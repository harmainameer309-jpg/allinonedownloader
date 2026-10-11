import React, { useState } from 'react';
import {
  FacebookVideoData,
  DownloadTask,
} from '../types';
import {
  Download,
  Clipboard,
  X,
  Play,
  Music,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Film,
} from 'lucide-react';
import { sanitizeFilename } from '../utils/downloadManager';

interface FacebookDownloaderProps {
  onDownload: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: any
  ) => void;
  onPreview: (video: any) => void;
  onAddToBatch: (video: any) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_FACEBOOK_VIDEOS = [
  {
    title: 'Featured Facebook Reel',
    url: 'https://www.facebook.com/reel/1807623153746790',
  },
  {
    title: 'Facebook Public Video',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
  },
];

export const FacebookDownloader: React.FC<FacebookDownloaderProps> = ({
  onDownload,
  onPreview,
  onAddToBatch,
  onShowToast,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<FacebookVideoData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedBatchNotice, setAddedBatchNotice] = useState(false);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
          setErrorMessage(null);
          onShowToast('Pasted link from clipboard');
          handleFetch(text.trim());
        }
      }
    } catch (err) {
      onShowToast('Please press Ctrl+V to paste link');
    }
  };

  const handleFetch = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || inputUrl).trim();
    if (!urlToFetch) {
      setErrorMessage('Please enter a Facebook Reel or Video URL');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setVideoData(null);
    try {
      const response = await fetch(`/api/facebook-info?url=${encodeURIComponent(urlToFetch)}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch Facebook video details.');
      }
      setVideoData(result.data);
      onShowToast('Facebook video loaded successfully');
    } catch (err: any) {
      console.error('Fetch Facebook video error:', err);
      setErrorMessage(err.message || 'Could not fetch Facebook video. Please ensure the post is public.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDownload = (quality: 'hd' | 'sd' | 'music') => {
    if (!videoData) return;
    const cleanTitle = sanitizeFilename(videoData.title || `facebook_${videoData.id}`);

    let mediaUrl = videoData.hdUrl || videoData.sdUrl || '';
    let ext = 'mp4';

    if (quality === 'hd') {
      mediaUrl = videoData.hdUrl || videoData.sdUrl || '';
      ext = 'mp4';
    } else if (quality === 'sd') {
      mediaUrl = videoData.sdUrl || videoData.hdUrl || '';
      ext = 'mp4';
    } else if (quality === 'music') {
      mediaUrl = videoData.hdUrl || videoData.sdUrl || '';
      ext = 'mp3';
    }

    const filename = `${cleanTitle}_FB_${quality.toUpperCase()}.${ext}`;
    onDownload(mediaUrl, filename, videoData.title || 'Facebook Video', quality, {
      ...videoData,
      cover: videoData.thumbnail,
      play: videoData.sdUrl || videoData.hdUrl,
      hdplay: videoData.hdUrl || videoData.sdUrl,
    });
  };

  const handleAddCurrentToBatch = () => {
    if (!videoData) return;
    onAddToBatch({
      ...videoData,
      cover: videoData.thumbnail,
      play: videoData.sdUrl || videoData.hdUrl,
      hdplay: videoData.hdUrl || videoData.sdUrl,
      canonicalUrl: videoData.originalUrl,
    });
    setAddedBatchNotice(true);
    setTimeout(() => setAddedBatchNotice(false), 3000);
  };

  const handleCopyLink = () => {
    if (!videoData) return;
    navigator.clipboard.writeText(videoData.originalUrl);
    setCopiedLink(true);
    onShowToast('Facebook link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>ClipStream Engine • Facebook Videos & Reels HD Downloader</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Facebook Video & Reel Downloader
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Extract high-definition Facebook Reels, public watch videos, and audio tracks with live download speed meters and zero pop-ups.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Paste Facebook video or reel link (e.g. https://www.facebook.com/reel/...)"
                className="w-full h-12 pl-4 pr-24 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1 border border-slate-700/60 cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="h-12 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Get Video</span>
                </>
              )}
            </button>
          </form>

          {/* Sample Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 font-medium">Quick sample:</span>
            {SAMPLE_FACEBOOK_VIDEOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleFetch(sample.url);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer text-left"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs sm:text-sm text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Result Card */}
      {videoData && (
        <div className="w-full max-w-5xl mx-auto bg-[#111827] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Thumbnail & In-App Preview */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div
                onClick={() =>
                  onPreview({
                    ...videoData,
                    cover: videoData.thumbnail,
                    play: videoData.sdUrl || videoData.hdUrl,
                    hdplay: videoData.hdUrl || videoData.sdUrl,
                  })
                }
                className="group relative w-full max-w-[280px] aspect-[9/14] bg-black rounded-xl overflow-hidden cursor-pointer shadow-lg border border-slate-800 hover:border-blue-500/50 transition-all"
              >
                <img
                  src={videoData.thumbnail}
                  alt={videoData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>
                {videoData.hdUrl && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-blue-600/90 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    HD Quality
                  </div>
                )}
              </div>
              <button
                onClick={() =>
                  onPreview({
                    ...videoData,
                    cover: videoData.thumbnail,
                    play: videoData.sdUrl || videoData.hdUrl,
                    hdplay: videoData.hdUrl || videoData.sdUrl,
                  })
                }
                className="mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Video Playback</span>
              </button>
            </div>

            {/* Right: Metadata & Formats */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    f
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Facebook Video / Reel</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {videoData.id}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed">
                    {videoData.title}
                  </p>
                </div>

                {/* Metadata */}
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                  {videoData.width && videoData.height && (
                    <>
                      <span>{videoData.width}x{videoData.height}</span>
                      <span> </span>
                    </>
                  )}
                  <span className="text-emerald-400 font-semibold">Direct MP4 Stream</span>
                  <span> </span>
                  <span className="text-slate-300">Codec: H.264</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: High Quality HD */}
                  {videoData.hdUrl && (
                    <button
                      onClick={() => triggerDownload('hd')}
                      className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-950/30 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">
                            Download High Quality (HD)
                          </div>
                          <div className="text-[11px] text-blue-100 font-mono mt-0.5">
                            {videoData.hdSizeFormatted || '1080p / 720p HD MP4'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Option 2: Standard Quality SD */}
                  {videoData.sdUrl && (
                    <button
                      onClick={() => triggerDownload('sd')}
                      className="p-3.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-white rounded-xl flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            Download Standard (SD)
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {videoData.sdSizeFormatted || 'Fast Mobile MP4'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Option 3: MP3 Audio */}
                  <button
                    onClick={() => triggerDownload('music')}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 rounded-xl flex items-center gap-3 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0 text-amber-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">Extract Audio (MP3)</div>
                      <div className="text-[11px] text-slate-400 font-mono">Original Soundtrack</div>
                    </div>
                  </button>
                </div>

                {/* Secondary buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleAddCurrentToBatch}
                    className="px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-blue-200 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {addedBatchNotice ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Added to Batch!</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-3.5 h-3.5" />
                        <span>Add Video to Batch Studio</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{copiedLink ? 'Copied' : 'Copy Original URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
