/** Reduce y comprime una imagen en el navegador antes de subirla (maximo ~420 KB, ancho maximo 1400 px). */
export async function compressImage(file: File, maxBytes = 420_000): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("El archivo no es una imagen.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("No se pudo leer la imagen.");
  });
  let width = Math.min(1400, bitmap.width);
  for (let round = 0; round < 5; round++) {
    const height = Math.max(1, Math.round((bitmap.height * width) / bitmap.width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Tu navegador no puede procesar imágenes.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    for (const quality of [0.86, 0.76, 0.66, 0.56]) {
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
      if (blob && blob.type === "image/webp" && blob.size <= maxBytes) {
        bitmap.close();
        return blob;
      }
      if (blob && blob.type !== "image/webp") {
        // El navegador no sabe WEBP: se usa JPEG.
        const jpg = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
        if (jpg && jpg.size <= maxBytes) {
          bitmap.close();
          return jpg;
        }
      }
    }
    width = Math.round(width * 0.8);
  }
  bitmap.close();
  throw new Error("La imagen sigue siendo muy pesada. Prueba con otra o más pequeña.");
}
