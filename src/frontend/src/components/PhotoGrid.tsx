import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Photo } from "../backend";
import { useDeletePhoto } from "../hooks/useQueries";

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => `skeleton-${i}`);

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  isAdmin: boolean;
  onPhotoClick: (index: number) => void;
}

export function PhotoGrid({
  photos,
  isLoading,
  isAdmin,
  onPhotoClick,
}: PhotoGridProps) {
  const { mutateAsync: deletePhoto } = useDeletePhoto();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    setDeletingId(photoId);
    try {
      await deletePhoto(photoId);
      toast.success("Photo deleted.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
        {SKELETON_KEYS.map((k) => (
          <Skeleton
            key={k}
            data-ocid="gallery.loading_state"
            className="aspect-square w-full rounded-sm bg-muted"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div
        data-ocid="gallery.empty_state"
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ImageOff className="w-9 h-9 text-muted-foreground" />
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">
          No photos yet
        </h3>
        <p className="text-muted-foreground max-w-xs">
          Be the first to share a photo. Drag &amp; drop or click the upload
          button above.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          data-ocid={`gallery.item.${index + 1}`}
          className="group relative aspect-square overflow-hidden rounded-sm bg-muted"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
          }}
        >
          <button
            type="button"
            onClick={() => onPhotoClick(index)}
            className="w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Open photo: ${photo.name}`}
          >
            <img
              src={photo.blob.getDirectURL()}
              alt={photo.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </button>

          {/* Caption overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/80 to-transparent px-3 py-3 pointer-events-none">
            <p className="text-white text-xs font-body truncate text-left">
              {photo.name}
            </p>
          </div>

          {/* Admin delete button */}
          {isAdmin && (
            <Button
              data-ocid={`gallery.delete_button.${index + 1}`}
              variant="destructive"
              size="icon"
              className="absolute top-1.5 right-1.5 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => handleDelete(e, photo.id)}
              disabled={deletingId === photo.id}
              aria-label={`Delete photo: ${photo.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Amber shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-transparent to-primary/10 pointer-events-none" />
        </motion.div>
      ))}
    </motion.div>
  );
}
