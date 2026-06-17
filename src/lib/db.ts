import 'server-only'
import { MongoClient, Db, ObjectId } from 'mongodb'
import type { Project, AdminUser } from '@/types/admin'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const uri = process.env.MONGODB_URI!
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  return global._mongoClientPromise
}

export async function connectDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db('root2005')
}

export async function initDb(): Promise<void> {
  // Validate required env vars
  const required = ['MONGODB_URI', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  const hash = process.env.ADMIN_PASSWORD_HASH!
  if (!hash.startsWith('$2b$') && !hash.startsWith('$2a$')) {
    throw new Error('ADMIN_PASSWORD_HASH must start with $2b$ or $2a$ (must be a valid bcrypt hash)')
  }

  const secret = process.env.ADMIN_SESSION_SECRET!
  const decoded = Buffer.from(secret, 'base64')
  if (decoded.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 bytes when decoded from base64')
  }

  // Warn if bcrypt cost factor is low
  const costMatch = hash.match(/^\$2[ab]\$(\d+)\$/)
  if (costMatch) {
    const cost = parseInt(costMatch[1], 10)
    if (cost < 12) {
      console.warn(
        `[Security Warning] ADMIN_PASSWORD_HASH has cost factor ${cost}, which is below the recommended minimum of 12.`
      )
    }
  }

  const db = await connectDb()

  // Create indexes
  await db.collection('admins').createIndex({ username: 1 }, { unique: true })
  await db.collection('projects').createIndex({ slug: 1 }, { unique: true })
  await db.collection('projects').createIndex({ created_at: -1 })
  await db.collection('projects').createIndex({ is_featured: 1 })
  await db.collection('projects').createIndex({ category: 1 })

  // Seed admin if collection is empty
  const adminCount = await db.collection('admins').countDocuments()
  if (adminCount === 0) {
    await db.collection('admins').insertOne({
      username: process.env.ADMIN_USERNAME!,
      password_hash: process.env.ADMIN_PASSWORD_HASH!,
      created_at: new Date().toISOString(),
    })
  }
}

// Initialize on module load — skip silently if env vars aren't loaded yet
// (happens in Next.js build workers; runtime requests will have full env)
initDb().catch(err => {
  const msg: string = err instanceof Error ? err.message : String(err)
  if (msg.includes('Missing required environment variable')) {
    // Silent skip during build/SSG workers — not a runtime error
    return
  }
  console.error('[db] Initialization failed:', msg)
})

function toAdminUser(doc: Record<string, unknown>): AdminUser {
  return {
    _id: doc._id as ObjectId,
    id: (doc._id as ObjectId).toString(),
    username: doc.username as string,
    passwordHash: doc.password_hash as string,
    createdAt: doc.created_at as string,
  }
}

function toProject(doc: Record<string, unknown>): Project {
  return {
    _id: doc._id as ObjectId,
    id: (doc._id as ObjectId).toString(),
    title: doc.title as string,
    slug: doc.slug as string,
    category: doc.category as string,
    shortDescription: doc.short_description as string,
    image: doc.image as string,
    thumbnail: doc.thumbnail as string | undefined,
    imageAlt: (doc.image_alt as string) || '', // default to empty string for backward compatibility
    websiteUrl: doc.website_url as string,
    demoUrl: doc.demo_url as string | undefined,
    client: doc.client as string,
    timeline: doc.timeline as string,
    results: doc.results as string[],
    content: doc.content as string,
    isFeatured: (doc.is_featured as boolean) || false,
    tags: (doc.tags as string[]) || [],
    screenshots: (doc.screenshots as string[]) || [],
    createdAt: doc.created_at as string,
    updatedAt: doc.updated_at as string,
  }
}

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  const db = await connectDb()
  const doc = await db.collection('admins').findOne({ username })
  if (!doc) return null
  return toAdminUser(doc as Record<string, unknown>)
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await connectDb()
  const docs = await db.collection('projects').find({}).sort({ created_at: -1 }).toArray()
  return docs.map(doc => toProject(doc as Record<string, unknown>))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const db = await connectDb()
  const doc = await db.collection('projects').findOne({ slug })
  if (!doc) return null
  return toProject(doc as Record<string, unknown>)
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = await connectDb()
    const doc = await db.collection('projects').findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    return toProject(doc as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const db = await connectDb()
  const docs = await db.collection('projects').find({}, { projection: { slug: 1 } }).toArray()
  return docs.map(doc => doc.slug as string)
}

export async function insertProject(
  data: Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const db = await connectDb()
  const now = new Date().toISOString()
  const doc = {
    title: data.title,
    slug: data.slug,
    category: data.category,
    short_description: data.shortDescription,
    image: data.image,
    thumbnail: data.thumbnail,
    image_alt: data.imageAlt,
    website_url: data.websiteUrl,
    demo_url: data.demoUrl,
    client: data.client,
    timeline: data.timeline,
    results: data.results,
    content: data.content,
    is_featured: data.isFeatured || false,
    tags: data.tags || [],
    screenshots: data.screenshots || [],
    created_at: now,
    updated_at: now,
  }
  const result = await db.collection('projects').insertOne(doc)
  return toProject({ ...doc, _id: result.insertedId })
}

export async function updateProjectById(
  id: string,
  data: Partial<Omit<Project, '_id' | 'id' | 'createdAt'>>
): Promise<Project | null> {
  try {
    const db = await connectDb()
    const now = new Date().toISOString()
    const updateDoc: Record<string, unknown> = { updated_at: now }
    if (data.title !== undefined) updateDoc.title = data.title
    if (data.slug !== undefined) updateDoc.slug = data.slug
    if (data.category !== undefined) updateDoc.category = data.category
    if (data.shortDescription !== undefined) updateDoc.short_description = data.shortDescription
    if (data.image !== undefined) updateDoc.image = data.image
    if (data.thumbnail !== undefined) updateDoc.thumbnail = data.thumbnail
    if (data.imageAlt !== undefined) updateDoc.image_alt = data.imageAlt
    if (data.websiteUrl !== undefined) updateDoc.website_url = data.websiteUrl
    if (data.demoUrl !== undefined) updateDoc.demo_url = data.demoUrl
    if (data.client !== undefined) updateDoc.client = data.client
    if (data.timeline !== undefined) updateDoc.timeline = data.timeline
    if (data.results !== undefined) updateDoc.results = data.results
    if (data.content !== undefined) updateDoc.content = data.content
    if (data.isFeatured !== undefined) updateDoc.is_featured = data.isFeatured
    if (data.tags !== undefined) updateDoc.tags = data.tags
    if (data.screenshots !== undefined) updateDoc.screenshots = data.screenshots

    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )
    if (!result) return null
    return toProject(result as Record<string, unknown>)
  } catch {
    return null
  }
}

export async function deleteProjectById(id: string): Promise<boolean> {
  try {
    const db = await connectDb()
    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch {
    return false
  }
}
