import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadPhoto } from "../hooks/useQueries";

export function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const { mutateAsync, isPending } = useUploadPhoto();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        toast.error("Please select image files.");
        return;
      }
      if (imageFiles.length < files.length) {
        toast.warning(
          `${files.length - imageFiles.length} non-image file(s) skipped.`,
        );
      }
      setUploadingCount(imageFiles.length);
      setDoneCount(0);
      setProgress(0);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          await mutateAsync({
            file,
            onProgress: (pct) => {
              // Overall progress: completed files + current file progress
              setProgress(((i + pct / 100) / imageFiles.length) * 100);
            },
          });
          setDoneCount(i + 1);
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        }
      }

      toast.success(
        imageFiles.length === 1
          ? "Photo uploaded!"
          : `${imageFiles.length} photos uploaded!`,
      );
      setProgress(null);
      setUploadingCount(0);
      setDoneCount(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [mutateAsync],
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload photos"
      />
      <Button
        data-ocid="gallery.upload_button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-5"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isPending
          ? uploadingCount > 1
            ? `Uploading ${doneCount + 1}/${uploadingCount}…`
            : "Uploading…"
          : "Upload Photos"}
      </Button>

      <AnimatePresence>
        {progress !== null && (
          <motion.div
            data-ocid="upload.loading_state"
            className="w-44"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {uploadingCount > 1
                ? `${doneCount}/${uploadingCount} done`
                : `${Math.round(progress)}%`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropzoneOverlay({
  isDragging,
  onDrop,
}: {
  isDragging: boolean;
  onDrop: (files: FileList) => void;
}) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          data-ocid="gallery.dropzone"
          className="fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) onDrop(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-4 border-2 border-dashed border-primary rounded-2xl px-20 py-16 shadow-amber">
            <Upload className="w-14 h-14 text-primary" />
            <p className="font-display text-3xl text-foreground">
              Drop to upload
            </p>
            <p className="text-muted-foreground text-sm">
              Release your photos to add them to the gallery
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
