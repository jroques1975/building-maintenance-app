import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET_NAME || '';

// Lazy-initialised so missing env vars only error at call time, not import time.
let _s3: S3Client | null = null;
function getClient(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return _s3;
}

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateUpload(contentType: string, contentLength: number): string | null {
  if (!ALLOWED_TYPES.has(contentType)) return 'File type not allowed';
  if (contentLength > MAX_BYTES) return 'File exceeds 10 MB limit';
  return null;
}

export async function createPresignedPut(
  contentType: string,
  originalFilename: string,
  buildingId: string,
): Promise<{ presignedUrl: string; fileUrl: string; key: string }> {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME is not configured');

  const ext = originalFilename.split('.').pop() ?? 'jpg';
  const key = `issues/${buildingId}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(getClient(), command, { expiresIn: 300 }); // 5 min
  const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  return { presignedUrl, fileUrl, key };
}

/**
 * Extract the S3 object key from a stored fileUrl.
 * e.g. https://bucket.s3.region.amazonaws.com/issues/xyz/uuid.jpg → issues/xyz/uuid.jpg
 */
export function keyFromUrl(url: string): string {
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : url;
}

/**
 * Generate a presigned GET URL for a private S3 object.
 * Falls back to the original url if S3 is not configured.
 */
export async function createPresignedGet(
  url: string,
  expiresIn = 3600, // 1 hour
): Promise<string> {
  if (!BUCKET) return url;
  const key = keyFromUrl(url);
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(getClient(), command, { expiresIn });
}

/**
 * Sign all attachment URLs in a list. Safe to call with an empty array.
 */
export async function signAttachments<T extends { url: string }>(
  attachments: T[],
): Promise<T[]> {
  if (!attachments.length || !BUCKET) return attachments;
  return Promise.all(
    attachments.map(async (a) => ({ ...a, url: await createPresignedGet(a.url) })),
  );
}
