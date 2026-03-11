import { Toaster } from "@/components/ui/sonner";
import { Camera } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AdminAuth } from "./components/AdminAuth";
import { Lightbox } from "./components/Lightbox";
import { PhotoGrid } from "./components/PhotoGrid";
import { DropzoneOverlay, UploadButton } from "./components/UploadZone";
import { useGetAllPhotos, useUploadPhoto } from "./hooks/useQueries";

export default function App() {
  const { data: photos = [], isLoading } = useGetAllPhotos();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { mutateAsync } = useUploadPhoto();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (files: FileList) => {
      setIsDragging(false);
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        toast.error("Please drop image files.");
        return;
      }
      let succeeded = 0;
      for (const file of imageFiles) {
        try {
          await mutateAsync({ file, onProgress: () => {} });
          succeeded++;
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        }
      }
      if (succeeded > 0) {
        toast.success(
          succeeded === 1 ? "Photo uploaded!" : `${succeeded} photos uploaded!`,
        );
      }
    },
    [mutateAsync],
  );

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Hero header */}
      <header
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('/assets/generated/gallery-hero-bg.dim_1920x400.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/70" />
        <div className="relative z-10 px-6 py-10 md:py-14 max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-body font-semibold uppercase tracking-widest text-primary">
                  Community Gallery
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Shared Moments
              </h1>
              <p className="mt-2 text-muted-foreground font-body text-sm md:text-base max-w-md">
                A public gallery — upload freely, no account needed. Every photo
                tells a story.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-2 shrink-0 flex flex-col items-end gap-3"
            >
              <UploadButton />
              <AdminAuth
                isAdmin={isAdmin}
                onLogin={() => setIsAdmin(true)}
                onLogout={() => setIsAdmin(false)}
              />
            </motion.div>
          </div>

          {/* Stats bar */}
          {!isLoading && photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-2 text-xs text-muted-foreground font-body"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                {photos.length} photo{photos.length !== 1 ? "s" : ""} in the
                collection
              </span>
              {isAdmin && (
                <span className="ml-2 text-primary font-semibold">
                  · Admin mode active
                </span>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Gallery */}
      <main className="flex-1 px-4 md:px-6 py-8 max-w-7xl mx-auto w-full">
        <PhotoGrid
          photos={photos}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onPhotoClick={setLightboxIndex}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {currentYear}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Lightbox */}
      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      {/* Drag drop overlay */}
      <DropzoneOverlay isDragging={isDragging} onDrop={handleDrop} />

      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
