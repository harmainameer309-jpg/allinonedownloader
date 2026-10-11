import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Activity,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  ListFilter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CricketScorecardResponse, InningsScorecard, CricketMatchListItem } from '../types';

interface CricketScorecardViewProps {
  onShowToast: (message: string) => void;
}

export const CricketScorecardView: React.FC<CricketScorecardViewProps> = ({ onShowToast }) => {
  const [matchId, setMatchId] = useState<string>('40381');
  const [inputMatchId, setInputMatchId] = useState<string>('40381');
  const [activeInningsIndex, setActiveInningsIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'api-curl'>('scorecard');

  // Scorecard Data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<CricketScorecardResponse | null>(null);

  // Commentary Data
  const [commentaryData, setCommentaryData] = useState<any | null>(null);
  const [loadingCommentary, setLoadingCommentary] = useState<boolean>(false);

  // Recent/Live Matches Modal
  const [showMatchesModal, setShowMatchesModal] = useState<boolean>(false);
  const [recentMatches, setRecentMatches] = useState<CricketMatchListItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);

  // Copy state
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const curlCommand = `curl --request GET \\
  --url https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/hscard \\
  --header 'x-rapidapi-host: cricbuzz-cricket.p.rapidapi.com' \\
  --header 'x-rapidapi-key: 129a4e1033mshf00414cde12896bp19ebecjsna454f882d8b1'`;

  // Fetch Scorecard
  const fetchScorecard = async (idToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cricket/scorecard/${idToFetch}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to retrieve match scorecard from Cricbuzz API');
      }
      setScorecardData(json.data);
      setActiveInningsIndex(0);
    } catch (err: any) {
      console.error('Error fetching scorecard:', err);
      setError(err.message || 'Error communicating with Cricbuzz API');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Commentary
  const fetchCommentary = async (idToFetch: string) => {
    setLoadingCommentary(true);
    try {
      const res = await fetch(`/api/cricket/commentary/${idToFetch}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setCommentaryData(json.data);
      }
    } catch (err) {
      console.error('Error fetching commentary:', err);
    } finally {
      setLoadingCommentary(false);
    }
  };

  // Fetch Recent/Live Matches list for picker
  const fetchRecentMatches = async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch('/api/cricket/matches/recent');
      const json = await res.json();
      if (res.ok && json.success && json.data?.typeMatches) {
        const list: CricketMatchListItem[] = [];
        json.data.typeMatches.forEach((tm: any) => {
          tm.seriesMatches?.forEach((sm: any) => {
            const seriesWrapper = sm.seriesAdWrapper;
            if (seriesWrapper?.matches) {
              seriesWrapper.matches.forEach((m: any) => {
                const info = m.matchInfo;
                if (info) {
                  list.push({
                    matchId: info.matchId,
                    matchDesc: info.matchDesc || '',
                    seriesName: seriesWrapper.seriesName || info.seriesName || '',
                    team1: info.team1?.teamName || info.team1?.teamSName || 'Team 1',
                    team2: info.team2?.teamName || info.team2?.teamSName || 'Team 2',
                    status: info.status || '',
                    state: info.state || '',
                    matchFormat: info.matchFormat || '',
                    startDate: info.startDate || '',
                  });
                }
              });
            }
          });
        });
        setRecentMatches(list.slice(0, 20));
      }
    } catch (err) {
      console.error('Error fetching matches list:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchScorecard(matchId);
  }, [matchId]);

  useEffect(() => {
    if (activeTab === 'commentary' && !commentaryData) {
      fetchCommentary(matchId);
    }
  }, [activeTab, matchId]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchScorecard(matchId);
      if (activeTab === 'commentary') {
        fetchCommentary(matchId);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh, matchId, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMatchId.trim()) return;
    // Extract numbers if URL or string with letters
    const match = inputMatchId.trim().match(/(\d{4,8})/);
    const targetId = match ? match[1] : inputMatchId.trim();
    setMatchId(targetId);
  };

  const handleSelectPreset = (presetId: string) => {
    setInputMatchId(presetId);
    setMatchId(presetId);
  };

  // Copy helpers
  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    onShowToast('cURL command copied to clipboard!');
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyJson = () => {
    if (!scorecardData) return;
    navigator.clipboard.writeText(JSON.stringify(scorecardData, null, 2));
    setCopiedJson(true);
    onShowToast('Scorecard JSON copied to clipboard!');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopySummary = () => {
    if (!scorecardData || !scorecardData.scorecard) return;
    const inn1 = scorecardData.scorecard[0];
    const inn2 = scorecardData.scorecard[1];
    const lines = [
      `🏏 ${scorecardData.appindex?.seotitle || 'Cricbuzz Cricket Scorecard'}`,
      `🏆 Status: ${scorecardData.status}`,
    ];
    if (inn1) {
      lines.push(`➡️ ${inn1.batteamname}: ${inn1.score}/${inn1.wickets} (${inn1.overs} ov) - RR: ${inn1.runrate}`);
    }
    if (inn2) {
      lines.push(`➡️ ${inn2.batteamname}: ${inn2.score}/${inn2.wickets} (${inn2.overs} ov) - RR: ${inn2.runrate}`);
    }
    lines.push(`⚡ Powered by Cricbuzz RapidAPI via ClipStream Hub`);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    onShowToast('Match summary text copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const currentInnings: InningsScorecard | undefined = scorecardData?.scorecard?.[activeInningsIndex];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Page Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0d1527] to-[#080d1a] border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-600/40 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CRICBUZZ RAPIDAPI INTEGRATION
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 rounded-full">
                Match #{matchId}
              </span>
              {scorecardData?.ismatchcomplete && (
                <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/40 rounded-full">
                  MATCH CONCLUDED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-emerald-400">🏏</span>
              <span>Cricket Match Center & Live Scorecard</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl">
              Live and complete ball-by-ball scorecards powered by the official{' '}
              <strong className="text-emerald-400">Cricbuzz RapidAPI</strong>. Detailed innings breakdowns, batsmen stats, bowler economies, extras, and live commentary.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                fetchRecentMatches();
                setShowMatchesModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Browse Matches</span>
            </button>

            <button
              onClick={() => fetchScorecard(matchId)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-700/50 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Auto-Sync {autoRefresh ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Search & Preset Match Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={inputMatchId}
                onChange={(e) => setInputMatchId(e.target.value)}
                placeholder="Enter Cricbuzz Match ID (e.g. 40381) or paste Cricbuzz URL..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>Load Scorecard</span>
            </button>
          </form>

          {/* Preset Match Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Popular Presets:</span>
            <button
              type="button"
              onClick={() => handleSelectPreset('40381')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                matchId === '40381'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-amber-400 font-mono">⚡ 40381</span>
              <span>USA vs IRE (2nd T20I - User Request)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('171060')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                matchId === '171060'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-emerald-400 font-mono">171060</span>
              <span>IND vs SL (Asian Games Semi)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('171051')}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                matchId === '171051'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-cyan-400 font-mono">171051</span>
              <span>BAN vs PAK (Asian Games Semi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-white">Could not retrieve scorecard for Match #{matchId}</h4>
            <p className="text-xs text-red-300/90">{error}</p>
            <p className="text-xs text-slate-400">
              Try switching back to preset match <strong className="text-emerald-400 cursor-pointer" onClick={() => handleSelectPreset('40381')}>40381 (USA vs IRE)</strong> or select a recent match from the Browse menu.
            </p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !scorecardData && (
        <div className="flex flex-col items-center justify-center p-16 bg-[#090d18] border border-slate-800 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Querying Cricbuzz Scorecard...</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to Cricbuzz RapidAPI host for match #{matchId}</p>
          </div>
        </div>
      )}

      {/* Main Scorecard View */}
      {scorecardData && (
        <div className="space-y-6">
          {/* Match Summary Hero Card */}
          <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
            {/* Header info bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {scorecardData.appindex?.seotitle?.split('|')?.[0] || 'T20 International Match'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {scorecardData.scorecard?.[0]?.batteamname || 'Team 1'} vs{' '}
                  {scorecardData.scorecard?.[1]?.batteamname || 'Team 2'}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{scorecardData.status}</span>
                </span>
                {scorecardData.appindex?.weburl && (
                  <a
                    href={scorecardData.appindex.weburl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-colors"
                    title="View on Cricbuzz website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Innings score cards (Side by Side or Stash) */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {scorecardData.scorecard?.map((inn, idx) => {
                const isActive = activeInningsIndex === idx;
                return (
                  <div
                    key={inn.inningsid || idx}
                    onClick={() => setActiveInningsIndex(idx)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                            INNINGS {inn.inningsid || idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {inn.batteamsname || inn.batteamname}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white">{inn.batteamname}</h3>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                          {inn.score}
                          <span className="text-slate-400 font-normal text-lg">/{inn.wickets}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {inn.overs} overs <span className="text-slate-600">•</span> RR: {inn.runrate}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Top batsman: <strong>{inn.batsman?.[0]?.name}</strong> ({inn.batsman?.[0]?.runs} off {inn.batsman?.[0]?.balls})</span>
                      <span className="text-emerald-400 font-medium">Click to inspect</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Share / Export Buttons Bar */}
            <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                Match #{matchId} <span className="text-slate-600">|</span> Result:{' '}
                <strong className="text-emerald-300">{scorecardData.status}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Copy text summary for WhatsApp or social media"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Copy complete raw JSON"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedJson ? 'JSON Copied' : 'JSON'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-800 text-sm font-semibold text-slate-400 space-x-6">
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Full Scorecard</span>
            </button>

            <button
              onClick={() => setActiveTab('commentary')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'commentary'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Commentary & Highlights</span>
            </button>

            <button
              onClick={() => setActiveTab('api-curl')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'api-curl'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>cURL & API Inspector</span>
            </button>
          </div>

          {/* TAB 1: FULL SCORECARD */}
          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              {/* Innings Selector Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">Select Innings:</span>
                {scorecardData.scorecard?.map((inn, idx) => (
                  <button
                    key={inn.inningsid || idx}
                    onClick={() => setActiveInningsIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeInningsIndex === idx
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{inn.batteamname}</span>
                    <span className="font-mono opacity-90">
                      {inn.score}/{inn.wickets} ({inn.overs} ov)
                    </span>
                  </button>
                ))}
              </div>

              {currentInnings && (
                <div className="space-y-6">
                  {/* Innings Header & Overview */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-base">
                        {currentInnings.batteamsname || currentInnings.batteamname.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">
                          {currentInnings.batteamname} Batting Innings
                        </h3>
                        <p className="text-xs text-slate-400">
                          Total Score: <strong className="text-emerald-400">{currentInnings.score}</strong> runs for{' '}
                          <strong className="text-emerald-400">{currentInnings.wickets}</strong> wickets in{' '}
                          <strong>{currentInnings.overs}</strong> overs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                        <span className="text-slate-400">Run Rate: </span>
                        <strong className="text-emerald-300">{currentInnings.runrate}</strong>
                      </div>
                      <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                        <span className="text-slate-400">Extras: </span>
                        <strong className="text-amber-300">{currentInnings.extras?.total ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Batting Scorecard Table */}
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
                    <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>🏏 Batting Scorecard</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {currentInnings.batsman?.length || 0} Batters Listed
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3 px-4 sm:px-6">Batter</th>
                            <th className="py-3 px-4">Dismissal</th>
                            <th className="py-3 px-3 text-right">R</th>
                            <th className="py-3 px-3 text-right">B</th>
                            <th className="py-3 px-3 text-right">4s</th>
                            <th className="py-3 px-3 text-right">6s</th>
                            <th className="py-3 px-4 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {currentInnings.batsman?.map((b) => {
                            const isHighScorer = b.runs >= 40;
                            const isCentury = b.runs >= 100;
                            const isFifty = b.runs >= 50 && b.runs < 100;
                            return (
                              <tr
                                key={b.id}
                                className="hover:bg-slate-900/40 transition-colors"
                              >
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{b.name}</span>
                                    {b.iscaptain && (
                                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                                        c
                                      </span>
                                    )}
                                    {b.iskeeper && (
                                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                                        wk
                                      </span>
                                    )}
                                    {isCentury && (
                                      <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/40">
                                        100+
                                      </span>
                                    )}
                                    {isFifty && (
                                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                        50+
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-400">
                                  {b.outdec || 'not out'}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono font-bold text-base">
                                  <span className={isHighScorer ? 'text-amber-400 font-extrabold' : 'text-white'}>
                                    {b.runs}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-slate-300 text-xs">
                                  {b.balls}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-emerald-400 text-xs">
                                  {b.fours}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-cyan-400 text-xs">
                                  {b.sixes}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-300 text-xs">
                                  {b.strkrate}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-800 bg-slate-900/80 text-xs">
                          {/* Extras row */}
                          <tr className="border-b border-slate-800/80">
                            <td className="py-3 px-4 sm:px-6 font-bold text-slate-300" colSpan={2}>
                              Extras{' '}
                              <span className="font-normal text-slate-500">
                                (b {currentInnings.extras?.byes ?? 0}, lb {currentInnings.extras?.legbyes ?? 0}, w{' '}
                                {currentInnings.extras?.wides ?? 0}, nb {currentInnings.extras?.noballs ?? 0}, p{' '}
                                {currentInnings.extras?.penalty ?? 0})
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-amber-300" colSpan={5}>
                              {currentInnings.extras?.total ?? 0}
                            </td>
                          </tr>
                          {/* Total row */}
                          <tr>
                            <td className="py-3.5 px-4 sm:px-6 font-extrabold text-white text-sm" colSpan={2}>
                              Total
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-extrabold text-emerald-400 text-base" colSpan={5}>
                              {currentInnings.score}/{currentInnings.wickets}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                ({currentInnings.overs} Ov, RR: {currentInnings.runrate})
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Bowling Scorecard Table */}
                  <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
                    <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>🎯 Bowling Figures</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {currentInnings.bowler?.length || 0} Bowlers
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3 px-4 sm:px-6">Bowler</th>
                            <th className="py-3 px-3 text-right">O</th>
                            <th className="py-3 px-3 text-right">M</th>
                            <th className="py-3 px-3 text-right">R</th>
                            <th className="py-3 px-3 text-right">W</th>
                            <th className="py-3 px-4 text-right">Econ</th>
                            <th className="py-3 px-4 text-right">Dots</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {currentInnings.bowler?.map((bowler) => {
                            const isTopBowler = bowler.wickets >= 2;
                            return (
                              <tr key={bowler.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4 sm:px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{bowler.name}</span>
                                    {isTopBowler && (
                                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                        ★ {bowler.wickets} Wkts
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-slate-200 text-xs">
                                  {bowler.overs}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-slate-400 text-xs">
                                  {bowler.maidens}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono text-slate-200 text-xs">
                                  {bowler.runs}
                                </td>
                                <td className="py-3.5 px-3 text-right font-mono font-bold text-base">
                                  <span className={bowler.wickets > 0 ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>
                                    {bowler.wickets}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-300 text-xs">
                                  {bowler.economy}
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">
                                  {bowler.dots ?? '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE COMMENTARY & HIGHLIGHTS */}
          {activeTab === 'commentary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="font-bold text-white text-sm">Match Commentary Feed</h4>
                  <p className="text-xs text-slate-400">Ball-by-ball updates and key match events from Cricbuzz</p>
                </div>
                <button
                  onClick={() => fetchCommentary(matchId)}
                  disabled={loadingCommentary}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 rounded-lg hover:bg-emerald-900/60 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCommentary ? 'animate-spin' : ''}`} />
                  <span>Refresh Feed</span>
                </button>
              </div>

              {loadingCommentary && !commentaryData && (
                <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                  Loading commentary updates...
                </div>
              )}

              {commentaryData?.comwrapper && commentaryData.comwrapper.length > 0 ? (
                <div className="space-y-3">
                  {commentaryData.comwrapper.map((item: any, idx: number) => {
                    const comm = item.commentary || item;
                    const event = comm.eventtype || 'NONE';
                    const isBoundary = event === 'FOUR' || event === 'SIX' || comm.boundarytracker;
                    const isWicket = event === 'WICKET';
                    const cleanText = (comm.commtxt || '')
                      .replace(/B\d+\$/g, '')
                      .replace(/I\d+\$/g, '')
                      .trim();

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isWicket
                            ? 'bg-red-950/20 border-red-800/50'
                            : isBoundary
                            ? 'bg-amber-950/20 border-amber-800/50'
                            : 'bg-[#0b101d] border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5">
                            {comm.overnum ? (
                              <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-slate-800 text-emerald-300 rounded border border-slate-700">
                                Over {comm.overnum}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-bold bg-slate-800 text-slate-400 rounded">
                                Update
                              </span>
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {isWicket && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                                  WICKET
                                </span>
                              )}
                              {event === 'FOUR' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded">
                                  FOUR (4)
                                </span>
                              )}
                              {event === 'SIX' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded">
                                  SIX (6)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed font-sans">
                              {cleanText || comm.commtxt}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
                  No active live commentary stream for Match #{matchId} or match has concluded. Check Full Scorecard tab for complete player breakdown.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: cURL & API INSPECTOR */}
          {activeTab === 'api-curl' && (
            <div className="space-y-6">
              {/* Exact user cURL display */}
              <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-white text-base">RapidAPI cURL Command</h4>
                  </div>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>

                <div className="relative group">
                  <pre className="p-4 bg-black/60 border border-slate-800/80 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {curlCommand}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">RapidAPI Host:</span>
                    <code className="text-cyan-300 font-mono">cricbuzz-cricket.p.rapidapi.com</code>
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5">Endpoint Pattern:</span>
                    <code className="text-cyan-300 font-mono">/mcenter/v1/{'{matchId}'}/hscard</code>
                  </div>
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white text-base">Raw Cricbuzz Scorecard Payload</h4>
                  </div>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-black/60 border border-slate-800/80 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
                  {JSON.stringify(scorecardData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Browse Recent & Live Matches */}
      {showMatchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Select from Recent Cricbuzz Matches</h3>
              </div>
              <button
                onClick={() => setShowMatchesModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal List */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/40">
              {loadingMatches ? (
                <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                  Fetching recent Cricbuzz matches list...
                </div>
              ) : recentMatches.length > 0 ? (
                recentMatches.map((m) => (
                  <div
                    key={m.matchId}
                    onClick={() => {
                      setMatchId(String(m.matchId));
                      setInputMatchId(String(m.matchId));
                      setShowMatchesModal(false);
                    }}
                    className="pt-3 first:pt-0 p-3 hover:bg-slate-900/80 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {m.seriesName || 'Tournament'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-emerald-400 rounded">
                          ID: {m.matchId}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                        {m.team1} vs {m.team2} {m.matchDesc && `(${m.matchDesc})`}
                      </h4>
                      <p className="text-xs text-slate-400">{m.status || m.state}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-xs text-emerald-400 font-semibold opacity-80 group-hover:opacity-100">
                      <span>View</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-400 text-xs">
                  No recent matches found. You can enter any custom Cricbuzz Match ID directly.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
              <button
                onClick={() => setShowMatchesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
