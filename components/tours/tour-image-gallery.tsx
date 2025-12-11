"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TourImageGalleryProps {
  images: string[]
  title: string
}

export function TourImageGallery({ images, title }: TourImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAll) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [showAll])

  // Keyboard navigation
  useEffect(() => {
    if (!showAll) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      } else if (e.key === "Escape") {
        setShowAll(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showAll, images.length])

  if (!images || images.length === 0) {
    return null
  }

  // Desktop: Show first 5 images in grid, mobile: show carousel
  const displayedImages = showAll ? images : images.slice(0, 5)
  const hasMoreImages = images.length > 5

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="space-y-4">
      {/* Desktop Grid Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-lg overflow-hidden">
          {/* Main large image (top-left, spans 2x2) */}
          <div className="col-span-2 row-span-2 relative group">
            <img
              src={displayedImages[0] || "/placeholder.svg"}
              alt={`${title} - Image 1`}
              className="w-full h-full object-cover"
            />
              {hasMoreImages && !showAll && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => {
                      setCurrentIndex(0)
                      setShowAll(true)
                    }}
                    className="bg-white/90 hover:bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg"
                  >
                    See more photos ({images.length})
                  </Button>
                </div>
              )}
          </div>

          {/* Top-right image */}
          {displayedImages[1] && (
            <div className="relative group">
              <img
                src={displayedImages[1]}
                alt={`${title} - Image 2`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Bottom-right images */}
          {displayedImages[2] && (
            <div className="relative group">
              <img
                src={displayedImages[2]}
                alt={`${title} - Image 3`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Bottom-right second image */}
          {displayedImages[3] && (
            <div className="relative group">
              <img
                src={displayedImages[3]}
                alt={`${title} - Image 4`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Bottom-right third image (with "See more photos" overlay if applicable) */}
          {displayedImages[4] && (
            <div className="relative group">
              <img
                src={displayedImages[4]}
                alt={`${title} - Image 5`}
                className="w-full h-full object-cover"
              />
              {hasMoreImages && !showAll && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Button
                    onClick={() => {
                      setCurrentIndex(0)
                      setShowAll(true)
                    }}
                    className="bg-white hover:bg-white/95 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2"
                  >
                    See more photos ({images.length})
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full-screen gallery modal */}
        {showAll && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <h2 className="text-white text-lg md:text-xl font-semibold">{title}</h2>
              <button
                onClick={() => setShowAll(false)}
                className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Close gallery"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Main image container */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
              <img
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 md:p-4 shadow-lg transition-colors z-10 border-2 border-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={28} className="text-white md:w-7 md:h-7" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 md:p-4 shadow-lg transition-colors z-10 border-2 border-white"
                    aria-label="Next image"
                  >
                    <ChevronRight size={28} className="text-white md:w-7 md:h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Footer with thumbnails and counter */}
            <div className="p-4 md:p-6 space-y-4 bg-black/50">
              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex
                        ? "border-pink-500 ring-2 ring-pink-500/50"
                        : "border-transparent hover:border-white/50"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${title} - Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Image counter */}
              <div className="text-center text-sm md:text-base text-white/80">
                {currentIndex + 1} of {images.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Carousel Layout */}
      <div className="md:hidden relative">
        <div className="relative h-[300px] overflow-hidden rounded-lg">
          {/* Image container with scroll */}
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="min-w-full h-full relative flex-shrink-0">
                <img
                  src={img}
                  alt={`${title} - Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* "See more photos" button on last image */}
                {idx === images.length - 1 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      onClick={() => {
                        setCurrentIndex(images.length - 1)
                        setShowAll(true)
                      }}
                      className="bg-white hover:bg-white/95 text-gray-900 font-semibold px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                      See more photos ({images.length})
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="text-gray-900" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="text-gray-900" />
              </button>
            </>
          )}

          {/* Pagination dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToImage(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

