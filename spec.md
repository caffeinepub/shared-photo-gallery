# Shared Photo Gallery

## Current State
A public gallery where anyone can upload and browse photos without login. Single-file upload via button or drag-and-drop. Lightbox for full-screen viewing. Photos sorted newest-to-oldest. No delete functionality.

## Requested Changes (Diff)

### Add
- `deletePhoto(photoId)` backend endpoint
- Multi-file upload: file picker accepts multiple files, processes them sequentially with per-file progress
- Drag-and-drop supports multiple files at once
- Admin mode: frontend-only static password check ("purgeme123"); when authenticated, delete buttons appear on each photo in the grid
- Admin login UI: a small lock icon / "Admin" button in the header opens a password dialog
- Admin logout button when authenticated

### Modify
- `UploadButton` and `DropzoneOverlay` to accept and process multiple files
- `PhotoGrid` to optionally show a delete button overlay on each photo when `isAdmin=true`
- `useQueries.ts` to add `useDeletePhoto` mutation
- `App.tsx` to manage admin state and pass it down

### Remove
- Nothing removed

## Implementation Plan
1. Add `deletePhoto` to `main.mo`
2. Regenerate `backend.d.ts` types (add `deletePhoto` signature)
3. Update `useQueries.ts`: add `useDeletePhoto`, update upload to handle multiple files
4. Update `UploadZone.tsx`: multi-file picker + multi-file drop
5. Update `PhotoGrid.tsx`: show delete overlay when `isAdmin=true`
6. Add `AdminAuth` component: lock icon button in header, password dialog
7. Update `App.tsx`: admin state, pass to PhotoGrid, wire AdminAuth
