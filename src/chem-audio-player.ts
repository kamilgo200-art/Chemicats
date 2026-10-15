// Chemicats Music — Mobile & Desktop Audio Player (Spotify / YT Music Mode)
// Uses the built-in procedural Web Audio synthesizer (0 MB external MP3s)
// Supports background playback on mobile (MediaSession API + Web Worker scheduler + Wake Audio Stream)

interface ChemTrack {
  id: string;
  title: string;
  subtitle?: string;
  bpm: number;
  bars?: number;
  steps?: number;
  duration?: number;
  biome?: string;
  context?: string;
}

interface EnrichedTrack extends ChemTrack {
  category: 'energy' | 'neon' | 'boss' | 'biome' | 'cats' | 'full' | 'core';
  categoryLabel: string;
  durationSec: number;
  formattedDuration: string;
  accentColor: string;
  accentSecondary: string;
  symbol: string;
  atomicNumber: number;
}

const FAVORITES_KEY = 'chemicats.music-player.favorites.v1';
const BG_MODE_KEY = 'chemicats.music-player.bg-enabled.v1';
const POCKET_MODE_KEY = 'chemicats.music-player.pocket-saver.v1';

const CATEGORY_META: Record<
  EnrichedTrack['category'],
  { label: string; color: string; secondary: string; symbol: string; z: number }
> = {
  energy: { label: '⚔️ Bojowe i Metal', color: '#f97316', secondary: '#ef4444', symbol: 'Fe', z: 26 },
  neon: { label: 'Neon i Synth', color: '#06b6d4', secondary: '#3b82f6', symbol: 'Ne', z: 10 },
  full: { label: 'Pełne Wersje', color: '#10b981', secondary: '#14b8a6', symbol: 'Au', z: 79 },
  boss: { label: 'Bossowie', color: '#ec4899', secondary: '#f43f5e', symbol: 'U', z: 92 },
  biome: { label: 'Biomy', color: '#22c55e', secondary: '#0ea5e9', symbol: 'Si', z: 14 },
  cats: { label: 'Motywy Kotów', color: '#eab308', secondary: '#f59e0b', symbol: 'Pt', z: 78 },
  core: { label: 'Klasyki Gry', color: '#38bdf8', secondary: '#818cf8', symbol: 'He', z: 2 },
};

function classifyTrack(t: ChemTrack): EnrichedTrack['category'] {
  const id = t.id || '';
  const sub = (t.subtitle || '').toLowerCase();
  if (
    id.startsWith('energy-') ||
    id.includes('guitar') ||
    id.includes('Riot') ||
    id.includes('combat-trailer') ||
    id.includes('anthem') ||
    id.includes('trailer') ||
    id === 'heart-reactor'
  ) {
    return 'energy';
  }
  if (
    id.startsWith('neon-') ||
    id === 'NeonDance' ||
    id === 'AfterHours' ||
    id === 'LabRave' ||
    id === 'ElectronDawn' ||
    id === 'IllegalSynthesis' ||
    id === 'ReverseReactor'
  ) {
    return 'neon';
  }
  if (id.endsWith('Full') || sub.includes('pełna wersja')) {
    return 'full';
  }
  if (
    id.includes('Celery') ||
    id.includes('SnakeGourd') ||
    id.includes('Hogweed') ||
    id.includes('Durian') ||
    id.includes('GiantTree') ||
    id.includes('MutantPolimer') ||
    sub.includes('boss') ||
    sub.includes('archiwum')
  ) {
    return 'boss';
  }
  if (id.startsWith('chemicats-v') || id.startsWith('chemicats-foundry') || id.startsWith('chemicats-bog') || id.startsWith('chemicats-charcoal') || t.biome || sub.includes('biom')) {
    return 'biome';
  }
  if (
    id.includes('Theme') ||
    id.includes('blackcat') ||
    id.includes('Curie') ||
    id.includes('Gemini') ||
    id.includes('Proton') ||
    id.includes('Quantum') ||
    id.includes('Isotope') ||
    id.includes('Atomic')
  ) {
    return 'cats';
  }
  return 'core';
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Create a tiny 1-second silent stereo WAV Data URI (0 external network requests)
function createSilentWavDataUri(): string {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 8;
  const numSamples = sampleRate; // 1 second
  const blockAlign = (numChannels * bitsPerSample) >> 3;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  // 8-bit PCM silence is 128
  const bytes = new Uint8Array(buffer);
  bytes.fill(128, 44);

  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

// Generate dynamic 512x512 cover art for Android/iOS lockscreen MediaSession
function generateArtworkDataUrl(track: EnrichedTrack): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.55, '#111c2d');
    grad.addColorStop(1, track.accentColor + '55');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle atomic orbital rings
    ctx.strokeStyle = track.accentColor + '44';
    ctx.lineWidth = 3;
    for (let r = 90; r <= 210; r += 60) {
      ctx.beginPath();
      ctx.arc(256, 230, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Periodic element tile in center
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = track.accentColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(176, 140, 160, 175, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(track.atomicNumber), 198, 174);

    ctx.fillStyle = track.accentColor;
    ctx.font = '800 74px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(track.symbol, 256, 252);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 18px sans-serif';
    ctx.fillText(`${track.bpm} BPM`, 256, 292);

    // Bottom title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 26px sans-serif';
    ctx.fillText(track.title.slice(0, 28), 256, 415);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 19px sans-serif';
    ctx.fillText('Chemicats Music · Atomowa Orkiestra', 256, 452);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

export function initChemAudioPlayer() {
  if (document.getElementById('chem-music-app-root')) return;

  let isOpen = false;
  let isPausedByUser = false;
  let shuffleEnabled = false;
  let repeatMode: 'all' | 'one' = 'all';
  let activeCategory: 'all' | 'fav' | EnrichedTrack['category'] = 'all';
  let searchQuery = '';
  let bgModeEnabled = localStorage.getItem(BG_MODE_KEY) !== 'false';
  let pocketSaverEnabled = localStorage.getItem(POCKET_MODE_KEY) === 'true';
  let favorites = new Set<string>(
    (() => {
      try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      } catch {
        return [];
      }
    })()
  );

  let tracks: EnrichedTrack[] = [];
  let currentTrackId = '';
  let lastAnnouncedTrackId = '';
  let analyser: AnalyserNode | null = null;
  let analyserConnected = false;
  let silentAudioEl: HTMLAudioElement | null = null;
  let mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  let bgWorker: Worker | null = null;

  const saveFavorites = () => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {}
  };

  const getAudio = (): any => (globalThis as any).ChemMusicPlayback?.current;

  const getTotalSteps = (id: string, track?: ChemTrack): number => {
    const bm = (globalThis as any).ChemBiomeMusic;
    const song = bm?.song?.(id);
    if (song && song.bars) return song.bars * 16;
    const stepFn = (globalThis as any).ChemTrackStepLength;
    if (typeof stepFn === 'function') {
      try {
        const s = stepFn(id);
        if (Number.isFinite(s) && s > 0) return s;
      } catch {}
    }
    if (track?.steps) return track.steps;
    if (track?.bars) return track.bars * 16;
    return 128;
  };

  const buildCatalog = (): EnrichedTrack[] => {
    if (tracks.length > 0) return tracks;
    const rawCatalog: ChemTrack[] = (globalThis as any).ChemTrackCatalog || [];
    const biomeTracks: ChemTrack[] = (globalThis as any).ChemBiomeMusic?.allTracks || [];
    const mergedMap = new Map<string, ChemTrack>();

    for (const item of [...rawCatalog, ...biomeTracks]) {
      if (!item || !item.id || item.id === 'silence') continue;
      const existing = mergedMap.get(item.id);
      mergedMap.set(item.id, { ...existing, ...item, subtitle: item.subtitle || existing?.subtitle });
    }

    const result: EnrichedTrack[] = [];
    let index = 0;
    for (const item of mergedMap.values()) {
      const cat = classifyTrack(item);
      const meta = CATEGORY_META[cat];
      const steps = getTotalSteps(item.id, item);
      const bpm = item.bpm || 120;
      const calcSec = item.duration || Math.round((steps * 60) / bpm / 4);
      result.push({
        ...item,
        bpm,
        category: cat,
        categoryLabel: meta.label,
        durationSec: calcSec,
        formattedDuration: formatTime(calcSec),
        accentColor: meta.color,
        accentSecondary: meta.secondary,
        symbol: meta.symbol,
        atomicNumber: meta.z + (index % 12),
      });
      index++;
    }
    tracks = result;
    return tracks;
  };

  // Patch _6.prototype.setHidden so background playback continues when screen locks
  const ensureBackgroundPatch = () => {
    const audio = getAudio();
    if (!audio || audio._chemBgPatched) return;
    audio._chemBgPatched = true;

    const origSetHidden = audio.setHidden.bind(audio);
    audio.setHidden = function (hidden: boolean) {
      if (bgModeEnabled && hidden && !isPausedByUser) {
        // Keep music running in background, only clear combat SFX queue
        this.queue?.clear?.();
        this.hidden = false;
        if (this.context?.state === 'suspended') {
          this.context.resume().catch(() => {});
        }
        return;
      }
      return origSetHidden(hidden);
    };

    // Hook end-of-track to respect Repeat One or auto-advance in player
    const origSchedule = audio.schedule.bind(audio);
    audio.schedule = function () {
      const prevStep = this.step || 0;
      const activeId = this.trackId;
      origSchedule();
      if (isOpen || bgModeEnabled) {
        const total = getTotalSteps(activeId);
        // Detect natural loop wraparound
        if (activeId && total > 32 && prevStep > total - 8 && this.step < 8) {
          if (repeatMode === 'one') {
            // Keep looping the same song
          } else if (shuffleEnabled || isOpen) {
            playNextTrack(1);
          }
        }
      }
    };
  };

  // Start unthrottled Web Worker timer so Web Audio scheduling works when phone screen is off
  const ensureBackgroundWorker = () => {
    if (bgWorker) return;
    try {
      const blob = new Blob(
        [
          `let t=null;onmessage=e=>{if(e.data==='start'){clearInterval(t);t=setInterval(()=>postMessage(1),25)}else{clearInterval(t);t=null}};`,
        ],
        { type: 'application/javascript' }
      );
      bgWorker = new Worker(URL.createObjectURL(blob));
      bgWorker.onmessage = () => {
        if (document.hidden && bgModeEnabled && !isPausedByUser) {
          const audio = getAudio();
          if (audio && audio.context?.state === 'running') {
            audio.schedule();
          } else if (audio && audio.context?.state === 'suspended') {
            audio.context.resume().catch(() => {});
          }
        }
      };
      bgWorker.postMessage('start');
    } catch {}
  };

  // Keep OS audio session active with silent <audio> + MediaStreamAudioDestinationNode
  const ensureWakeAudioBridge = async () => {
    const audio = getAudio();
    if (!audio) return;
    await audio.unlock();
    ensureBackgroundPatch();
    ensureBackgroundWorker();

    if (!silentAudioEl) {
      silentAudioEl = document.createElement('audio');
      silentAudioEl.src = createSilentWavDataUri();
      silentAudioEl.loop = true;
      silentAudioEl.volume = 0.01;
      silentAudioEl.setAttribute('playsinline', 'true');
      silentAudioEl.style.display = 'none';
      document.body.appendChild(silentAudioEl);
    }

    if (bgModeEnabled && !isPausedByUser) {
      silentAudioEl.play().catch(() => {});
    }

    // Connect Web Audio AnalyserNode for the real-time visualizer
    if (audio.context && audio.synth && !analyserConnected) {
      try {
        analyser = audio.context.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;
        audio.synth.master.connect(analyser);
        analyserConnected = true;

        if (typeof audio.context.createMediaStreamDestination === 'function' && !mediaStreamDest) {
          mediaStreamDest = audio.context.createMediaStreamDestination();
          audio.synth.master.connect(mediaStreamDest);
        }
      } catch {}
    }
  };

  // Sync with Android / iOS Lock Screen & Notification MediaSession
  const updateMediaSession = (track: EnrichedTrack | undefined) => {
    if (!('mediaSession' in navigator) || !track) return;
    try {
      const artUrl = generateArtworkDataUrl(track);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: `Chemicats · ${track.categoryLabel}`,
        album: `${track.bpm} BPM · Atomowa Orkiestra`,
        artwork: artUrl ? [{ src: artUrl, sizes: '512x512', type: 'image/png' }] : [],
      });
      navigator.mediaSession.playbackState = isPausedByUser ? 'paused' : 'playing';

      navigator.mediaSession.setActionHandler('play', () => {
        void togglePlayPause(false);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        void togglePlayPause(true);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        void playNextTrack(-1);
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        void playNextTrack(1);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null) {
          seekToSeconds(details.seekTime);
        }
      });
    } catch {}
  };

  const getFilteredTracks = (): EnrichedTrack[] => {
    const all = buildCatalog();
    const q = searchQuery.trim().toLowerCase();
    return all.filter((t) => {
      if (activeCategory === 'fav' && !favorites.has(t.id)) return false;
      if (activeCategory !== 'all' && activeCategory !== 'fav' && t.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.subtitle || '').toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        String(t.bpm).includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
      );
    });
  };

  const selectAndPlayTrack = async (id: string) => {
    const audio = getAudio();
    if (!audio) return;
    isPausedByUser = false;
    await ensureWakeAudioBridge();
    if (!audio.settings.enabled) {
      audio.configure({ enabled: true });
    }
    if (audio.settings.music <= 0.02) {
      audio.configure({ music: 0.7 });
    }
    await audio.playTrack(id, 'chem-music-player');
    audio.leavePanel?.();
    currentTrackId = id;
    const found = buildCatalog().find((t) => t.id === id);
    updateMediaSession(found);
    renderUI();
  };

  const togglePlayPause = async (forcePause?: boolean) => {
    const audio = getAudio();
    if (!audio) return;
    const all = buildCatalog();
    const activeId = audio.trackId || currentTrackId || all[0]?.id;

    const shouldPause =
      typeof forcePause === 'boolean'
        ? forcePause
        : !isPausedByUser && audio.context?.state === 'running' && audio.settings.enabled;

    if (shouldPause) {
      isPausedByUser = true;
      audio.context?.suspend?.().catch(() => {});
      silentAudioEl?.pause?.();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } else {
      isPausedByUser = false;
      await ensureWakeAudioBridge();
      if (!audio.trackId && activeId) {
        await selectAndPlayTrack(activeId);
        return;
      }
      await audio.context?.resume?.().catch(() => {});
      if (bgModeEnabled) silentAudioEl?.play?.().catch(() => {});
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    }
    renderUI();
  };

  const playNextTrack = async (dir: 1 | -1) => {
    const pool = getFilteredTracks();
    const list = pool.length > 0 ? pool : buildCatalog();
    if (!list.length) return;
    const audio = getAudio();
    const activeId = audio?.trackId || currentTrackId || list[0].id;

    if (shuffleEnabled && list.length > 1) {
      const candidates = list.filter((t) => t.id !== activeId);
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (pick) await selectAndPlayTrack(pick.id);
      return;
    }

    const idx = list.findIndex((t) => t.id === activeId);
    const nextIdx = idx === -1 ? 0 : (idx + dir + list.length) % list.length;
    await selectAndPlayTrack(list[nextIdx].id);
  };

  const seekToSeconds = (targetSec: number) => {
    const audio = getAudio();
    if (!audio) return;
    const activeId = audio.trackId || currentTrackId;
    const track = buildCatalog().find((t) => t.id === activeId);
    if (!track) return;
    const stepDuration = 60 / (track.bpm || 120) / 4;
    const totalSteps = getTotalSteps(track.id, track);
    const newStep = Math.max(0, Math.min(totalSteps - 1, Math.floor(targetSec / stepDuration)));
    audio.step = newStep;
    if (audio.biomeChoice) audio.biomeChoice.step = newStep;
  };

  // Manage Pocket Battery Saver (freezes heavy game canvas while music player is open)
  const syncPocketSaver = () => {
    const gameCanvas = document.querySelector('canvas:not(#chem-music-visualizer)') as HTMLCanvasElement | null;
    if (gameCanvas) {
      if (isOpen && pocketSaverEnabled) {
        gameCanvas.style.visibility = 'hidden';
      } else {
        gameCanvas.style.visibility = 'visible';
      }
    }
  };

  // Inject Scoped Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'chem-music-player-styles';
  styleEl.textContent = `
    #chem-music-launcher {
      position: fixed;
      bottom: 14px;
      left: 14px;
      z-index: 9990;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 0 14px;
      border-radius: 999px;
      background: rgba(9, 13, 22, 0.92);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(12px);
      cursor: pointer;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s ease;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    #chem-music-launcher:hover {
      border-color: rgba(56, 189, 248, 0.75);
      transform: translateY(-1px);
    }
    #chem-music-launcher:active {
      transform: scale(0.96);
    }
    #chem-music-launcher .chem-eq-bars {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 14px;
    }
    #chem-music-launcher .chem-eq-bars span {
      width: 3px;
      background: #38bdf8;
      border-radius: 2px;
      animation: chemEqBounce 0.8s ease-in-out infinite alternate;
    }
    #chem-music-launcher .chem-eq-bars span:nth-child(2) { animation-delay: 0.2s; height: 12px; }
    #chem-music-launcher .chem-eq-bars span:nth-child(3) { animation-delay: 0.4s; height: 8px; }
    #chem-music-launcher.is-paused .chem-eq-bars span {
      animation-play-state: paused;
      height: 4px !important;
      opacity: 0.5;
    }
    @keyframes chemEqBounce {
      0% { height: 4px; }
      100% { height: 14px; }
    }

    #chem-music-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #070a12;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: chemMusicSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #chem-music-modal[hidden] {
      display: none !important;
    }
    @keyframes chemMusicSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chem-music-num {
      font-variant-numeric: tabular-nums;
    }
    .chem-music-btn {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: transparent;
      color: #e2e8f0;
      border: none;
      cursor: pointer;
      transition: transform 0.12s ease, background-color 0.12s ease, color 0.12s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .chem-music-btn:hover {
      background: rgba(255, 255, 255, 0.07);
    }
    .chem-music-btn:active {
      transform: scale(0.94);
    }
    .chem-music-btn.is-active {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.14);
    }
    .chem-music-play-cta {
      width: 60px;
      height: 60px;
      border-radius: 999px;
      background: #f8fafc;
      color: #070a12;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(56, 189, 248, 0.28);
      transition: transform 0.12s ease;
    }
    .chem-music-play-cta:active {
      transform: scale(0.93);
    }
    .chem-music-track-row {
      display: grid;
      grid-template-columns: 36px 1fr auto 44px;
      align-items: center;
      gap: 12px;
      min-height: 60px;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
      cursor: pointer;
      transition: background-color 0.12s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .chem-music-track-row:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .chem-music-track-row.is-current {
      background: rgba(56, 189, 248, 0.1);
    }
    .chem-cat-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .chem-cat-tabs::-webkit-scrollbar { display: none; }
    .chem-cat-tab {
      min-height: 36px;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(15, 23, 42, 0.7);
      color: #94a3b8;
      cursor: pointer;
      transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
    }
    .chem-cat-tab.is-active {
      background: #f8fafc;
      color: #090d16;
      border-color: #f8fafc;
    }
  `;
  document.head.appendChild(styleEl);

  // Root container
  const root = document.createElement('div');
  root.id = 'chem-music-app-root';
  for (const evt of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'keydown']) {
    root.addEventListener(evt, (e) => e.stopPropagation());
  }

  // Floating Launcher Pill (always reachable on mobile & desktop)
  const launcher = document.createElement('button');
  launcher.id = 'chem-music-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Otwórz odtwarzacz Chemicats Music');
  launcher.innerHTML = `
    <span class="chem-eq-bars" aria-hidden="true">
      <span style="height:6px"></span>
      <span style="height:12px"></span>
      <span style="height:9px"></span>
    </span>
    <span id="chem-music-launcher-label" style="max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      Chemicats Music
    </span>
  `;
  launcher.onclick = async () => {
    isOpen = true;
    modal.hidden = false;
    await ensureWakeAudioBridge();
    const audio = getAudio();
    if (audio && !audio.trackId) {
      const cat = buildCatalog();
      if (cat.length) await selectAndPlayTrack(cat[0].id);
    }
    syncPocketSaver();
    renderUI();
  };

  // Full-Screen Spotify / YT Music Modal
  const modal = document.createElement('section');
  modal.id = 'chem-music-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Chemicats Music — Odtwarzacz Mobilny');
  modal.hidden = true;

  modal.innerHTML = `
    <!-- Top App Bar (54px) -->
    <header style="height: 54px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.12); background: rgba(9, 13, 22, 0.9);">
      <button type="button" id="chem-music-close" class="chem-music-btn" aria-label="Zminimalizuj do gry" title="Wróć do gry (muzyka gra dalej)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div style="text-align: center; min-width: 0;">
        <div style="font-size: 14px; font-weight: 700; letter-spacing: -0.01em; color: #f8fafc;">Chemicats Music</div>
        <div id="chem-music-header-sub" style="font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Atomowa Orkiestra · 0 MB MP3 (Synteza Live)</div>
      </div>
      <button type="button" id="chem-music-bg-toggle" class="chem-music-btn is-active" style="padding: 0 10px; font-size: 11px; font-weight: 600; gap: 5px;" title="Odtwarzanie w tle i na ekranie blokady telefonu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        <span id="chem-music-bg-label">W tle: WŁ</span>
      </button>
    </header>

    <!-- Main Responsive Content Grid (1-col mobile, 2-col desktop) -->
    <div style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); overflow-y: auto;">
      
      <!-- Left / Top Deck: Now Playing Art + Visualizer + Scrubber + Transport Controls -->
      <div style="padding: 16px 20px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(148, 163, 184, 0.08); background: radial-gradient(circle at 50% 15%, rgba(56, 189, 248, 0.12), transparent 65%);">
        
        <!-- Visualizer & Periodic Cover Art Card -->
        <div style="position: relative; width: 100%; max-width: 340px; height: 190px; margin: 0 auto; border-radius: 20px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(148, 163, 184, 0.16); overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <canvas id="chem-music-visualizer" width="340" height="190" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;"></canvas>
          <div style="position: relative; z-index: 2; text-align: center; padding: 12px 18px; border-radius: 16px; background: rgba(9, 13, 22, 0.72); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.1);">
            <div id="chem-music-art-num" class="chem-music-num" style="font-size: 11px; color: #94a3b8; font-weight: 600;">79 · Au</div>
            <div id="chem-music-art-sym" style="font-size: 38px; font-weight: 800; line-height: 1.05; color: #38bdf8; letter-spacing: -0.03em;">Au</div>
            <div id="chem-music-art-cat" style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Pełne Wersje</div>
          </div>
        </div>

        <!-- Track Title & Favorite Action -->
        <div style="margin-top: 14px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
          <div style="min-width: 0; flex: 1;">
            <h2 id="chem-music-now-title" style="margin: 0; font-size: 19px; font-weight: 800; line-height: 1.25; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Wybierz utwór</h2>
            <p id="chem-music-now-sub" style="margin: 4px 0 0; font-size: 13px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Chemicats · Atomowa Orkiestra</p>
          </div>
          <button type="button" id="chem-music-fav-current" class="chem-music-btn" aria-label="Dodaj do ulubionych" title="Dodaj lub usuń z ulubionych">
            <svg id="chem-music-fav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>

        <!-- Progress Scrubber Bar -->
        <div style="margin-top: 12px;">
          <input type="range" id="chem-music-seek" min="0" max="100" step="0.5" value="0" aria-label="Postęp utworu" style="width: 100%; height: 6px; accent-color: #38bdf8; cursor: pointer;" />
          <div class="chem-music-num" style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 4px;">
            <span id="chem-music-time-cur">0:00</span>
            <span id="chem-music-time-tot">0:00</span>
          </div>
        </div>

        <!-- Primary Transport Controls (Thumb-Zone Friendly 44px+) -->
        <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; max-width: 340px; width: 100%; margin-left: auto; margin-right: auto;">
          <button type="button" id="chem-music-shuffle" class="chem-music-btn" aria-label="Odtwarzanie losowe" title="Losowa kolejność (Shuffle)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          </button>
          <button type="button" id="chem-music-prev" class="chem-music-btn" aria-label="Poprzedni utwór" title="Poprzedni utwór">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button type="button" id="chem-music-play" class="chem-music-play-cta" aria-label="Odtwórz lub wstrzymaj" title="Odtwórz / Pauza">
            <svg id="chem-music-play-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button type="button" id="chem-music-next" class="chem-music-btn" aria-label="Następny utwór" title="Następny utwór">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <button type="button" id="chem-music-repeat" class="chem-music-btn" aria-label="Tryb powtarzania" title="Pętla: Cała playlista / Jeden utwór">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span id="chem-music-repeat-badge" style="font-size: 10px; font-weight: 800; margin-left: 2px;"></span>
          </button>
        </div>

        <!-- Volume & Pocket Battery Saver Strip -->
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.1); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; flex: 1; min-width: 150px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <input type="range" id="chem-music-vol" min="0" max="1" step="0.01" value="0.7" aria-label="Głośność muzyki" style="flex: 1; accent-color: #38bdf8;" />
          </label>
          <button type="button" id="chem-music-pocket" class="chem-cat-tab" style="min-height: 34px; font-size: 11px;" title="Ukrywa renderowanie grafiki gry, gdy słuchasz muzyki — oszczędza baterię telefonu">
            🔋 Tryb kieszeniowy: WYŁ
          </button>
        </div>
      </div>

      <!-- Right / Bottom Deck: Search + Playlists + Full Tracklist -->
      <div style="display: flex; flex-direction: column; min-height: 320px; max-height: 100%; overflow: hidden;">
        
        <!-- Search & Filter Header -->
        <div style="padding: 12px 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.1); background: rgba(9, 13, 22, 0.6); display: flex; flex-direction: column; gap: 10px;">
          <div style="position: relative; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="position: absolute; left: 12px; pointer-events: none;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="search" id="chem-music-search" placeholder="Szukaj piosenki, biomu, bossa lub BPM…" aria-label="Szukaj utworu" style="width: 100%; height: 40px; padding: 0 12px 0 36px; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(15, 23, 42, 0.9); color: #f8fafc; font-size: 13px; outline: none;" />
          </div>
          <div class="chem-cat-tabs" id="chem-music-tabs" role="tablist"></div>
        </div>

        <!-- Scrollable Track List -->
        <div id="chem-music-list" style="flex: 1; overflow-y: auto; padding-bottom: 24px;"></div>
      </div>

    </div>
  `;

  root.appendChild(launcher);
  root.appendChild(modal);
  document.body.appendChild(root);

  // Query elements
  const closeBtn = modal.querySelector('#chem-music-close') as HTMLButtonElement;
  const bgToggleBtn = modal.querySelector('#chem-music-bg-toggle') as HTMLButtonElement;
  const bgLabel = modal.querySelector('#chem-music-bg-label') as HTMLElement;
  const headerSub = modal.querySelector('#chem-music-header-sub') as HTMLElement;
  const artNum = modal.querySelector('#chem-music-art-num') as HTMLElement;
  const artSym = modal.querySelector('#chem-music-art-sym') as HTMLElement;
  const artCat = modal.querySelector('#chem-music-art-cat') as HTMLElement;
  const nowTitle = modal.querySelector('#chem-music-now-title') as HTMLElement;
  const nowSub = modal.querySelector('#chem-music-now-sub') as HTMLElement;
  const favCurrentBtn = modal.querySelector('#chem-music-fav-current') as HTMLButtonElement;
  const favIcon = modal.querySelector('#chem-music-fav-icon') as SVGElement;
  const seekInput = modal.querySelector('#chem-music-seek') as HTMLInputElement;
  const timeCur = modal.querySelector('#chem-music-time-cur') as HTMLElement;
  const timeTot = modal.querySelector('#chem-music-time-tot') as HTMLElement;
  const shuffleBtn = modal.querySelector('#chem-music-shuffle') as HTMLButtonElement;
  const prevBtn = modal.querySelector('#chem-music-prev') as HTMLButtonElement;
  const playBtn = modal.querySelector('#chem-music-play') as HTMLButtonElement;
  const playIcon = modal.querySelector('#chem-music-play-icon') as SVGElement;
  const nextBtn = modal.querySelector('#chem-music-next') as HTMLButtonElement;
  const repeatBtn = modal.querySelector('#chem-music-repeat') as HTMLButtonElement;
  const repeatBadge = modal.querySelector('#chem-music-repeat-badge') as HTMLElement;
  const volInput = modal.querySelector('#chem-music-vol') as HTMLInputElement;
  const pocketBtn = modal.querySelector('#chem-music-pocket') as HTMLButtonElement;
  const searchInput = modal.querySelector('#chem-music-search') as HTMLInputElement;
  const tabsContainer = modal.querySelector('#chem-music-tabs') as HTMLElement;
  const listContainer = modal.querySelector('#chem-music-list') as HTMLElement;
  const launcherLabel = launcher.querySelector('#chem-music-launcher-label') as HTMLElement;
  const visCanvas = modal.querySelector('#chem-music-visualizer') as HTMLCanvasElement;
  const visCtx = visCanvas.getContext('2d');

  // Wire Controls
  closeBtn.onclick = () => {
    isOpen = false;
    modal.hidden = true;
    syncPocketSaver();
    renderUI();
  };

  bgToggleBtn.onclick = () => {
    bgModeEnabled = !bgModeEnabled;
    try {
      localStorage.setItem(BG_MODE_KEY, String(bgModeEnabled));
    } catch {}
    if (bgModeEnabled && !isPausedByUser) {
      void ensureWakeAudioBridge();
    } else {
      silentAudioEl?.pause?.();
    }
    renderUI();
  };

  pocketBtn.onclick = () => {
    pocketSaverEnabled = !pocketSaverEnabled;
    try {
      localStorage.setItem(POCKET_MODE_KEY, String(pocketSaverEnabled));
    } catch {}
    syncPocketSaver();
    renderUI();
  };

  favCurrentBtn.onclick = () => {
    const audio = getAudio();
    const activeId = audio?.trackId || currentTrackId;
    if (!activeId) return;
    if (favorites.has(activeId)) favorites.delete(activeId);
    else favorites.add(activeId);
    saveFavorites();
    renderUI();
  };

  shuffleBtn.onclick = () => {
    shuffleEnabled = !shuffleEnabled;
    renderUI();
  };

  repeatBtn.onclick = () => {
    repeatMode = repeatMode === 'all' ? 'one' : 'all';
    renderUI();
  };

  prevBtn.onclick = () => void playNextTrack(-1);
  nextBtn.onclick = () => void playNextTrack(1);
  playBtn.onclick = () => void togglePlayPause();

  let isSeeking = false;
  seekInput.addEventListener('pointerdown', () => {
    isSeeking = true;
  });
  seekInput.addEventListener('pointerup', () => {
    isSeeking = false;
  });
  seekInput.addEventListener('input', () => {
    const audio = getAudio();
    const activeId = audio?.trackId || currentTrackId;
    const track = buildCatalog().find((t) => t.id === activeId);
    if (!track) return;
    const pct = Number(seekInput.value) / 100;
    const sec = pct * track.durationSec;
    timeCur.textContent = formatTime(sec);
    seekToSeconds(sec);
  });

  volInput.addEventListener('input', () => {
    const audio = getAudio();
    if (!audio) return;
    const v = Number(volInput.value);
    audio.configure({ enabled: v > 0, music: v, master: Math.max(audio.settings.master || 0.72, v) });
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderTrackList();
  });

  const renderTabs = () => {
    const all = buildCatalog();
    const tabDefs: Array<{ id: typeof activeCategory; label: string; count: number }> = [
      { id: 'all', label: 'Wszystkie', count: all.length },
      { id: 'fav', label: '♥ Ulubione', count: favorites.size },
      { id: 'energy', label: '⚔️ Bojowe i Metal', count: all.filter((t) => t.category === 'energy').length },
      { id: 'neon', label: 'Neon i Synth', count: all.filter((t) => t.category === 'neon').length },
      { id: 'full', label: 'Pełne Wersje', count: all.filter((t) => t.category === 'full').length },
      { id: 'boss', label: 'Bossowie', count: all.filter((t) => t.category === 'boss').length },
      { id: 'biome', label: 'Biomy', count: all.filter((t) => t.category === 'biome').length },
      { id: 'cats', label: 'Motywy Kotów', count: all.filter((t) => t.category === 'cats').length },
      { id: 'core', label: 'Klasyki', count: all.filter((t) => t.category === 'core').length },
    ];

    tabsContainer.innerHTML = '';
    for (const tab of tabDefs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chem-cat-tab' + (activeCategory === tab.id ? ' is-active' : '');
      btn.textContent = `${tab.label} · ${tab.count}`;
      btn.onclick = () => {
        activeCategory = tab.id;
        renderTabs();
        renderTrackList();
      };
      tabsContainer.appendChild(btn);
    }
  };

  const renderTrackList = () => {
    const filtered = getFilteredTracks();
    const audio = getAudio();
    const activeId = audio?.trackId || currentTrackId;

    listContainer.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 36px 20px; text-align: center; color: #64748b; font-size: 13px;';
      empty.textContent =
        activeCategory === 'fav'
          ? 'Brak ulubionych utworów. Dotknij ikony serca przy piosence, aby dodać ją do ulubionych.'
          : 'Nie znaleziono utworów pasujących do wyszukiwania.';
      listContainer.appendChild(empty);
      return;
    }

    filtered.forEach((track, idx) => {
      const isCurrent = track.id === activeId;
      const isFav = favorites.has(track.id);
      const row = document.createElement('div');
      row.className = 'chem-music-track-row' + (isCurrent ? ' is-current' : '');

      // Col 1: Number or Element Symbol Badge
      const leftBadge = document.createElement('div');
      leftBadge.className = 'chem-music-num';
      leftBadge.style.cssText = `width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; background: ${
        isCurrent ? track.accentColor : 'rgba(30, 41, 59, 0.7)'
      }; color: ${isCurrent ? '#070a12' : '#94a3b8'};`;
      leftBadge.textContent = isCurrent && !isPausedByUser ? '▶' : String(idx + 1);

      // Col 2: Title & Unboxed Metadata
      const info = document.createElement('div');
      info.style.cssText = 'min-width: 0;';
      const titleEl = document.createElement('div');
      titleEl.style.cssText = `font-size: 14px; font-weight: ${
        isCurrent ? '700' : '600'
      }; color: ${isCurrent ? '#38bdf8' : '#f1f5f9'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
      titleEl.textContent = track.title;

      const metaEl = document.createElement('div');
      metaEl.className = 'chem-music-num';
      metaEl.style.cssText =
        'font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;';
      metaEl.textContent = `${track.categoryLabel} · ${track.bpm} BPM${
        track.subtitle ? ' · ' + track.subtitle : ''
      }`;
      info.append(titleEl, metaEl);

      // Col 3: Duration
      const durEl = document.createElement('div');
      durEl.className = 'chem-music-num';
      durEl.style.cssText = 'font-size: 12px; color: #94a3b8; font-weight: 500;';
      durEl.textContent = track.formattedDuration;

      // Col 4: Favorite button
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'chem-music-btn';
      favBtn.setAttribute('aria-label', isFav ? 'Usuń z ulubionych' : 'Dodaj do ulubionych');
      favBtn.style.color = isFav ? '#f43f5e' : '#64748b';
      favBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${
        isFav ? 'currentColor' : 'none'
      }" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      favBtn.onclick = (e) => {
        e.stopPropagation();
        if (favorites.has(track.id)) favorites.delete(track.id);
        else favorites.add(track.id);
        saveFavorites();
        renderTabs();
        renderTrackList();
        renderNowPlayingHeader();
      };

      row.onclick = () => void selectAndPlayTrack(track.id);
      row.append(leftBadge, info, durEl, favBtn);
      listContainer.appendChild(row);
    });
  };

  const renderNowPlayingHeader = () => {
    const all = buildCatalog();
    const audio = getAudio();
    const activeId = audio?.trackId || currentTrackId || all[0]?.id;
    const track = all.find((t) => t.id === activeId) || all[0];

    headerSub.textContent = `${all.length} utworów w pakiecie · 0 MB MP3 (Synteza Live)`;

    const playing =
      Boolean(audio) &&
      !isPausedByUser &&
      audio.context?.state === 'running' &&
      audio.settings?.enabled;

    launcher.classList.toggle('is-paused', !playing);
    launcherLabel.textContent = track && playing ? `${track.title}` : 'Chemicats Music';

    bgToggleBtn.classList.toggle('is-active', bgModeEnabled);
    bgLabel.textContent = bgModeEnabled ? 'W tle: WŁ' : 'W tle: WYŁ';

    pocketBtn.classList.toggle('is-active', pocketSaverEnabled);
    pocketBtn.textContent = pocketSaverEnabled
      ? '🔋 Tryb kieszeniowy: WŁ'
      : '🔋 Tryb kieszeniowy: WYŁ';

    shuffleBtn.classList.toggle('is-active', shuffleEnabled);
    repeatBtn.classList.toggle('is-active', repeatMode === 'one');
    repeatBadge.textContent = repeatMode === 'one' ? '1' : '';

    playIcon.innerHTML = playing
      ? '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>'
      : '<path d="M8 5v14l11-7z"/>';

    if (audio?.settings) {
      volInput.value = String(audio.settings.music ?? 0.7);
    }

    if (track) {
      artNum.textContent = `${track.atomicNumber} · ${track.bpm} BPM`;
      artSym.textContent = track.symbol;
      artSym.style.color = track.accentColor;
      artCat.textContent = track.categoryLabel;
      nowTitle.textContent = track.title;
      nowSub.textContent = `${track.categoryLabel} · ${track.bpm} BPM${
        track.subtitle ? ' · ' + track.subtitle : ''
      }`;
      timeTot.textContent = track.formattedDuration;

      const isFav = favorites.has(track.id);
      favCurrentBtn.style.color = isFav ? '#f43f5e' : '#94a3b8';
      favIcon.setAttribute('fill', isFav ? 'currentColor' : 'none');
    }
  };

  const renderUI = () => {
    renderNowPlayingHeader();
    renderTabs();
    renderTrackList();
  };

  // Live Progress + Visualizer Loop
  const freqData = new Uint8Array(64);
  let phase = 0;

  const tickVisualizerAndProgress = () => {
    const audio = getAudio();
    if (audio) {
      ensureBackgroundPatch();
      const activeId = audio.trackId || currentTrackId;
      if (activeId && activeId !== lastAnnouncedTrackId) {
        lastAnnouncedTrackId = activeId;
        currentTrackId = activeId;
        const found = buildCatalog().find((t) => t.id === activeId);
        updateMediaSession(found);
        if (isOpen) renderUI();
        else renderNowPlayingHeader();
      }

      if (isOpen && activeId) {
        const track = buildCatalog().find((t) => t.id === activeId);
        if (track && !isSeeking) {
          const totalSteps = getTotalSteps(track.id, track);
          const step = (audio.step || 0) % Math.max(1, totalSteps);
          const pct = Math.min(100, (step / Math.max(1, totalSteps)) * 100);
          seekInput.value = String(pct);
          timeCur.textContent = formatTime((pct / 100) * track.durationSec);
        }
      }
    }

    // Draw Visualizer when modal is open
    if (isOpen && visCtx) {
      const w = visCanvas.width;
      const h = visCanvas.height;
      visCtx.clearRect(0, 0, w, h);

      const all = buildCatalog();
      const activeId = audio?.trackId || currentTrackId || all[0]?.id;
      const track = all.find((t) => t.id === activeId);
      const color = track?.accentColor || '#38bdf8';

      const playing =
        Boolean(audio) &&
        !isPausedByUser &&
        audio.context?.state === 'running' &&
        audio.settings?.enabled;

      if (analyser && playing) {
        analyser.getByteFrequencyData(freqData);
      } else {
        freqData.fill(8);
      }

      phase += playing ? 0.06 : 0.01;
      const barCount = 32;
      const barW = (w - 32) / barCount;

      for (let i = 0; i < barCount; i++) {
        const raw = analyser && playing ? freqData[i] / 255 : 0.06 + Math.sin(phase + i * 0.3) * 0.03;
        const val = Math.max(0.05, raw);
        const barH = val * (h * 0.72);
        const x = 16 + i * barW;
        const y = h - barH;

        visCtx.fillStyle = color + (i % 2 === 0 ? '66' : '38');
        visCtx.beginPath();
        visCtx.roundRect(x, y, Math.max(2, barW - 3), barH, 3);
        visCtx.fill();
      }
    }

    requestAnimationFrame(tickVisualizerAndProgress);
  };

  requestAnimationFrame(tickVisualizerAndProgress);
}
