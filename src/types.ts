export type SupportedPlatform =
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'pinterest'
  | 'reddit';

// ---------------------------------------------------------------------------
// YouTube Types
// ---------------------------------------------------------------------------
export interface FormatOption {
  id: string;
  quality: string;
  resolution: string;
  format: string;
  mimeType: string;
  fileSizeApprox: string;
  type: 'video' | 'audio' | 'thumbnail';
  url: string;
  hasAudio: boolean;
  isDirectDownload?: boolean;
}

export interface ThumbnailOption {
  id: string;
  quality: string;
  resolution: string;
  format: string;
  mimeType: string;
  fileSizeApprox: string;
  type: 'thumbnail';
  url: string;
  hasAudio: boolean;
  isDirectDownload?: boolean;
}

export interface RapidApiResult {
  attempted: boolean;
  host: string;
  statusCode: number | null;
  latencyMs: number;
  isReachable: boolean;
  rawMessage: string;
  data: any;
}

export interface YouTubeVideoData {
  platform?: 'youtube';
  videoId: string;
  canonicalUrl: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnailUrl: string;
  maxResThumbnailUrl: string;
  embedHtml: string;
  rapidApiResult: RapidApiResult;
  formats: FormatOption[];
  thumbnails: ThumbnailOption[];
}

// ---------------------------------------------------------------------------
// TikTok Types
// ---------------------------------------------------------------------------
export interface TikTokAuthor {
  id: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface TikTokMusicInfo {
  id?: string;
  title?: string;
  author?: string;
  album?: string;
  play_url?: string;
  cover?: string;
  duration?: number;
}

export interface TikTokVideo {
  platform?: 'tiktok';
  id: string;
  video_id?: string;
  aweme_id?: string;
  title: string;
  cover: string;
  ai_dynamic_cover?: string;
  origin_cover?: string;
  duration: number;
  play: string;
  wmplay?: string;
  hdplay?: string;
  size?: number;
  wm_size?: number;
  hd_size?: number;
  music?: string;
  music_info?: TikTokMusicInfo;
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  download_count?: number;
  collect_count?: number;
  create_time?: number;
  author?: TikTokAuthor;
}

export interface TikTokCreator {
  user: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarMedium?: string;
    avatarThumb?: string;
    signature?: string;
    verified?: boolean;
    secUid?: string;
  };
  stats: {
    followingCount: number;
    followerCount: number;
    heartCount: number;
    videoCount: number;
    diggCount: number;
  };
}

// ---------------------------------------------------------------------------
// Facebook Video & Reel Types
// ---------------------------------------------------------------------------
export interface FacebookVideoData {
  platform: 'facebook';
  id: string;
  title: string;
  thumbnail: string;
  originalUrl: string;
  hdUrl?: string;
  sdUrl?: string;
  width?: number;
  height?: number;
  codecs?: Record<string, string>;
  hdSizeFormatted?: string;
  sdSizeFormatted?: string;
}

// ---------------------------------------------------------------------------
// Generic Social Media Video Data (Instagram, Twitter/X, Pinterest, Reddit)
// ---------------------------------------------------------------------------
export interface GenericVideoData {
  platform: SupportedPlatform;
  id: string;
  title: string;
  thumbnail: string;
  originalUrl: string;
  hdUrl?: string;
  sdUrl?: string;
  audioUrl?: string;
  author?: string;
  authorHandle?: string;
  duration?: number;
  width?: number;
  height?: number;
  hdSizeFormatted?: string;
  sdSizeFormatted?: string;
  mediaItems?: Array<{
    id: number;
    url: string;
    thumbnail?: string;
    isVideo?: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Cricket Scorecard & Match Center Types (Cricbuzz RapidAPI)
// ---------------------------------------------------------------------------
export interface CricketBatsman {
  id: number;
  name: string;
  nickname?: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strkrate: string | number;
  outdec: string;
  iscaptain?: boolean;
  iskeeper?: boolean;
  isoverseas?: boolean;
  inmatchchange?: string;
}

export interface CricketBowler {
  id: number;
  name: string;
  nickname?: string;
  overs: string | number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string | number;
  dots?: number;
  balls?: number;
  rpb?: number;
  iscaptain?: boolean;
  iskeeper?: boolean;
}

export interface CricketExtras {
  total?: number;
  byes?: number;
  legbyes?: number;
  wides?: number;
  noballs?: number;
  penalty?: number;
}

export interface CricketFow {
  id?: number;
  name?: string;
  score?: number;
  wktnbr?: number;
  overnbr?: number;
}

export interface CricketPartnership {
  bat1id?: number;
  bat1name?: string;
  bat1runs?: number;
  bat1balls?: number;
  bat2id?: number;
  bat2name?: string;
  bat2runs?: number;
  bat2balls?: number;
  total?: number;
}

export interface InningsScorecard {
  inningsid: number;
  batteamname: string;
  batteamsname?: string;
  bowlteamname?: string;
  score: number;
  wickets: number;
  overs: number | string;
  runrate: number | string;
  batsman: CricketBatsman[];
  bowler: CricketBowler[];
  extras?: CricketExtras;
  fow?: CricketFow[];
  partnership?: CricketPartnership[];
  isdeclared?: boolean;
  isfollowon?: boolean;
  ballnbr?: number;
  rpb?: number;
}

export interface CricketAppIndex {
  seotitle?: string;
  weburl?: string;
}

export interface CricketScorecardResponse {
  scorecard: InningsScorecard[];
  ismatchcomplete: boolean;
  status: string;
  appindex?: CricketAppIndex;
  responselastupdated?: string | number;
}

export interface CricketMatchListItem {
  matchId: number;
  matchDesc: string;
  seriesName: string;
  team1: string;
  team2: string;
  status: string;
  state: string;
  matchFormat?: string;
  startDate?: string;
}

// ---------------------------------------------------------------------------
// Batch & Download Task Types
// ---------------------------------------------------------------------------
export interface DownloadTask {
  id: string;
  title: string;
  platform: SupportedPlatform;
  quality: '1080p' | '720p' | '480p' | '360p' | 'hd' | 'sd' | 'wm' | 'music' | 'cover';
  status: 'idle' | 'downloading' | 'compressing' | 'completed' | 'cancelled' | 'error';
  receivedBytes: number;
  totalBytes: number;
  percentage: number;
  speedFormatted: string;
  etaFormatted: string;
  error?: string;
  abortController?: AbortController;
}

export interface BatchItem {
  id: string;
  url: string;
  platform: SupportedPlatform;
  selected: boolean;
  quality: 'hd' | 'sd' | 'wm' | 'music' | '720p' | '1080p';
  status: 'pending' | 'fetching' | 'ready' | 'downloading' | 'done' | 'error';
  video?: any;
  error?: string;
  progress?: number;
}

// ---------------------------------------------------------------------------
// UNIFIED USER DATA & MERGED HISTORY SCHEMA
// ---------------------------------------------------------------------------
export interface UnifiedHistoryItem {
  id: string;
  platform: SupportedPlatform;
  title: string;
  author: string;
  authorHandle?: string;
  thumbnail: string;
  quality: string;
  format: string; // 'MP4' | 'MP3' | 'JPG'
  fileSizeFormatted?: string;
  timestamp: number;
  originalUrl: string;
  downloadUrl?: string;
  videoId?: string;
}

// Legacy ClipStream item format for backward-compatible migration
export interface LegacyClipstreamHistoryItem {
  id: string;
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  timestamp: number;
  url: string;
}

// Legacy TokHD item format for backward-compatible migration
export interface LegacyTokHDHistoryItem {
  id: string;
  title: string;
  authorName: string;
  authorHandle: string;
  thumbnail: string;
  quality: string;
  sizeFormatted: string;
  timestamp: number;
  downloadUrl: string;
  originalUrl?: string;
}

// ---------------------------------------------------------------------------
// Snaptube Web Desktop Edition Types
// ---------------------------------------------------------------------------
export interface SnaptubeFormatOption {
  format: 'MP4' | 'MP3';
  quality: string;
  resolution?: string;
  size: string;
  badge?: string;
  isPopular?: boolean;
  isHd?: boolean;
}

export interface SnaptubeVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  channelAvatar?: string;
  verified?: boolean;
  views: string;
  uploadDate: string;
  duration: string;
  thumbnailUrl: string;
  category: 'home' | 'trending' | 'music' | 'search';
  description?: string;
  formats?: SnaptubeFormatOption[];
}

export interface MatagVisionResult {
  result?: string;
  detected_objects?: Array<{ label: string; confidence: number }>;
  model?: string;
  prompt?: string;
  [key: string]: any;
}

