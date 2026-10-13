/**
 * Background Removal Utility for Logos
 * Automatically strips white, light, or solid background colors from uploaded logos,
 * making them transparent PNGs ready for headers, footers, and dashboards.
 */

export interface BackgroundRemovalOptions {
  tolerance?: number; // Color distance tolerance (default: 38)
  feather?: boolean;   // Soft edge blending (default: true)
  cropPaddings?: boolean; // Trim empty transparent borders (default: true)
}

/**
 * Remove background from an image file or data URL
 * Returns a PNG data URL with transparent background.
 */
export async function removeLogoBackground(
  imageSource: File | Blob | string,
  options: BackgroundRemovalOptions = {}
): Promise<string> {
  const tolerance = options.tolerance ?? 38;
  const feather = options.feather ?? true;

  // Load image
  const img = await loadImage(imageSource);

  // Maximum dimension for logos to ensure fast processing and sharp quality
  const maxDim = 512;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context tidak tersedia');
  }

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Detect background color from the 4 corners and borders
  const samplePoints: Array<[number, number]> = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  let sumR = 0, sumG = 0, sumB = 0, sampleCount = 0;
  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a > 128) {
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      sampleCount++;
    }
  }

  // Default to white if all transparent or invalid
  const targetR = sampleCount > 0 ? Math.round(sumR / sampleCount) : 255;
  const targetG = sampleCount > 0 ? Math.round(sumG / sampleCount) : 255;
  const targetB = sampleCount > 0 ? Math.round(sumB / sampleCount) : 255;

  const isBgLight = (targetR + targetG + targetB) / 3 > 200;

  // 2. Flood Fill from boundaries to preserve interior shapes with similar colors
  const visited = new Uint8Array(width * height);
  const isBackground = new Uint8Array(width * height);

  // Queue coordinates as flat indices
  const queue: number[] = [];

  const getColorDistance = (idx: number): number => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const dr = r - targetR;
    const dg = g - targetG;
    const db = b - targetB;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const isPixelBg = (idx: number): boolean => {
    const a = data[idx + 3];
    if (a < 30) return true; // already transparent

    const dist = getColorDistance(idx);
    if (dist <= tolerance) return true;

    // Extra check for white/light gray background variations
    if (isBgLight) {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > 230 && g > 230 && b > 230 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
        return true;
      }
    }

    return false;
  };

  // Enqueue all perimeter pixels
  for (let x = 0; x < width; x++) {
    // top border
    const topIdx = x;
    if (!visited[topIdx] && isPixelBg(topIdx * 4)) {
      visited[topIdx] = 1;
      queue.push(topIdx);
    }
    // bottom border
    const bottomIdx = (height - 1) * width + x;
    if (!visited[bottomIdx] && isPixelBg(bottomIdx * 4)) {
      visited[bottomIdx] = 1;
      queue.push(bottomIdx);
    }
  }

  for (let y = 0; y < height; y++) {
    // left border
    const leftIdx = y * width;
    if (!visited[leftIdx] && isPixelBg(leftIdx * 4)) {
      visited[leftIdx] = 1;
      queue.push(leftIdx);
    }
    // right border
    const rightIdx = y * width + (width - 1);
    if (!visited[rightIdx] && isPixelBg(rightIdx * 4)) {
      visited[rightIdx] = 1;
      queue.push(rightIdx);
    }
  }

  // BFS Flood Fill
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    isBackground[current] = 1;

    const cx = current % width;
    const cy = Math.floor(current / width);

    // 4 Neighbors
    const neighbors: number[] = [];
    if (cx > 0) neighbors.push(current - 1);
    if (cx < width - 1) neighbors.push(current + 1);
    if (cy > 0) neighbors.push(current - width);
    if (cy < height - 1) neighbors.push(current + width);

    for (const n of neighbors) {
      if (!visited[n]) {
        visited[n] = 1;
        if (isPixelBg(n * 4)) {
          queue.push(n);
        }
      }
    }
  }

  // Also check uniform near-white background anywhere in the image if outer background was white
  if (isBgLight) {
    for (let i = 0; i < width * height; i++) {
      if (!isBackground[i]) {
        const pIdx = i * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        if (r > 248 && g > 248 && b > 248) {
          isBackground[i] = 1;
        }
      }
    }
  }

  // 3. Apply Transparency & Edge Softening (Defringing)
  const lowThreshold = tolerance * 0.6;
  const highThreshold = tolerance * 1.25;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    if (isBackground[i]) {
      const dist = getColorDistance(idx);
      if (!feather || dist <= lowThreshold) {
        data[idx + 3] = 0; // Completely transparent
      } else if (dist <= highThreshold) {
        // Smooth feather alpha
        const factor = (dist - lowThreshold) / (highThreshold - lowThreshold);
        data[idx + 3] = Math.round(factor * 255);
      } else {
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Return crisp PNG data URL
  return canvas.toDataURL('image/png');
}

/**
 * Helper to load image from File, Blob, or URL
 */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat file gambar untuk penghapusan background'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
      reader.readAsDataURL(source);
    }
  });
}
