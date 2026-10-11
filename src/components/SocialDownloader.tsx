import React, { useState, useEffect } from 'react';
import { GenericVideoData, DownloadTask, SupportedPlatform } from '../types';
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
import { PlatformIcon } from './PlatformIcon';
import { sanitizeFilename } from '../utils/downloadManager';

interface SocialDownloaderProps {
  initialPlatform?: SupportedPlatform;
  initialUrl?: string;
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

const PLATFORM_OPTIONS: Array<{
  id: SupportedPlatform;
  label: string;
  sampleUrl: string;
  placeholder: string;
}> = [
  {
    id: 'instagram',
    label: 'Instagram',
    sampleUrl: 'https://www.instagram.com/p/DN-QI37DSnI/',
    placeholder: 'Paste Instagram Reel or Post link (e.g. https://www.instagram.com/p/... or /reel/...)',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    sampleUrl: 'https://twitter.com/Twitter/status/1274066870817026048',
    placeholder: 'Paste Twitter / X Video link (e.g. https://x.com/user/status/...)',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sampleUrl: 'https://www.facebook.com/reel/1807623153746790',
    placeholder: 'Paste Facebook Reel or Video link (e.g. https://www.facebook.com/reel/...)',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    sampleUrl: 'https://www.pinterest.com/pin/1234567890/',
    placeholder: 'Paste Pinterest Video or Pin link (e.g. https://pin.it/... or pinterest.com/pin/...)',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    sampleUrl: 'https://www.reddit.com/r/videos/comments/sample_post/',
    placeholder: 'Paste Reddit Video link (e.g. https://www.reddit.com/r/.../comments/...)',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    sampleUrl: 'https://www.tiktok.com/@tiktoktips/video/7675767536016706847',
    placeholder: 'Paste TikTok Video link (e.g. https://www.tiktok.com/@user/video/...)',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    sampleUrl: 'https://www.youtube.com/watch?v=dyvxxJSGUsE',
    placeholder: 'Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)',
  },
];

export const SocialDownloader: React.FC<SocialDownloaderProps> = ({
  initialPlatform = 'instagram',
  initialUrl,
  onDownload,
  onPreview,
  onAddToBatch,
  onShowToast,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatform>(initialPlatform);
  const [inputUrl, setInputUrl] = useState(initialUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<GenericVideoData | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedBatchNotice, setAddedBatchNotice] = useState(false);

  useEffect(() => {
    if (initialUrl && initialUrl.trim()) {
      setInputUrl(initialUrl.trim());
      handleFetch(initialUrl.trim());
    }
  }, [initialUrl]);

  const currentPlatformInfo =
    PLATFORM_OPTIONS.find((p) => p.id === selectedPlatform) || PLATFORM_OPTIONS[0];

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
      setErrorMessage(`Please enter a valid ${currentPlatformInfo.label} video URL`);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setVideoData(null);
    setSelectedMediaIndex(0);

    try {
      // Use social media extractor
      const response = await fetch(`/api/social-media-info?url=${encodeURIComponent(urlToFetch)}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || `Failed to fetch ${currentPlatformInfo.label} video details.`);
      }
      setVideoData(result.data);
      setSelectedMediaIndex(0);
      if (result.platform && result.platform !== 'unknown') {
        setSelectedPlatform(result.platform);
      }
      onShowToast(`${currentPlatformInfo.label} media loaded successfully`);
    } catch (err: any) {
      console.error('Fetch media error:', err);
      setErrorMessage(
        err.message || `Could not fetch ${currentPlatformInfo.label} video. Please ensure the link is public.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDownload = (quality: 'hd' | 'sd' | 'music') => {
    if (!videoData) return;
    const cleanTitle = sanitizeFilename(videoData.title || `${selectedPlatform}_${videoData.id}`);

    const activeMedia = videoData.mediaItems?.[selectedMediaIndex];
    const isPhoto = activeMedia && !activeMedia.isVideo;
    let mediaUrl = activeMedia?.url || videoData.hdUrl || videoData.sdUrl || videoData.originalUrl;
    let ext = isPhoto ? 'jpg' : 'mp4';

    if (quality === 'hd') {
      mediaUrl = activeMedia?.url || videoData.hdUrl || videoData.sdUrl || videoData.originalUrl;
      ext = isPhoto ? 'jpg' : 'mp4';
    } else if (quality === 'sd') {
      mediaUrl = activeMedia?.url || videoData.sdUrl || videoData.hdUrl || videoData.originalUrl;
      ext = isPhoto ? 'jpg' : 'mp4';
    } else if (quality === 'music') {
      mediaUrl = videoData.audioUrl || activeMedia?.url || videoData.hdUrl || videoData.sdUrl || videoData.originalUrl;
      ext = 'mp3';
    }

    const itemSuffix = videoData.mediaItems && videoData.mediaItems.length > 1 ? `_part${selectedMediaIndex + 1}` : '';
    const filename = `${cleanTitle}${itemSuffix}_${selectedPlatform.toUpperCase()}_${quality.toUpperCase()}.${ext}`;
    onDownload(mediaUrl, filename, videoData.title || 'Social Video', quality, {
      ...videoData,
      cover: activeMedia?.thumbnail || videoData.thumbnail,
      play: activeMedia?.url || videoData.sdUrl || videoData.hdUrl,
      hdplay: activeMedia?.url || videoData.hdUrl || videoData.sdUrl,
    });
  };

  const handleAddCurrentToBatch = () => {
    if (!videoData) return;
    onAddToBatch({
      ...videoData,
      platform: selectedPlatform,
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
    onShowToast('Link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Universal Engine   Instagram, Twitter/X, Pinterest, Reddit & More</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            All-Platform Social Media Downloader
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Extract high-definition videos, Reels, and audio from Instagram, Twitter/X, Pinterest, Reddit, Facebook, YouTube, and TikTok.
          </p>
        </div>

        {/* Platform Selector Ribbon with authentic logos */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit mx-auto text-xs font-medium">
          {PLATFORM_OPTIONS.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlatform(p.id);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white font-bold shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <PlatformIcon platform={p.id} size={16} />
                <span>{p.label}</span>
              </button>
            );
          })}
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
                placeholder={currentPlatformInfo.placeholder}
                className="w-full h-12 pl-4 pr-24 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
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
              className="h-12 px-6 sm:px-8 bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
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

          {/* Sample Chip for Active Platform */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 font-medium">Quick sample:</span>
            <button
              type="button"
              onClick={() => {
                setInputUrl(currentPlatformInfo.sampleUrl);
                handleFetch(currentPlatformInfo.sampleUrl);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer text-left flex items-center gap-1.5"
            >
              <PlatformIcon platform={selectedPlatform} size={14} />
              <span>Sample {currentPlatformInfo.label} Post</span>
            </button>
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
      {videoData && (() => {
        const activeMedia = videoData.mediaItems?.[selectedMediaIndex];
        const isPhoto = activeMedia && !activeMedia.isVideo;
        const activeThumb = activeMedia?.thumbnail || (isPhoto ? activeMedia?.url : '') || videoData.thumbnail;
        const activePlay = activeMedia?.url || videoData.sdUrl || videoData.hdUrl;

        return (
          <div className="w-full max-w-5xl mx-auto bg-[#111827] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left: Thumbnail & In-App Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div
                  onClick={() =>
                    onPreview({
                      ...videoData,
                      cover: activeThumb,
                      play: activePlay,
                      hdplay: activePlay,
                    })
                  }
                  className="group relative w-full max-w-[280px] aspect-[9/14] bg-black rounded-xl overflow-hidden cursor-pointer shadow-lg border border-slate-800 hover:border-pink-500/50 transition-all"
                >
                  {activeThumb ? (
                    <img
                      src={activeThumb}
                      alt={videoData.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 gap-2">
                      <PlatformIcon platform={selectedPlatform} size={36} />
                      <span className="text-xs uppercase font-mono font-bold tracking-wider">
                        {selectedPlatform} Media
                      </span>
                    </div>
                  )}
                  {!isPhoto && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-1 fill-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <PlatformIcon platform={selectedPlatform} size={12} />
                    <span>{selectedPlatform.toUpperCase()}</span>
                  </div>
                </div>
                {!isPhoto ? (
                  <button
                    onClick={() =>
                      onPreview({
                        ...videoData,
                        cover: activeThumb,
                        play: activePlay,
                        hdplay: activePlay,
                      })
                    }
                    className="mt-3 text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test Video Playback</span>
                  </button>
                ) : (
                  <span className="mt-3 text-xs text-slate-400 flex items-center gap-1 font-mono">
                    High Resolution Photo
                  </span>
                )}
              </div>

              {/* Right: Metadata & Formats */}
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <PlatformIcon platform={selectedPlatform} size={22} />
                    <div>
                      <h3 className="text-sm font-bold text-white capitalize">
                        {selectedPlatform} Video / Media
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {videoData.author ? `@${videoData.author}` : `${selectedPlatform} Post`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed">
                      {videoData.title}
                    </p>
                  </div>

                  {/* Multi-item carousel if Instagram carousel has multiple images/videos */}
                  {videoData.mediaItems && videoData.mediaItems.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">
                          Post Media Carousel ({videoData.mediaItems.length} items):
                        </span>
                        <span className="text-[11px] text-pink-400 font-mono">
                          Active item #{selectedMediaIndex + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                        {videoData.mediaItems.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedMediaIndex(idx)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              selectedMediaIndex === idx
                                ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30'
                                : 'border-slate-700 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={item.thumbnail || item.url}
                              alt={`Part ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 rounded text-[9px] font-mono text-white">
                              {item.isVideo !== false ? '▶' : '📷'} #{idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                    <span className="text-emerald-400 font-semibold">
                      {isPhoto ? 'Direct Image Source' : 'Direct MP4 Source'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">
                      {isPhoto ? 'Format: JPG / PNG' : 'Codec: H.264 / AAC'}
                    </span>
                    {videoData.hdSizeFormatted && (
                      <>
                        <span>•</span>
                        <span className="text-pink-400 font-bold">{videoData.hdSizeFormatted}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* High Quality HD */}
                    <button
                      onClick={() => triggerDownload('hd')}
                      className="p-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl shadow-lg shadow-pink-950/30 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">
                            {isPhoto ? 'Download Photo (HD)' : 'Download High Quality (HD)'}
                          </div>
                          <div className="text-[11px] text-pink-100 font-mono mt-0.5">
                            {isPhoto ? 'Full Resolution JPG/PNG' : videoData.hdSizeFormatted || '1080p / 720p HD MP4'}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Standard Definition SD */}
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
                            {isPhoto ? 'Standard Resolution' : 'Download Standard (SD)'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {isPhoto ? 'Optimized Image' : videoData.sdSizeFormatted || 'Data Saver MP4'}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* MP3 Audio Extraction */}
                    {!isPhoto && (
                      <button
                        onClick={() => triggerDownload('music')}
                        className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 rounded-xl flex items-center gap-3 transition-all cursor-pointer sm:col-span-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0 text-amber-400">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-semibold">Extract Audio (MP3)</div>
                          <div className="text-[11px] text-slate-400 font-mono">Original Audio Stream</div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Secondary buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={handleAddCurrentToBatch}
                      className="px-3 py-1.5 text-xs font-medium text-pink-300 hover:text-pink-200 bg-pink-950/40 hover:bg-pink-900/40 border border-pink-800/50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {addedBatchNotice ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">Added to Batch!</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5" />
                          <span>Add to Batch Studio</span>
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
        );
      })()}
    </div>
  );
};
