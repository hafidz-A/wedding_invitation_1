'use client'

import { useCallback, useState } from 'react'

export function useUpload(slug: string) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true)
      setError(null)
      try {
        const form = new FormData()
        form.append('slug', slug)
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setError(err.error || `HTTP ${res.status}`)
          return null
        }
        const data = await res.json()
        return data.url as string
      } catch (e: any) {
        setError(e?.message || 'Upload failed')
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [slug],
  )

  return { upload, isUploading, error }
}
