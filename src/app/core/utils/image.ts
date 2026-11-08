export async function compressImage(
    blob: Blob,
    maxSide = 1280,
    quality = 0.8,
): Promise<Blob> {
    const bitmap = await createImageBitmap(blob, {
        imageOrientation: 'from-image',
    });

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (out) => (out ? resolve(out) : reject(new Error('Compression failed'))),
            'image/jpeg',
            quality,
        )
    })
}