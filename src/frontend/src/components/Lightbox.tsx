import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import type { Photo } from "../backend";

interface LightboxProps {
  photos: Photo[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function formatDate(uploadedAt: bigint): string {
  const ms = Number(uploadedAt) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const isOpen = currentIndex !== null;
  const photo = currentIndex !== null ? photos[currentIndex] : null;

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, handlePrev, handleNext]);

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          data-ocid="lightbox.dialog"
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center w-full h-full p-4 md:p-8">
            {/* Top bar */}
            <div className="flex items-center justify-between w-full max-w-5xl mb-4">
              <div>
                <p className="font-display text-lg text-foreground truncate max-w-xs md:max-w-md">
                  {photo.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(photo.uploadedAt)}
                </p>
              </div>
              <Button
                data-ocid="lightbox.close_button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-foreground hover:text-primary hover:bg-white/10 rounded-full"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Image + nav */}
            <div className="relative flex items-center justify-center flex-1 w-full max-w-5xl">
              {/* Prev */}
              {photos.length > 1 && (
                <Button
                  data-ocid="lightbox.pagination_prev"
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  className="absolute left-0 z-20 text-foreground hover:text-primary hover:bg-white/10 rounded-full w-12 h-12"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={photo.id}
                  src={photo.blob.getDirectURL()}
                  alt={photo.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-sm shadow-2xl"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Next */}
              {photos.length > 1 && (
                <Button
                  data-ocid="lightbox.pagination_next"
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="absolute right-0 z-20 text-foreground hover:text-primary hover:bg-white/10 rounded-full w-12 h-12"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* Counter */}
            {photos.length > 1 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {currentIndex! + 1} / {photos.length}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
