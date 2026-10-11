import React from 'react';
import {
  Layers,
  Database,
  ArrowDownToLine,
  Globe,
  Trophy,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PlatformIcon } from './PlatformIcon';

interface HeaderProps {
  activeTab:
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
    | 'creator-profile';
  onSelectTab: (
    tab:
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
  ) => void;
  batchCount: number;
  historyCount: number;
  migratedNotificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  batchCount,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity: Signature Unified Website Logo */}
        <button
          onClick={() => onSelectTab('smart')}
          className="text-left group focus:outline-none cursor-pointer"
        >
          <BrandLogo size="md" showText={true} />
        </button>

        {/* Clean Main Navigation with Authentic Platform Logos */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('smart')}
            className={`transition-colors hover:text-white pb-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'smart'
                ? 'text-white border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <span>Universal</span>
          </button>

          <button
            onClick={() => onSelectTab('snaptube')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'snaptube'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <span className="w-4 h-4 rounded bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
              CS
            </span>
            <span>ClipStream Desktop</span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
              DESKTOP
            </span>
          </button>

          <button
            onClick={() => onSelectTab('youtube')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'youtube'
                ? 'text-red-400 border-red-500 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <PlatformIcon platform="youtube" size={15} />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => onSelectTab('tiktok')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tiktok'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <PlatformIcon platform="tiktok" size={14} />
            <span>TikTok</span>
          </button>

          <button
            onClick={() => onSelectTab('facebook')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'facebook'
                ? 'text-blue-400 border-blue-500 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <PlatformIcon platform="facebook" size={14} />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => onSelectTab('social')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'social'
                ? 'text-pink-400 border-pink-500 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <PlatformIcon platform="instagram" size={14} />
            <span>Instagram</span>
          </button>

          <button
            onClick={() => onSelectTab('cricket')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cricket'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cricket Live</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
              NEW
            </span>
          </button>

          <button
            onClick={() => onSelectTab('batch')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'batch'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <span>Batch ZIP</span>
            {batchCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full">
                {batchCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('creator')}
            className={`transition-colors hover:text-white pb-1 border-b-2 cursor-pointer ${
              activeTab === 'creator'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Creators
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors hover:text-white pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Merged Library</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('guide')}
            className={`transition-colors hover:text-white pb-1 border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'text-white border-slate-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Guide
          </button>

          <button
            onClick={() => onSelectTab('creator-profile')}
            className={`transition-colors hover:text-white pb-1 border-b-2 cursor-pointer ${
              activeTab === 'creator-profile'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-slate-400'
            }`}
          >
            Harmain
          </button>
        </nav>

        {/* Primary CTA / History Quick Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('history')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 rounded-lg transition-all cursor-pointer"
            title="View merged user data across all platforms"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Merged ({historyCount})</span>
          </button>
          <button
            onClick={() => onSelectTab('batch')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-600 via-blue-600 to-cyan-600 hover:opacity-95 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Studio</span>
          </button>
        </div>
      </div>

      {/* Mobile Subbar Navigation */}
      <div className="lg:hidden flex items-center justify-between border-t border-slate-800/80 px-2 py-1.5 bg-[#090d16]/98 text-xs font-medium overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => onSelectTab('smart')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'smart' ? 'text-white font-bold bg-slate-800' : 'text-slate-400'
          }`}
        >
          Universal
        </button>
        <button
          onClick={() => onSelectTab('snaptube')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'snaptube' ? 'text-amber-400 font-bold bg-amber-950/40 border border-amber-500/30' : 'text-slate-400'
          }`}
        >
          <span className="w-3.5 h-3.5 rounded bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
            CS
          </span>
          Desktop
        </button>
        <button
          onClick={() => onSelectTab('youtube')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'youtube' ? 'text-red-400 font-bold bg-red-950/40' : 'text-slate-400'
          }`}
        >
          YouTube
        </button>
        <button
          onClick={() => onSelectTab('tiktok')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'tiktok' ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          TikTok
        </button>
        <button
          onClick={() => onSelectTab('facebook')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'facebook' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-400'
          }`}
        >
          Facebook
        </button>
        <button
          onClick={() => onSelectTab('social')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'social' ? 'text-pink-400 font-bold bg-pink-950/40' : 'text-slate-400'
          }`}
        >
          <PlatformIcon platform="instagram" size={12} />
          Instagram
        </button>
        <button
          onClick={() => onSelectTab('cricket')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'cricket' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          🏏 Cricket
        </button>
        <button
          onClick={() => onSelectTab('batch')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'batch' ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400'
          }`}
        >
          Batch {batchCount > 0 && `(${batchCount})`}
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'history' ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400'
          }`}
        >
          Library {historyCount > 0 && `(${historyCount})`}
        </button>
        <button
          onClick={() => onSelectTab('creator-profile')}
          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'creator-profile' ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-slate-400'
          }`}
        >
          Harmain
        </button>
      </div>
    </header>
  );
};
