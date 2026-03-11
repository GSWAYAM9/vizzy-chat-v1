'use client'

import { Download, X } from 'lucide-react'
import type { GeneratedImage } from '@/lib/db'
import { useState } from 'react'

interface ImageGalleryProps {
  images: GeneratedImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vizzy-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="border-b border-border p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer hover:ring-2 ring-primary transition-all"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(image)
                  }}
                  className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs truncate">
                {image.prompt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            <img
              src={selectedImage.image_url}
              alt={selectedImage.prompt}
              className="w-full rounded-lg"
            />

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-300">Prompt:</p>
              <p className="text-white">{selectedImage.prompt}</p>

              <button
                onClick={() => handleDownload(selectedImage)}
                className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={20} />
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
