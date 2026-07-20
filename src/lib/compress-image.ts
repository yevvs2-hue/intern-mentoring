const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i;

// 일부 안드로이드/구형 iOS 브라우저는 HEIC 등 확장자의 MIME 타입을 인식하지 못해
// file.type을 빈 문자열로 주는 경우가 있어, 그럴 때는 확장자로 이미지 여부를 판단한다.
export function isImageFile(file: File): boolean {
  if (file.type) return file.type.startsWith("image/");
  return IMAGE_EXTENSIONS.test(file.name);
}

export async function compressImage(file: File): Promise<File> {
  if (!isImageFile(file) || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= 4 * 1024 * 1024) {
      bitmap.close();
      return file;
    }
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
