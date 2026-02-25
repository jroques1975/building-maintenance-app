import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { createPresignedPut, validateUpload } from '../services/s3.service';

export const uploadRoutes = Router();

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  contentLength: z.number().int().positive().max(10_485_760), // 10 MB
  buildingId: z.string().min(1),
});

/**
 * POST /api/uploads/presign
 * Returns a short-lived S3 presigned PUT URL.
 * The client uploads directly to S3, then includes the returned fileUrl
 * in the issue creation body under attachments[].url.
 */
uploadRoutes.post('/presign', authenticate, async (req, res) => {
  const data = presignSchema.parse(req.body);

  const validationError = validateUpload(data.contentType, data.contentLength);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const result = await createPresignedPut(
    data.contentType,
    data.filename,
    data.buildingId,
  );

  return res.json({
    success: true,
    data: {
      presignedUrl: result.presignedUrl,
      fileUrl: result.fileUrl,
      key: result.key,
    },
  });
});
