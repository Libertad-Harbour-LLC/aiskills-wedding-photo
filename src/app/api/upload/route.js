import { handleUpload } from "@vercel/blob/client";
import { APP } from "@/lib/app.config";

export const runtime = "nodejs";

// Optional direct upload from the visitor's device to YOUR Vercel Blob store.
// Works only when BLOB_READ_WRITE_TOKEN is set (Vercel: Storage → Blob → connect to the project).
// The file goes from the browser straight to Blob storage, so large videos are fine.
export async function POST(req) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "upload_disabled", message: "Upload is not enabled — paste a public link" }, { status: 400 });
  }
  const body = await req.json();
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const code = (process.env.ACCESS_CODE || "").trim();
        if (code && (clientPayload || "") !== code) throw new Error("access_code_required");
        return {
          allowedContentTypes: APP.upload.types,
          maximumSizeInBytes: APP.upload.maxBytes,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: "upload_failed", message: String(e?.message || e) }, { status: 400 });
  }
}
