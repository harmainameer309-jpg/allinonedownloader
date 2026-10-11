import React, { useState } from 'react';
import { TikTokVideo, DownloadTask } from '../types';
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
  Heart,
  MessageCircle,
  Share2,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatBytes, formatDuration, formatNumber, sanitizeFilename } from '../utils/downloadManager';

interface TikTokDownloaderProps {
  onDownload: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: TikTokVideo
  ) => void;
  onPreview: (video: TikTokVideo) => void;
  onAddToBatch: (video: TikTokVideo) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_VIDEOS = [
  {
    title: 'Cyber Security Tips (Official)',
    url: 'https://www.tiktok.com/@tiktoktips/video/7675767536016706847',
  },
  {
    title: 'TikTok Creators Guide',
    url: 'https://www.tiktok.com/@tiktokcreators/video/7310050334196367403',
  },
];

export const TikTokDownloader: React.FC<TikTokDownloaderProps> = ({
  onDownload,
  onPreview,
  onAddToBatch,
  onShowToast,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<TikTokVideo | null>(null);
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
      setErrorMessage('Please enter a TikTok video URL');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setVideoData(null);
    try {
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(urlToFetch)}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch video. Please check the URL.');
      }
      setVideoData(result.data);
      onShowToast('TikTok video loaded successfully');
    } catch (err: any) {
      console.error('Fetch video error:', err);
      setErrorMessage(err.message || 'Could not fetch video. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDownload = (quality: DownloadTask['quality']) => {
    if (!videoData) return;
    let mediaUrl = videoData.hdplay || videoData.play;
    let ext = 'mp4';
    const cleanTitle = sanitizeFilename(videoData.title || `tiktok_${videoData.id}`);

    if (quality === 'hd') {
      mediaUrl = videoData.hdplay || videoData.play;
      ext = 'mp4';
    } else if (quality === 'sd') {
      mediaUrl = videoData.play;
      ext = 'mp4';
    } else if (quality === 'wm') {
      mediaUrl = videoData.wmplay || videoData.play;
      ext = 'mp4';
    } else if (quality === 'music') {
      mediaUrl = videoData.music || videoData.play;
      ext = 'mp3';
    } else if (quality === 'cover') {
      mediaUrl = videoData.origin_cover || videoData.cover;
      ext = 'jpg';
    }

    const filename = `${cleanTitle}_${quality.toUpperCase()}_NoWatermark.${ext}`;
    onDownload(mediaUrl, filename, videoData.title || 'TikTok Video', quality, videoData);
  };

  const handleAddCurrentToBatch = () => {
    if (!videoData) return;
    onAddToBatch(videoData);
    setAddedBatchNotice(true);
    setTimeout(() => setAddedBatchNotice(false), 3000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ClipStream Engine • TikTok 1080p No Watermark</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            TikTok Video Downloader Without Watermark
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Download high-definition 1080p TikTok videos with live progress speed tracking, MP3 audio extraction, and batch queue support.
          </p>
        </div>

        {/* Input Box Card */}
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
                placeholder="Paste TikTok video link (e.g. https://www.tiktok.com/@user/video/...)"
                className="w-full h-12 pl-4 pr-24 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
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
              className="h-12 px-6 sm:px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
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
            <span className="text-slate-500 font-medium">Quick samples:</span>
            {SAMPLE_VIDEOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handleFetch(sample.url);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer text-left"
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
            {/* Left: Thumbnail & Preview Button */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div
                onClick={() => onPreview(videoData)}
                className="group relative w-full max-w-[280px] aspect-[9/14] bg-black rounded-xl overflow-hidden cursor-pointer shadow-lg border border-slate-800 hover:border-cyan-500/50 transition-all"
              >
                <img
                  src={videoData.cover}
                  alt={videoData.title || 'TikTok thumbnail'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[11px] font-mono tabular-nums text-slate-200">
                  {formatDuration(videoData.duration)}
                </div>
                {videoData.hdplay && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-cyan-600/90 backdrop-blur-md rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    HD 1080p
                  </div>
                )}
              </div>
              <button
                onClick={() => onPreview(videoData)}
                className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Watch Preview Without Watermark</span>
              </button>
            </div>

            {/* Right: Metadata & Download Choices */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                {/* Author Info */}
                {videoData.author && (
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <img
                      src={videoData.author.avatar}
                      alt={videoData.author.nickname}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {videoData.author.nickname}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">@{videoData.author.unique_id}</p>
                    </div>
                  </div>
                )}

                {/* Caption / Title */}
                <div className="mt-4">
                  <p className="text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed">
                    {videoData.title || 'TikTok Video Without Watermark'}
                  </p>
                </div>

                {/* Statistics */}
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatNumber(videoData.play_count)} views</span>
                  </span>
                  <span> </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400/80" />
                    <span>{formatNumber(videoData.digg_count)} likes</span>
                  </span>
                  <span> </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatNumber(videoData.comment_count)} comments</span>
                  </span>
                  <span> </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatNumber(videoData.share_count)} shares</span>
                  </span>
                </div>

                {videoData.music_info && (
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-400 truncate">
                    <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {videoData.music_info.title} - {videoData.music_info.author}
                    </span>
                  </div>
                )}
              </div>

              {/* Download Buttons Section */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* HD No Watermark */}
                  <button
                    onClick={() => triggerDownload('hd')}
                    disabled={!videoData.hdplay && !videoData.play}
                    className="group relative p-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-950/30 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          Download HD (No Watermark)
                        </div>
                        <div className="text-[11px] text-cyan-100/90 font-mono mt-0.5">
                          {videoData.hd_size ? formatBytes(videoData.hd_size) : 'Original 1080p'}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* SD No Watermark */}
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
                          Download SD (Fast)
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {videoData.size ? formatBytes(videoData.size) : 'Data Saver'}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* MP3 Audio */}
                  {videoData.music && (
                    <button
                      onClick={() => triggerDownload('music')}
                      className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 rounded-xl flex items-center gap-3 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0 text-cyan-400">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold">Extract Audio (MP3)</div>
                        <div className="text-[11px] text-slate-400 font-mono">Original Sound Track</div>
                      </div>
                    </button>
                  )}

                  {/* HD Cover Artwork */}
                  <button
                    onClick={() => triggerDownload('cover')}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 rounded-xl flex items-center gap-3 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0 text-amber-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">Download HD Cover</div>
                      <div className="text-[11px] text-slate-400 font-mono">High-res artwork</div>
                    </div>
                  </button>
                </div>

                {/* Batch Add & Watermark secondary links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleAddCurrentToBatch}
                    className="px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  {videoData.wmplay && (
                    <button
                      onClick={() => triggerDownload('wm')}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Need original with watermark? Click here
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
