import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Clipboard,
  X,
  AlertCircle,
  Loader2,
  Download,
  Film,
  Music,
} from 'lucide-react';
import { SupportedPlatform } from '../types';

interface SmartUnifiedInputProps {
  onRouteYouTube: (url: string) => void;
  onRouteTikTok: (url: string) => void;
  onRouteFacebook: (url: string) => void;
  onRouteInstagram?: (url: string) => void;
  onRouteCricket?: (url: string) => void;
  onRouteSnaptube?: (url?: string) => void;
  onShowToast: (msg: string) => void;
}

const UNIVERSAL_SAMPLES = [
  {
    platform: 'instagram' as const,
    label: '📸 Instagram Reel (DN-QI37DSnI)',
    url: 'https://www.instagram.com/p/DN-QI37DSnI/',
  },
  {
    platform: 'snaptube' as const,
    label: '⚡ Snaptube Desktop Edition',
    url: 'https://www.youtube.com/watch?v=dyvxxJSGUsE',
  },
  {
    platform: 'facebook' as const,
    label: 'Facebook Reel',
    url: 'https://www.facebook.com/reel/1807623153746790',
  },
  {
    platform: 'youtube' as const,
    label: 'YouTube Tutorial',
    url: 'https://www.youtube.com/watch?v=dyvxxJSGUsE',
  },
  {
    platform: 'tiktok' as const,
    label: 'TikTok Security Tips',
    url: 'https://www.tiktok.com/@tiktoktips/video/7675767536016706847',
  },
  {
    platform: 'cricket' as const,
    label: '🏏 Cricbuzz Match #40381',
    url: 'https://www.cricbuzz.com/live-cricket-scorecard/40381/usa-vs-ire-2nd-t20i-ireland-tour-of-usa-2021',
  },
];

export const SmartUnifiedInput: React.FC<SmartUnifiedInputProps> = ({
  onRouteYouTube,
  onRouteTikTok,
  onRouteFacebook,
  onRouteInstagram,
  onRouteCricket,
  onRouteSnaptube,
  onShowToast,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [mode, setMode] = useState<'auto' | 'youtube' | 'tiktok' | 'facebook' | 'instagram'>('auto');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
          setErrorMsg(null);
          onShowToast('Pasted link from clipboard');
        }
      }
    } catch (err) {
      onShowToast('Please press Ctrl+V to paste link');
    }
  };

  const handleAnalyze = async () => {
    const raw = inputUrl.trim();
    if (!raw) {
      setErrorMsg('Please paste a YouTube, TikTok, or Facebook link to continue');
      return;
    }
    setErrorMsg(null);
    setIsDetecting(true);

    try {
      const isFb = /(?:facebook\.com|fb\.watch|fb\.gg)/i.test(raw);
      const isYt = /(?:youtu\.be|youtube\.com)/i.test(raw);
      const isTt = /tiktok\.com/i.test(raw);
      const isIg = /(?:instagram\.com|instagr\.am)/i.test(raw);
      const isCricbuzz = /(?:cricbuzz\.com|cricket)/i.test(raw);

      if (isCricbuzz && onRouteCricket) {
        onRouteCricket(raw);
      } else if (isIg && onRouteInstagram) {
        onRouteInstagram(raw);
      } else if (mode === 'instagram' && onRouteInstagram) {
        onRouteInstagram(raw);
      } else if (mode === 'facebook' || (mode === 'auto' && isFb)) {
        onRouteFacebook(raw);
      } else if (mode === 'youtube' || (mode === 'auto' && isYt)) {
        onRouteYouTube(raw);
      } else if (mode === 'tiktok' || (mode === 'auto' && isTt)) {
        onRouteTikTok(raw);
      } else if (isIg && onRouteInstagram) {
        onRouteInstagram(raw);
      } else if (isFb) {
        onRouteFacebook(raw);
      } else if (isYt) {
        onRouteYouTube(raw);
      } else if (isTt) {
        onRouteTikTok(raw);
      } else {
        const res = await fetch('/api/detect-platform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: raw }),
        });
        const json = await res.json();
        if (json.platform === 'instagram' && onRouteInstagram) {
          onRouteInstagram(raw);
        } else if (json.platform === 'facebook') {
          onRouteFacebook(raw);
        } else if (json.platform === 'youtube') {
          onRouteYouTube(raw);
        } else if (json.platform === 'tiktok') {
          onRouteTikTok(raw);
        } else {
          setErrorMsg(
            'Unable to recognize URL platform. Please ensure it is a valid Instagram, Facebook, YouTube, TikTok, or Cricbuzz link.'
          );
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error parsing video link');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-2">
      {/* Hero Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>YouTube, TikTok & Facebook All-In-One Downloader by Harmain Ameer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Universal Media Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Paste any YouTube, TikTok, or Facebook Reel/Video link below. Our engine automatically recognizes the platform, strips watermarks, extracts high-bitrate audio, and prepares 1080p MP4 downloads.
        </p>
      </div>

      {/* Mode Segmented Controls */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl w-fit mx-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode('auto')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'auto'
              ? 'bg-gradient-to-r from-red-600 via-blue-600 to-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Auto Detect
        </button>
        <button
          type="button"
          onClick={() => setMode('instagram')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'instagram'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          <span>Instagram</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('facebook')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'facebook'
              ? 'bg-[#1877F2] text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-300" />
          <span>Facebook</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('youtube')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'youtube'
              ? 'bg-red-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>YouTube</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('tiktok')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mode === 'tiktok'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>TikTok</span>
        </button>
      </div>

      {/* Input Bar */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Paste any Instagram, YouTube, TikTok, or Facebook video link here..."
              className="w-full h-13 pl-4 pr-24 rounded-xl bg-[#0b0f19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isDetecting || !inputUrl.trim()}
            className="h-13 px-6 sm:px-8 bg-gradient-to-r from-red-600 via-blue-600 to-cyan-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-black/40 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting & Loading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fetch Media</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Cross-Platform Samples */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Quick sample links:</span>
          {UNIVERSAL_SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(s.url);
                if (s.platform === 'snaptube' && onRouteSnaptube) onRouteSnaptube(s.url);
                else if (s.platform === 'facebook') onRouteFacebook(s.url);
                else if (s.platform === 'youtube') onRouteYouTube(s.url);
                else if (s.platform === 'cricket' && onRouteCricket) onRouteCricket(s.url);
                else onRouteTikTok(s.url);
              }}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  s.platform === 'snaptube'
                    ? 'bg-amber-400'
                    : s.platform === 'facebook'
                    ? 'bg-blue-400'
                    : s.platform === 'youtube'
                    ? 'bg-red-500'
                    : s.platform === 'cricket'
                    ? 'bg-emerald-400'
                    : 'bg-cyan-400'
                }`}
              />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <span className="font-bold text-sm">f</span>
          </div>
          <h3 className="text-sm font-bold text-white">Facebook Videos & Reels</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High definition and standard definition MP4 streams with audio extraction powered by RapidAPI.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">YouTube 1080p & 720p HD</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Universal progressive faststart MP4 transcoding with synchronized audio and in-app video testing.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">TikTok Zero Watermarks</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Clean video extractions without author bouncing watermarks, with live bytes/sec speed tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
