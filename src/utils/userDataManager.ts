import {
  UnifiedHistoryItem,
  LegacyClipstreamHistoryItem,
  LegacyTokHDHistoryItem,
  SupportedPlatform,
} from '../types';

export const UNIFIED_STORAGE_KEY = 'clipstream_tokhd_unified_history_v1';
export const LEGACY_CLIPSTREAM_KEY = 'clipstream_history';
export const LEGACY_TOKHD_KEY = 'tokhd_download_history_v1';
export const LEGACY_FACEBOOK_KEY = 'facebook_download_history_v1';
export const PREFERENCES_STORAGE_KEY = 'clipstream_tokhd_preferences_v1';

export interface UserPreferences {
  defaultPlatform: 'auto' | 'youtube' | 'tiktok' | 'facebook';
  defaultVideoQuality: 'hd' | '1080p' | '720p' | 'sd';
  soundNotifications: boolean;
  autoPlayPreview: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultPlatform: 'auto',
  defaultVideoQuality: 'hd',
  soundNotifications: true,
  autoPlayPreview: true,
};

/**
 * Merges user data across ClipStream (YouTube), TokHD (TikTok), and Facebook seamlessly.
 * Automatically inspects localStorage for legacy records from all platforms,
 * transforms them into unified items, deduplicates, and saves back.
 */
export function getMergedUserData(): {
  items: UnifiedHistoryItem[];
  migratedFromClipStream: number;
  migratedFromTokHD: number;
  migratedFromFacebook: number;
} {
  let migratedClipStreamCount = 0;
  let migratedTokHDCount = 0;
  let migratedFacebookCount = 0;
  const mergedMap = new Map<string, UnifiedHistoryItem>();

  // 1. Read existing unified store if present
  try {
    const rawUnified = localStorage.getItem(UNIFIED_STORAGE_KEY);
    if (rawUnified) {
      const parsed: UnifiedHistoryItem[] = JSON.parse(rawUnified);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.id) {
            mergedMap.set(item.id, item);
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error reading unified history store:', err);
  }

  // 2. Read and merge legacy ClipStream history (YouTube)
  try {
    const rawClipstream = localStorage.getItem(LEGACY_CLIPSTREAM_KEY);
    if (rawClipstream) {
      const parsed: LegacyClipstreamHistoryItem[] = JSON.parse(rawClipstream);
      if (Array.isArray(parsed)) {
        parsed.forEach((c) => {
          if (!c) return;
          const canonicalUrl = c.url || (c.videoId ? `https://www.youtube.com/watch?v=${c.videoId}` : '');
          const id = c.id || `yt_${c.videoId || Date.now()}_${c.timestamp}`;

          if (!mergedMap.has(id)) {
            const unifiedItem: UnifiedHistoryItem = {
              id,
              platform: 'youtube',
              title: c.title || `YouTube Video (${c.videoId || ''})`,
              author: c.author || 'YouTube Creator',
              thumbnail: c.thumbnailUrl || (c.videoId ? `https://i.ytimg.com/vi/${c.videoId}/hqdefault.jpg` : ''),
              quality: '720p HD',
              format: 'MP4',
              fileSizeFormatted: '~35 MB',
              timestamp: c.timestamp || Date.now(),
              originalUrl: canonicalUrl,
              downloadUrl: canonicalUrl,
              videoId: c.videoId,
            };
            mergedMap.set(id, unifiedItem);
            migratedClipStreamCount++;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error reading legacy ClipStream history:', err);
  }

  // 3. Read and merge legacy TokHD history (TikTok)
  try {
    const rawTokHD = localStorage.getItem(LEGACY_TOKHD_KEY);
    if (rawTokHD) {
      const parsed: LegacyTokHDHistoryItem[] = JSON.parse(rawTokHD);
      if (Array.isArray(parsed)) {
        parsed.forEach((t) => {
          if (!t) return;
          const id = t.id || `tok_${t.timestamp}`;
          if (!mergedMap.has(id)) {
            const isMusic = (t.quality || '').toLowerCase().includes('music') || (t.quality || '').toLowerCase().includes('mp3');
            const unifiedItem: UnifiedHistoryItem = {
              id,
              platform: 'tiktok',
              title: t.title || 'TikTok Video No Watermark',
              author: t.authorName || 'TikTok Creator',
              authorHandle: t.authorHandle || 'tiktok',
              thumbnail: t.thumbnail || '',
              quality: t.quality || 'HD',
              format: isMusic ? 'MP3' : 'MP4',
              fileSizeFormatted: t.sizeFormatted || 'Stream',
              timestamp: t.timestamp || Date.now(),
              originalUrl: t.originalUrl || t.downloadUrl || '',
              downloadUrl: t.downloadUrl,
            };
            mergedMap.set(id, unifiedItem);
            migratedTokHDCount++;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error reading legacy TokHD history:', err);
  }

  // 4. Read and merge legacy Facebook history if available
  try {
    const rawFB = localStorage.getItem(LEGACY_FACEBOOK_KEY);
    if (rawFB) {
      const parsed: any[] = JSON.parse(rawFB);
      if (Array.isArray(parsed)) {
        parsed.forEach((f) => {
          if (!f) return;
          const id = f.id || `fb_${f.timestamp || Date.now()}`;
          if (!mergedMap.has(id)) {
            const unifiedItem: UnifiedHistoryItem = {
              id,
              platform: 'facebook',
              title: f.title || 'Facebook Video / Reel',
              author: f.author || 'Facebook Creator',
              thumbnail: f.thumbnail || '',
              quality: f.quality || 'HD',
              format: f.format || 'MP4',
              fileSizeFormatted: f.fileSizeFormatted || '~18 MB',
              timestamp: f.timestamp || Date.now(),
              originalUrl: f.originalUrl || f.url || '',
              downloadUrl: f.downloadUrl,
            };
            mergedMap.set(id, unifiedItem);
            migratedFacebookCount++;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Error reading legacy Facebook history:', err);
  }

  // 5. Sort all items by timestamp descending
  const items = Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);

  // 6. Save unified state back to localStorage
  try {
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(items.slice(0, 100)));

    // Synchronize YouTube legacy store
    const ytItems: LegacyClipstreamHistoryItem[] = items
      .filter((i) => i.platform === 'youtube')
      .map((i) => ({
        id: i.id,
        videoId: i.videoId || '',
        title: i.title,
        author: i.author,
        thumbnailUrl: i.thumbnail,
        timestamp: i.timestamp,
        url: i.originalUrl,
      }));
    localStorage.setItem(LEGACY_CLIPSTREAM_KEY, JSON.stringify(ytItems.slice(0, 50)));

    // Synchronize TikTok legacy store
    const tokItems: LegacyTokHDHistoryItem[] = items
      .filter((i) => i.platform === 'tiktok')
      .map((i) => ({
        id: i.id,
        title: i.title,
        authorName: i.author,
        authorHandle: i.authorHandle || 'tiktok',
        thumbnail: i.thumbnail,
        quality: i.quality,
        sizeFormatted: i.fileSizeFormatted || 'Ready',
        timestamp: i.timestamp,
        downloadUrl: i.downloadUrl || i.originalUrl,
        originalUrl: i.originalUrl,
      }));
    localStorage.setItem(LEGACY_TOKHD_KEY, JSON.stringify(tokItems.slice(0, 50)));

    // Synchronize Facebook legacy store
    const fbItems = items.filter((i) => i.platform === 'facebook');
    localStorage.setItem(LEGACY_FACEBOOK_KEY, JSON.stringify(fbItems.slice(0, 50)));
  } catch (e) {
    console.warn('Error saving merged history:', e);
  }

  return {
    items,
    migratedFromClipStream: migratedClipStreamCount,
    migratedFromTokHD: migratedTokHDCount,
    migratedFromFacebook: migratedFacebookCount,
  };
}

/**
 * Persists a newly added media download to the unified store and legacy stores.
 */
export function saveHistoryItem(item: UnifiedHistoryItem): UnifiedHistoryItem[] {
  const current = getMergedUserData().items;
  const filtered = current.filter(
    (existing) => !(existing.originalUrl === item.originalUrl && Math.abs(existing.timestamp - item.timestamp) < 60000)
  );
  const updated = [item, ...filtered].slice(0, 100);

  try {
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(updated));

    // Sync YouTube legacy store
    const ytItems = updated.filter((i) => i.platform === 'youtube');
    localStorage.setItem(
      LEGACY_CLIPSTREAM_KEY,
      JSON.stringify(
        ytItems.map((i) => ({
          id: i.id,
          videoId: i.videoId || '',
          title: i.title,
          author: i.author,
          thumbnailUrl: i.thumbnail,
          timestamp: i.timestamp,
          url: i.originalUrl,
        }))
      )
    );

    // Sync TikTok legacy store
    const tokItems = updated.filter((i) => i.platform === 'tiktok');
    localStorage.setItem(
      LEGACY_TOKHD_KEY,
      JSON.stringify(
        tokItems.map((i) => ({
          id: i.id,
          title: i.title,
          authorName: i.author,
          authorHandle: i.authorHandle || 'tiktok',
          thumbnail: i.thumbnail,
          quality: i.quality,
          sizeFormatted: i.fileSizeFormatted || 'Downloaded',
          timestamp: i.timestamp,
          downloadUrl: i.downloadUrl || i.originalUrl,
          originalUrl: i.originalUrl,
        }))
      )
    );

    // Sync Facebook legacy store
    const fbItems = updated.filter((i) => i.platform === 'facebook');
    localStorage.setItem(LEGACY_FACEBOOK_KEY, JSON.stringify(fbItems));
  } catch (e) {
    console.warn('Failed to save history item:', e);
  }

  return updated;
}

export function clearAllUserData(): void {
  try {
    localStorage.removeItem(UNIFIED_STORAGE_KEY);
    localStorage.removeItem(LEGACY_CLIPSTREAM_KEY);
    localStorage.removeItem(LEGACY_TOKHD_KEY);
    localStorage.removeItem(LEGACY_FACEBOOK_KEY);
  } catch (e) {
    console.warn('Error clearing user data:', e);
  }
}

export function removeHistoryItem(id: string): UnifiedHistoryItem[] {
  const current = getMergedUserData().items;
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error removing history item:', e);
  }
  return updated;
}

/**
 * Exports complete merged user library as a downloadable JSON file.
 */
export function exportUserDataAsJSON(): void {
  const data = {
    app: 'ClipStream Studio',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    creator: 'Harmain Ameer (harmainameer309@gmail.com)',
    totalItems: 0,
    history: getMergedUserData().items,
  };
  data.totalItems = data.history.length;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unified_downloader_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports user data from backup JSON and seamlessly merges into existing records.
 */
export function importUserDataFromJSON(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const importedItems: any[] = Array.isArray(parsed) ? parsed : parsed.history || [];

        if (!Array.isArray(importedItems) || importedItems.length === 0) {
          resolve({ success: false, count: 0, error: 'No valid download history found in the file' });
          return;
        }

        let addedCount = 0;
        const current = getMergedUserData().items;
        const map = new Map<string, UnifiedHistoryItem>();
        current.forEach((i) => map.set(i.id, i));

        importedItems.forEach((raw) => {
          const id = raw.id || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          if (!map.has(id)) {
            const urlToCheck = (raw.originalUrl || raw.url || '').toLowerCase();
            let platform: SupportedPlatform = 'youtube';
            if (raw.platform === 'facebook' || urlToCheck.includes('facebook.com') || urlToCheck.includes('fb.watch')) {
              platform = 'facebook';
            } else if (raw.platform === 'tiktok' || raw.authorHandle || urlToCheck.includes('tiktok.com')) {
              platform = 'tiktok';
            }

            const item: UnifiedHistoryItem = {
              id,
              platform,
              title: raw.title || 'Saved Video',
              author: raw.author || raw.authorName || 'Creator',
              authorHandle: raw.authorHandle,
              thumbnail: raw.thumbnail || raw.thumbnailUrl || '',
              quality: raw.quality || '1080p / HD',
              format: raw.format || 'MP4',
              fileSizeFormatted: raw.fileSizeFormatted || raw.sizeFormatted,
              timestamp: raw.timestamp || Date.now(),
              originalUrl: raw.originalUrl || raw.url || '',
              downloadUrl: raw.downloadUrl || raw.url,
              videoId: raw.videoId,
            };
            map.set(id, item);
            addedCount++;
          }
        });

        const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(UNIFIED_STORAGE_KEY, JSON.stringify(merged));
        resolve({ success: true, count: addedCount });
      } catch (err: any) {
        resolve({ success: false, count: 0, error: err.message || 'Invalid JSON format' });
      }
    };
    reader.onerror = () => resolve({ success: false, count: 0, error: 'Could not read file' });
    reader.readAsText(file);
  });
}
