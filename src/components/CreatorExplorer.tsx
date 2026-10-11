import React, { useState, useEffect } from 'react';
import { TikTokCreator, TikTokVideo, DownloadTask } from '../types';
import {
  Search,
  Users,
  CheckCircle2,
  Play,
  Download,
  Layers,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatDuration, formatNumber, sanitizeFilename } from '../utils/downloadManager';

interface CreatorExplorerProps {
  onDownloadSingle: (
    mediaUrl: string,
    filename: string,
    title: string,
    quality: DownloadTask['quality'],
    videoMeta?: TikTokVideo
  ) => void;
  onPreview: (video: TikTokVideo) => void;
  onAddMultipleToBatch: (videos: TikTokVideo[]) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_POPULAR_KEYWORDS = ['tech', 'coding', 'dance', 'comedy', 'news', 'gaming'];

export const CreatorExplorer: React.FC<CreatorExplorerProps> = ({
  onDownloadSingle,
  onPreview,
  onAddMultipleToBatch,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('tech');
  const [isSearching, setIsSearching] = useState(false);
  const [creators, setCreators] = useState<TikTokCreator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<TikTokCreator | null>(null);

  const [creatorPosts, setCreatorPosts] = useState<TikTokVideo[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    handleSearch('tech');
  }, []);

  const handleSearch = async (termToSearch?: string) => {
    const keyword = (termToSearch || searchTerm).trim();
    if (!keyword) return;
    setIsSearching(true);
    setErrorMsg(null);
    setSelectedCreator(null);
    setCreatorPosts([]);

    try {
      const res = await fetch(`/api/user-search?keywords=${encodeURIComponent(keyword)}&count=8`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data.user_list)) {
        setCreators(json.data.user_list);
        if (json.data.user_list.length > 0) {
          loadCreatorPosts(json.data.user_list[0]);
        }
      } else {
        setCreators([]);
      }
    } catch (err: any) {
      console.error('Search creators error:', err);
      setErrorMsg(err.message || 'Failed to search creators');
    } finally {
      setIsSearching(false);
    }
  };

  const loadCreatorPosts = async (creator: TikTokCreator) => {
    setSelectedCreator(creator);
    setIsLoadingPosts(true);
    setSelectedPostIds(new Set());
    try {
      const res = await fetch(
        `/api/user-posts?unique_id=${encodeURIComponent(creator.user.uniqueId)}&count=12`
      );
      const json = await res.json();
      if (json.data && Array.isArray(json.data.videos)) {
        setCreatorPosts(json.data.videos);
      } else {
        setCreatorPosts([]);
      }
    } catch (err: any) {
      console.error('Error fetching creator posts:', err);
      setCreatorPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const toggleSelectPost = (id: string) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPosts = () => {
    if (selectedPostIds.size === creatorPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(creatorPosts.map((p) => p.id || p.video_id || '')));
    }
  };

  const handleSendSelectedToBatch = () => {
    const selected = creatorPosts.filter((p) =>
      selectedPostIds.has(p.id || (p as any).video_id || '')
    );
    if (selected.length === 0) return;
    onAddMultipleToBatch(selected);
    onShowToast(`Sent ${selected.length} creator videos to Batch Studio`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-2.5 pt-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Users className="w-7 h-7 sm:w-8 h-8 text-cyan-400" />
          <span>Creator Explorer & Grabber</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Explore top content creators, browse their latest high-definition videos without watermarks, and send multiple videos into the Batch Studio.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search creators by topic or username (e.g. tech, cooking, dance)..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="h-12 px-5 sm:px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Quick topic buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Popular:</span>
          {DEFAULT_POPULAR_KEYWORDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setSearchTerm(k);
                handleSearch(k);
              }}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors capitalize text-[11px] cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Creators Ribbon */}
      {creators.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Matching Creators ({creators.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {creators.map((c) => {
              const isCurrent = selectedCreator?.user.id === c.user.id;
              return (
                <button
                  key={c.user.id}
                  onClick={() => loadCreatorPosts(c)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                      : 'bg-[#111827]/80 hover:bg-[#152033] border-slate-800/80'
                  }`}
                >
                  <img
                    src={c.user.avatarThumb || c.user.avatarMedium}
                    alt={c.user.nickname}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {c.user.nickname}
                      {c.user.verified && (
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 inline" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">@{c.user.uniqueId}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatNumber(c.stats.followerCount)} followers
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Creator Posts Showcase */}
      {selectedCreator && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={selectedCreator.user.avatarMedium || selectedCreator.user.avatarThumb}
                alt={selectedCreator.user.nickname}
                className="w-13 h-13 rounded-full object-cover border-2 border-cyan-500/50"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  {selectedCreator.user.nickname}
                  {selectedCreator.user.verified && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </h3>
                <p className="text-xs text-slate-400">@{selectedCreator.user.uniqueId}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span>{formatNumber(selectedCreator.stats.followerCount)} followers</span>
                  <span> </span>
                  <span>{formatNumber(selectedCreator.stats.heartCount)} likes</span>
                  <span> </span>
                  <span>{formatNumber(selectedCreator.stats.videoCount)} videos</span>
                </div>
              </div>
            </div>

            {/* Batch Select Controls */}
            {creatorPosts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleSelectAllPosts}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  {selectedPostIds.size === creatorPosts.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleSendSelectedToBatch}
                  disabled={selectedPostIds.size === 0}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-sm shadow-cyan-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Send {selectedPostIds.size} to Batch Studio</span>
                </button>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {isLoadingPosts ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Fetching latest videos without watermark...</span>
            </div>
          ) : creatorPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {creatorPosts.map((post) => {
                const postId = post.id || (post as any).video_id || post.aweme_id || '';
                const isSelected = selectedPostIds.has(postId);
                return (
                  <div
                    key={postId}
                    className={`relative rounded-xl overflow-hidden border transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-cyan-500 bg-[#131b2e]'
                        : 'border-slate-800 bg-[#0d1322] hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-[9/13] bg-black overflow-hidden">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => toggleSelectPost(postId)}
                        className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-white font-bold'
                            : 'bg-black/60 text-transparent hover:text-white border border-white/20'
                        }`}
                      >
                        ✓
                      </button>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono tabular-nums text-slate-200">
                        {formatDuration(post.duration)}
                      </div>
                      <button
                        onClick={() => onPreview(post)}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-cyan-500/80 hover:bg-cyan-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                      >
                        <Play className="w-4 h-4 ml-0.5 fill-white" />
                      </button>
                    </div>

                    <div className="p-2.5 space-y-2">
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                        {post.title || 'TikTok Video'}
                      </p>
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatNumber(post.digg_count)} likes
                        </span>
                        <button
                          onClick={() => {
                            const mediaUrl = post.hdplay || post.play;
                            const filename = `${sanitizeFilename(post.title || 'tiktok')}_HD.mp4`;
                            onDownloadSingle(mediaUrl, filename, post.title || 'TikTok Video', 'hd', post);
                          }}
                          className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-950 rounded-md transition-colors cursor-pointer"
                          title="Instant HD Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No public videos found for this creator.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
