// Shrinks a screenshot in the browser before sending it, so uploads are fast
// on phones and stay well under the server's size limit.

const MAX_SIDE = 1600; // pixels — plenty for the AI to read text

export interface PreparedImage {
  mediaType: "image/jpeg";
  data: string; // base64 without the "data:...;base64," prefix
  previewUrl: string; // for showing a thumbnail
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // White background so transparent PNGs don't turn black as JPEG.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.split(",")[1], previewUrl: dataUrl };
}
