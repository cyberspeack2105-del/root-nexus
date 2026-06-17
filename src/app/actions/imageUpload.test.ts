/**
 * Unit tests for image upload server action
 * Tests cover file validation, error handling, and upload flow
 */

import {
  validateImageFile,
  ImageUploadResult,
  ValidationResult,
} from './imageUpload'

/**
 * Helper to create test FormData with file
 */
function createTestFormData(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

/**
 * Helper to create mock File object
 */
function createMockFile(
  name: string,
  size: number,
  type: string,
  buffer?: Buffer
): File {
  const data = buffer || Buffer.alloc(size)
  // Convert Buffer to ArrayBuffer for File constructor compatibility
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  return new File([arrayBuffer], name, { type })
}

describe('Image Upload Validation', () => {
  describe('validateImageFile', () => {
    it('should reject when no file provided', async () => {
      const formData = new FormData()
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('NO_FILE')
    })

    it('should reject file larger than 5MB', async () => {
      const size = 6 * 1024 * 1024 // 6MB
      const file = createMockFile('large.png', size, 'image/png')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('FILE_TOO_LARGE')
      expect(result.error).toContain('5MB')
    })

    it('should accept file exactly 5MB', async () => {
      const size = 5 * 1024 * 1024 // 5MB
      // Create valid PNG file
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      const buffer = Buffer.concat([pngHeader, Buffer.alloc(size - pngHeader.length)])
      const file = createMockFile('valid.png', size, 'image/png', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should accept file smaller than 5MB', async () => {
      const size = 2 * 1024 * 1024 // 2MB
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      const buffer = Buffer.concat([pngHeader, Buffer.alloc(size - pngHeader.length)])
      const file = createMockFile('small.png', size, 'image/png', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should reject unsupported file types', async () => {
      const file = createMockFile('document.pdf', 1024 * 100, 'application/pdf')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('INVALID_FILE_TYPE')
      expect(result.error).toContain('PNG')
      expect(result.error).toContain('JPEG')
      expect(result.error).toContain('WebP')
    })

    it('should reject invalid file content', async () => {
      // File with PNG extension but non-PNG content
      const buffer = Buffer.from('Not a real image')
      const file = createMockFile('fake.png', buffer.length, 'image/png', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('INVALID_FILE_CONTENT')
    })

    it('should accept valid PNG with correct magic bytes', async () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      const buffer = Buffer.concat([pngHeader, Buffer.alloc(1024)])
      const file = createMockFile('valid.png', buffer.length, 'image/png', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should accept valid JPEG with correct magic bytes', async () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff])
      const buffer = Buffer.concat([jpegHeader, Buffer.alloc(1024)])
      const file = createMockFile('valid.jpg', buffer.length, 'image/jpeg', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should handle empty file', async () => {
      const file = createMockFile('empty.png', 0, 'image/png')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('FILE_TOO_LARGE')
    })
  })
})

describe('Image Upload Error Handling', () => {
  it('should return specific error for file too large', async () => {
    const size = 10 * 1024 * 1024 // 10MB
    const file = createMockFile('huge.png', size, 'image/png')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.error).toContain('5MB')
  })

  it('should return specific error for unsupported type', async () => {
    const file = createMockFile('video.mp4', 1024 * 100, 'video/mp4')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.error).toContain('PNG')
  })

  it('should handle validation errors gracefully', async () => {
    const file = createMockFile('corrupt.png', 500, 'image/png')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should provide error type in response', async () => {
    const file = createMockFile('test.txt', 1024, 'text/plain')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.errorType).toBe('INVALID_FILE_TYPE')
  })
})

describe('Image Upload - File Type Validation', () => {
  describe('Supported formats', () => {
    it('should support PNG format', async () => {
      const header = Buffer.from([0x89, 0x50, 0x4e, 0x47])
      const buffer = Buffer.concat([header, Buffer.alloc(1024)])
      const file = createMockFile('test.png', buffer.length, 'image/png', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should support JPEG format', async () => {
      const header = Buffer.from([0xff, 0xd8, 0xff])
      const buffer = Buffer.concat([header, Buffer.alloc(1024)])
      const file = createMockFile('test.jpg', buffer.length, 'image/jpeg', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })

    it('should support WebP format', async () => {
      // WebP: RIFF signature at start, WEBP at offset 8
      const riff = Buffer.from([0x52, 0x49, 0x46, 0x46])
      const fileSize = Buffer.alloc(4) // Placeholder for file size
      const webp = Buffer.from([0x57, 0x45, 0x42, 0x50])
      const buffer = Buffer.concat([riff, fileSize, webp, Buffer.alloc(1024)])
      const file = createMockFile('test.webp', buffer.length, 'image/webp', buffer)
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(true)
    })
  })

  describe('Unsupported formats', () => {
    it('should reject BMP format', async () => {
      const file = createMockFile('test.bmp', 1024, 'image/bmp')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('INVALID_FILE_TYPE')
    })

    it('should reject GIF format', async () => {
      const file = createMockFile('test.gif', 1024, 'image/gif')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('INVALID_FILE_TYPE')
    })

    it('should reject SVG format', async () => {
      const file = createMockFile('test.svg', 1024, 'image/svg+xml')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
    })

    it('should reject text files', async () => {
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const formData = createTestFormData(file)
      const result = await validateImageFile(formData)
      expect(result.valid).toBe(false)
      expect(result.errorType).toBe('INVALID_FILE_TYPE')
    })
  })
})

describe('Image Upload - File Size Validation', () => {
  it('should reject files with 0 bytes', async () => {
    const file = createMockFile('empty.png', 0, 'image/png')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.valid).toBe(false)
  })

  it('should accept files with 1 byte', async () => {
    const buffer = Buffer.from([0x89])
    const file = createMockFile('tiny.png', 1, 'image/png', buffer)
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    // Will fail due to invalid image content, not size
    expect(result.errorType).not.toBe('FILE_TOO_LARGE')
  })

  it('should accept files at 1MB', async () => {
    const header = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    const buffer = Buffer.concat([header, Buffer.alloc(1024 * 1024 - 4)])
    const file = createMockFile('1mb.png', buffer.length, 'image/png', buffer)
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.valid).toBe(true)
  })

  it('should accept files at 3MB', async () => {
    const header = Buffer.from([0x89, 0x50, 0x4e, 0x47])
    const buffer = Buffer.concat([header, Buffer.alloc(3 * 1024 * 1024 - 4)])
    const file = createMockFile('3mb.png', buffer.length, 'image/png', buffer)
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.valid).toBe(true)
  })

  it('should reject files at 5.1MB', async () => {
    const size = Math.floor(5.1 * 1024 * 1024)
    const file = createMockFile('toolarge.png', size, 'image/png')
    const formData = createTestFormData(file)
    const result = await validateImageFile(formData)
    expect(result.valid).toBe(false)
    expect(result.errorType).toBe('FILE_TOO_LARGE')
  })
})
