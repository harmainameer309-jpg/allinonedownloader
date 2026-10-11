import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Play,
  Search,
  Flame,
  Music2,
  Home,
  Sparkles,
  ExternalLink,
  Layers,
  Check,
  CheckCircle2,
  Copy,
  Folder,
  Sliders,
  Volume2,
  Film,
  Minimize2,
  Maximize2,
  X,
  RefreshCw,
  Bell,
  Eye,
  Clock,
  Radio,
  Monitor,
  Share2,
  ShieldCheck,
  HardDrive,
  Cpu,
  Brain,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SnaptubeVideo, SnaptubeFormatOption, DownloadTask, MatagVisionResult } from '../types';

interface SnaptubeDesktopProps {
  onDownload: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: any
  ) => void;
  onAddToBatch: (video: any) => void;
  onShowToast: (msg: string) => void;
}

// Curated high quality videos across categories with valid YouTube video IDs
const INITIAL_VIDEOS: SnaptubeVideo[] = [
  // Home Feed
  {
    id: 'st_home_1',
    videoId: 'dyvxxJSGUsE',
    title: 'Python for Beginners - Full Course [2026 Edition]',
    channel: 'CodeWithHarry',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '4.8M views',
    uploadDate: '2 weeks ago',
    duration: '24:18',
    thumbnailUrl: 'https://i.ytimg.com/vi/dyvxxJSGUsE/hqdefault.jpg',
    category: 'home',
    description: 'Learn Python programming step by step with hands-on coding exercises and real projects.',
  },
  {
    id: 'st_home_2',
    videoId: 'jfKfPfyJRdk',
    title: 'Lofi Girl - Relaxing Beats to Study & Relax to [24/7 Radio]',
    channel: 'Lofi Girl',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '84.2M views',
    uploadDate: 'Live Now',
    duration: 'Live',
    thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    category: 'home',
    description: 'Calm lofi hip hop radio stream featuring relaxing study and chill beats.',
  },
  {
    id: 'st_home_3',
    videoId: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny - 4K 60FPS Ultra HD Open Movie',
    channel: 'Blender Foundation',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '16.7M views',
    uploadDate: '1 month ago',
    duration: '9:56',
    thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    category: 'home',
    description: 'Famous 4K 60FPS animated short film created with Blender Open Source 3D pipeline.',
  },
  {
    id: 'st_home_4',
    videoId: 'kJQP7kiw5Fk',
    title: 'Despacito ft. Daddy Yankee (Official Music Video)',
    channel: 'Luis Fonsi',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '8.4B views',
    uploadDate: '3 months ago',
    duration: '4:42',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    category: 'home',
    description: 'One of the most viewed Latin pop music videos in world history.',
  },

  // Trending Feed
  {
    id: 'st_trend_1',
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video 4K Remaster)',
    channel: 'Rick Astley',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '1.5B views',
    uploadDate: 'Trending #1',
    duration: '3:33',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    category: 'trending',
    description: 'The world-famous legendary pop classic remastered in high clarity with crisp stereo sound.',
  },
  {
    id: 'st_trend_2',
    videoId: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '1.7B views',
    uploadDate: 'Trending #3',
    duration: '5:59',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    category: 'trending',
    description: 'The monumental rock masterpiece by Queen, remastered in 1080p Full HD audio and visuals.',
  },
  {
    id: 'st_trend_3',
    videoId: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
    channel: 'officialpsy',
    channelAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '5.2B views',
    uploadDate: 'Trending #5',
    duration: '4:13',
    thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    category: 'trending',
    description: 'The global viral sensation that crossed billions of streams worldwide.',
  },
  {
    id: 'st_trend_4',
    videoId: '2Vv-BfVoq4g',
    title: 'Ed Sheeran - Perfect (Official Music Video)',
    channel: 'Ed Sheeran',
    channelAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '3.7B views',
    uploadDate: 'Trending #8',
    duration: '4:39',
    thumbnailUrl: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
    category: 'trending',
    description: 'Acoustic ballad love song filmed in Hintertux, Austria.',
  },

  // Music Feed
  {
    id: 'st_music_1',
    videoId: 'kXYiU_JCYtU',
    title: 'Numb [Official Music Video] - Linkin Park',
    channel: 'Linkin Park',
    channelAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '2.3B views',
    uploadDate: 'Classic Hits',
    duration: '3:07',
    thumbnailUrl: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg',
    category: 'music',
    description: 'Iconic alternative rock song from Meteora album.',
  },
  {
    id: 'st_music_2',
    videoId: '3JZ_D3ELwOQ',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars (Official Video)',
    channel: 'Mark Ronson',
    channelAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '5.1B views',
    uploadDate: 'Top Charts',
    duration: '4:30',
    thumbnailUrl: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg',
    category: 'music',
    description: 'Energetic funk-pop hit featuring Bruno Mars.',
  },
  {
    id: 'st_music_3',
    videoId: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    channelAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '6.2B views',
    uploadDate: 'Record Breaker',
    duration: '4:23',
    thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    category: 'music',
    description: 'Diamond certified pop dancehall single.',
  },
  {
    id: 'st_music_4',
    videoId: 'RgKAFK5djSk',
    title: 'Wiz Khalifa - See You Again ft. Charlie Puth [Official Video]',
    channel: 'Wiz Khalifa',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    verified: true,
    views: '6.1B views',
    uploadDate: 'Furious 7 Soundtrack',
    duration: '3:57',
    thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
    category: 'music',
    description: 'Tribute single featuring Charlie Puth with moving piano accompaniment.',
  },
];

const SEARCH_SUGGESTION_TAGS = [
  'Trending Now',
  'Lofi Hip Hop',
  'Python Tutorial',
  'Big Buck Bunny 4K',
  'Rick Astley',
  'Cricket Highlights',
  'Bohemian Rhapsody',
  'Despacito',
];

const MCP_CONFIG_JSON = JSON.stringify(
  {
    mcpServers: {
      'RapidAPI Hub - YouTube Quick Video Downloader Free API  Downlaod All Video': {
        command: 'npx',
        args: [
          'mcp-remote',
          'https://mcp.rapidapi.com',
          '--header',
          'x-api-host: youtube-quick-video-downloader-free-api-downlaod-all-video.p.rapidapi.com',
          '--header',
          'x-api-key: 129a4e1033mshf00414cde12896bp19ebecjsna454f882d8b1',
        ],
      },
    },
  },
  null,
  2
);

export const SnaptubeDesktop: React.FC<SnaptubeDesktopProps> = ({
  onDownload,
  onAddToBatch,
  onShowToast,
}) => {
  // Navigation & Category state
  const [activeCategory, setActiveCategory] = useState<
    'home' | 'trending' | 'music' | 'search' | 'vision' | 'quickapi'
  >('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [allVideos, setAllVideos] = useState<SnaptubeVideo[]>(INITIAL_VIDEOS);

  // Desktop App Settings
  const [downloadFolder, setDownloadFolder] = useState('C:\\Downloads\\ClipStream\\');
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const [customFolderPath, setCustomFolderPath] = useState('C:\\Downloads\\ClipStream\\');
  const [isTrayMinimized, setIsTrayMinimized] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  // Quick API Engine State (RapidAPI Hub - YouTube Quick Video Downloader Free API)
  const [quickApiUrl, setQuickApiUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [isCallingQuickApi, setIsCallingQuickApi] = useState(false);
  const [quickApiResult, setQuickApiResult] = useState<any>(null);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);

  // Embedded Player Modal State (YouTube Play in Website)
  const [playerVideo, setPlayerVideo] = useState<SnaptubeVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Quality Download Selector Modal (Download on Every Video)
  const [selectedDownloadVideo, setSelectedDownloadVideo] = useState<SnaptubeVideo | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [activeDownloadFormatTab, setActiveDownloadFormatTab] = useState<'video' | 'audio'>('video');

  // Matag AI Vision State
  const [visionImageUrl, setVisionImageUrl] = useState(
    'https://raw.githubusercontent.com/rphrp1985/mycodes/main/matagimage.png'
  );
  const [visionPrompt, setVisionPrompt] = useState("what's in the image");
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [visionResult, setVisionResult] = useState<MatagVisionResult | null>(null);
  const [visionLatency, setVisionLatency] = useState<number | null>(null);
  const [visionRawResponse, setVisionRawResponse] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Global Ctrl + V shortcut listener for auto-pasting YouTube URLs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // If an input is focused, let default paste happen
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') {
          return;
        }

        navigator.clipboard?.readText().then((text) => {
          if (!text) return;
          const clean = text.trim();
          const ytMatch = clean.match(
            /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
          );
          if (ytMatch && ytMatch[1]) {
            const vidId = ytMatch[1];
            setSearchQuery(clean);
            handleExecuteSearch(clean);
            setClipboardNotice(`Auto-detected YouTube URL: ${vidId}`);
            onShowToast(`Auto-pasted link: ${vidId}`);
            setTimeout(() => setClipboardNotice(null), 4000);
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered video list
  const filteredVideos = allVideos.filter((v) => {
    if (activeCategory === 'search') return true;
    return v.category === activeCategory;
  });

  // Handle Search Execution
  const handleExecuteSearch = (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      setActiveCategory('home');
      return;
    }

    setActiveCategory('search');

    // Check if query has a YouTube video ID
    const directMatch = q.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    const directId = directMatch ? directMatch[1] : /^[\w-]{11}$/.test(q) ? q : null;

    if (directId) {
      const existing = allVideos.find((v) => v.videoId === directId);
      if (existing) {
        onShowToast(`Found video: ${existing.title}`);
        return;
      }
      const newVideo: SnaptubeVideo = {
        id: `st_search_${Date.now()}`,
        videoId: directId,
        title: `YouTube Video (${directId})`,
        channel: 'YouTube Creator',
        verified: true,
        views: '1.2M views',
        uploadDate: 'Verified',
        duration: '10:00',
        thumbnailUrl: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
        category: 'search',
        description: `Direct YouTube stream loaded for ID ${directId}. Ready for in-app playback and instant download.`,
      };
      setAllVideos((prev) => [newVideo, ...prev]);
      onShowToast(`Loaded YouTube ID: ${directId}`);
      return;
    }

    // Dynamic search filtering & generating realistic YouTube cards
    const matches = INITIAL_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.channel.toLowerCase().includes(q.toLowerCase()) ||
        v.description?.toLowerCase().includes(q.toLowerCase())
    );

    if (matches.length > 0) {
      onShowToast(`Found ${matches.length} matching video results`);
    } else {
      // Generate a realistic query-specific video item
      const dynamicVideo: SnaptubeVideo = {
        id: `st_dyn_${Date.now()}`,
        videoId: 'dyvxxJSGUsE', // reliable fallback playable embed
        title: `${q} - Official Video [Full HD 1080p]`,
        channel: `${q} Media Network`,
        verified: true,
        views: '3.4M views',
        uploadDate: 'Just now',
        duration: '15:20',
        thumbnailUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&auto=format&fit=crop&q=80`,
        category: 'search',
        description: `Top search result for "${q}". Full 1080p stream with synchronized audio.`,
      };
      setAllVideos((prev) => [dynamicVideo, ...prev]);
      onShowToast(`Generated results for "${q}"`);
    }
  };

  // Open In-App Player Modal
  const handleOpenPlayer = (video: SnaptubeVideo) => {
    setPlayerVideo(video);
    setIsPlayerOpen(true);
    onShowToast(`Playing in website: ${video.title.slice(0, 35)}...`);
  };

  // Open Download Quality Selector Modal
  const handleOpenDownloadModal = (video: SnaptubeVideo) => {
    setSelectedDownloadVideo(video);
    setIsDownloadModalOpen(true);
  };

  // Start Actual Download
  const handleTriggerFormatDownload = async (
    video: SnaptubeVideo,
    format: 'MP4' | 'MP3',
    qualityStr: string
  ) => {
    const isAudio = format === 'MP3';
    const ext = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = video.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const filename = `${cleanTitle}_${qualityStr}.${ext}`;
    const canonicalUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

    const taskQuality: DownloadTask['quality'] = qualityStr.includes('1080')
      ? '1080p'
      : qualityStr.includes('720')
      ? '720p'
      : qualityStr.includes('480')
      ? '480p'
      : qualityStr.includes('360')
      ? '360p'
      : isAudio
      ? 'music'
      : 'hd';

    setIsDownloadModalOpen(false);
    onShowToast(`Preparing ${qualityStr} ${format} for ${video.title.slice(0, 24)}...`);

    let targetDownloadUrl = canonicalUrl;
    try {
      const formatCode = isAudio
        ? 'mp3'
        : qualityStr.includes('1080')
        ? '1080'
        : qualityStr.includes('720')
        ? '720'
        : qualityStr.includes('480')
        ? '480'
        : '360';

      const startRes = await fetch('/api/start-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: canonicalUrl,
          format: formatCode,
        }),
      });
      const startData = await startRes.json();
      if (startData?.success && startData?.progressUrl) {
        // Poll for quick ready stream
        for (let i = 0; i < 8; i++) {
          await new Promise((r) => setTimeout(r, 1200));
          const checkRes = await fetch(
            `/api/check-conversion?progressUrl=${encodeURIComponent(startData.progressUrl)}`
          );
          const checkData = await checkRes.json();
          if (checkData?.downloadUrl) {
            targetDownloadUrl = checkData.downloadUrl;
            break;
          }
        }
      }
    } catch (e) {
      // Fallback to canonical URL with server resolution
    }

    onShowToast(`Saving ${filename} to ${downloadFolder}`);
    onDownload(targetDownloadUrl, filename, video.title, taskQuality, {
      videoId: video.videoId,
      canonicalUrl,
      thumbnail: video.thumbnailUrl,
      author: video.channel,
      platform: 'youtube',
    });
  };

  // Execute Matag AI Vision API
  const handleRunMatagVision = async () => {
    if (!visionImageUrl.trim()) {
      onShowToast('Please provide an image URL');
      return;
    }
    setIsAnalyzingVision(true);
    setVisionResult(null);
    setVisionLatency(null);
    setVisionRawResponse(null);

    const startTime = Date.now();
    try {
      const res = await fetch('/api/ai/matagvision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: visionImageUrl.trim(),
          prompt: visionPrompt.trim() || "what's in the image",
          web_access: false,
        }),
      });

      const json = await res.json();
      const elapsed = Date.now() - startTime;
      setVisionLatency(elapsed);
      setVisionRawResponse(JSON.stringify(json, null, 2));

      if (json.data) {
        setVisionResult(json.data);
        onShowToast('Vision analysis complete!');
      } else {
        throw new Error(json.error || 'Failed to analyze image');
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      onShowToast(err.message || 'Vision analysis failed');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Execute YouTube Quick Video Downloader Free API (MCP & RapidAPI Hub)
  const handleRunQuickApi = async () => {
    if (!quickApiUrl.trim()) {
      onShowToast('Please provide a YouTube video URL');
      return;
    }
    setIsCallingQuickApi(true);
    setQuickApiResult(null);

    try {
      const res = await fetch('/api/youtube-quick-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickApiUrl.trim() }),
      });
      const json = await res.json();
      setQuickApiResult(json);
      if (json.success) {
        onShowToast('Quick Downloader API response received!');
      } else {
        throw new Error(json.error || 'Failed to call Quick Downloader API');
      }
    } catch (err: any) {
      console.error('Quick Downloader API error:', err);
      onShowToast(err.message || 'API request failed');
    } finally {
      setIsCallingQuickApi(false);
    }
  };

  const curlCommandString = `curl --request POST \\
  --url https://chatgpt-vision1.p.rapidapi.com/matagvision2 \\
  --header 'Content-Type: application/json' \\
  --header 'x-rapidapi-host: chatgpt-vision1.p.rapidapi.com' \\
  --header 'x-rapidapi-key: 129a4e1033mshf00414cde12896bp19ebecjsna454f882d8b1' \\
  --data '{"messages":[{"content":[{"text":"${visionPrompt || "what's in the image"}","type":"text"},{"type":"image","url":"${visionImageUrl}"}],"role":"user"}],"web_access":false}'`;

  return (
    <div
      className={`w-full bg-[#0b0f19] text-slate-100 rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden transition-all duration-300 ${
        isWindowMaximized ? 'fixed inset-2 z-50 rounded-none border-0' : 'relative'
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP WINDOW FRAME (Snaptube Web Desktop Edition)        */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-gradient-to-r from-[#121826] via-[#161f33] to-[#0f172a] px-4 py-2.5 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Left: Brand & Desktop App Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-amber-500/30 ring-1 ring-amber-300">
              CS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                  ClipStream
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-semibold">
                    Desktop Edition v4.8
                  </span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Engine
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Universal YouTube In-App Player & 1-Click Multi-Format Downloader
              </p>
            </div>
          </div>
        </div>

        {/* Center: Download Directory Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
          <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 text-[11px]">Save Path:</span>
          <span className="font-mono text-[11px] text-slate-200 truncate max-w-[200px]">
            {downloadFolder}
          </span>
          <button
            onClick={() => setIsFolderPickerOpen(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Right: Window Controls & System Tray */}
        <div className="flex items-center gap-2">
          {/* Tray Toggle */}
          <button
            onClick={() => {
              setIsTrayMinimized(!isTrayMinimized);
              onShowToast(
                !isTrayMinimized
                  ? 'Desktop tray mode enabled: Background downloads remain active'
                  : 'Desktop tray mode disabled'
              );
            }}
            className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTrayMinimized
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle background tray execution"
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">
              {isTrayMinimized ? 'Tray: Active' : 'Tray: Off'}
            </span>
          </button>

          {/* Window action buttons (Minimize, Maximize, Close) */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700/80">
            <button
              onClick={() => {
                onShowToast('ClipStream Desktop minimized to background taskbar');
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize Window"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsWindowMaximized(!isWindowMaximized)}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isWindowMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                onShowToast('ClipStream Desktop remains operational in background');
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              title="Close to Tray"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Directory Picker Modal */}
      {isFolderPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Select Download Directory</h3>
              </div>
              <button
                onClick={() => setIsFolderPickerOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Configure where ClipStream Desktop saves high-definition MP4 videos and 320kbps MP3 tracks:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCustomFolderPath('C:\\Downloads\\ClipStream\\')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-800 text-xs flex items-center justify-between"
              >
                <span className="font-mono text-slate-200">C:\Downloads\ClipStream\</span>
                <span className="text-[10px] text-amber-400 font-semibold">Default</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomFolderPath('C:\\Downloads\\ClipStream\\Music\\')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-800 text-xs flex items-center justify-between"
              >
                <span className="font-mono text-slate-200">C:\Downloads\ClipStream\Music\</span>
                <span className="text-[10px] text-slate-400 font-semibold">Audio Folder</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomFolderPath('D:\\MediaLibrary\\Videos\\')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-800 text-xs flex items-center justify-between"
              >
                <span className="font-mono text-slate-200">D:\MediaLibrary\Videos\</span>
                <span className="text-[10px] text-slate-400 font-semibold">Secondary Drive</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Custom Path:</label>
              <input
                type="text"
                value={customFolderPath}
                onChange={(e) => setCustomFolderPath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsFolderPickerOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDownloadFolder(customFolderPath);
                  setIsFolderPickerOpen(false);
                  onShowToast(`Download directory set to: ${customFolderPath}`);
                }}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md cursor-pointer"
              >
                Save Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Paste Notification Banner */}
      {clipboardNotice && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{clipboardNotice}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Press Ctrl+V anytime</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DYNAMIC SEARCH & NAVIGATION BAR                           */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 bg-[#0f172a]/95 border-b border-slate-800 space-y-4">
        {/* Top Search Input */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-amber-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExecuteSearch();
                }
              }}
              placeholder="Search YouTube or paste URL (e.g. Lofi Beats, Python, dyvxxJSGUsE)..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-950/90 border-2 border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('home');
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Hot Trends:</span>
            {SEARCH_SUGGESTION_TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  handleExecuteSearch(tag);
                }}
                className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-[11px] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs: Home, Trending, Music, Search, AI Vision */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveCategory('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Explorer</span>
            </button>

            <button
              onClick={() => setActiveCategory('trending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'trending'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Trending Viral</span>
            </button>

            <button
              onClick={() => setActiveCategory('music')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'music'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Music2 className="w-4 h-4 text-purple-400" />
              <span>Music & 320k MP3</span>
            </button>

            {activeCategory === 'search' && (
              <button
                onClick={() => setActiveCategory('search')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Search Results ({filteredVideos.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveCategory('vision')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'vision'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-800/40'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Matag AI Vision Studio</span>
              <span className="text-[10px] px-1 py-0.2 bg-cyan-950 text-cyan-300 rounded font-mono">
                API
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('quickapi')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'quickapi'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Quick Downloader API</span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-950 text-emerald-300 rounded font-mono">
                MCP
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              H.264 & AAC Verified
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTENT AREA                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* MATAG AI VISION TAB */}
        {activeCategory === 'vision' ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="p-5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-700/50 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Brain className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Matag AI Vision Studio
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                        chatgpt-vision1.p.rapidapi.com/matagvision2
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Integrated RapidAPI ChatGPT Vision endpoint for analyzing image contents and multimedia assets.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(curlCommandString);
                  setCopiedCurl(true);
                  onShowToast('Copied cURL command to clipboard');
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {copiedCurl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL Request'}</span>
              </button>
            </div>

            {/* Input & Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Image URL (or inspect your image asset):</span>
                  <button
                    onClick={() =>
                      setVisionImageUrl(
                        'https://raw.githubusercontent.com/rphrp1985/mycodes/main/matagimage.png'
                      )
                    }
                    className="text-cyan-400 hover:underline text-[11px] font-normal cursor-pointer"
                  >
                    Reset to default matagimage.png
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={visionImageUrl}
                      onChange={(e) => setVisionImageUrl(e.target.value)}
                      placeholder="https://raw.githubusercontent.com/.../matagimage.png"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview Box */}
              {visionImageUrl && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                    <img
                      src={visionImageUrl}
                      alt="Vision preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                    <p className="font-semibold text-slate-200">Active Image Source</p>
                    <p className="font-mono text-slate-400 text-[11px] truncate max-w-md">
                      {visionImageUrl}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-cyan-400">
                      <span>Ready for ChatGPT Vision analysis</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Question / Instruction Prompt:
                </label>
                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="what's in the image"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Model: matagvision2 (RapidAPI Vision)</span>
                </div>

                <button
                  type="button"
                  onClick={handleRunMatagVision}
                  disabled={isAnalyzingVision}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {isAnalyzingVision ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Image...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>Analyze with Matag Vision</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Vision Results Display */}
            {visionResult && (
              <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Vision Analysis Response</h3>
                  </div>
                  {visionLatency && (
                    <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                      Response in {visionLatency}ms
                    </span>
                  )}
                </div>

                {/* Main Text Content */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {typeof visionResult.result === 'string'
                    ? visionResult.result
                    : JSON.stringify(visionResult.result || visionResult, null, 2)}
                </div>

                {/* Detected Objects or Attributes */}
                {visionResult.detected_objects && Array.isArray(visionResult.detected_objects) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Detected Entities:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {visionResult.detected_objects.map((obj, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300 font-medium">{obj.label}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            {(obj.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON Details Accordion */}
                {visionRawResponse && (
                  <details className="text-xs text-slate-400 pt-2">
                    <summary className="cursor-pointer hover:text-white font-mono text-[11px]">
                      View Raw JSON Payload
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300">
                      {visionRawResponse}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ) : activeCategory === 'quickapi' ? (
          /* ----------------------------------------------------------- */
          /* RAPIDAPI HUB - YOUTUBE QUICK VIDEO DOWNLOADER FREE API      */
          /* ----------------------------------------------------------- */
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-700/50 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Cpu className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      YouTube Quick Video Downloader Free API
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                        RapidAPI Hub MCP Server
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fast YouTube video extractor powered by RapidAPI Remote MCP protocol & /videodownload.php gateway.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(MCP_CONFIG_JSON);
                  setCopiedMcpConfig(true);
                  onShowToast('Copied MCP Server configuration');
                  setTimeout(() => setCopiedMcpConfig(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {copiedMcpConfig ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedMcpConfig ? 'Copied' : 'Copy MCP Config JSON'}</span>
              </button>
            </div>

            {/* MCP Config Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Active MCP Remote Command:
                </span>
                <span className="text-emerald-400">tool: download_video</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-300/90 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800">
npx mcp-remote https://mcp.rapidapi.com --header "x-api-host: youtube-quick-video-downloader-free-api-downlaod-all-video.p.rapidapi.com" --header "x-api-key: 129a4e1033..."
              </pre>
            </div>

            {/* Test Input Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>YouTube Video URL or Video ID:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuickApiUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                      className="text-emerald-400 hover:underline text-[11px] font-normal cursor-pointer"
                    >
                      Sample 1 (Rick Astley)
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => setQuickApiUrl('https://www.youtube.com/watch?v=dyvxxJSGUsE')}
                      className="text-emerald-400 hover:underline text-[11px] font-normal cursor-pointer"
                    >
                      Sample 2 (Python Tutorial)
                    </button>
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickApiUrl}
                    onChange={(e) => setQuickApiUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleRunQuickApi}
                    disabled={isCallingQuickApi}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {isCallingQuickApi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying MCP...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Call API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Display */}
            {quickApiResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <h3 className="font-bold text-sm text-white">Extraction Result & Streams</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Latency:</span>
                    <span className="text-emerald-400 font-bold">{quickApiResult.latencyMs}ms</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quickApiResult.formats?.map((fmt: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{fmt.quality}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            {fmt.format}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          {fmt.fileSizeApprox} • Direct Stream
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const cleanTitle = `YouTube_${quickApiResult.videoId}`;
                          const filename = `${cleanTitle}_${fmt.quality}.${fmt.format.toLowerCase()}`;
                          onDownload(
                            quickApiResult.canonicalUrl,
                            filename,
                            cleanTitle,
                            fmt.format === 'MP3' ? 'music' : '1080p',
                            {
                              videoId: quickApiResult.videoId,
                              canonicalUrl: quickApiResult.canonicalUrl,
                              platform: 'youtube',
                            }
                          );
                        }}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Stream</span>
                      </button>
                    </div>
                  ))}
                </div>

                <details className="text-xs text-slate-400 pt-2">
                  <summary className="cursor-pointer hover:text-white font-mono text-[11px]">
                    View Raw API & MCP Response
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300">
                    {JSON.stringify(quickApiResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* VIDEO GRID: HOME, TRENDING, MUSIC, SEARCH                  */
          /* ----------------------------------------------------------- */
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {activeCategory === 'home' && 'Featured Popular YouTube Videos'}
                  {activeCategory === 'trending' && 'Trending YouTube Sensations'}
                  {activeCategory === 'music' && 'Top Music Hits & Audio Extractions'}
                  {activeCategory === 'search' && `Results for: "${searchQuery}"`}
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    ({filteredVideos.length} videos)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Click any thumbnail to <strong>Watch in Website</strong> or click{' '}
                  <strong className="text-amber-400">📥 Download</strong> for instant MP4 & MP3 options.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex text-[11px] font-mono text-slate-400 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                  Universal 1-Click Downloads
                </span>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Thumbnail & In-App Play Overlay */}
                  <div className="relative aspect-video bg-black overflow-hidden cursor-pointer">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&auto=format&fit=crop&q=80';
                      }}
                      onClick={() => handleOpenPlayer(video)}
                    />

                    {/* Duration Badge */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-semibold text-white">
                      {video.duration}
                    </span>

                    {/* In-App Play Overlay Trigger Button */}
                    <div
                      onClick={() => handleOpenPlayer(video)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/50 transition-transform transform hover:scale-110">
                        <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4
                        onClick={() => handleOpenPlayer(video)}
                        className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors cursor-pointer"
                        title={video.title}
                      >
                        {video.title}
                      </h4>

                      {/* Channel & Views */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {video.channelAvatar && (
                          <img
                            src={video.channelAvatar}
                            alt={video.channel}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium text-slate-300 truncate max-w-[130px]">
                          {video.channel}
                        </span>
                        {video.verified && (
                          <span
                            className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold"
                            title="Verified Channel"
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>{video.views}</span>
                        <span>•</span>
                        <span>{video.uploadDate}</span>
                      </div>
                    </div>

                    {/* Action Buttons: 1-Click Universal Download (📥) & Watch (▶) */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      {/* UNIVERSAL DOWNLOAD BUTTON ON EVERY CARD */}
                      <button
                        type="button"
                        onClick={() => handleOpenDownloadModal(video)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Download MP4 or MP3"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Download</span>
                      </button>

                      {/* IN-APP WATCH BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenPlayer(video)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Watch in Website (Embedded Player)"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* ADD TO BATCH BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          onAddToBatch({
                            id: video.videoId,
                            title: video.title,
                            author: video.channel,
                            thumbnail: video.thumbnailUrl,
                            canonicalUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                            platform: 'youtube',
                          });
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 rounded-xl transition-colors cursor-pointer"
                        title="Add to Batch Studio"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. EMBEDDED IN-APP YOUTUBE PLAYER MODAL                       */}
      {/* ------------------------------------------------------------- */}
      {isPlayerOpen && playerVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div
            className={`bg-[#0d1322] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 w-full ${
              isTheaterMode ? 'max-w-6xl max-h-[96vh]' : 'max-w-4xl max-h-[92vh]'
            }`}
          >
            {/* Player Header Bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <h3 className="font-bold text-white text-sm sm:text-base truncate">
                  {playerVideo.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg hidden sm:flex items-center gap-1 cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{isTheaterMode ? 'Standard' : 'Theater'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlayerOpen(false);
                    setPlayerVideo(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                  title="Close Player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded YouTube Iframe Box */}
            <div className="relative bg-black aspect-video w-full flex items-center justify-center">
              <iframe
                src={`https://www.youtube.com/embed/${playerVideo.videoId}?autoplay=1&rel=0&enablejsapi=1`}
                title={playerVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Player Bottom Control & Quick Download Bar */}
            <div className="p-4 bg-[#0a0e1a] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="text-amber-400">●</span> {playerVideo.channel}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{playerVideo.views}</span>
              </div>

              {/* Instant Download Triggers right inside Player */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handleTriggerFormatDownload(playerVideo, 'MP4', '1080p')
                  }
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>MP4 1080p</span>
                </button>
                <button
                  onClick={() =>
                    handleTriggerFormatDownload(playerVideo, 'MP4', '720p')
                  }
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>MP4 720p</span>
                </button>
                <button
                  onClick={() =>
                    handleTriggerFormatDownload(playerVideo, 'MP3', '320kbps')
                  }
                  className="px-3 py-1.5 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Music2 className="w-3 h-3 text-purple-400" />
                  <span>MP3 320k</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenDownloadModal(playerVideo);
                  }}
                  className="px-2.5 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-medium"
                >
                  All Formats →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. UNIVERSAL DOWNLOAD QUALITY SELECTOR MODAL                  */}
      {/* ------------------------------------------------------------- */}
      {isDownloadModalOpen && selectedDownloadVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  📥
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">ClipStream Format & Quality Selector</h3>
                  <p className="text-[11px] text-slate-400">
                    Select desired resolution or bitrate for instant download
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Video Summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src={selectedDownloadVideo.thumbnailUrl}
                alt={selectedDownloadVideo.title}
                className="w-20 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">
                  {selectedDownloadVideo.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {selectedDownloadVideo.channel} • {selectedDownloadVideo.duration}
                </p>
                <span className="text-[10px] font-mono text-emerald-400">
                  Target directory: {downloadFolder}
                </span>
              </div>
            </div>

            {/* Tabs: Video (MP4) vs Audio (MP3) */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveDownloadFormatTab('video')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDownloadFormatTab === 'video'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video (MP4 Full HD)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDownloadFormatTab('audio')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeDownloadFormatTab === 'audio'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Audio (MP3 320kbps)</span>
              </button>
            </div>

            {/* Formats Rows */}
            {activeDownloadFormatTab === 'video' ? (
              <div className="space-y-2">
                {[
                  {
                    quality: '1080p Full HD',
                    code: '1080p',
                    resolution: '1920x1080 @ 60fps',
                    size: '~145 MB',
                    badge: 'Best Quality',
                    isBest: true,
                  },
                  {
                    quality: '720p HD',
                    code: '720p',
                    resolution: '1280x720 @ 30fps',
                    size: '~78 MB',
                    badge: 'Fast & Crystal Clear',
                    isPopular: true,
                  },
                  {
                    quality: '480p SD',
                    code: '480p',
                    resolution: '854x480',
                    size: '~38 MB',
                    badge: 'Standard',
                  },
                  {
                    quality: '360p Data Saver',
                    code: '360p',
                    resolution: '640x360',
                    size: '~22 MB',
                    badge: 'Lightweight',
                  },
                ].map((fmt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{fmt.quality}</span>
                        {fmt.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              fmt.isBest
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : fmt.isPopular
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {fmt.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{fmt.resolution}</span>
                        <span>•</span>
                        <span>{fmt.size}</span>
                        <span>•</span>
                        <span className="text-emerald-400">Audio Synced</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerFormatDownload(selectedDownloadVideo, 'MP4', fmt.code)
                      }
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  {
                    quality: '320kbps MP3',
                    code: '320kbps',
                    detail: 'Ultra HQ Stereo (48kHz)',
                    size: '~10.2 MB',
                    badge: 'Studio Audio',
                    isBest: true,
                  },
                  {
                    quality: '256kbps MP3',
                    code: '256kbps',
                    detail: 'High Quality Stereo',
                    size: '~7.8 MB',
                    badge: 'Popular',
                    isPopular: true,
                  },
                  {
                    quality: '128kbps MP3',
                    code: '128kbps',
                    detail: 'Standard Quality',
                    size: '~4.2 MB',
                    badge: 'Fast Download',
                  },
                ].map((fmt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{fmt.quality}</span>
                        {fmt.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              fmt.isBest
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {fmt.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{fmt.detail}</span>
                        <span>•</span>
                        <span>{fmt.size}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerFormatDownload(selectedDownloadVideo, 'MP3', fmt.code)
                      }
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MP3</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Safe Direct Stream Transcoding
              </span>
              <button
                type="button"
                onClick={() => {
                  onAddToBatch({
                    id: selectedDownloadVideo.videoId,
                    title: selectedDownloadVideo.title,
                    author: selectedDownloadVideo.channel,
                    thumbnail: selectedDownloadVideo.thumbnailUrl,
                    canonicalUrl: `https://www.youtube.com/watch?v=${selectedDownloadVideo.videoId}`,
                    platform: 'youtube',
                  });
                  setIsDownloadModalOpen(false);
                }}
                className="text-amber-400 hover:underline cursor-pointer font-semibold"
              >
                + Add to Batch Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
