import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SmartUnifiedInput } from './components/SmartUnifiedInput';
import { YouTubeDownloader } from './components/YouTubeDownloader';
import { TikTokDownloader } from './components/TikTokDownloader';
import { FacebookDownloader } from './components/FacebookDownloader';
import { BatchStudio } from './components/BatchStudio';
import { CreatorExplorer } from './components/CreatorExplorer';
import { MergedHistoryView } from './components/MergedHistoryView';
import { HowItWorks } from './components/HowItWorks';
import { CreatorProfile } from './components/CreatorProfile';
import { CricketScorecardView } from './components/CricketScorecardView';
import { SocialDownloader } from './components/SocialDownloader';
import { SnaptubeDesktop } from './components/SnaptubeDesktop';
import { ProgressBar } from './components/ProgressBar';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { Toast } from './components/Toast';
import {
  TikTokVideo,
  YouTubeVideoData,
  FacebookVideoData,
  BatchItem,
  DownloadTask,
  UnifiedHistoryItem,
  SupportedPlatform,
} from './types';
import { downloadMediaStream, formatBytes, sanitizeFilename } from './utils/downloadManager';
import {
  getMergedUserData,
  saveHistoryItem,
  removeHistoryItem,
  clearAllUserData,
} from './utils/userDataManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    | 'smart'
    | 'snaptube'
    | 'youtube'
    | 'tiktok'
    | 'facebook'
    | 'social'
    | 'cricket'
    | 'batch'
    | 'creator'
    | 'history'
    | 'guide'
    | 'creator-profile'
  >('smart');

  // Input routing pre-fills
  const [socialUrl, setSocialUrl] = useState<string>('');

  // Merged User Data State across YouTube, TikTok, and Facebook
  const [mergedHistory, setMergedHistory] = useState<UnifiedHistoryItem[]>([]);
  const [migratedClipStreamCount, setMigratedClipStreamCount] = useState(0);
  const [migratedTokHDCount, setMigratedTokHDCount] = useState(0);
  const [migratedFacebookCount, setMigratedFacebookCount] = useState(0);

  // Batch Studio Items
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  // Active Download Stream Progress Task
  const [activeTask, setActiveTask] = useState<DownloadTask | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<any | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Initialize and automatically merge user data from all platforms on mount
  useEffect(() => {
    refreshHistoryData();
  }, []);

  const refreshHistoryData = () => {
    const res = getMergedUserData();
    setMergedHistory(res.items);
    setMigratedClipStreamCount(res.migratedFromClipStream);
    setMigratedTokHDCount(res.migratedFromTokHD);
    setMigratedFacebookCount(res.migratedFromFacebook);
  };

  // Add media to unified history
  const handleRecordDownload = (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: string,
    platform: SupportedPlatform,
    meta?: any
  ) => {
    const isAudio = filename.toLowerCase().endsWith('.mp3');
    const isThumb = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg');
    const format = isAudio ? 'MP3' : isThumb ? 'JPG' : 'MP4';

    const newItem: UnifiedHistoryItem = {
      id: `${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      platform,
      title: title || (platform === 'facebook' ? 'Facebook Video / Reel' : 'Downloaded Media'),
      author: meta?.author?.nickname || meta?.author || (platform === 'facebook' ? 'Facebook Creator' : 'Creator'),
      authorHandle: meta?.author?.unique_id || undefined,
      thumbnail: meta?.cover || meta?.thumbnailUrl || meta?.thumbnail || '',
      quality: quality || 'HD',
      format,
      fileSizeFormatted: meta?.hd_size ? formatBytes(meta.hd_size) : meta?.hdSizeFormatted,
      timestamp: Date.now(),
      originalUrl: meta?.canonicalUrl || meta?.originalUrl || mediaUrl,
      downloadUrl: mediaUrl,
      videoId: meta?.id || meta?.videoId,
    };

    const updated = saveHistoryItem(newItem);
    setMergedHistory(updated);
  };

  // Stream downloader handler with live speed/bytes/ETA
  const handleStartDownload = async (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: any
  ) => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    const isFb =
      videoMeta?.platform === 'facebook' ||
      filename.includes('_FB_') ||
      mediaUrl.includes('fbcdn.net') ||
      (videoMeta?.originalUrl && /facebook\.com|fb\.watch/i.test(videoMeta.originalUrl));
    const isYt =
      videoMeta?.canonicalUrl?.includes('youtube.com') ||
      videoMeta?.platform === 'youtube' ||
      filename.includes('YouTube') ||
      videoMeta?.videoId;
    const isIg =
      videoMeta?.platform === 'instagram' ||
      filename.includes('_INSTAGRAM_') ||
      mediaUrl.includes('cdninstagram.com') ||
      (videoMeta?.originalUrl && /(?:instagram\.com|instagr\.am)/i.test(videoMeta.originalUrl));

    const platform: SupportedPlatform = isIg
      ? 'instagram'
      : isFb
      ? 'facebook'
      : isYt
      ? 'youtube'
      : (videoMeta?.platform as SupportedPlatform) || 'tiktok';

    const taskId = `dl_${Date.now()}`;
    setActiveTask({
      id: taskId,
      title,
      platform,
      quality,
      status: 'downloading',
      percentage: 0,
      receivedBytes: 0,
      totalBytes: 0,
      speedFormatted: 'Starting...',
      etaFormatted: '--',
    });

    await downloadMediaStream(
      mediaUrl,
      filename,
      taskId,
      title,
      quality,
      platform === 'youtube' ? 'youtube' : 'tiktok',
      {
        onProgress: (updated) => {
          setActiveTask((prev) => (prev ? { ...prev, ...updated } : null));
        },
        onSuccess: (savedFilename, blob) => {
          handleRecordDownload(mediaUrl, savedFilename, title, quality, platform, {
            ...videoMeta,
            hd_size: blob.size,
          });
          showToast(`Saved: ${savedFilename}`);
        },
        onError: (err) => {
          console.error('Download stream error:', err);
          showToast(err);
        },
      },
      abortController
    );
  };

  const handleCancelDownload = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    setActiveTask((prev) =>
      prev
        ? {
            ...prev,
            status: 'cancelled',
            speedFormatted: 'Cancelled',
            etaFormatted: '--',
          }
        : null
    );
  };

  const handleDismissTask = () => {
    setActiveTask(null);
  };

  // Batch Queue Helpers
  const handleAddToBatch = (video: any, forcedPlatform?: SupportedPlatform) => {
    const isIg =
      forcedPlatform === 'instagram' ||
      video.platform === 'instagram' ||
      (video.originalUrl && /(?:instagram\.com|instagr\.am)/i.test(video.originalUrl));
    const isFb =
      forcedPlatform === 'facebook' ||
      video.platform === 'facebook' ||
      (video.originalUrl && /facebook\.com|fb\.watch/i.test(video.originalUrl));
    const isYt =
      forcedPlatform === 'youtube' ||
      video.canonicalUrl ||
      video.videoId ||
      video.platform === 'youtube';

    const platform: SupportedPlatform = isIg
      ? 'instagram'
      : isFb
      ? 'facebook'
      : isYt
      ? 'youtube'
      : 'tiktok';
    const videoUrl = isIg
      ? video.originalUrl || video.url
      : isFb
      ? video.originalUrl || video.url
      : isYt
      ? video.canonicalUrl || `https://www.youtube.com/watch?v=${video.videoId}`
      : `https://www.tiktok.com/@${video.author?.unique_id || 'user'}/video/${video.id}`;

    const newItem: BatchItem = {
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: videoUrl,
      platform,
      selected: true,
      quality: 'hd',
      status: 'ready',
      video: {
        ...video,
        cover: video.cover || video.thumbnailUrl || video.thumbnail,
      },
    };

    setBatchItems((prev) => {
      if (
        prev.some(
          (item) =>
            (item.video as any)?.id === video.id ||
            (item.video as any)?.videoId === (video as any)?.videoId
        )
      ) {
        showToast('Video is already in Batch Studio');
        return prev;
      }
      showToast('Added video to Batch Studio');
      return [newItem, ...prev];
    });
  };

  const handleAddMultipleToBatch = (videos: TikTokVideo[]) => {
    const newItems: BatchItem[] = videos.map((video) => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: `https://www.tiktok.com/@${video.author?.unique_id || 'user'}/video/${video.id}`,
      platform: 'tiktok',
      selected: true,
      quality: 'hd',
      status: 'ready',
      video,
    }));

    setBatchItems((prev) => {
      const existingIds = new Set(prev.map((i) => (i.video as any)?.id).filter(Boolean));
      const filtered = newItems.filter((i) => !existingIds.has((i.video as any)?.id));
      return [...filtered, ...prev];
    });
    setActiveTab('batch');
    showToast(`Added ${videos.length} videos to Batch Studio`);
  };

  const handleSelectHistoryVideo = (url: string, platform: SupportedPlatform) => {
    if (platform === 'facebook') {
      setActiveTab('facebook');
    } else if (platform === 'youtube') {
      setActiveTab('youtube');
    } else {
      setActiveTab('tiktok');
    }
  };

  const handleClearHistory = () => {
    clearAllUserData();
    setMergedHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeHistoryItem(id);
    setMergedHistory(updated);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        batchCount={batchItems.length}
        historyCount={mergedHistory.length}
        migratedNotificationCount={migratedClipStreamCount + migratedTokHDCount + migratedFacebookCount}
      />

      {/* Persistent Live Download Progress Tracker */}
      {activeTask && (
        <div className="sticky top-16 z-30 w-full bg-[#090d16]/98 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <ProgressBar
              task={activeTask}
              onCancel={handleCancelDownload}
              onDismiss={handleDismissTask}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Tab 1: Universal Auto-Detect Downloader */}
        {activeTab === 'smart' && (
          <SmartUnifiedInput
            onRouteYouTube={(url) => {
              setActiveTab('youtube');
            }}
            onRouteTikTok={(url) => {
              setActiveTab('tiktok');
            }}
            onRouteFacebook={(url) => {
              setActiveTab('facebook');
            }}
            onRouteInstagram={(url) => {
              setSocialUrl(url);
              setActiveTab('social');
            }}
            onRouteCricket={(url) => {
              setActiveTab('cricket');
            }}
            onRouteSnaptube={(url) => {
              setActiveTab('snaptube');
            }}
            onShowToast={showToast}
          />
        )}

        {/* Tab: Snaptube Web Desktop Edition (Embedded Player & Universal Downloads) */}
        {activeTab === 'snaptube' && (
          <SnaptubeDesktop
            onDownload={handleStartDownload}
            onAddToBatch={(v) => handleAddToBatch(v, 'youtube')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 2: Facebook Videos & Reels Downloader */}
        {activeTab === 'facebook' && (
          <FacebookDownloader
            onDownload={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddToBatch={(v) => handleAddToBatch(v, 'facebook')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 3: Full YouTube Downloader (ClipStream) */}
        {activeTab === 'youtube' && (
          <YouTubeDownloader
            onDownload={handleStartDownload}
            onAddToBatch={(v) => handleAddToBatch(v, 'youtube')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 4: Full TikTok Downloader (TokHD) */}
        {activeTab === 'tiktok' && (
          <TikTokDownloader
            onDownload={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddToBatch={(v) => handleAddToBatch(v, 'tiktok')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 5: Multi-Platform Social Downloader */}
        {activeTab === 'social' && (
          <SocialDownloader
            initialUrl={socialUrl}
            onDownload={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddToBatch={(v) => handleAddToBatch(v, 'instagram')}
            onShowToast={showToast}
          />
        )}

        {/* Tab 6: Cricbuzz Live Cricket Scorecard & Match Center */}
        {activeTab === 'cricket' && (
          <CricketScorecardView onShowToast={showToast} />
        )}

        {/* Tab 7: Unified Cross-Platform Batch Studio */}
        {activeTab === 'batch' && (
          <BatchStudio
            batchItems={batchItems}
            onSetBatchItems={setBatchItems}
            onDownloadSingle={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onShowToast={showToast}
          />
        )}

        {/* Tab 6: TikTok Creator Explorer */}
        {activeTab === 'creator' && (
          <CreatorExplorer
            onDownloadSingle={handleStartDownload}
            onPreview={(v) => setPreviewVideo(v)}
            onAddMultipleToBatch={handleAddMultipleToBatch}
            onShowToast={showToast}
          />
        )}

        {/* Tab 7: Merged User Data & Library */}
        {activeTab === 'history' && (
          <MergedHistoryView
            items={mergedHistory}
            migratedClipStreamCount={migratedClipStreamCount}
            migratedTokHDCount={migratedTokHDCount}
            migratedFacebookCount={migratedFacebookCount}
            onClearHistory={handleClearHistory}
            onRemoveItem={handleRemoveHistoryItem}
            onDownloadAgain={(mediaUrl, fn, title, q, platform) => {
              handleStartDownload(mediaUrl, fn, title, q, { platform });
            }}
            onSelectVideoUrl={handleSelectHistoryVideo}
            onShowToast={showToast}
            onRefreshData={refreshHistoryData}
          />
        )}

        {/* Tab 8: Guide & FAQs */}
        {activeTab === 'guide' && <HowItWorks />}

        {/* Tab 9: About Creator (Harmain Ameer) */}
        {activeTab === 'creator-profile' && <CreatorProfile />}
      </main>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={previewVideo}
        isOpen={Boolean(previewVideo)}
        onClose={() => setPreviewVideo(null)}
        onDownload={(video, quality) => {
          let mediaUrl = video.hdplay || video.hdUrl || video.play || video.sdUrl || video.canonicalUrl;
          let ext = 'mp4';
          if (quality === 'music') ext = 'mp3';
          const fname = `${sanitizeFilename(video.title || 'video')}_${quality.toUpperCase()}.${ext}`;
          handleStartDownload(mediaUrl, fname, video.title || 'Video', quality, video);
        }}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a12] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-extrabold text-white text-sm">ClipStream Studio</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-300">
              Unified Platform Created & Developed by{' '}
              <strong className="text-white">Harmain Ameer</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a
              href="mailto:harmainameer309@gmail.com"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              harmainameer309@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('smart')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Universal
            </button>
            <button
              onClick={() => setActiveTab('snaptube')}
              className="hover:text-amber-300 transition-colors cursor-pointer text-amber-400 font-semibold"
            >
              ⚡ Snaptube Desktop
            </button>
            <button
              onClick={() => setActiveTab('facebook')}
              className="hover:text-white transition-colors cursor-pointer text-blue-400 font-medium"
            >
              Facebook
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              YouTube
            </button>
            <button
              onClick={() => setActiveTab('tiktok')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              TikTok
            </button>
            <button
              onClick={() => setActiveTab('cricket')}
              className="hover:text-emerald-300 text-emerald-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🏏 Cricket Live</span>
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Batch ZIP
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-white transition-colors cursor-pointer text-emerald-400"
            >
              Merged Data
            </button>
            <button
              onClick={() => setActiveTab('creator-profile')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About Harmain
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
