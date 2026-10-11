import React, { useRef, useState } from 'react';
import { TikTokVideo } from '../types';
import { X, Play, Download, ExternalLink } from 'lucide-react';
import { formatBytes, formatDuration, formatNumber } from '../utils/downloadManager';

interface VideoPreviewModalProps {
  video: TikTokVideo | any | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (video: any, quality: 'hd' | 'sd' | 'music') => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  video,
  isOpen,
  onClose,
  onDownload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<'hd' | 'sd'>('hd');

  if (!isOpen || !video) return null;

  const isTikTok = video.author?.unique_id || video.hdplay || video.play;
  const currentPlayUrl =
    selectedQuality === 'hd' && video.hdplay ? video.hdplay : video.play || video.canonicalUrl;
  const proxyVideoUrl = `/api/proxy-media?url=${encodeURIComponent(currentPlayUrl)}&filename=preview.mp4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 text-slate-400 hover:text-white bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Box */}
        <div className="relative bg-black flex items-center justify-center md:w-3/5 min-h-[320px] max-h-[50vh] md:max-h-none overflow-hidden">
          {video.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={proxyVideoUrl}
              poster={video.origin_cover || video.cover}
              autoPlay
              loop
              playsInline
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full max-h-[75vh] object-contain"
            />
          )}

          {/* Quality Indicator */}
          <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[11px] font-mono font-medium text-cyan-300">
            {video.videoId
              ? 'YouTube Player Preview'
              : selectedQuality === 'hd' && video.hdplay
              ? 'HD 1080p   No Watermark'
              : 'Standard   No Watermark'}
          </div>
        </div>

        {/* Details & Actions */}
        <div className="p-5 md:w-2/5 flex flex-col justify-between overflow-y-auto bg-[#0d1322]">
          <div>
            {/* Author */}
            {video.author && (
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <img
                  src={video.author.avatar || video.thumbnailUrl}
                  alt={video.author.nickname || video.author}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {video.author.nickname || video.author}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {video.author.unique_id ? `@${video.author.unique_id}` : 'YouTube Creator'}
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="mt-4">
              <p className="text-sm text-slate-200 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {video.title || 'Untitled Media'}
              </p>
            </div>

            {/* Metadata */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
              {video.duration ? (
                <>
                  <span>{formatDuration(video.duration)}</span>
                  <span> </span>
                </>
              ) : null}
              {video.play_count ? (
                <>
                  <span>{formatNumber(video.play_count)} views</span>
                  <span> </span>
                </>
              ) : null}
              {video.digg_count ? (
                <>
                  <span>{formatNumber(video.digg_count)} likes</span>
                  <span> </span>
                </>
              ) : null}
              {video.hd_size ? (
                <span className="text-cyan-400 font-semibold">{formatBytes(video.hd_size)}</span>
              ) : null}
            </div>

            {/* Quality switcher for TikTok */}
            {video.hdplay && (
              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Preview Stream Quality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedQuality('hd')}
                    disabled={!video.hdplay}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      selectedQuality === 'hd'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-semibold shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    HD (1080p)
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {video.hd_size ? formatBytes(video.hd_size) : 'Original HD'}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedQuality('sd')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      selectedQuality === 'sd'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-semibold shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SD (Standard)
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {video.size ? formatBytes(video.size) : 'Data Saver'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onClose();
                onDownload(video, selectedQuality);
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {selectedQuality.toUpperCase()}</span>
            </button>
            {video.music && (
              <button
                onClick={() => {
                  onClose();
                  onDownload(video, 'music');
                }}
                className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700/60 cursor-pointer"
              >
                <span>Download MP3 Audio Track</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
