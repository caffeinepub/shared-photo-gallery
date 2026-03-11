import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type PhotoId = string;
export interface Photo {
    id: PhotoId;
    blob: ExternalBlob;
    name: string;
    mimeType: string;
    uploadedAt: Time;
}
export interface backendInterface {
    getAllPhotos(): Promise<Array<Photo>>;
    getPhotoBlob(photoId: PhotoId): Promise<ExternalBlob>;
    uploadPhoto(name: string, mimeType: string, blob: ExternalBlob): Promise<PhotoId>;
    deletePhoto(photoId: PhotoId): Promise<void>;
}
