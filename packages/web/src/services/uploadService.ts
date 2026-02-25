import { tokenService } from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UploadedAttachment {
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

/**
 * Get a presigned S3 PUT URL from the backend, upload the file directly
 * to S3, and return the attachment metadata to include in issue creation.
 */
export async function uploadPhoto(
  file: File,
  buildingId: string,
): Promise<UploadedAttachment> {
  const token = tokenService.getToken();
  if (!token) throw new Error('Not authenticated');

  // 1. Get presigned URL from backend
  const presignRes = await fetch(`${API_BASE}/uploads/presign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      contentLength: file.size,
      buildingId,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to get upload URL');
  }

  const { data } = await presignRes.json();

  // 2. PUT file bytes directly to S3
  const s3Res = await fetch(data.presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!s3Res.ok) throw new Error('Upload to S3 failed');

  return {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
    url: data.fileUrl,
  };
}
