'use client'

import { Download, X, Maximize2, Sparkles } from 'lucide-react'
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
      <div className="glass-strong border-b border-border/50 p-4 max-h-72 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Sparkles size={16} className="text-accent" />
          <h3 className="text-sm font-medium text-foreground">Generated Images</h3>
          <span className="ml-auto text-xs text-muted-foreground">{images.length} images</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-xl overflow-hidden glass cursor-pointer hover:ring-2 ring-accent/50 transition-all duration-300 hover:scale-[1.02] animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                <p className="text-xs text-foreground font-medium line-clamp-2 mb-2">{image.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image)
                    }}
                    className="flex-1 py-1.5 bg-foreground/90 hover:bg-foreground rounded-lg text-background text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={12} />
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(image)
                    }}
                    className="p-1.5 bg-accent/90 hover:bg-accent rounded-lg text-accent-foreground transition-colors"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2.5 glass hover:bg-card/90 rounded-xl text-foreground transition-all duration-200"
            >
              <X size={20} />
            </button>

            <div className="glass-strong rounded-2xl overflow-hidden">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="w-full rounded-t-2xl"
              />

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prompt</p>
                  <p className="text-foreground leading-relaxed">{selectedImage.prompt}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="flex-1 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download size={18} />
                    Download Image
                  </button>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="px-6 py-3 glass hover:bg-card/90 text-foreground rounded-xl font-medium transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
