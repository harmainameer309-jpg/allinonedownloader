import React, { useState } from 'react';
import { BatchItem, DownloadTask, TikTokVideo, YouTubeVideoData } from '../types';
import {
  Layers,
  FolderArchive,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Play,
  Check,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Music,
  ExternalLink,
  Film,
} from 'lucide-react';
import {
  formatBytes,
  formatDuration,
  sanitizeFilename,
  downloadBatchAsZip,
} from '../utils/downloadManager';

interface BatchStudioProps {
  batchItems: BatchItem[];
  onSetBatchItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  onDownloadSingle: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: any
  ) => void;
  onPreview: (video: any) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_BATCH_LINKS = [
  'https://www.facebook.com/reel/1807623153746790',
  'https://www.youtube.com/watch?v=dyvxxJSGUsE',
  'https://www.tiktok.com/@tiktoktips/video/7675767536016706847',
  'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  'https://www.tiktok.com/@tiktokcreators/video/7310050334196367403',
];

export const BatchStudio: React.FC<BatchStudioProps> = ({
  batchItems,
  onSetBatchItems,
  onDownloadSingle,
  onPreview,
  onShowToast,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Batch ZIP packaging state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');

  // Sequential batch state
  const [isSequentialDownloading, setIsSequentialDownloading] = useState(false);
  const [sequentialIndex, setSequentialIndex] = useState(0);

  // Extract URLs from textarea
  const extractedUrls = urlInput
    .split(/[\n,\s]+/)
    .map((u) => u.trim())
    .filter(
      (u) =>
        u.includes('tiktok.com/') ||
        u.includes('youtube.com/') ||
        u.includes('youtu.be/') ||
        u.includes('facebook.com/') ||
        u.includes('fb.watch/')
    );

  const handleProcessInputUrls = async () => {
    if (extractedUrls.length === 0) {
      setInputError('Please enter at least one valid Facebook, YouTube, or TikTok video URL');
      return;
    }
    setIsProcessingInput(true);
    setInputError(null);

    try {
      const newBatchItems: BatchItem[] = extractedUrls.map((url) => {
        const isFb = url.includes('facebook.com/') || url.includes('fb.watch/');
        const isYt = url.includes('youtube.com/') || url.includes('youtu.be/');
        return {
          id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url,
          platform: isFb ? 'facebook' : isYt ? 'youtube' : 'tiktok',
          selected: true,
          quality: 'hd',
          status: 'fetching',
        };
      });

      onSetBatchItems((prev) => [...prev, ...newBatchItems]);
      setUrlInput('');

      // Send to server batch-info
      const response = await fetch('/api/batch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: extractedUrls }),
      });
      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch batch video information');
      }

      const resultsMap = new Map<string, any>();
      (json.results || []).forEach((r: any) => {
        resultsMap.set(r.url, r);
      });

      onSetBatchItems((prev) =>
        prev.map((item) => {
          const res = resultsMap.get(item.url);
          if (res) {
            if (res.success && res.data) {
              return {
                ...item,
                status: 'ready',
                platform: res.platform || item.platform,
                video: res.data,
              };
            } else {
              return {
                ...item,
                status: 'error',
                error: res.error || 'Failed to analyze video',
              };
            }
          }
          return item;
        })
      );
      onShowToast(`Processed ${extractedUrls.length} videos in batch`);
    } catch (err: any) {
      console.error('Batch process error:', err);
      setInputError(err.message || 'Error processing batch URLs');
    } finally {
      setIsProcessingInput(false);
    }
  };

  const handleLoadSamples = () => {
    setUrlInput(SAMPLE_BATCH_LINKS.join('\n'));
    setInputError(null);
  };

  const handleToggleSelect = (id: string) => {
    onSetBatchItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = (select: boolean) => {
    onSetBatchItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleSetGlobalQuality = (quality: BatchItem['quality']) => {
    onSetBatchItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, quality } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    onSetBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    onSetBatchItems([]);
  };

  const selectedItems = batchItems.filter((item) => item.selected && item.video);
  const totalSelectedBytes = selectedItems.reduce((acc, item) => {
    const v: any = item.video;
    const size = v?.hd_size || v?.size || 35 * 1024 * 1024;
    return acc + size;
  }, 0);

  const handleDownloadBatchZip = async () => {
    if (selectedItems.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    setZipStatusText('Preparing unified batch ZIP package...');

    try {
      const itemsToZip = selectedItems.map((item) => ({
        video: item.video!,
        platform: item.platform,
        quality: item.quality,
      }));

      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadBatchAsZip(
        itemsToZip,
        `Media_Batch_Download_${dateStr}.zip`,
        (percent, statusText) => {
          setZipProgress(percent);
          setZipStatusText(statusText);
        }
      );

      onSetBatchItems((prev) =>
        prev.map((item) => (item.selected ? { ...item, status: 'done' } : item))
      );
      onShowToast('Batch ZIP download completed successfully');
    } catch (err: any) {
      console.error('Batch zip error:', err);
      alert('Error creating batch ZIP archive: ' + err.message);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
      setZipStatusText('');
    }
  };

  const handleDownloadSequentially = async () => {
    if (selectedItems.length === 0) return;
    setIsSequentialDownloading(true);

    for (let i = 0; i < selectedItems.length; i++) {
      setSequentialIndex(i + 1);
      const item = selectedItems[i];
      const video: any = item.video!;

      let mediaUrl = video.hdplay || video.play || video.canonicalUrl || '';
      let ext = 'mp4';

      if (item.quality === 'music') {
        mediaUrl = video.music || video.play || mediaUrl;
        ext = 'mp3';
      }

      const filename = `${sanitizeFilename(video.title || `video_${video.id}`)}-${item.quality.toUpperCase()}.${ext}`;
      onDownloadSingle(mediaUrl, filename, video.title || 'Video', item.quality as any, video);

      // 1.5s delay between sequential triggers
      await new Promise((r) => setTimeout(r, 1500));
    }

    setIsSequentialDownloading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-2.5 pt-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
          <Layers className="w-7 h-7 sm:w-8 h-8 text-cyan-400" />
          <span>Cross-Platform Batch ZIP Studio</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Mix YouTube and TikTok links together in one unified queue. Configure formats, extract audio, and download all as a single organized ZIP archive.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Paste Multiple Video URLs (YouTube & TikTok)</span>
            <span className="text-xs text-slate-500 font-mono">
              ({extractedUrls.length} valid links detected)
            </span>
          </label>
          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            Load Mixed Sample Batch
          </button>
        </div>

        <textarea
          rows={3}
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (inputError) setInputError(null);
          }}
          placeholder="Paste links here (one URL per line or separated by spaces)...&#10;https://www.youtube.com/watch?v=...&#10;https://www.tiktok.com/@user/video/..."
          className="w-full p-3.5 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-slate-200 text-xs sm:text-sm font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-y"
        />

        {inputError && (
          <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{inputError}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500 hidden sm:block">
            Supports YouTube videos, Shorts, TikTok standard, and mobile share links.
          </p>
          <button
            onClick={handleProcessInputUrls}
            disabled={isProcessingInput || extractedUrls.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition-all cursor-pointer ml-auto"
          >
            {isProcessingInput ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Batch ({extractedUrls.length})...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add {extractedUrls.length > 0 ? `${extractedUrls.length} Videos` : 'to Batch'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Zip Progress Banner */}
      {isZipping && (
        <div className="bg-[#131b2e] border border-cyan-500/40 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="font-semibold text-white">{zipStatusText}</span>
            </div>
            <span className="text-cyan-400 font-bold tabular-nums">{zipProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${zipProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Batch Queue Section */}
      {batchItems.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
          {/* Master Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSelectAll(selectedItems.length !== batchItems.length)}
                className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {selectedItems.length === batchItems.length ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {selectedItems.length === batchItems.length
                    ? 'Deselect All'
                    : `Select All (${batchItems.length})`}
                </span>
              </button>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-slate-500 font-medium">Batch quality:</span>
                <button
                  onClick={() => handleSetGlobalQuality('hd')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
                >
                  All HD
                </button>
                <button
                  onClick={() => handleSetGlobalQuality('sd')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
                >
                  All SD
                </button>
                <button
                  onClick={() => handleSetGlobalQuality('music')}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-mono transition-colors cursor-pointer"
                >
                  All MP3
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {selectedItems.length} selected {totalSelectedBytes > 0 && `(~${formatBytes(totalSelectedBytes)})`}
              </span>
              <button
                onClick={handleClearAll}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Clear all batch items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Batch Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadBatchZip}
              disabled={isZipping || selectedItems.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Download Selected as ZIP ({selectedItems.length})</span>
            </button>
            <button
              onClick={handleDownloadSequentially}
              disabled={isSequentialDownloading || selectedItems.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isSequentialDownloading
                  ? `Downloading ${sequentialIndex}/${selectedItems.length}...`
                  : 'Download Sequentially'}
              </span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3 pt-2">
            {batchItems.map((item) => {
              const video: any = item.video;
              const isYouTube = item.platform === 'youtube';
              const isFacebook = item.platform === 'facebook';
              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.selected
                      ? isFacebook
                        ? 'bg-[#12192c]/80 border-blue-800/40'
                        : isYouTube
                        ? 'bg-[#181115]/80 border-red-800/40'
                        : 'bg-[#131b2e]/80 border-cyan-800/40'
                      : 'bg-[#0d1322]/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div className="relative w-14 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800">
                      {video ? (
                        <>
                          <img
                            src={video.cover || video.thumbnailUrl || video.thumbnail}
                            alt={video.title || 'Video'}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div
                            className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase text-white ${
                              isFacebook ? 'bg-blue-600' : isYouTube ? 'bg-red-600' : 'bg-cyan-600'
                            }`}
                          >
                            {isFacebook ? 'FB' : isYouTube ? 'YT' : 'TIKTOK'}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          {item.status === 'fetching' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {video ? (
                        <>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                            {video.title || 'Untitled Video'}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                            <span className={isYouTube ? 'text-red-400' : 'text-cyan-400'}>
                              {video.author?.unique_id || video.author || 'Creator'}
                            </span>
                            <span> </span>
                            <span className="uppercase text-[10px] font-bold">
                              {item.quality.toUpperCase()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-xs font-mono text-slate-400 truncate max-w-sm">
                            {item.url}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.status === 'fetching'
                              ? 'Analyzing media link...'
                              : item.error || 'Parsing error'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {video && (
                    <div className="flex items-center justify-end gap-2.5 shrink-0 pl-8 sm:pl-0">
                      <select
                        value={item.quality}
                        onChange={(e) => {
                          const val = e.target.value as BatchItem['quality'];
                          onSetBatchItems((prev) =>
                            prev.map((i) => (i.id === item.id ? { ...i, quality: val } : i))
                          );
                        }}
                        className="h-8 px-2 bg-slate-800 border border-slate-700 text-xs font-mono rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="hd">HD (1080p)</option>
                        <option value="sd">SD (Standard)</option>
                        <option value="music">MP3 Audio</option>
                      </select>

                      <button
                        onClick={() => {
                          const mediaUrl = video.hdplay || video.play || video.canonicalUrl;
                          const ext = item.quality === 'music' ? 'mp3' : 'mp4';
                          const fname = `${sanitizeFilename(video.title || 'video')}-${item.quality.toUpperCase()}.${ext}`;
                          onDownloadSingle(mediaUrl, fname, video.title || 'Video', item.quality as any, video);
                        }}
                        className="p-2 text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Download single file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Remove from batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {batchItems.length === 0 && (
        <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-300">Your Batch Studio Queue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Paste multiple YouTube or TikTok links above, or click "Load Mixed Sample Batch" to package videos into a single ZIP archive.
          </p>
        </div>
      )}
    </div>
  );
};
