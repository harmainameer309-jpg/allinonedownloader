import React, { useState } from 'react';
import {
  Film,
  Zap,
  ShieldCheck,
  ChevronDown,
  Layers,
  Music,
  Database,
  HelpCircle,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const HowItWorks: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'How does the unified downloader handle YouTube, TikTok, and Facebook links?',
      a: 'The platform features automatic link detection. When you paste any URL into the search box or Batch Studio, our engine determines whether it is a Facebook Reel/Video, a YouTube video (standard watch link, Shorts, youtu.be), or a TikTok video (standard or vt.tiktok.com). It removes all watermarks for TikTok, fetches direct High Quality MP4 streams for Facebook, transcode-optimizes YouTube streams into H.264 & AAC progressive MP4, and delivers high-speed downloads.',
    },
    {
      q: 'How do I download Facebook Reels or public watch videos?',
      a: 'Copy the link of any public Facebook Reel or video (e.g. https://www.facebook.com/reel/1807623153746790), paste it into the search box, and click "Get Video". You will immediately be presented with High Quality (HD) MP4, Standard Quality (SD), and MP3 audio extraction download options.',
    },
    {
      q: 'How does the merged user data and history synchronization work?',
      a: 'When you open the application, ClipStream automatically scans for past download history across YouTube, TikTok, Facebook, and Instagram. It normalizes, deduplicates, and compiles all your downloads into one unified library. Any download you make is automatically synchronized across all platform categories, and you can export your entire combined library as a JSON backup at any time.',
    },
    {
      q: 'Are TikTok videos downloaded completely without watermarks?',
      a: 'Yes! The TikTok engine queries direct source streams with all bouncy TikTok logos and author badges stripped out. You get the pristine 1080p/720p source MP4 file.',
    },
    {
      q: 'Can I extract high-bitrate 320kbps MP3 audio from all platforms?',
      a: 'Yes. On YouTube, you can convert full video soundtracks into crystal-clear 320kbps MP3 or 128kbps M4A. On TikTok and Facebook, you can extract the original creator soundtrack directly into an MP3 file.',
    },
    {
      q: 'How does the Batch ZIP Studio package multiple videos?',
      a: 'You can paste up to 30 Facebook, YouTube, and TikTok links at once. The Batch Studio fetches all stream links, lets you select individual or global quality (HD, SD, or MP3), and bundles them together into a compressed ZIP file with customized filenames for instant 1-click archiving.',
    },
    {
      q: 'Is this service 100% free and private?',
      a: 'Yes. The unified studio is 100% free, created by Harmain Ameer. There are no fees, no subscriptions, and all user history remains private in your browser with zero server telemetry.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 pt-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Comprehensive User Guide & FAQ
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Everything you need to know about downloading Facebook Videos & Reels, YouTube 1080p MP4, TikTok No-Watermark, and managing your merged media library.
        </p>
      </div>

      {/* 3 Steps Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono text-base border border-blue-500/20">
            01
          </div>
          <h3 className="text-base font-bold text-white">Copy Any Video URL</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Copy the link of any Facebook Reel, YouTube video/Shorts, or TikTok clip from your mobile app or browser address bar.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold font-mono text-base border border-cyan-500/20">
            02
          </div>
          <h3 className="text-base font-bold text-white">Paste into Downloader</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Paste the link into Universal, Facebook, YouTube, or TikTok tabs. Our engine detects the stream and loads all formats in seconds.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-base border border-emerald-500/20">
            03
          </div>
          <h3 className="text-base font-bold text-white">Save in HD & Sync Library</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Choose HD 1080p, SD, or MP3 audio. Watch real-time speed meters, test playback in-app, and access your merged library anytime.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Core Merged Platform Capabilities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <span className="font-bold text-sm">f</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Facebook Reels & Video HD</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct High Quality MP4 video extractions from Facebook Reels and public watch feeds with audio extraction.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 text-red-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Universal H.264 Faststart</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every video is packaged with progressive faststart headers, guaranteeing synchronized audio and instant seeking on all devices.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Cross-Platform Batch ZIP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queue Facebook, YouTube, and TikTok links simultaneously in one studio, then package them into a single compressed ZIP archive.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
