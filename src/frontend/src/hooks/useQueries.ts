import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetAllPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      const photos = await actor.getAllPhotos();
      return [...photos].sort((a, b) => {
        const aTime = Number(a.uploadedAt);
        const bTime = Number(b.uploadedAt);
        return bTime - aTime;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(onProgress);
      return actor.uploadPhoto(file.name, file.type, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useDeletePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
