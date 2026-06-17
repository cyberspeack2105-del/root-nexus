import sharp from 'sharp'

/**
 * Image optimization configuration and utility functions
 */

export interface ImageOptimizationOptions {
  quality?: number
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface OptimizedImage {
  buffer: Buffer
  size: number
  width: number
  height: number
  format: string
}

export interface ImageProcessingResult {
  success: boolean
  data?: OptimizedImage
  error?: string
}

/**
 * Default image quality setting (80% for optimal web delivery)
 */
const DEFAULT_QUALITY = 80

/**
 * Image dimension presets
 */
export const IMAGE_DIMENSIONS = {
  THUMBNAIL: { width: 400, height: 300, label: 'Thumbnail for lists' },
  MEDIUM: { width: 800, height: 600, label: 'Medium for detail pages' },
  ORIGINAL: { label: 'Full resolution for archival' },
} as const

/**
 * Validate image buffer and metadata
 * @param buffer - Image buffer data
 * @returns Object with validation result and error message if invalid
 */
export function validateImageBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Image buffer is empty' }
  }

  // Check for minimum image size (at least 1KB)
  if (buffer.length < 1024) {
    return { valid: false, error: 'Image file is too small' }
  }

  return { valid: true }
}

/**
 * Optimize image with specified dimensions and quality
 * Removes EXIF metadata and compresses for web delivery
 *
 * @param buffer - Image buffer to optimize
 * @param width - Target width in pixels
 * @param height - Target height in pixels
 * @param quality - Compression quality (1-100, default 80)
 * @returns Promise resolving to optimized image data
 * @throws Error if image processing fails
 */
export async function optimizeImage(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number = DEFAULT_QUALITY
): Promise<ImageProcessingResult> {
  try {
    // Validate input
    const validation = validateImageBuffer(buffer)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid image buffer',
      }
    }

    if (width <= 0 || height <= 0) {
      return {
        success: false,
        error: 'Invalid image dimensions',
      }
    }

    if (quality < 1 || quality > 100) {
      return {
        success: false,
        error: 'Quality must be between 1 and 100',
      }
    }

    // Process image: resize, remove EXIF, compress
    const metadata = await sharp(buffer).metadata()

    if (!metadata.format) {
      return {
        success: false,
        error: 'Unable to determine image format',
      }
    }

    // Resize with cover fit to maintain aspect ratio
    // Converting to JPEG/WebP removes all EXIF metadata
    const pipeline = sharp(buffer).resize(width, height, {
      fit: 'cover', // Crop to exact dimensions
      position: 'center',
    })

    // Convert to appropriate format with quality settings
    let optimized
    if (metadata.format === 'webp') {
      optimized = await pipeline.webp({ quality }).toBuffer({ resolveWithObject: true })
    } else {
      optimized = await pipeline.jpeg({ quality }).toBuffer({ resolveWithObject: true })
    }

    return {
      success: true,
      data: {
        buffer: optimized.data,
        size: optimized.data.length,
        width: optimized.info.width,
        height: optimized.info.height,
        format: optimized.info.format || 'unknown',
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Image processing failed'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Generate thumbnail version (400x300px)
 * Used for project list views
 *
 * @param buffer - Original image buffer
 * @param quality - Compression quality (default 80)
 * @returns Promise resolving to thumbnail data
 */
export async function generateThumbnail(
  buffer: Buffer,
  quality: number = DEFAULT_QUALITY
): Promise<ImageProcessingResult> {
  return optimizeImage(buffer, IMAGE_DIMENSIONS.THUMBNAIL.width, IMAGE_DIMENSIONS.THUMBNAIL.height, quality)
}

/**
 * Generate medium version (800x600px)
 * Used for project detail pages
 *
 * @param buffer - Original image buffer
 * @param quality - Compression quality (default 80)
 * @returns Promise resolving to medium image data
 */
export async function generateMedium(
  buffer: Buffer,
  quality: number = DEFAULT_QUALITY
): Promise<ImageProcessingResult> {
  return optimizeImage(buffer, IMAGE_DIMENSIONS.MEDIUM.width, IMAGE_DIMENSIONS.MEDIUM.height, quality)
}

/**
 * Remove EXIF and all metadata from image
 * Preserves original dimensions and quality
 *
 * @param buffer - Image buffer to clean
 * @returns Promise resolving to image without metadata
 */
export async function removeExif(buffer: Buffer): Promise<ImageProcessingResult> {
  try {
    const validation = validateImageBuffer(buffer)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid image buffer',
      }
    }

    // Get original metadata to preserve format and dimensions
    const metadata = await sharp(buffer).metadata()

    if (!metadata.format || !metadata.width || !metadata.height) {
      return {
        success: false,
        error: 'Unable to determine image properties',
      }
    }

    // Re-encode at same quality removes all metadata including EXIF
    const pipeline = sharp(buffer)

    let cleaned
    if (metadata.format === 'webp') {
      cleaned = await pipeline.webp({ quality: DEFAULT_QUALITY }).toBuffer({ resolveWithObject: true })
    } else {
      cleaned = await pipeline.jpeg({ quality: DEFAULT_QUALITY }).toBuffer({ resolveWithObject: true })
    }

    return {
      success: true,
      data: {
        buffer: cleaned.data,
        size: cleaned.data.length,
        width: cleaned.info.width,
        height: cleaned.info.height,
        format: cleaned.info.format || 'unknown',
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'EXIF removal failed'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Batch process multiple image sizes
 * Useful for generating all variants at once
 *
 * @param buffer - Original image buffer
 * @param quality - Compression quality (default 80)
 * @returns Promise resolving to object with all image variants
 */
export async function processAllImageVariants(
  buffer: Buffer,
  quality: number = DEFAULT_QUALITY
): Promise<{
  success: boolean
  original?: OptimizedImage
  thumbnail?: OptimizedImage
  medium?: OptimizedImage
  error?: string
}> {
  try {
    // Process all variants in parallel
    const [originalResult, thumbnailResult, mediumResult] = await Promise.all([
      removeExif(buffer), // Remove EXIF from original
      generateThumbnail(buffer, quality),
      generateMedium(buffer, quality),
    ])

    if (!originalResult.success || !thumbnailResult.success || !mediumResult.success) {
      return {
        success: false,
        error: 'Failed to process all image variants',
      }
    }

    return {
      success: true,
      original: originalResult.data,
      thumbnail: thumbnailResult.data,
      medium: mediumResult.data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Batch processing failed'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Get image metadata without processing
 * Useful for validation and dimension checking
 *
 * @param buffer - Image buffer
 * @returns Promise resolving to image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata()
    return {
      success: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      hasAlpha: metadata.hasAlpha,
      size: buffer.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read metadata',
    }
  }
}
