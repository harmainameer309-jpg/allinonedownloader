import React, { useState, useRef } from 'react';
import {
  Search,
  Sparkles,
  Clipboard,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  Film,
  Volume2,
  Image as ImageIcon,
  Play,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Server,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { YouTubeVideoData, FormatOption, ThumbnailOption, DownloadTask } from '../types';

interface YouTubeDownloaderProps {
  onDownload: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: any
  ) => void;
  onAddToBatch: (video: YouTubeVideoData) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_VIDEOS = [
  {
    title: 'CodeWithHarry - Python Tutorial #20',
    url: 'https://www.youtube.com/watch?v=dyvxxJSGUsE',
    label: 'Python Tutorial',
  },
  {
    title: 'Lofi Girl - Relaxing Beats',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    label: 'Lofi Chill Beats',
  },
  {
    title: 'Blender Studio - Big Buck Bunny',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    label: '4K Animation Video',
  },
];

interface ConversionState {
  isActive: boolean;
  item: FormatOption | null;
  progress: number;
  statusText: string;
  downloadUrl: string | null;
  directProxyUrl: string | null;
  inlineProxyUrl: string | null;
  error: string | null;
}

export const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({
  onDownload,
  onAddToBatch,
  onShowToast,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'thumbnail'>('video');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedToBatchNotice, setAddedToBatchNotice] = useState(false);

  // In-app test player
  const [testPlayerUrl, setTestPlayerUrl] = useState<string | null>(null);
  const [testPlayerTitle, setTestPlayerTitle] = useState<string>('');
  const [testPlayerType, setTestPlayerType] = useState<'video' | 'audio'>('video');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active conversion pipeline
  const [conversion, setConversion] = useState<ConversionState>({
    isActive: false,
    item: null,
    progress: 0,
    statusText: '',
    downloadUrl: null,
    directProxyUrl: null,
    inlineProxyUrl: null,
    error: null,
  });

  const handleFetchVideo = async (targetUrl?: string) => {
    const urlToUse = (targetUrl || url).trim();
    if (!urlToUse) {
      setError('Please paste or enter a YouTube video URL.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fetch-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch video details.');
      }
      setVideoData(data);
      setUrl(urlToUse);
      onShowToast('YouTube video loaded successfully');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not fetch video. Check URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        onShowToast('Pasted link from clipboard');
        handleFetchVideo(text);
      }
    } catch (err) {
      onShowToast('Please press Ctrl+V to paste URL manually');
    }
  };

  const handleCopyLink = (targetUrl: string, id: string) => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedId(id);
    onShowToast('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartDownload = async (item: FormatOption | ThumbnailOption) => {
    if (!videoData) return;
    const safeTitle = videoData.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

    // If thumbnail
    if (item.type === 'thumbnail') {
      const filename = `${safeTitle}_${item.resolution || item.quality}.jpg`;
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(
        filename
      )}&type=image`;
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Thumbnail image downloaded');
      return;
    }

    // Video / Audio transcoding conversion
    setConversion({
      isActive: true,
      item: item as FormatOption,
      progress: 15,
      statusText: `Initializing ${item.quality} ${item.format} conversion pipeline...`,
      downloadUrl: null,
      directProxyUrl: null,
      inlineProxyUrl: null,
      error: null,
    });

    try {
      const formatCode =
        item.format === 'MP3'
          ? 'mp3'
          : item.quality.includes('1080')
          ? '1080'
          : item.quality.includes('720')
          ? '720'
          : item.quality.includes('480')
          ? '480'
          : '360';

      const startRes = await fetch('/api/start-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoData.canonicalUrl,
          format: formatCode,
        }),
      });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.success || !startData.progressUrl) {
        throw new Error(startData.error || 'Failed to initialize video conversion.');
      }

      setConversion((prev) => ({
        ...prev,
        progress: 30,
        statusText: `Transcoding ${item.format} stream with synchronized H.264 video & AAC audio...`,
      }));

      const progressUrl = startData.progressUrl;
      let isDone = false;
      let attempts = 0;

      while (!isDone && attempts < 32) {
        await new Promise((r) => setTimeout(r, 1500));
        attempts++;
        const checkRes = await fetch(
          `/api/check-conversion?progressUrl=${encodeURIComponent(progressUrl)}`
        );
        const checkData = await checkRes.json();
        if (checkData.downloadUrl) {
          isDone = true;
          const extension = item.format.toLowerCase();
          const cleanQuality = item.quality.replace(/[^a-zA-Z0-9]/g, '_');
          const filename = `${safeTitle}_${cleanQuality}.${extension}`;

          const proxyDownloadUrl = `/api/proxy-download?url=${encodeURIComponent(
            checkData.downloadUrl
          )}&filename=${encodeURIComponent(filename)}&type=${item.type}`;
          const proxyInlineUrl = `/api/proxy-download?url=${encodeURIComponent(
            checkData.downloadUrl
          )}&filename=${encodeURIComponent(filename)}&type=${item.type}&inline=true`;

          setConversion((prev) => ({
            ...prev,
            progress: 88,
            statusText: `Optimizing video file for universal playback (H.264 & AAC)...`,
          }));

          try {
            await fetch('/api/prepare-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: checkData.downloadUrl,
                type: item.type,
              }),
            });
          } catch (prepErr) {
            console.warn('Pre-packaging notice:', prepErr);
          }

          setConversion((prev) => ({
            ...prev,
            progress: 100,
            statusText: `Ready! Download is starting automatically...`,
            downloadUrl: checkData.downloadUrl,
            directProxyUrl: proxyDownloadUrl,
            inlineProxyUrl: proxyInlineUrl,
          }));

          // Direct browser download
          const dlLink = document.createElement('a');
          dlLink.href = proxyDownloadUrl;
          dlLink.download = filename;
          document.body.appendChild(dlLink);
          dlLink.click();
          setTimeout(() => document.body.removeChild(dlLink), 1000);

          onShowToast(`Downloaded: ${item.quality} ${item.format}`);

          // Delegate to parent download handler to record in merged library
          onDownload(
            checkData.downloadUrl,
            filename,
            videoData.title,
            (item.quality.includes('1080') ? '1080p' : '720p') as any,
            {
              platform: 'youtube',
              id: videoData.videoId,
              title: videoData.title,
              author: videoData.author,
              thumbnailUrl: videoData.thumbnailUrl,
              canonicalUrl: videoData.canonicalUrl,
            }
          );
          break;
        } else {
          const newProg = Math.min(30 + attempts * 4, 94);
          setConversion((prev) => ({
            ...prev,
            progress: newProg,
            statusText: checkData.text || `Processing ${item.quality} MP4 video (${newProg}%)...`,
          }));
        }
      }

      if (!isDone) {
        setConversion((prev) => ({
          ...prev,
          statusText:
            'Conversion is taking longer than expected. You can download directly via our instant mirrors below.',
          error:
            'Transcoder busy. Please click any Instant Mirror below for direct 1-click MP4 download.',
        }));
      }
    } catch (err: any) {
      console.error(err);
      setConversion((prev) => ({
        ...prev,
        error: err.message || 'Video stream could not be converted.',
        statusText: 'Direct conversion encountered an issue.',
      }));
    }
  };

  const handleTestLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setTestPlayerUrl(objectUrl);
      setTestPlayerTitle(`Local File: ${file.name}`);
      setTestPlayerType(file.type.includes('audio') ? 'audio' : 'video');
      onShowToast(`Loaded ${file.name} for playback testing`);
    }
  };

  const handleAddVideoToBatch = () => {
    if (!videoData) return;
    onAddToBatch(videoData);
    setAddedToBatchNotice(true);
    setTimeout(() => setAddedToBatchNotice(false), 3000);
  };

  const allItems: (FormatOption | ThumbnailOption)[] = videoData
    ? [...videoData.formats, ...videoData.thumbnails]
    : [];
  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const mirrorLinks = videoData
    ? [
        {
          name: 'SaveFrom Fast Mirror (MP4)',
          url: `https://en.savefrom.net/1-youtube-video-downloader-3vA/?url=${encodeURIComponent(
            videoData.canonicalUrl
          )}`,
          badge: '1080p / 720p Direct',
        },
        {
          name: 'SSYouTube Stream Engine',
          url: `https://ssyoutube.com/watch?v=${videoData.videoId}`,
          badge: 'Instant Stream',
        },
        {
          name: 'Y2Meta Video Downloader',
          url: `https://www.y2meta.mobi/youtube/${videoData.videoId}`,
          badge: 'MP4 & MP3',
        },
        {
          name: 'YT1s Full HD Portal',
          url: `https://yt1s.com/en/youtube-to-mp4?q=${encodeURIComponent(videoData.canonicalUrl)}`,
          badge: 'High Speed MP4',
        },
      ]
    : [];

  return (
    <div className="w-full space-y-8">
      {/* Search / URL Input Box */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-800/60 text-red-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>ClipStream Engine   YouTube 1080p MP4 & 320kbps MP3</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            YouTube Video & Audio Downloader
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Extract high-definition YouTube videos, Shorts, 320kbps MP3 audio, and maximum-resolution thumbnail artwork.
          </p>
        </div>

        <div className="relative flex items-center p-1.5 sm:p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl shadow-black/40 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-red-500" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFetchVideo();
              }
            }}
            placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)"
            className="flex-1 bg-transparent px-2 py-2 text-sm sm:text-base text-white placeholder-slate-500 outline-none min-w-0"
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer mr-1"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer mr-2 border border-slate-700/60"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>
          <button
            type="button"
            onClick={() => handleFetchVideo()}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <span>Fetch Video</span>
            )}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Unable to load YouTube video</p>
              <p className="text-red-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
          <span className="font-medium text-slate-500">Try sample:</span>
          {SAMPLE_VIDEOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                handleFetchVideo(sample.url);
              }}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Details & Formats Result */}
      {videoData && (
        <div className="w-full max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Media Preview Box */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video group">
              {isPlayingPreview ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoData.videoId}?autoplay=1&rel=0`}
                    title={videoData.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsPlayingPreview(false)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-slate-950/90 hover:bg-black text-slate-200 text-xs rounded-md border border-slate-700 flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Close Player</span>
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={videoData.maxResThumbnailUrl || videoData.thumbnailUrl}
                    alt={videoData.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = videoData.thumbnailUrl;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-center justify-center">
                    <button
                      onClick={() => setIsPlayingPreview(true)}
                      className="w-14 h-14 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-110 transition-all cursor-pointer group-hover:ring-4 ring-red-500/30"
                      title="Watch Video Preview"
                    >
                      <Play className="w-6 h-6 fill-white translate-x-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-slate-200">
                    <span className="bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono">
                      {videoData.videoId}
                    </span>
                    <span className="bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                      Click to watch
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Information */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {videoData.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
                  <a
                    href={videoData.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold flex items-center gap-1"
                  >
                    <span>{videoData.author}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-600"> </span>
                  <span className="font-mono text-slate-300">ID: {videoData.videoId}</span>
                  <span className="text-slate-600"> </span>
                  <span className="text-emerald-400 font-semibold">Audio & Video Synced</span>
                </div>
              </div>

              {/* Guidance Box */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-3 text-xs">
                <Server className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <span>Direct MP4 Video Downloader</span>
                    <span className="text-slate-600"> </span>
                    <span className="text-emerald-400 font-semibold">H.264 & AAC Verified</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Choose <strong className="text-emerald-400">720p HD</strong> or <strong className="text-white">1080p Full HD</strong> below for instant downloading. You can also send this video directly to the unified Batch Studio.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleAddVideoToBatch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-xs font-semibold text-cyan-300 rounded-lg transition-colors cursor-pointer"
                >
                  {addedToBatchNotice ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Added to Batch!</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5" />
                      <span>Add to Batch Studio</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCopyLink(videoData.canonicalUrl, 'canonical')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedId === 'canonical' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{copiedId === 'canonical' ? 'Copied' : 'Copy Video URL'}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Test local video playback"
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Local Video File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleTestLocalFile}
                  accept="video/*,audio/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Active Conversion Banner */}
          {conversion.isActive && (
            <div className="p-5 bg-slate-950 border border-red-500/40 rounded-xl space-y-4 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Downloading {conversion.item?.quality} {conversion.item?.format}
                  </h4>
                </div>
                <button
                  onClick={() => setConversion((prev) => ({ ...prev, isActive: false }))}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{conversion.statusText}</span>
                  <span className="font-mono tabular-nums text-red-400 font-semibold">
                    {conversion.progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-red-600/50"
                    style={{ width: `${conversion.progress}%` }}
                  />
                </div>
              </div>

              {/* Ready Box */}
              {conversion.directProxyUrl && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-white text-xs font-bold">Your .MP4 Video File is Ready!</p>
                      <p className="text-emerald-300/80 text-[11px] font-normal">
                        Synchronized H.264 video and stereo AAC audio verified. Test play below or save to your disk:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        if (conversion.inlineProxyUrl) {
                          setTestPlayerUrl(conversion.inlineProxyUrl);
                          setTestPlayerTitle(`${videoData.title} (${conversion.item?.quality})`);
                          setTestPlayerType(conversion.item?.type === 'audio' ? 'audio' : 'video');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>Test Play Video</span>
                    </button>
                    <a
                      href={conversion.directProxyUrl}
                      download={`${videoData.title}_${conversion.item?.quality}.mp4`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      <span>Save MP4 File</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Error notice */}
              {conversion.error && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">Fast Download Available Below</p>
                    <p className="text-amber-200/80 mt-0.5">{conversion.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Player Modal */}
          {testPlayerUrl && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <h4 className="text-sm font-bold text-white truncate max-w-md">
                      {testPlayerTitle}
                    </h4>
                  </div>
                  <button
                    onClick={() => setTestPlayerUrl(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  {testPlayerType === 'video' ? (
                    <video
                      src={testPlayerUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full p-8 flex flex-col items-center justify-center space-y-4">
                      <Volume2 className="w-16 h-16 text-amber-400 animate-pulse" />
                      <audio src={testPlayerUrl} controls autoPlay className="w-full max-w-md" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>H.264 stream and AAC audio verified with seeking support</span>
                  </div>
                  <button
                    onClick={() => setTestPlayerUrl(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Close Player
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formats Filter Tabs */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Select Format & Quality</h3>
                <p className="text-xs text-slate-400">All formats packaged with synchronized audio & video</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'video'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video MP4 ({videoData.formats.filter((f) => f.type === 'video').length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'audio'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio MP3 ({videoData.formats.filter((f) => f.type === 'audio').length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('thumbnail')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'thumbnail'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Thumbnails ({videoData.thumbnails.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Formats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const isCopied = copiedId === item.id;
                const isCurrentlyConverting = conversion.isActive && conversion.item?.id === item.id;
                const isRecommended = item.id === 'video-720p';
                return (
                  <div
                    key={item.id}
                    className={`p-4 bg-slate-950/70 border rounded-xl transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isRecommended
                        ? 'border-emerald-600/50 shadow-md shadow-emerald-950/20'
                        : 'border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {item.type === 'video' ? (
                            <Film className="w-3.5 h-3.5 text-red-400" />
                          ) : item.type === 'audio' ? (
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{item.quality}</span>
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            isRecommended
                              ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                              : 'text-red-400 bg-red-950/50 border-red-900/60'
                          }`}
                        >
                          {item.format}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span className="font-mono">{item.resolution}</span>
                        <span className="text-slate-600"> </span>
                        <span className="font-mono tabular-nums">{item.fileSizeApprox}</span>
                        {item.hasAudio && item.type === 'video' && (
                          <>
                            <span className="text-slate-600"> </span>
                            <span className="text-emerald-400 text-[11px]">Video + Audio</span>
                          </>
                        )}
                      </div>
                      {isRecommended && (
                        <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Recommended: Fast transcode, full duration & synchronized audio</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleStartDownload(item)}
                        disabled={isCurrentlyConverting}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                          isRecommended
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                        }`}
                      >
                        {isCurrentlyConverting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isCurrentlyConverting
                            ? 'Converting...'
                            : item.type === 'video'
                            ? 'Download Video'
                            : item.type === 'audio'
                            ? 'Download Audio'
                            : 'Download Poster'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleCopyLink(item.url || videoData.canonicalUrl, item.id)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instant 1-Click Mirrors */}
          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-white">Instant Download Mirrors (Zero Wait)</h4>
              </div>
              <span className="text-xs text-slate-400">Direct High-Speed MP4 Downloads</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mirrorLinks.map((mirror, i) => (
                <a
                  key={i}
                  href={mirror.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-red-500/50 rounded-xl transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-red-400 transition-colors truncate">
                      {mirror.name}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">{mirror.badge}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
