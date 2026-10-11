import JSZip from 'jszip';
import { DownloadTask, TikTokVideo, SupportedPlatform } from '../types';

export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let unitIndex = 0;
  while (val >= 1024 && unitIndex < units.length - 1) {
    val /= 1024;
    unitIndex++;
  }
  return `${val.toFixed(1)} ${units[unitIndex]}`;
}

export function formatNumber(num?: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function sanitizeFilename(name: string, fallback = 'video_download'): string {
  const sanitized = name.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 60).trim();
  return sanitized || fallback;
}

export interface StreamDownloadCallbacks {
  onProgress: (task: Partial<DownloadTask>) => void;
  onSuccess: (filename: string, blob: Blob) => void;
  onError: (error: string) => void;
}

/**
 * Downloads a media file via proxy with live progress tracking (bytes, speed, ETA)
 */
export async function downloadMediaStream(
  mediaUrl: string,
  filename: string,
  taskId: string,
  taskTitle: string,
  quality: DownloadTask['quality'],
  platform: SupportedPlatform,
  callbacks: StreamDownloadCallbacks,
  abortController?: AbortController
): Promise<Blob | null> {
  const controller = abortController || new AbortController();

  try {
    const isYt = platform === 'youtube';
    const endpoint = isYt ? '/api/proxy-download' : '/api/proxy-media';
    const proxyUrl = `${endpoint}?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(
      filename
    )}&download=1`;

    callbacks.onProgress({
      id: taskId,
      title: taskTitle,
      platform,
      quality,
      status: 'downloading',
      percentage: 0,
      receivedBytes: 0,
      totalBytes: 0,
      speedFormatted: 'Connecting to stream...',
      etaFormatted: '--',
    });

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${response.statusText}`);
    }

    const contentLengthHeader = response.headers.get('content-length');
    const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

    if (!response.body) {
      throw new Error('ReadableStream not supported by response');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;
    const startTime = Date.now();
    let lastTime = startTime;
    let lastBytes = 0;
    let speedBytesPerSec = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;

        const now = Date.now();
        const interval = now - lastTime;

        // Smooth speed calculation every 250ms
        if (interval >= 250 || receivedBytes === totalBytes) {
          const deltaBytes = receivedBytes - lastBytes;
          const currentSpeed = (deltaBytes / interval) * 1000;
          speedBytesPerSec =
            speedBytesPerSec === 0 ? currentSpeed : speedBytesPerSec * 0.7 + currentSpeed * 0.3;
          lastTime = now;
          lastBytes = receivedBytes;

          let etaSeconds = 0;
          if (totalBytes > receivedBytes && speedBytesPerSec > 0) {
            etaSeconds = Math.round((totalBytes - receivedBytes) / speedBytesPerSec);
          }

          const percentage =
            totalBytes > 0
              ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100))
              : Math.min(99, Math.round(receivedBytes / (1024 * 1024 * 5))); // estimated for unknown length

          callbacks.onProgress({
            id: taskId,
            status: 'downloading',
            receivedBytes,
            totalBytes,
            percentage,
            speedFormatted: `${formatBytes(speedBytesPerSec)}/s`,
            etaFormatted: etaSeconds > 0 ? `${etaSeconds}s remaining` : 'finishing...',
          });
        }
      }
    }

    const isMp3 = filename.toLowerCase().endsWith('.mp3');
    const isJpg = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg');
    const contentType = isMp3 ? 'audio/mpeg' : isJpg ? 'image/jpeg' : 'video/mp4';

    const blob = new Blob(chunks as unknown as BlobPart[], { type: contentType });

    callbacks.onProgress({
      id: taskId,
      status: 'completed',
      percentage: 100,
      receivedBytes,
      totalBytes: receivedBytes,
      speedFormatted: 'Done',
      etaFormatted: 'Complete',
    });

    // Trigger browser file download
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

    callbacks.onSuccess(filename, blob);
    return blob;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      callbacks.onProgress({
        id: taskId,
        status: 'cancelled',
        speedFormatted: 'Cancelled',
        etaFormatted: '--',
      });
      return null;
    }
    console.error('Download error:', error);
    callbacks.onError(error.message || 'Download failed');
    callbacks.onProgress({
      id: taskId,
      status: 'error',
      error: error.message || 'Download failed',
    });
    return null;
  }
}

/**
 * Creates and downloads a ZIP file containing multiple videos/audio tracks from all platforms
 */
export async function downloadBatchAsZip(
  items: Array<{
    video: any;
    platform: SupportedPlatform;
    quality: string;
  }>,
  zipFilename: string,
  onZipProgress: (percent: number, currentItem: string) => void
): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const { video, platform, quality } = items[i];
    const prefix = `${(i + 1).toString().padStart(2, '0')}_`;
    const titleClean = sanitizeFilename(video.title || `video_${video.id || i}`);

    let mediaUrl = video.hdplay || video.hdUrl || video.play || video.sdUrl || video.canonicalUrl || '';
    let extension = 'mp4';

    if (platform === 'youtube') {
      if (quality === 'music') {
        extension = 'mp3';
      }
      mediaUrl = video.canonicalUrl || video.url || mediaUrl;
    } else if (platform === 'facebook') {
      if (quality === 'music') {
        extension = 'mp3';
      }
      mediaUrl = (quality === 'sd' ? video.sdUrl : video.hdUrl) || video.hdUrl || video.sdUrl || mediaUrl;
    } else {
      if (quality === 'hd') {
        mediaUrl = video.hdplay || video.play;
      } else if (quality === 'sd') {
        mediaUrl = video.play;
      } else if (quality === 'wm') {
        mediaUrl = video.wmplay || video.play;
      } else if (quality === 'music') {
        mediaUrl = video.music || video.play;
        extension = 'mp3';
      }
    }

    const itemName = `${prefix}${titleClean}_${quality.toUpperCase()}.${extension}`;
    onZipProgress(
      Math.round((i / items.length) * 80),
      `Fetching [${platform.toUpperCase()}] ${i + 1}/${items.length}: ${titleClean.slice(0, 30)}...`
    );

    try {
      const endpoint = platform === 'youtube' ? '/api/proxy-download' : '/api/proxy-media';
      const proxyUrl = `${endpoint}?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(
        itemName
      )}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        zip.file(itemName, blob);
      }
    } catch (e) {
      console.warn(`Failed adding ${itemName} to zip:`, e);
    }
  }

  onZipProgress(85, 'Packaging ZIP archive...');

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 4 },
    },
    (metadata) => {
      onZipProgress(85 + Math.round(metadata.percent * 0.15), 'Compressing ZIP archive...');
    }
  );

  onZipProgress(100, 'Saving ZIP archive...');
  const objectUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
