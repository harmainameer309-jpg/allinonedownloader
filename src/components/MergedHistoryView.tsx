import React, { useState, useRef } from 'react';
import {
  UnifiedHistoryItem,
  SupportedPlatform,
  DownloadTask,
} from '../types';
import {
  History,
  Trash2,
  Download,
  Film,
  Music,
  ExternalLink,
  Copy,
  Check,
  Search,
  Upload,
  FileJson,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Database,
  Layers,
  X,
} from 'lucide-react';
import {
  exportUserDataAsJSON,
  importUserDataFromJSON,
} from '../utils/userDataManager';

interface MergedHistoryViewProps {
  items: UnifiedHistoryItem[];
  migratedClipStreamCount: number;
  migratedTokHDCount: number;
  migratedFacebookCount: number;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  onDownloadAgain: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    platform: SupportedPlatform
  ) => void;
  onSelectVideoUrl: (url: string, platform: SupportedPlatform) => void;
  onShowToast: (msg: string) => void;
  onRefreshData: () => void;
}

export const MergedHistoryView: React.FC<MergedHistoryViewProps> = ({
  items,
  migratedClipStreamCount,
  migratedTokHDCount,
  migratedFacebookCount,
  onClearHistory,
  onRemoveItem,
  onDownloadAgain,
  onSelectVideoUrl,
  onShowToast,
  onRefreshData,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'youtube' | 'tiktok' | 'facebook' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalCount = items.length;
  const youtubeCount = items.filter((i) => i.platform === 'youtube').length;
  const tiktokCount = items.filter((i) => i.platform === 'tiktok').length;
  const facebookCount = items.filter((i) => i.platform === 'facebook').length;
  const audioCount = items.filter((i) => i.format === 'MP3').length;

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowToast('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await importUserDataFromJSON(file);
    if (res.success) {
      onShowToast(`Successfully imported & merged ${res.count} items!`);
      onRefreshData();
    } else {
      onShowToast(res.error || 'Import failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredItems = items.filter((item) => {
    if (filterPlatform === 'youtube' && item.platform !== 'youtube') return false;
    if (filterPlatform === 'tiktok' && item.platform !== 'tiktok') return false;
    if (filterPlatform === 'facebook' && item.platform !== 'facebook') return false;
    if (filterPlatform === 'audio' && item.format !== 'MP3') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchAuthor = (item.author || '').toLowerCase().includes(q);
      return matchTitle || matchAuthor;
    }
    return true;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Database className="w-7 h-7 text-emerald-400" />
            <span>Merged Media Library & History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unified user data synchronized across YouTube, TikTok, and Facebook.
          </p>
        </div>

        {/* Data Import / Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportUserDataAsJSON()}
            disabled={items.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download JSON backup of all merged data"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Import and merge external backup"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              title="Clear all merged records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Migration Notice Banner */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-start gap-3 shadow-md">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <span>Unified Multi-Platform Data Sync Active</span>
            <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full">
              AUTO-MERGE ENABLED
            </span>
          </div>
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            Your user history across <strong className="text-white">YouTube</strong>,{' '}
            <strong className="text-white">TikTok</strong>, and{' '}
            <strong className="text-white">Facebook</strong> is consolidated into one clean library. All new queries and downloads automatically deduplicate and keep all storage stores in sync.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block font-medium">Total Merged</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block tabular-nums">
            {totalCount}
          </span>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <span className="text-xs text-blue-400/90 block font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Facebook
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block tabular-nums">
            {facebookCount}
          </span>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <span className="text-xs text-red-400/90 block font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            YouTube
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block tabular-nums">
            {youtubeCount}
          </span>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <span className="text-xs text-cyan-400/90 block font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            TikTok
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block tabular-nums">
            {tiktokCount}
          </span>
        </div>
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
          <span className="text-xs text-amber-400/90 block font-medium flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            MP3 Audio
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block tabular-nums">
            {audioCount}
          </span>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-rose-200">
            Are you sure you want to clear all merged download records across all platforms?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClearHistory();
                setShowClearConfirm(false);
                onShowToast('All merged history cleared');
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterPlatform('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Media ({totalCount})
          </button>
          <button
            onClick={() => setFilterPlatform('facebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'facebook'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            <span>Facebook ({facebookCount})</span>
          </button>
          <button
            onClick={() => setFilterPlatform('youtube')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>YouTube ({youtubeCount})</span>
          </button>
          <button
            onClick={() => setFilterPlatform('tiktok')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'tiktok'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>TikTok ({tiktokCount})</span>
          </button>
          <button
            onClick={() => setFilterPlatform('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterPlatform === 'audio'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>Audio ({audioCount})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved videos..."
            className="w-full h-9 pl-8 pr-3 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Merged Items List */}
      {filteredItems.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matching media records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search terms or filter.'
              : 'Download any Facebook, YouTube, or TikTok video above and it will automatically be cataloged in your merged library.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl divide-y divide-slate-800/80 shadow-2xl overflow-hidden">
          {filteredItems.map((item) => {
            const isYouTube = item.platform === 'youtube';
            const isFacebook = item.platform === 'facebook';
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Thumbnail with platform badge */}
                  <div className="relative w-16 h-12 sm:w-18 sm:h-13 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800 group">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%231e293b"/></svg>';
                      }}
                    />
                    <div
                      className={`absolute top-1 left-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-white shadow-sm ${
                        isFacebook
                          ? 'bg-blue-600'
                          : isYouTube
                          ? 'bg-red-600'
                          : 'bg-cyan-600'
                      }`}
                    >
                      {isFacebook ? 'FB' : isYouTube ? 'YT' : 'TIKTOK'}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onSelectVideoUrl(item.originalUrl, item.platform)}
                      className="text-xs sm:text-sm font-semibold text-slate-100 truncate hover:text-cyan-400 cursor-pointer transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono mt-1 tabular-nums">
                      <span className="text-slate-300 font-medium">
                        {item.authorHandle ? `@${item.authorHandle}` : item.author}
                      </span>
                      <span> </span>
                      <span
                        className={`font-semibold ${
                          item.format === 'MP3'
                            ? 'text-amber-400'
                            : isFacebook
                            ? 'text-blue-400'
                            : isYouTube
                            ? 'text-red-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {item.quality} ({item.format})
                      </span>
                      {item.fileSizeFormatted && (
                        <>
                          <span> </span>
                          <span className="text-slate-500">{item.fileSizeFormatted}</span>
                        </>
                      )}
                      <span> </span>
                      <span className="text-slate-500">{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() =>
                      onDownloadAgain(
                        item.downloadUrl || item.originalUrl,
                        `${item.title}_${item.quality}.${item.format.toLowerCase()}`,
                        item.title,
                        (item.quality.toLowerCase().includes('1080') ? '1080p' : 'hd') as any,
                        item.platform
                      )
                    }
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download file again"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(item.originalUrl, item.id)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Copy original link"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onSelectVideoUrl(item.originalUrl, item.platform)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Open in Downloader"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
