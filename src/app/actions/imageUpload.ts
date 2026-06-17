'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { processAllImageVariants } from '@/lib/imageOptimization'
import crypto from 'crypto'

/**
 * Image upload result structure
 */
export interface ImageUploadResult {
  success: boolean
  imagePath?: string
  thumbnail?: string
  original?: string
  error?: string
  errorType?: string
}

/**
 * File validation result
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  errorType?: string
}

/**
 * Allowed MIME types for image uploads
 */
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

/**
 * Magic bytes for image file validation
 * Validates file type by checking first few bytes instead of extension
 */
const MAGIC_BYTES_MAP: Record<string, Buffer> = {
  'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47]), // PNG
  'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]), // JPEG
  'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]), // WEBP (at offset 0)
}

/**
 * Maximum file size (5MB in bytes)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Validate image file type using magic bytes
 * @param buffer - File buffer
 * @param mimeType - Reported MIME type
 * @returns Validation result
 */
function validateFileType(buffer: Buffer, mimeType: string): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Only PNG, JPEG, and WebP formats are supported',
      errorType: 'INVALID_FILE_TYPE',
    }
  }

  // Validate magic bytes for additional security
  const magic = MAGIC_BYTES_MAP[mimeType]
  if (magic && !buffer.subarray(0, magic.length).equals(magic)) {
    // Special handling for WebP which may have WEBP at offset 8
    if (mimeType !== 'image/webp' || !buffer.subarray(8, 12).equals(Buffer.from([0x57, 0x45, 0x42, 0x50]))) {
      return {
        valid: false,
        error: 'File content does not match declared format',
        errorType: 'INVALID_FILE_CONTENT',
      }
    }
  }

  return { valid: true }
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @returns Validation result
 */
function validateFileSize(size: number): ValidationResult {
  if (size <= 0) {
    return {
      valid: false,
      error: 'File size is invalid',
      errorType: 'INVALID_FILE_SIZE',
    }
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      errorType: 'FILE_TOO_LARGE',
    }
  }

  return { valid: true }
}

/**
 * Sanitize filename to prevent path traversal and remove special characters
 * @param filename - Original filename
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '')

  // Remove special characters but keep extension
  sanitized = sanitized
    .replace(/[^a-zA-Z0-9._-]/g, '-') // Replace special chars with dash
    .replace(/-+/g, '-') // Collapse multiple dashes
    .toLowerCase()

  return sanitized
}

/**
 * Generate unique filename to prevent collisions
 * @param originalFilename - Original filename from upload
 * @returns Unique filename with timestamp and random suffix
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomSuffix = crypto.randomBytes(4).toString('hex')
  const sanitized = sanitizeFilename(originalFilename)

  return `${timestamp}-${randomSuffix}-${sanitized}`
}

/**
 * Write file to disk with error handling
 * @param filepath - Full path to write file
 * @param data - File data buffer
 * @returns Success result or error
 */
async function writeFileToDisk(filepath: string, data: Buffer): Promise<{ success: boolean; error?: string }> {
  try {
    await writeFile(filepath, data)
    return { success: true }
  } catch (error) {
    console.error(`Failed to write file to ${filepath}:`, error)

    if (error instanceof Error && error.message.includes('ENOSPC')) {
      return {
        success: false,
        error: 'Server storage full. Please try again later.',
      }
    }

    if (error instanceof Error && error.message.includes('EACCES')) {
      return {
        success: false,
        error: 'Permission denied. Please contact administrator.',
      }
    }

    return {
      success: false,
      error: 'Failed to save image file',
    }
  }
}

/**
 * Handle image upload - main server action
 * Validates file, optimizes image variants, saves to disk
 *
 * @param formData - FormData containing image file
 * @returns Upload result with paths or error
 *
 * @example
 * const formData = new FormData()
 * formData.append('file', fileInput.files[0])
 * const result = await handleImageUpload(formData)
 */
export async function handleImageUpload(formData: FormData): Promise<ImageUploadResult> {
  try {
    // Extract file from FormData
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: 'No file provided',
        errorType: 'NO_FILE',
      }
    }

    // Validate file size first (cheap operation)
    const sizeValidation = validateFileSize(file.size)
    if (!sizeValidation.valid) {
      return {
        success: false,
        error: sizeValidation.error,
        errorType: sizeValidation.errorType,
      }
    }

    // Convert file to buffer
    let buffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Failed to read file:', error)
      return {
        success: false,
        error: 'Failed to read file',
        errorType: 'FILE_READ_ERROR',
      }
    }

    // Validate file type using magic bytes
    const typeValidation = validateFileType(buffer, file.type)
    if (!typeValidation.valid) {
      return {
        success: false,
        error: typeValidation.error,
        errorType: typeValidation.errorType,
      }
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name)

    // Process all image variants
    console.log(`Processing image: ${uniqueFilename}`)
    const processingResult = await processAllImageVariants(buffer)

    if (!processingResult.success) {
      console.error(`Image processing failed for ${uniqueFilename}:`, processingResult.error)
      return {
        success: false,
        error: 'Image processing failed. Please try a different image.',
        errorType: 'IMAGE_PROCESSING_ERROR',
      }
    }

    // Save all variants to disk
    const projectsPath = join(process.cwd(), 'public', 'projects')

    const writeResults = await Promise.all([
      writeFileToDisk(
        join(projectsPath, 'original', uniqueFilename),
        processingResult.original!.buffer
      ),
      writeFileToDisk(
        join(projectsPath, 'thumbnails', uniqueFilename),
        processingResult.thumbnail!.buffer
      ),
      writeFileToDisk(
        join(projectsPath, 'medium', uniqueFilename),
        processingResult.medium!.buffer
      ),
    ])

    // Check if all writes succeeded
    for (const result of writeResults) {
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to save image file',
          errorType: 'FILE_WRITE_ERROR',
        }
      }
    }

    console.log(`Successfully processed and saved image: ${uniqueFilename}`)

    // Return paths for database storage
    return {
      success: true,
      imagePath: `/projects/medium/${uniqueFilename}`, // Primary image path
      thumbnail: `/projects/thumbnails/${uniqueFilename}`, // Thumbnail path
      original: `/projects/original/${uniqueFilename}`, // Original for archival
    }
  } catch (error) {
    console.error('Unexpected error during image upload:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during upload',
      errorType: 'UNEXPECTED_ERROR',
    }
  }
}

/**
 * Validate image file without processing
 * Useful for client-side validation feedback
 *
 * @param formData - FormData containing image file
 * @returns Validation result with error if invalid
 */
export async function validateImageFile(formData: FormData): Promise<ValidationResult> {
  try {
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return {
        valid: false,
        error: 'No file provided',
        errorType: 'NO_FILE',
      }
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size)
    if (!sizeValidation.valid) {
      return sizeValidation
    }

    // Convert to buffer for magic byte validation
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate file type
    return validateFileType(buffer, file.type)
  } catch (error) {
    console.error('Error validating image file:', error)
    return {
      valid: false,
      error: 'Failed to validate file',
      errorType: 'VALIDATION_ERROR',
    }
  }
}

/**
 * Remove uploaded image files from disk
 * Used during project deletion or update
 *
 * @param imagePath - Path to image (relative to public folder)
 * @returns Success or error result
 */
export async function removeImageFile(imagePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { unlink } = await import('fs/promises')
    const fullPath = join(process.cwd(), 'public', imagePath)

    // Prevent path traversal
    if (!fullPath.startsWith(join(process.cwd(), 'public', 'projects'))) {
      return {
        success: false,
        error: 'Invalid image path',
      }
    }

    await unlink(fullPath)
    console.log(`Deleted image: ${fullPath}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Failed to delete image file:`, errorMessage)

    // Don't fail if file doesn't exist
    if (errorMessage.includes('ENOENT')) {
      return { success: true }
    }

    return {
      success: false,
      error: 'Failed to delete image file',
    }
  }
}
