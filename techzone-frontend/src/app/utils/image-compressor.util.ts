export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export class ImageCompressorUtil {
  
  /**
   * Compresses an image File using HTML5 Canvas.
   * Ensures output width <= 1200px and file size <= 300KB.
   */
  static compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const maxWidth = options.maxWidth || 1200;
    const maxHeight = options.maxHeight || 1200;
    const initialQuality = options.quality || 0.82;
    const maxSizeKB = options.maxSizeKB || 300;

    return new Promise((resolve, reject) => {
      // If file is already small (< 150KB), resolve directly
      if (file.size <= 150 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Resize maintaining aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to Blob with quality control under maxSizeKB
          let quality = initialQuality;

          const convertToBlob = (q: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve(file);
                  return;
                }

                // If size is still larger than target, reduce quality and try once more
                if (blob.size > maxSizeKB * 1024 && q > 0.5) {
                  convertToBlob(q - 0.15);
                } else {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                    type: "image/webp",
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                }
              },
              "image/webp",
              q
            );
          };

          convertToBlob(quality);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  }
}
