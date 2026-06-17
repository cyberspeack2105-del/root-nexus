'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { verifyAdminSession } from '@/lib/dal'
import {
  insertProject,
  updateProjectById,
  deleteProjectById,
  getProjectById,
  getAllSlugs,
} from '@/lib/db'
import { makeUniqueSlug } from '@/lib/slugify'
import { handleImageUpload } from '@/app/actions/imageUpload'
import type { ActionResult } from '@/types/admin'

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  if (file.size > maxSize) {
    return false
  }
  
  return true
}

function validateProjectFields(formData: FormData): {
  data?: {
    title: string
    category: string
    shortDescription: string
    image: string
    client: string
    timeline: string
    results: string[]
    content: string
    websiteUrl: string
    demoUrl?: string
    isFeatured: boolean
    tags: string[]
    screenshots: string[]
  }
  fieldErrors?: Record<string, string[]>
} {
  const title = (formData.get('title') as string | null) ?? ''
  const category = (formData.get('category') as string | null) ?? ''
  const shortDescription = (formData.get('shortDescription') as string | null) ?? ''
  const image = (formData.get('image') as string | null) ?? ''
  const client = (formData.get('client') as string | null) ?? ''
  const timeline = (formData.get('timeline') as string | null) ?? ''
  const resultsRaw = (formData.get('results') as string | null) ?? ''
  const content = (formData.get('content') as string | null) ?? ''
  const websiteUrl = (formData.get('websiteUrl') as string | null) ?? ''
  const demoUrl = (formData.get('demoUrl') as string | null) ?? ''
  const isFeaturedRaw = (formData.get('isFeatured') as string | null) ?? ''
  const tagsRaw = (formData.get('tags') as string | null) ?? ''
  const imageFile = formData.get('imageFile') as File | null

  const fieldErrors: Record<string, string[]> = {}

  if (!title || title.length > 200) {
    fieldErrors.title = ['Title is required and must be at most 200 characters.']
  }
  if (!category || category.length > 100) {
    fieldErrors.category = ['Category is required and must be at most 100 characters.']
  }
  if (!shortDescription || shortDescription.length > 500) {
    fieldErrors.shortDescription = [
      'Short description is required and must be at most 500 characters.',
    ]
  }
  
  // Image validation - check for file upload or URL fallback
  if (!image && !imageFile) {
    fieldErrors.image = ['Image is required. Please upload an image or provide a URL.']
  }
  // Allow local paths (uploaded images) OR valid http/https URLs
  if (image && !image.startsWith('/') && !isValidUrl(image)) {
    fieldErrors.image = ['Image must be a valid URL (http/https).']
  }
  if (image && image.length > 500) {
    fieldErrors.image = ['Image URL must be at most 500 characters.']
  }
  if (imageFile && !isValidImageFile(imageFile)) {
    const maxSize = 5 * 1024 * 1024
    if (imageFile.size > maxSize) {
      fieldErrors.imageFile = [`File must be smaller than ${maxSize / 1024 / 1024}MB.`]
    } else {
      fieldErrors.imageFile = ['Only PNG, JPEG, and WebP formats are supported.']
    }
  }
  
  if (!client || client.length > 200) {
    fieldErrors.client = ['Client is required and must be at most 200 characters.']
  }
  if (!timeline || timeline.length > 100) {
    fieldErrors.timeline = ['Timeline is required and must be at most 100 characters.']
  }
  if (!resultsRaw || resultsRaw.length > 500) {
    fieldErrors.results = [
      'Results are required and must be at most 500 characters total.',
    ]
  }
  if (!content || content.length > 5000) {
    fieldErrors.content = ['Content is required and must be at most 5000 characters.']
  }
  if (!websiteUrl || !isValidUrl(websiteUrl) || websiteUrl.length > 500) {
    fieldErrors.websiteUrl = [
      'Website URL is required, must be a valid HTTPS URL, and at most 500 characters.',
    ]
  }
  if (demoUrl && (!isValidUrl(demoUrl) || demoUrl.length > 500)) {
    fieldErrors.demoUrl = [
      'Demo URL must be a valid URL (http/https) and at most 500 characters.',
    ]
  }
  
  // Tags validation
  if (tagsRaw.length > 100) {
    fieldErrors.tags = ['Tags must be at most 100 characters total.']
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  // Split comma-separated results string into array, filtering empty entries
  const results = resultsRaw
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)

  // Split comma-separated tags string into array, filtering empty entries, max 5 tags
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5)

  const isFeatured = isFeaturedRaw === 'on' || isFeaturedRaw === 'true'

  // Parse existing screenshots (useful during edit)
  const existingScreenshotsRaw = (formData.get('existingScreenshots') as string | null) ?? '[]'
  let screenshots: string[] = []
  try {
    screenshots = JSON.parse(existingScreenshotsRaw)
  } catch {
    screenshots = existingScreenshotsRaw ? existingScreenshotsRaw.split(',').map(s => s.trim()).filter(Boolean) : []
  }

  return {
    data: { 
      title, 
      category, 
      shortDescription, 
      image, 
      client, 
      timeline, 
      results, 
      content, 
      websiteUrl,
      demoUrl: demoUrl || undefined,
      isFeatured,
      tags,
      screenshots
    },
  }
}

// ---------------------------------------------------------------------------
// createProjectAction
// ---------------------------------------------------------------------------

export async function createProjectAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await verifyAdminSession()

  const validated = validateProjectFields(formData)
  if (validated.fieldErrors) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: validated.fieldErrors,
    }
  }

  let { title, category, shortDescription, image, client, timeline, results, content, websiteUrl, demoUrl, isFeatured, tags, screenshots } =
    validated.data!

  // Handle image file upload if provided
  const imageFile = formData.get('imageFile') as File | null
  let thumbnail: string | undefined

  if (imageFile && imageFile.size > 0) {
    const uploadFormData = new FormData()
    uploadFormData.append('file', imageFile)
    
    const uploadResult = await handleImageUpload(uploadFormData)
    
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Image upload failed',
        fieldErrors: { imageFile: [uploadResult.error || 'Image upload failed'] },
      }
    }
    
    // Use uploaded image paths
    image = uploadResult.imagePath || image
    thumbnail = uploadResult.thumbnail
  }

  // Handle additional screenshot uploads
  const screenshotFiles = formData.getAll('screenshotFiles') as File[]
  const uploadedScreenshots: string[] = []

  for (const file of screenshotFiles) {
    if (file && file.size > 0) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResult = await handleImageUpload(uploadFormData)
      if (uploadResult.success && uploadResult.imagePath) {
        uploadedScreenshots.push(uploadResult.imagePath)
      } else {
        console.error('Failed to upload screenshot:', uploadResult.error)
      }
    }
  }

  const finalScreenshots = [...screenshots, ...uploadedScreenshots]

  if (finalScreenshots.length > 15) {
    return { success: false, error: 'You can upload a maximum of 15 screenshots in total.' }
  }

  let slug: string
  try {
    const existingSlugs = await getAllSlugs()
    slug = makeUniqueSlug(title, existingSlugs)
  } catch {
    return { success: false, error: 'Failed to generate slug.' }
  }

  try {
    await insertProject({
      title,
      slug,
      category,
      shortDescription,
      image,
      thumbnail,
      imageAlt: title,
      client,
      timeline,
      results,
      content,
      websiteUrl,
      demoUrl,
      isFeatured,
      tags,
      screenshots: finalScreenshots,
    })
  } catch {
    return { success: false, error: 'Failed to save project. Please try again.' }
  }

  try {
    revalidatePath('/work')
    revalidatePath('/')
  } catch (err) {
    console.error('[createProjectAction] revalidatePath failed:', err)
  }

  redirect('/rn-secure-admin')
}

// ---------------------------------------------------------------------------
// updateProjectAction
// ---------------------------------------------------------------------------

export async function updateProjectAction(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await verifyAdminSession()

  const existing = await getProjectById(id)
  if (!existing) {
    notFound()
  }

  const validated = validateProjectFields(formData)
  if (validated.fieldErrors) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: validated.fieldErrors,
    }
  }

  const { title, category, shortDescription, image, client, timeline, results, content, websiteUrl, demoUrl, isFeatured, tags, screenshots } =
    validated.data!

  const oldSlug = existing.slug
  let newSlug = oldSlug

  if (title !== existing.title) {
    try {
      const existingSlugs = await getAllSlugs()
      newSlug = makeUniqueSlug(title, existingSlugs, oldSlug)
    } catch {
      return { success: false, error: 'Failed to generate slug.' }
    }
  }

  // Handle image file upload if provided
  const imageFile = formData.get('imageFile') as File | null
  let imagePath = image
  let thumbnail: string | undefined

  if (imageFile && imageFile.size > 0) {
    const uploadFormData = new FormData()
    uploadFormData.append('file', imageFile)
    
    const uploadResult = await handleImageUpload(uploadFormData)
    
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Image upload failed',
        fieldErrors: { imageFile: [uploadResult.error || 'Image upload failed'] },
      }
    }
    
    // Use uploaded image paths
    imagePath = uploadResult.imagePath || image
    thumbnail = uploadResult.thumbnail
  }

  // Handle additional screenshot uploads
  const screenshotFiles = formData.getAll('screenshotFiles') as File[]
  const uploadedScreenshots: string[] = []

  for (const file of screenshotFiles) {
    if (file && file.size > 0) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResult = await handleImageUpload(uploadFormData)
      if (uploadResult.success && uploadResult.imagePath) {
        uploadedScreenshots.push(uploadResult.imagePath)
      } else {
        console.error('Failed to upload screenshot:', uploadResult.error)
      }
    }
  }

  const finalScreenshots = [...screenshots, ...uploadedScreenshots]

  if (finalScreenshots.length > 15) {
    return { success: false, error: 'You can upload a maximum of 15 screenshots in total.' }
  }

  try {
    await updateProjectById(id, {
      title,
      slug: newSlug,
      category,
      shortDescription,
      image: imagePath,
      thumbnail: thumbnail || existing.thumbnail,
      imageAlt: title,
      client,
      timeline,
      results,
      content,
      websiteUrl,
      demoUrl,
      isFeatured,
      tags,
      screenshots: finalScreenshots,
    })
  } catch {
    return { success: false, error: 'Failed to update project. Please try again.' }
  }

  try {
    revalidatePath('/work')
    revalidatePath(`/work/${oldSlug}`)
    revalidatePath(`/work/${newSlug}`)
    revalidatePath('/')
  } catch (err) {
    console.error('[updateProjectAction] revalidatePath failed:', err)
  }

  // redirect() throws internally — must be called outside try/catch
  redirect('/rn-secure-admin')
}

// ---------------------------------------------------------------------------
// deleteProjectAction
// ---------------------------------------------------------------------------

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  await verifyAdminSession()

  const existing = await getProjectById(id)
  if (!existing) {
    return { success: false, error: 'Project not found.' }
  }

  try {
    await deleteProjectById(id)
  } catch {
    return { success: false, error: 'Failed to delete project. Please try again.' }
  }

  try {
    revalidatePath('/work')
    revalidatePath('/')
  } catch (err) {
    console.error('[deleteProjectAction] revalidatePath failed:', err)
  }

  // redirect() throws internally — must be called outside try/catch
  redirect('/rn-secure-admin')
}
