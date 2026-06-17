'use client'

import { useActionState, useState, useRef } from 'react'
import type { ActionResult, Project } from '@/types/admin'

const initialState: ActionResult = { success: false, error: '' }

interface ProjectFormProps {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>
  initialData?: Omit<Project, '_id'>
  submitLabel?: string
}

export default function ProjectForm({
  action,
  initialData,
  submitLabel = 'Save Project',
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ?? null
  )
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Screenshots state
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(
    initialData?.screenshots ?? []
  )
  const [newScreenshotFiles, setNewScreenshotFiles] = useState<File[]>([])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const hiddenScreenshotInputRef = useRef<HTMLInputElement>(null)
  const visibleScreenshotInputRef = useRef<HTMLInputElement>(null)
  const [charCounts, setCharCounts] = useState({
    title: initialData?.title?.length || 0,
    category: initialData?.category?.length || 0,
    shortDescription: initialData?.shortDescription?.length || 0,
    client: initialData?.client?.length || 0,
    timeline: initialData?.timeline?.length || 0,
    results: initialData?.results?.join(', ')?.length || 0,
    content: initialData?.content?.length || 0,
    websiteUrl: initialData?.websiteUrl?.length || 0,
    demoUrl: initialData?.demoUrl?.length || 0,
    tags: initialData?.tags?.join(', ')?.length || 0,
  })

  const fieldError = (field: string) => {
    if (!state || state.success !== false) return null
    const errs = state.fieldErrors?.[field]
    if (!errs?.length) return null
    return <p className="text-red-500 text-xs mt-1">{errs[0]}</p>
  }

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setImagePreview(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleImageChange(file || null)
  }

  const syncHiddenInput = (files: File[]) => {
    if (hiddenScreenshotInputRef.current) {
      const dt = new DataTransfer()
      files.forEach(file => dt.items.add(file))
      hiddenScreenshotInputRef.current.files = dt.files
    }
  }

  const handleScreenshotsChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      const totalCount = existingScreenshots.length + newScreenshotFiles.length + newFiles.length;
      if (totalCount > 15) {
        alert(`You can only upload up to 15 screenshots in total (Existing: ${existingScreenshots.length}, New Selected: ${newScreenshotFiles.length}, Trying to add: ${newFiles.length}).`);
        if (visibleScreenshotInputRef.current) {
          visibleScreenshotInputRef.current.value = "";
        }
        return;
      }

      const updatedFiles = [...newScreenshotFiles, ...newFiles]
      setNewScreenshotFiles(updatedFiles)
      syncHiddenInput(updatedFiles)

      if (visibleScreenshotInputRef.current) {
        visibleScreenshotInputRef.current.value = "";
      }

      const previews: string[] = []
      let loaded = 0
      updatedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            previews.push(result)
          }
          loaded++
          if (loaded === updatedFiles.length) {
            setScreenshotPreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveNewScreenshot = (indexToRemove: number) => {
    const updatedFiles = newScreenshotFiles.filter((_, index) => index !== indexToRemove)
    setNewScreenshotFiles(updatedFiles)
    syncHiddenInput(updatedFiles)

    const updatedPreviews = screenshotPreviews.filter((_, index) => index !== indexToRemove)
    setScreenshotPreviews(updatedPreviews)
  }

  const handleDeleteExistingScreenshot = (pathToDelete: string) => {
    setExistingScreenshots(prev => prev.filter(path => path !== pathToDelete))
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleImageChange(file)
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
    }
  }

  const handleCharChange = (
    field: keyof typeof charCounts,
    value: string
  ) => {
    setCharCounts((prev) => ({
      ...prev,
      [field]: value.length,
    }))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.success === false && state.error && !state.fieldErrors && (
        <div role="alert" className="bg-red-900 border border-red-700 rounded px-4 py-3 text-red-200 text-sm">
          {state.error}
        </div>
      )}

      {/* Title Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="title" className="text-sm text-gray-300">
            Title <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.title}/200
          </span>
        </div>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          required
          defaultValue={initialData?.title ?? ''}
          onChange={(e) => handleCharChange('title', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
        />
        <p className="text-xs text-gray-500">Project name (max 200 characters)</p>
        {fieldError('title')}
      </div>

      {/* Category Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="category" className="text-sm text-gray-300">
            Category <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.category}/100
          </span>
        </div>
        <input
          id="category"
          name="category"
          type="text"
          maxLength={100}
          required
          defaultValue={initialData?.category ?? ''}
          onChange={(e) => handleCharChange('category', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
        />
        <p className="text-xs text-gray-500">Service category (max 100 characters)</p>
        {fieldError('category')}
      </div>

      {/* Short Description Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="shortDescription" className="text-sm text-gray-300">
            Short Description <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.shortDescription}/500
          </span>
        </div>
        <textarea
          id="shortDescription"
          name="shortDescription"
          maxLength={500}
          required
          defaultValue={initialData?.shortDescription ?? ''}
          onChange={(e) => handleCharChange('shortDescription', e.target.value)}
          rows={3}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-y"
        />
        <p className="text-xs text-gray-500">Brief overview (max 500 characters)</p>
        {fieldError('shortDescription')}
      </div>

      {/* Hidden field: carries existing image path when editing */}
      <input
        type="hidden"
        name="image"
        value={initialData?.image ?? ''}
      />

      {/* Image Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300">
          Project Image <span className="text-red-400">*</span>
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            dragActive
              ? 'border-white bg-gray-700'
              : 'border-gray-600 bg-gray-800 hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="imageFile"
            name="imageFile"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:text-gray-300 transition font-medium"
          >
            Choose File
          </button>
          <p className="text-gray-400 text-sm mt-2">
            or drag and drop here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPEG, WebP (max 5MB)
          </p>
        </div>
        {imageFileName && (
          <p className="text-xs text-gray-400">
            Selected: {imageFileName}
          </p>
        )}
        {imagePreview && (
          <div className="mt-3 border border-gray-600 rounded p-2">
            <p className="text-xs text-gray-400 mb-2">
              {imageFileName ? 'New image preview:' : 'Current image:'}
            </p>
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full max-h-64 rounded"
            />
          </div>
        )}
        <p className="text-xs text-gray-500">
          Upload a new image to replace the current one (PNG, JPEG, WebP, max 5MB)
        </p>
        {fieldError('imageFile')}
      </div>

      {/* Hidden real file input – submitted with the form */}
      <input
        ref={hiddenScreenshotInputRef}
        type="file"
        name="screenshotFiles"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Hidden input to pass existing screenshots JSON to the server action */}
      <input
        type="hidden"
        name="existingScreenshots"
        value={JSON.stringify(existingScreenshots)}
      />

      {/* Additional Screenshots Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300 font-medium">
            Additional Screenshots
            <span className="ml-2 text-xs text-gray-500">
              (max 15 total)
            </span>
          </label>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            existingScreenshots.length + newScreenshotFiles.length >= 15
              ? 'bg-red-900/50 text-red-400'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {existingScreenshots.length + newScreenshotFiles.length} / 15
          </span>
        </div>

        {/* Visible Add Button */}
        <div>
          <input
            ref={visibleScreenshotInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleScreenshotsChange(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => visibleScreenshotInputRef.current?.click()}
            disabled={existingScreenshots.length + newScreenshotFiles.length >= 15}
            className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-gray-600 bg-gray-800 hover:bg-gray-750 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg py-5 transition"
          >
            <span className="text-2xl text-gray-400">＋</span>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Add Screenshot</p>
              <p className="text-xs text-gray-500">PNG, JPEG, WebP — max 5MB each</p>
            </div>
          </button>
        </div>

        {/* Newly selected screenshots — individual cards */}
        {screenshotPreviews.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
              New — {screenshotPreviews.length} image(s) selected
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {screenshotPreviews.map((preview, i) => (
                <div key={i} className="relative aspect-[4/3] border border-gray-600 rounded-lg overflow-hidden group bg-gray-900">
                  <img
                    src={preview}
                    alt={`New screenshot ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Filename badge */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[9px] text-gray-300 truncate">
                    {newScreenshotFiles[i]?.name}
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveNewScreenshot(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    title="Remove"
                  >
                    ✕
                  </button>
                  {/* Index badge */}
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing screenshots from the database */}
        {existingScreenshots.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
              Saved — {existingScreenshots.length} image(s)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingScreenshots.map((path, i) => {
                const displayPath = path.startsWith('/')
                  ? path.replace('/projects/medium/', '/projects/original/')
                  : path;
                return (
                  <div key={path} className="relative aspect-[4/3] border border-gray-600 rounded-lg overflow-hidden group bg-gray-900">
                    <img
                      src={displayPath}
                      alt={`Saved screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Index badge */}
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingScreenshot(path)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Website URL Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="websiteUrl" className="text-sm text-gray-300">
            Website URL <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.websiteUrl}/500
          </span>
        </div>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          maxLength={500}
          required
          defaultValue={initialData?.websiteUrl ?? ''}
          onChange={(e) => handleCharChange('websiteUrl', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
          placeholder="https://example.com"
        />
        <p className="text-xs text-gray-500">HTTPS URL of the project website (required)</p>
        {fieldError('websiteUrl')}
      </div>

      {/* Demo URL Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="demoUrl" className="text-sm text-gray-300">
            Demo URL
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.demoUrl}/500
          </span>
        </div>
        <input
          id="demoUrl"
          name="demoUrl"
          type="url"
          maxLength={500}
          defaultValue={initialData?.demoUrl ?? ''}
          onChange={(e) => handleCharChange('demoUrl', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
          placeholder="https://demo.example.com"
        />
        <p className="text-xs text-gray-500">Optional URL to live demo or preview</p>
        {fieldError('demoUrl')}
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center gap-3">
        <input
          id="isFeatured"
          name="isFeatured"
          type="checkbox"
          defaultChecked={initialData?.isFeatured ?? false}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 cursor-pointer"
        />
        <label htmlFor="isFeatured" className="text-sm text-gray-300 cursor-pointer">
          Mark as featured to highlight on work page
        </label>
      </div>

      {/* Tags Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="tags" className="text-sm text-gray-300">
            Tags
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.tags}/100
          </span>
        </div>
        <textarea
          id="tags"
          name="tags"
          maxLength={100}
          defaultValue={initialData?.tags?.join(', ') ?? ''}
          onChange={(e) => handleCharChange('tags', e.target.value)}
          rows={2}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-y"
          placeholder="e.g., web design, mobile, e-commerce"
        />
        <p className="text-xs text-gray-500">Comma-separated tags for categorization (max 5 tags, total 100 characters)</p>
        {fieldError('tags')}
      </div>

      {/* Client Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="client" className="text-sm text-gray-300">
            Client <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.client}/200
          </span>
        </div>
        <input
          id="client"
          name="client"
          type="text"
          maxLength={200}
          required
          defaultValue={initialData?.client ?? ''}
          onChange={(e) => handleCharChange('client', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
        />
        {fieldError('client')}
      </div>

      {/* Timeline Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="timeline" className="text-sm text-gray-300">
            Timeline <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.timeline}/100
          </span>
        </div>
        <input
          id="timeline"
          name="timeline"
          type="text"
          maxLength={100}
          required
          defaultValue={initialData?.timeline ?? ''}
          onChange={(e) => handleCharChange('timeline', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
        />
        {fieldError('timeline')}
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="results" className="text-sm text-gray-300">
            Results <span className="text-red-400">*</span>
            <span className="text-gray-500 text-xs ml-2">(comma-separated)</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.results}/500
          </span>
        </div>
        <input
          id="results"
          name="results"
          type="text"
          maxLength={500}
          required
          defaultValue={initialData?.results?.join(', ') ?? ''}
          onChange={(e) => handleCharChange('results', e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
        />
        <p className="text-xs text-gray-500">Key metrics/results (comma-separated, max 500 characters)</p>
        {fieldError('results')}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="content" className="text-sm text-gray-300">
            Content <span className="text-red-400">*</span>
          </label>
          <span className="text-xs text-gray-500">
            {charCounts.content}/5000
          </span>
        </div>
        <textarea
          id="content"
          name="content"
          maxLength={5000}
          required
          defaultValue={initialData?.content ?? ''}
          onChange={(e) => handleCharChange('content', e.target.value)}
          rows={8}
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white resize-y"
        />
        <p className="text-xs text-gray-500">Detailed project story (max 5000 characters)</p>
        {fieldError('content')}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-white text-black py-2 px-6 rounded font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {pending ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
