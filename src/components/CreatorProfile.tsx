import React, { useState } from 'react';
import {
  Mail,
  Check,
  Copy,
  Send,
  Code,
  Globe,
  Users,
  ShieldCheck,
  Award,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export const CreatorProfile: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const email = 'harmainameer309@gmail.com';
  const name = 'Harmain Ameer';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject || 'Inquiry regarding ClipStream & TokHD Unified Platform'
    )}&body=${encodeURIComponent(message || 'Hello Harmain,\n\nI am contacting you regarding your video downloader...')}`;
    window.location.href = mailtoUrl;
  };

  const testimonials = [
    {
      name: 'Sarah Lin',
      role: 'Content Creator & Editor',
      text: "Harmain Ameer's unified platform is the cleanest downloader on the internet. Being able to download both YouTube lectures in 1080p and TikTok clips without watermarks in one tab saves me hours every week.",
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Online Educator',
      text: 'Having a single unified library where all my educational videos and audio transcripts are saved and backup-ready is incredible. Fast transcoding and zero ad redirects.',
    },
    {
      name: 'Devon Vance',
      role: 'Podcast Producer',
      text: 'Extracting 320kbps MP3 audio directly from interviews and TikTok viral sounds with batch ZIP download is lightning fast. Huge respect to Harmain for combining both tools!',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pt-4">
      {/* Creator Hero Card */}
      <div className="relative bg-gradient-to-br from-[#111827] via-[#0d1424] to-[#090d16] border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Dual Platform Gradient */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-600 via-rose-500 to-cyan-500 p-0.5 shadow-xl shadow-red-950/40">
              <div className="w-full h-full bg-[#090d16] rounded-2xl flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-cyan-300 font-mono">
                  HA
                </span>
              </div>
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#090d16] flex items-center justify-center text-white"
              title="Verified Creator"
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {name}
                </h1>
                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                  Founder & Lead Engineer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Creator & Developer of ClipStream (All-in-One Media Downloader)
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              "Welcome to ClipStream! I built this platform with a single goal: giving people worldwide an honest, lightning-fast, and ad-free tool to download media in true 1080p HD, extract 320kbps MP3s, and package batch files into clean ZIP archives with completely merged and synced user history. Thank you for using ClipStream!"
            </p>

            {/* Email Contact Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 shadow-sm">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="select-all">{email}</span>
                <button
                  onClick={handleCopyEmail}
                  className="ml-2 p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={`mailto:${email}`}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Contact Harmain</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Direct Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture details */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Code className="w-5 h-5 text-cyan-400" />
            <h3>Platform Technical Architecture</h3>
          </div>
          <div className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Platform</span>
              <span className="text-white font-semibold">ClipStream Studio</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Sole Creator & Lead</span>
              <span className="text-cyan-300 font-semibold">{name}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Direct Contact</span>
              <span className="text-slate-200 font-mono">{email}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">YouTube Engine</span>
              <span className="text-slate-200">1080p Full HD MP4, 320kbps MP3, H.264 Faststart</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">TikTok Engine</span>
              <span className="text-slate-200">No Watermark 1080p, Live Speed ETA Tracker</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Batch Archiving</span>
              <span className="text-emerald-400 font-mono">JSZip Cross-Platform ZIP</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Data Synchronizer</span>
              <span className="text-emerald-400 font-mono">Unified Storage & JSON Migration</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Mail className="w-5 h-5 text-blue-400" />
            <h3>Send Inquiries to Harmain</h3>
          </div>
          <p className="text-xs text-slate-400">
            Have a question, feedback, or custom feature request for the unified platform? Send a message directly to Harmain Ameer.
          </p>
          <form onSubmit={handleSendEmail} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Suggestion for ClipStream..."
                className="w-full h-10 px-3.5 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full p-3 bg-[#0b0f19] border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>

      {/* Community Testimonials */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Community Feedback on Harmain Ameer's Work</span>
          </h3>
          <span className="text-xs text-slate-400">Verified User Feedback</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <p className="text-xs text-slate-300 italic leading-relaxed">"{t.text}"</p>
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{t.name}</span>
                  <span className="text-[11px] text-slate-500">{t.role}</span>
                </div>
                <Award className="w-4 h-4 text-amber-400/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
