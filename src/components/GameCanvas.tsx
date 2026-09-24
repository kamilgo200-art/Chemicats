import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { TouchControls } from './TouchControls';
import { MenuGameplay } from './MenuGameplay';
import { PeriodicTable, PERIODIC_TABLE } from './PeriodicTable';
import { REACTIONS_DB, MoleculeGraphic } from './ReactionsDB';
import { AlchemyTable } from './AlchemyTable';

import { CatbotLandingHacking } from './CatbotLandingHacking';
import { CatbotEngine } from './CatbotEngine';

const ROOM_WIDTH = 1400;
const ROOM_HEIGHT = 1050;

export const formatMoney = (val: number | string) => {
    let num = Number(val);
    if (isNaN(num)) return val.toString();
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'mld';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'mln';
    if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return Math.floor(num).toString();
};

// We use a global for the websocket so we can trigger it from anywhere
let globalWs: WebSocket | null = null;

import { EN_DICT } from '../i18n';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameStateUi, setGameStateUi] = useState<'menu' | 'playing' | 'gameover' | 'victory' | 'victory_screen' | 'proton_tutorial'>('menu');
  const [victoryTimer, setVictoryTimer] = useState(5);
  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [reactionDiscovery, setReactionDiscovery] = useState<{active: boolean, equation: string, name: string, description: string, atoms?: string[]}|null>(null);
  const [marketDiscovery, setMarketDiscovery] = useState<{active: boolean, title: string, content: string}|null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [bossIntro, setBossIntro] = useState<{active: boolean, name: string, description: string}|null>(null);
  const [showingRecipeBook, setShowingRecipeBook] = useState(false);
  const [showingOptions, setShowingOptions] = useState(false);
  const [optionsTab, setOptionsTab] = useState<'main' | 'settings' | 'investments' | 'market' | 'periodic_table' | 'feedback'>('main');
  const [showingStats, setShowingStats] = useState(false);
  const [showingSaves, setShowingSaves] = useState(false);
  const [showingPeriodicTable, setShowingPeriodicTable] = useState(false);
  const [selectedAtomDetails, setSelectedAtomDetails] = useState<number | null>(null);
  const [selectedReactionDetails, setSelectedReactionDetails] = useState<string | null>(null);
  const [menuSelectedZ, setMenuSelectedZ] = useState<number | undefined>();
  const [showingLan, setShowingLan] = useState(false);
  const [lanNick, setLanNick] = useState(() => localStorage.getItem('lanNick') || 'Player1');
  const [lanActive, setLanActive] = useState(() => localStorage.getItem('lanActive') === 'true');
  const [transferAmount, setTransferAmount] = useState(500);
  const [previewReaction, setPreviewReaction] = useState<{id: string, equation: string, name: string, description: string, atoms: string[]}|null>(null);
  const [devPasswordPrompt, setDevPasswordPrompt] = useState(false);
  const [devPasswordInp, setDevPasswordInp] = useState('');
  
  const [catbotModeUnlocked, setCatbotModeUnlocked] = useState(() => localStorage.getItem('catbotModeUnlocked') === 'true');
  const [easterEggScanning, setEasterEggScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showCatbotHacking, setShowCatbotHacking] = useState(false);
  const [isCatbotEngineRunning, setIsCatbotEngineRunning] = useState(false);
  
  const easterEggTimerRef = useRef<number | null>(null);
  const easterEggIntervalRef = useRef<number | null>(null);

  const [showingDevMenu, setShowingDevMenu] = useState(false);
  const [devMenuPos, setDevMenuPos] = useState({ x: 16, y: 64 });
  const [isDragDev, setIsDragDev] = useState(false);
  const [dragStartDev, setDragStartDev] = useState({ x: 0, y: 0 });
  const [showingDevBossTests, setShowingDevBossTests] = useState(false);
  const [shakeChar, setShakeChar] = useState('');
  const [triggerRender, setTriggerRender] = useState(0);
  const [marketAmounts, setMarketAmounts] = useState<Record<string, number>>({});
  const [deleteSaveConfirm, setDeleteSaveConfirm] = useState<number | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [marketExpandedDescs, setMarketExpandedDescs] = useState<Record<string, boolean>>({});

  const tx = (text: string) => {
      if (engineRef.current?.state?.language === 'en') {
          return EN_DICT[text] || text;
      }
      return text;
  };

  const charTouchStartX = useRef(0);
  const atomTouchStartY = useRef(0);
  const devTimerRef = useRef<any>(null);

  useEffect(() => {
    let t: any;
    if (reactionDiscovery?.active) {
       t = setTimeout(() => {
          if (engineRef.current) {
             engineRef.current.state.reactionDiscovery = null;
          }
          setReactionDiscovery(null);
       }, 3000);
    }
    return () => clearTimeout(t);
  }, [reactionDiscovery?.active, reactionDiscovery?.name]);

  useEffect(() => {
    let t: any;
    if (marketDiscovery?.active) {
       t = setTimeout(() => {
          if (engineRef.current) {
             engineRef.current.state.marketDiscovery = null;
          }
          setMarketDiscovery(null);
       }, 4000);
    }
    return () => clearTimeout(t);
  }, [marketDiscovery?.active, marketDiscovery?.title]);

  useEffect(() => {
    let timerId: any;
    if (gameStateUi === 'victory_screen') {
        if (engineRef.current?.state.autoNextLevel && (engineRef.current?.state.level || 1) < 6) {
            timerId = setInterval(() => {
                setVictoryTimer(prev => {
                    if (prev <= 1) {
                        nextLevelFromVictory();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    } else {
        setVictoryTimer(5); // reset
    }
    return () => clearInterval(timerId);
  }, [gameStateUi]);

  const nextLevelFromVictory = () => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    
    // next level transition
    engine.state.drops = [];
    engine.state.projectiles = [];
    engine.state.enemies = [];
    engine.state.particles = [];
    engine.state.damageNumbers = [];
    engine.state.rooms = (engine as any).generateDungeon(10 + engine.state.level * 2);
    engine.state.currentRoom = { x: 0, y: 0 };
    engine.state.player.pos = { x: 0, y: 0 };
    engine.state.dungeonKills = {};
    const r0 = engine.state.rooms.find(r => r.gridX===0 && r.gridY===0);
    if (r0) {
       r0.cleared = false;
       r0.enemyCount = 3 + engine.state.level;
       (engine as any).spawnEnemiesForRoom(r0);
    }
    engine.state.state = 'playing';
    setGameStateUi('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    engineRef.current = new GameEngine();
    const engine = engineRef.current;

    let lastTime = performance.now();
    let lastUiUpdate = performance.now();
    let animationFrameId: number;

    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let konamiPos = 0;

    let mobileKonamiTaps = 0;
    let lastMobileTapTime = 0;

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        engine.resize(canvas.width, canvas.height);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      engine.state.keys[key] = true;
      if (e.key === ' ') e.preventDefault();
      
      // Konami code check
      if (engine && engine.state.state === 'playing') {
          if (key === konamiCode[konamiPos]) {
              konamiPos++;
              if (konamiPos === konamiCode.length) {
                  engine.triggerKonami();
                  konamiPos = 0;
              }
          } else {
              konamiPos = 0;
          }
      }

      if (e.key === '/') {
          setDevPasswordPrompt(true);
          setDevPasswordInp('');
          engine.state.devPaused = true;
          return;
      }

      if (key === 'q' && engine.state.hasSuperWeapon) {
          let defaultWeapon: 'normal' | 'shotgun' | 'orbit' = 'normal';
          if (engine.state.selectedCharacter === 'black_cat') defaultWeapon = 'shotgun';
          else if (engine.state.selectedCharacter === 'bohr_cat') defaultWeapon = 'orbit';
          engine.state.equippedWeapon = engine.state.equippedWeapon === 'super' ? defaultWeapon : 'super';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      engine.state.keys[e.key.toLowerCase()] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      engine.state.mouse = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };
    const handleMouseDown = () => { engine.state.isMouseDown = true; };
    const handleMouseUp = () => { engine.state.isMouseDown = false; };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (engine && engine.state.state === 'playing') {
          if (engine.state.isLobby && !engine.state.characterSelected) {
              const chars = ['ginger_cat', 'black_cat', 'bohr_cat', 'curie_cat', 'mendelejew'];
              const currentIdx = chars.indexOf(engine.state.selectedCharacter) >= 0 ? chars.indexOf(engine.state.selectedCharacter) : 0;
              let nextIdx = currentIdx;
              if (e.deltaY > 0) nextIdx = (currentIdx + 1) % chars.length;
              else nextIdx = (currentIdx - 1 + chars.length) % chars.length;
              engine.state.selectedCharacter = chars[nextIdx] as any;
              setTriggerRender(r => r + 1);
              return;
          }
          // Zawsze scrollujemy atomy na krawędzi bębenka
          const baseArr = engine.state.unlockedAtoms.concat(engine.state.unlockedMolecules);
          if (baseArr.length === 0) return;
          const currentAtomIdx = baseArr.indexOf(engine.state.player.selectedAtom);
          let nextIdx = currentAtomIdx >= 0 ? currentAtomIdx : 0;
          if (e.deltaY > 0) {
              nextIdx = (nextIdx + 1) % baseArr.length;
          } else {
              nextIdx = (nextIdx - 1 + baseArr.length) % baseArr.length;
          }
          if (engine.state.equippedWeapon !== 'super') {
              engine.state.player.selectedAtom = baseArr[nextIdx] as any;
          } else {
              // W superbroni scroll kreci krawędzią (wizualnie), ale strzelamy ze środka. Zróbmy tak, żeby scroll wciąz zmieniał atom na brzegu (na potem), ale selectedAtom w superbroni to reacvja. 
              // Ale czekaj, wybrany atom jest jeden w `selectedAtom`. Dodajmy może `selectedReaction` w player state, żeby nie mieszać wybranych atomów z reakcją.
          }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (engine && engine.state.state === 'playing' && e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Check top-center area
            if (y < 120 && x > rect.width/2 - 120 && x < rect.width/2 + 120) {
                const now = performance.now();
                if (now - lastMobileTapTime < 500) {
                    mobileKonamiTaps++;
                    if (mobileKonamiTaps >= 7) {
                        engine.triggerKonami();
                        mobileKonamiTaps = 0;
                    }
                } else {
                    mobileKonamiTaps = 1;
                }
                lastMobileTapTime = now;
            } else {
                mobileKonamiTaps = 0;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);

    let ws: WebSocket | null = null;
    let syncTimer = 0;
    if (localStorage.getItem('lanActive') === 'true') {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        try {
            // Get or create unique client ID
            let lanClientId = localStorage.getItem('lanClientId');
            if (!lanClientId) {
                lanClientId = Math.random().toString(36).substring(2, 9);
                localStorage.setItem('lanClientId', lanClientId);
            }
            
            ws = new WebSocket(`${wsProtocol}//${window.location.host}/play`);
            globalWs = ws;
            ws.onopen = () => console.log('Connected to LAN server');
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'state_update') {
                       if (data.state.clientId === lanClientId) return; // ignore our own ghosts
                       if (!engineRef.current?.state) return;
                       const st = engineRef.current.state;
                       if (!st.networkPlayers) st.networkPlayers = [];
                       const idx = st.networkPlayers.findIndex((p: any) => p.id === data.id);
                       if (idx >= 0) {
                           st.networkPlayers[idx].targetPos = data.state.pos;
                           st.networkPlayers[idx].char = data.state.char;
                           st.networkPlayers[idx].nick = data.state.nick;
                           st.networkPlayers[idx].hp = data.state.hp;
                           st.networkPlayers[idx].maxHp = data.state.maxHp;
                           st.networkPlayers[idx].isDead = data.state.isDead;
                           st.networkPlayers[idx].deadTimer = data.state.deadTimer;
                       } else {
                           st.networkPlayers.push({ id: data.id, ...data.state, targetPos: data.state.pos, pos: data.state.pos });
                                                      if (st.showingLobby) setTriggerRender(r => r + 1);
                       }

                       if (data.state.stockPrice !== undefined) {
                           if (!st.stockPrice || st.stockPrice === 10 || data.state.investmentRoomCounter !== st.investmentRoomCounter) {
                               st.stockPrice = data.state.stockPrice;
                               st.bondsRoomsLeft = data.state.bondsRoomsLeft;
                               st.investmentRoomCounter = data.state.investmentRoomCounter;
                           }
                       }

                       if (data.state.unpaidTax !== undefined && Math.max(0, data.state.unpaidTax) < Math.max(0, st.unpaidTax)) {
                           st.unpaidTax = data.state.unpaidTax;
                           st.roomsSinceTaxOwed = data.state.roomsSinceTaxOwed;
                           st.policeSpawning = false;
                           // Clean police from state
                           st.enemies = st.enemies.filter(e => e.type !== 'PoliceCat');
                       }

                       if (data.state.isHost && !st.isHost && data.state.level !== undefined && st.level !== undefined && data.state.level > st.level) {
                           st.level = data.state.level;
                           if (data.state.unlockedAtoms) st.unlockedAtoms = data.state.unlockedAtoms;
                           if (data.state.isLobby !== undefined && !data.state.isLobby) st.isLobby = false;
                       }
                    }
                    if (data.type === 'broadcast') {
                        if (data.payload.event === 'revive_success' && data.payload.target === lanClientId) {
                             if (engineRef.current && engineRef.current.state.player.isDead) {
                                 engineRef.current.state.player.isDead = false;
                                 engineRef.current.state.player.hp = Math.floor(engineRef.current.state.player.maxHp * 0.5);
                                 engineRef.current.state.player.deadTimer = 0;
                             }
                        }
                        if (data.payload.event === 'start_game') {
                            if (engineRef.current && engineRef.current.state.state !== 'playing') {
                                engineRef.current.state.showingLobby = false;
                                engineRef.current.state.showingSaves = false;
                                engineRef.current.resetGame(); // reset
                                engineRef.current.state.state = 'playing';
                                if (data.payload.hostState) {
                                    engineRef.current.state.level = data.payload.hostState.level;
                                    engineRef.current.state.isLobby = data.payload.hostState.isLobby;
                                    engineRef.current.state.unlockedAtoms = data.payload.hostState.unlockedAtoms;
                                    if (!data.payload.hostState.isLobby) engineRef.current.state.characterSelected = true; // auto skip char select if jumping to run
                                } else {
                                    engineRef.current.state.isLobby = true;
                                    engineRef.current.state.characterSelected = false;
                                }
                            }
                        }
                    }
                    if (data.type === 'player_leave') {
                       if (engineRef.current?.state?.networkPlayers) {
                          engineRef.current.state.networkPlayers = engineRef.current.state.networkPlayers.filter((p: any) => p.id !== data.id);
                          if (engineRef.current.state.showingLobby) setTriggerRender(r => r + 1);
                       }
                    }
                } catch(err) {}
            };
        } catch (e) {
            console.error('WS Connection error', e);
        }
    }

    const render = (time?: number) => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1); 
      lastTime = now;

      if (now - lastUiUpdate > 33) { // ~30 FPS HUD update
          lastUiUpdate = now;
          setTriggerRender(r => (r + 1) % 1000);
      }

      engine.update(dt);

      if (engine.state.networkPlayers) {
          engine.state.networkPlayers.forEach((np: any) => {
              if (np.pos && np.targetPos) {
                  // Smooth LERP (Linear Interpolation) to reduce perceived lag
                  np.pos.x += (np.targetPos.x - np.pos.x) * 0.4;
                  np.pos.y += (np.targetPos.y - np.pos.y) * 0.4;
              }
          });
          
          if (engine.state.keys['e'] && !engine.state.player.isDead) {
              const deadNp = engine.state.networkPlayers.find((np: any) => np.isDead && Math.hypot(np.pos.x - engine.state.player.pos.x, np.pos.y - engine.state.player.pos.y) < 150);
              if (deadNp) {
                  engine.state.reviveTimer = (engine.state.reviveTimer || 0) + dt;
                  if (engine.state.reviveTimer >= 4.0) {
                      engine.state.reviveTimer = 0;
                      if (globalWs && globalWs.readyState === 1) {
                          globalWs.send(JSON.stringify({ type: 'broadcast', payload: { event: 'revive_success', target: deadNp.id } }));
                      }
                  }
              } else {
                  engine.state.reviveTimer = 0;
              }
          } else {
              engine.state.reviveTimer = 0;
          }
      }
      
      if (ws && ws.readyState === 1 && engine.state.state !== 'menu') {
          syncTimer++;
          // Optimized tick rate for stable LAN multiplayer across routers
          if (syncTimer >= 4) {
              syncTimer = 0;
              ws.send(JSON.stringify({ 
                 type: 'update', 
                 state: { 
                     clientId: localStorage.getItem('lanClientId'),
                     pos: engine.state.player.pos, 
                     char: engine.state.selectedCharacter, 
                     nick: localStorage.getItem('lanNick') || 'Player',
                     hp: engine.state.player.hp,
                     maxHp: engine.state.player.maxHp,
                     isDead: engine.state.player.isDead,
                     deadTimer: engine.state.player.deadTimer,
                     stockPrice: engine.state.stockPrice,
                     bondsRoomsLeft: engine.state.bondsRoomsLeft,
                     investmentRoomCounter: engine.state.investmentRoomCounter,
                     unpaidTax: engine.state.unpaidTax,
                     roomsSinceTaxOwed: engine.state.roomsSinceTaxOwed,
                     isHost: engine.state.isHost,
                     level: engine.state.level,
                     unlockedAtoms: engine.state.unlockedAtoms,
                     isLobby: engine.state.isLobby
                 } 
              }));
          }
      }

      const { state } = engine;
      setGameStateUi(state.state);
      setScore(state.score);
      setLogs(prev => {
          if (prev.length !== state.log.length) return [...state.log];
          for (let i = 0; i < prev.length; i++) {
              if (prev[i] !== state.log[i]) return [...state.log];
          }
          return prev;
      });
      setReactionDiscovery(state.reactionDiscovery || null);
      setMarketDiscovery(state.marketDiscovery || null);
      
      if (state.showingBossIntro) {
          setBossIntro(prev => {
              if (prev && prev.active && prev.name === state.bossIntroName && prev.description === state.bossIntroDesc) return prev;
              return { active: true, name: state.bossIntroName || '', description: state.bossIntroDesc || '' };
          });
      } else {
          setBossIntro(null);
      }
      
      setShowingRecipeBook(state.showingRecipeBook);
      setShowingOptions(state.showingOptions);
      setShowingStats(state.showingStats);
      setShowingSaves(state.showingSaves);

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.state !== 'playing') {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(state.cameraZoom, state.cameraZoom);
      
      let sx = 0, sy = 0;
      if (state.screenShake > 0 && !state.disableScreenShake) {
        sx = (Math.random() - 0.5) * state.screenShake;
        sy = (Math.random() - 0.5) * state.screenShake;
      }
      ctx.translate(-state.camera.x + sx, -state.camera.y + sy);

      const vx1 = state.camera.x - sx;
      const vy1 = state.camera.y - sy;
      const canvasW = canvas.width / state.cameraZoom;
      const canvasH = canvas.height / state.cameraZoom;
      const vx2 = vx1 + canvasW;
      const vy2 = vy1 + canvasH;

      // Draw Rooms Background
      state.rooms.forEach(room => {
        const cx = room.gridX * ROOM_WIDTH;
        const cy = room.gridY * ROOM_HEIGHT;
        const hw = ROOM_WIDTH / 2;
        const hh = ROOM_HEIGHT / 2;

        if (cx + hw < vx1 || cx - hw > vx2 || cy + hh < vy1 || cy - hh > vy2) {
            return;
        }

        ctx.fillStyle = room.visited ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.2)';
        ctx.fillRect(cx - hw, cy - hh, ROOM_WIDTH, ROOM_HEIGHT);

        // Draw Walls with 40px WALL_THICKNESS matching physical collisions
        const WALL_THICKNESS = 40;
        const ds = 200; // DOOR_SIZE is 200

        // Visual properties based on cleared status
        const wallFillColor = room.cleared ? '#131524' : '#2b0a0a'; // Dark deep violet vs dark crimson threat
        const strokeColor = room.cleared ? 'rgba(99, 102, 241, 0.9)' : 'rgba(239, 68, 68, 0.95)'; // Indigo neon vs bright red threat neon
        const innerGlow = room.cleared ? 'rgba(129, 140, 248, 0.3)' : 'rgba(248, 113, 113, 0.35)';

        ctx.fillStyle = wallFillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;

        // North Wall
        if (room.doors.North && room.cleared) {
            ctx.fillRect(cx - hw, cy - hh, hw - ds / 2, WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy - hh, hw - ds / 2, WALL_THICKNESS);
            ctx.fillRect(cx + ds / 2, cy - hh, hw - ds / 2, WALL_THICKNESS);
            ctx.strokeRect(cx + ds / 2, cy - hh, hw - ds / 2, WALL_THICKNESS);
        } else {
            ctx.fillRect(cx - hw, cy - hh, ROOM_WIDTH, WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy - hh, ROOM_WIDTH, WALL_THICKNESS);
        }

        // South Wall
        if (room.doors.South && room.cleared) {
            ctx.fillRect(cx - hw, cy + hh - WALL_THICKNESS, hw - ds / 2, WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy + hh - WALL_THICKNESS, hw - ds / 2, WALL_THICKNESS);
            ctx.fillRect(cx + ds / 2, cy + hh - WALL_THICKNESS, hw - ds / 2, WALL_THICKNESS);
            ctx.strokeRect(cx + ds / 2, cy + hh - WALL_THICKNESS, hw - ds / 2, WALL_THICKNESS);
        } else {
            ctx.fillRect(cx - hw, cy + hh - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy + hh - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);
        }

        // West Wall
        if (room.doors.West && room.cleared) {
            ctx.fillRect(cx - hw, cy - hh + WALL_THICKNESS, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy - hh + WALL_THICKNESS, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.fillRect(cx - hw, cy + ds / 2, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.strokeRect(cx - hw, cy + ds / 2, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
        } else {
            ctx.fillRect(cx - hw, cy - hh + WALL_THICKNESS, WALL_THICKNESS, ROOM_HEIGHT - WALL_THICKNESS * 2);
            ctx.strokeRect(cx - hw, cy - hh + WALL_THICKNESS, WALL_THICKNESS, ROOM_HEIGHT - WALL_THICKNESS * 2);
        }

        // East Wall
        if (room.doors.East && room.cleared) {
            ctx.fillRect(cx + hw - WALL_THICKNESS, cy - hh + WALL_THICKNESS, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.strokeRect(cx + hw - WALL_THICKNESS, cy - hh + WALL_THICKNESS, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.fillRect(cx + hw - WALL_THICKNESS, cy + ds / 2, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
            ctx.strokeRect(cx + hw - WALL_THICKNESS, cy + ds / 2, WALL_THICKNESS, hh - ds / 2 - WALL_THICKNESS);
        } else {
            ctx.fillRect(cx + hw - WALL_THICKNESS, cy - hh + WALL_THICKNESS, WALL_THICKNESS, ROOM_HEIGHT - WALL_THICKNESS * 2);
            ctx.strokeRect(cx + hw - WALL_THICKNESS, cy - hh + WALL_THICKNESS, WALL_THICKNESS, ROOM_HEIGHT - WALL_THICKNESS * 2);
        }

        // Draw Doors or Neon laser fields
        if (room.cleared) {
            // Unlocked gateways glow green/emerald
            ctx.fillStyle = 'rgba(52, 211, 153, 0.25)'; // Emerald gateway glow
            if (room.doors.North) ctx.fillRect(cx - ds / 2, cy - hh - 20, ds, WALL_THICKNESS + 40);
            if (room.doors.South) ctx.fillRect(cx - ds / 2, cy + hh - WALL_THICKNESS - 20, ds, WALL_THICKNESS + 40);
            if (room.doors.West) ctx.fillRect(cx - hw - 20, cy - ds / 2, WALL_THICKNESS + 40, ds);
            if (room.doors.East) ctx.fillRect(cx + hw - WALL_THICKNESS - 20, cy - ds / 2, WALL_THICKNESS + 40, ds);

            // Path indicator markings
            ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
            ctx.font = '800 24px Arial';
            ctx.textAlign = 'center';
            if (room.doors.North) ctx.fillText('⬆', cx, cy - hh + WALL_THICKNESS / 2 + 8);
            if (room.doors.South) ctx.fillText('⬇', cx, cy + hh - WALL_THICKNESS / 2 + 8);
            if (room.doors.West) ctx.fillText('⬅', cx - hw + WALL_THICKNESS / 2, cy + 8);
            if (room.doors.East) ctx.fillText('➡', cx + hw - WALL_THICKNESS / 2, cy + 8);
        } else {
            // Locked doors: Draw warning laser barriers
            ctx.fillStyle = 'rgba(239, 68, 68, 0.45)'; // Crimson alert fill
            if (room.doors.North) ctx.fillRect(cx - ds / 2, cy - hh, ds, WALL_THICKNESS);
            if (room.doors.South) ctx.fillRect(cx - ds / 2, cy + hh - WALL_THICKNESS, ds, WALL_THICKNESS);
            if (room.doors.West) ctx.fillRect(cx - hw, cy - ds / 2, WALL_THICKNESS, ds);
            if (room.doors.East) ctx.fillRect(cx + hw - WALL_THICKNESS, cy - ds / 2, WALL_THICKNESS, ds);

            // Draw laser barrier lines
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ef4444';
            if (room.doors.North) {
                ctx.strokeRect(cx - ds / 2, cy - hh, ds, WALL_THICKNESS);
                ctx.beginPath(); ctx.moveTo(cx - ds / 2, cy - hh + WALL_THICKNESS); ctx.lineTo(cx + ds / 2, cy - hh); ctx.stroke();
            }
            if (room.doors.South) {
                ctx.strokeRect(cx - ds / 2, cy + hh - WALL_THICKNESS, ds, WALL_THICKNESS);
                ctx.beginPath(); ctx.moveTo(cx - ds / 2, cy + hh); ctx.lineTo(cx + ds / 2, cy + hh - WALL_THICKNESS); ctx.stroke();
            }
            if (room.doors.West) {
                ctx.strokeRect(cx - hw, cy - ds / 2, WALL_THICKNESS, ds);
                ctx.beginPath(); ctx.moveTo(cx - hw, cy + ds / 2); ctx.lineTo(cx - hw + WALL_THICKNESS, cy - ds / 2); ctx.stroke();
            }
            if (room.doors.East) {
                ctx.strokeRect(cx + hw - WALL_THICKNESS, cy - ds / 2, WALL_THICKNESS, ds);
                ctx.beginPath(); ctx.moveTo(cx + hw - WALL_THICKNESS, cy + ds / 2); ctx.lineTo(cx + hw, cy - ds / 2); ctx.stroke();
            }
        }

        if (room.isBoss) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
            ctx.beginPath();
            ctx.arc(cx, cy, 300, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      if (state.isLobby) {
          // Warsztat
          ctx.save();
          ctx.translate(-80, 250);
          ctx.fillStyle = 'rgba(100, 100, 150, 0.4)';
          ctx.beginPath();
          ctx.roundRect(-60, -40, 120, 80, 10);
          ctx.fill();
          ctx.strokeStyle = 'rgba(150, 150, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '800 16px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('WARSZTAT', 0, 0);
          ctx.font = '600 10px "Inter", sans-serif';
          ctx.fillStyle = '#aaa';
          ctx.fillText(tx(tx("Podejdź, aby wejść")), 0, 20);
          ctx.restore();

          // Stół Alchemiczny
          ctx.save();
          ctx.translate(80, 250);
          ctx.fillStyle = 'rgba(150, 50, 150, 0.4)';
          ctx.beginPath();
          ctx.roundRect(-60, -40, 120, 80, 10);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '800 16px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ALCHEMIA', 0, 0);
          ctx.font = '600 10px "Inter", sans-serif';
          ctx.fillStyle = '#aaa';
          ctx.fillText(tx(tx("Podejdź, aby wejść")), 0, 20);
          ctx.restore();

          // Portal
          ctx.save();
          ctx.translate(0, -200);
          ctx.beginPath();
          ctx.arc(0, 0, 50, 0, Math.PI * 2);
          
          const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
          
          ctx.shadowColor = '#818cf8';
          ctx.shadowBlur = 20;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 4;
          ctx.stroke();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 0;
          ctx.fillText('ENTER DUNGEON', 0, -70);
          ctx.restore();
      }

      // Draw Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      const startX = Math.floor((state.camera.x - sx) / gridSize) * gridSize - gridSize;
      const endX = startX + canvas.width + gridSize * 2;
      const startY = Math.floor((state.camera.y - sy) / gridSize) * gridSize - gridSize;
      const endY = startY + canvas.height + gridSize * 2;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      const getAtomColor = (atom: string) => {
          switch(atom.toUpperCase()) {
              case 'H': return {fill: '#60a5fa', stroke: '#3b82f6'};
              case 'O': return {fill: '#f87171', stroke: '#ef4444'};
              case 'C': return {fill: '#94a3b8', stroke: '#64748b'};
              case 'N': return {fill: '#a78bfa', stroke: '#8b5cf6'};
              case 'S': return {fill: '#fde047', stroke: '#eab308'};
              case 'SI': return {fill: '#cbd5e1', stroke: '#94a3b8'};
              case 'RA': return {fill: '#8b5cf6', stroke: '#7c3aed'};
              case 'PO': return {fill: '#d946ef', stroke: '#c026d3'};
              case 'P': return {fill: '#fb923c', stroke: '#f97316'};
              case 'CL': return {fill: '#4ade80', stroke: '#22c55e'};
              case 'K': return {fill: '#c084fc', stroke: '#a855f7'};
              case 'MG': return {fill: '#fbbf24', stroke: '#f59e0b'};
              case 'CA': return {fill: '#e2e8f0', stroke: '#cbd5e1'};
              case 'SC': return {fill: '#c4b5fd', stroke: '#a78bfa'};
              case 'TI': return {fill: '#9ca3af', stroke: '#6b7280'};
              case 'FE': return {fill: '#b45309', stroke: '#92400e'};
              case 'AL': return {fill: '#cbd5e1', stroke: '#94a3b8'};
              case 'NA': return {fill: '#fcd34d', stroke: '#f59e0b'};
              case 'F': return {fill: '#a7f3d0', stroke: '#34d399'};
              case 'NE': return {fill: '#fca5a5', stroke: '#f87171'};
              case 'HE': return {fill: '#fef08a', stroke: '#facc15'};
              case 'LI': return {fill: '#fecaca', stroke: '#f87171'};
              case 'BE': return {fill: '#bbf7d0', stroke: '#4ade80'};
              case 'B': return {fill: '#fed7aa', stroke: '#fb923c'};
              default: return {fill: '#ffffff', stroke: '#ffffff'};
          }
      };

      // Drops (Electrons or Atoms)
      state.drops.forEach(d => {
         const r = d.size || 5;
         if (d.pos.x + r < vx1 || d.pos.x - r > vx2 || d.pos.y + r < vy1 || d.pos.y - r > vy2) {
             return;
         }

         const t = d.text || 'e⁻';
         if (d.isPortal) {
             const x = d.pos.x;
             const y = d.pos.y + Math.sin(performance.now()/300)*10;
             ctx.font = '50px Arial';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.shadowColor = '#8b5cf6';
             ctx.shadowBlur = 30 + Math.sin(performance.now()/150)*20;
             ctx.fillText('🌀', x, y);
             ctx.shadowBlur = 0;
         } else if (t === 'e⁻') {
             const c = d.color || '#fde047';
             ctx.fillStyle = c;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             const x = d.pos.x;
             const y = d.pos.y + Math.sin(performance.now()/150)*3;
             
             ctx.fillStyle = c;
             ctx.font = 'bold 16px monospace';
             ctx.shadowColor = c;
             ctx.shadowBlur = 10;
             ctx.fillText(t, x, y);
             ctx.fillText(t, x, y); // glow inner
         } else {
             // It's an atom
             const drawX = d.pos.x;
             const drawY = d.pos.y + Math.sin(performance.now()/150)*3;
             
             let r = 12;
             if (d.isProton) r = 14;
             else {
                 switch(t) {
                     case 'H': r = 5; break;
                     case 'O': r = 10; break;
                     case 'C': r = 9; break;
                     case 'N': r = 7; break;
                     case 'S': r = 10; break;
                     case 'Si': r = 12; break;
                     case 'P': r = 10; break;
                 }
             }

             ctx.beginPath();
             ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
             
             if (d.isProton) {
                 ctx.fillStyle = d.color || '#a855f7';
                 ctx.strokeStyle = '#d8b4fe';
                 ctx.fill();
                 ctx.lineWidth = 2;
                 ctx.stroke();
                 ctx.fillStyle = '#fff';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.font = 'bold 14px monospace';
                 ctx.shadowBlur = 0;
                 ctx.fillText(t, drawX, drawY);
             } else {
                 const color = getAtomColor(t);
                 ctx.fillStyle = color.fill;
                 ctx.strokeStyle = color.stroke;
                 ctx.fill();
                 ctx.lineWidth = Math.max(1, r * 0.15);
                 ctx.stroke();

                 ctx.fillStyle = '#fff';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.font = 'bold 9px monospace';
                 ctx.shadowBlur = 0;
                 ctx.fillText(t, drawX, drawY);
             }
         }
      });

      // Particles
      state.particles.forEach(p => {
        if (p.pos.x + p.size < vx1 || p.pos.x - p.size > vx2 || p.pos.y + p.size < vy1 || p.pos.y - p.size > vy2) {
            return;
        }

        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, p.size * 0.8);
        ctx.lineCap = 'round';
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        const velLen = Math.hypot(p.vel.x, p.vel.y);
        const drawLen = Math.min(30, velLen * 0.1 + p.size); 
        const nx = velLen === 0 ? 0 : p.vel.x / velLen;
        const ny = velLen === 0 ? 0 : p.vel.y / velLen;
        ctx.moveTo(p.pos.x, p.pos.y);
        ctx.lineTo(p.pos.x - nx * drawLen, p.pos.y - ny * drawLen);
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      const currentRoomInfo = state.rooms?.find(r => r.gridX === state.currentRoom.x && r.gridY === state.currentRoom.y);
      if (!state.isLobby && currentRoomInfo?.isMercenary) {
          const rX = currentRoomInfo.gridX * 1000;
          const rY = currentRoomInfo.gridY * 1050; 
          ctx.save();
          ctx.translate(rX, rY);
          ctx.fillStyle = 'rgba(50, 120, 50, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, 80, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🐾 Najemnicy', 0, -10);
          ctx.font = '14px Arial';
          ctx.fillText(tx(tx("(Kliknij w środku aby wejść)")), 0, 15);
          ctx.restore();
      }

      // Enemies
      state.enemies.forEach(e => {
        if (e.pos.x + e.radius < vx1 || e.pos.x - e.radius > vx2 || e.pos.y + e.radius < vy1 || e.pos.y - e.radius > vy2) {
            return;
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(e.pos.x, e.pos.y + e.radius*0.8, e.radius, 0, Math.PI * 2);
        ctx.fill();

        if (e.type === 'C3Wall') {
            ctx.fillStyle = '#1e293b'; // Ciemny grafit
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2, 8);
            } else {
                ctx.rect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2);
            }
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('C₃ GRAFIT', e.pos.x, e.pos.y);
            return;
        }

        if (e.type === 'WoodWall') {
            ctx.fillStyle = '#78350f'; // Dark brown
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2, 4);
            } else {
                ctx.rect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2);
            }
            ctx.fill();
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw some wood grain lines
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(e.pos.x - e.radius/2, e.pos.y - e.radius + 5);
            ctx.lineTo(e.pos.x - e.radius/2, e.pos.y + e.radius - 5);
            ctx.moveTo(e.pos.x + e.radius/2, e.pos.y - e.radius + 5);
            ctx.lineTo(e.pos.x + e.radius/2, e.pos.y + e.radius - 5);
            ctx.stroke();
            
            ctx.fillStyle = '#fef3c7';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DREWNO', e.pos.x, e.pos.y);
            return;
        }

        if (e.type === 'C6Wall') {
            // Textured Diamond
            const grad = ctx.createLinearGradient(e.pos.x - e.radius, e.pos.y - e.radius, e.pos.x + e.radius, e.pos.y + e.radius);
            grad.addColorStop(0, '#e0f2fe');
            grad.addColorStop(0.5, '#bae6fd');
            grad.addColorStop(1, '#7dd3fc');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(e.pos.x, e.pos.y - e.radius);
            ctx.lineTo(e.pos.x + e.radius, e.pos.y);
            ctx.lineTo(e.pos.x, e.pos.y + e.radius);
            ctx.lineTo(e.pos.x - e.radius, e.pos.y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(e.pos.x - e.radius/2, e.pos.y - e.radius/2);
            ctx.lineTo(e.pos.x + e.radius/2, e.pos.y + e.radius/2);
            ctx.stroke();
            
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('C₆ DIAMENT', e.pos.x, e.pos.y);
            return;
        }

        if (e.type === 'Fe3CWall' || e.type === 'Fe2O3Wall') {
            ctx.fillStyle = e.type === 'Fe3CWall' ? '#475569' : '#9a3412';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2, 2);
            } else {
                ctx.rect(e.pos.x - e.radius, e.pos.y - e.radius, e.radius*2, e.radius*2);
            }
            ctx.fill();
            ctx.strokeStyle = e.type === 'Fe3CWall' ? '#1e293b' : '#431407';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.type === 'Fe3CWall' ? 'Fe₃C STAL' : 'Fe₂O₃ RDZA', e.pos.x, e.pos.y);
            return;
        }

        ctx.save();
        ctx.translate(e.pos.x, e.pos.y);
        
        // Radioactive Auras from accumulated atoms
        const raCount = e.atoms.Ra || 0;
        const poCount = e.atoms.Po || 0;
        if (raCount > 0 || poCount > 0) {
            const auraRadius = 150 + (raCount + poCount) * 20;
            const pulse = 1.0 + 0.1 * Math.sin(performance.now() / 150);
            
            ctx.beginPath();
            ctx.arc(0, 0, auraRadius * pulse, 0, Math.PI * 2);
            if (raCount > 0 && poCount > 0) {
                ctx.fillStyle = 'rgba(217, 70, 239, 0.15)'; // mixed pink
                ctx.strokeStyle = 'rgba(217, 70, 239, 0.4)';
            } else if (raCount > 0) {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.15)'; // Ra purple
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
            } else {
                ctx.fillStyle = 'rgba(192, 38, 211, 0.15)'; // Po fuchsia
                ctx.strokeStyle = 'rgba(192, 38, 211, 0.4)';
            }
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 15]);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
        }

        let scale = 1;
        let rot = 0.05 * Math.sin(performance.now() / 300);

        if (e.type === 'Celery') {
            // Aggressive pulsing and rotating for Celery Boss
            scale = 1 + 0.15 * Math.sin(performance.now() / 150);
            rot = 0.2 * Math.sin(performance.now() / 100);
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 20 + 10 * Math.sin(performance.now() / 100);
        } else if (e.type === 'Durian') {
            const spikes = 16;
            ctx.fillStyle = '#65a30d'; // Olive green
            ctx.beginPath();
            for(let i=0; i<spikes; i++) {
                const ang = (i / spikes) * Math.PI * 2 + performance.now()/1000;
                const rad = e.radius + (i%2===0 ? 15 : -5);
                const x = Math.cos(ang) * rad;
                const y = Math.sin(ang) * rad;
                if (i===0) ctx.moveTo(x,y);
                else ctx.lineTo(x,y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#4d7c0f';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Core
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(0, 0, e.radius/2, 0, Math.PI*2);
            ctx.fill();
            
            // Radioactive glow
            ctx.shadowColor = '#84cc16';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#bef264';
            ctx.stroke();
            ctx.shadowBlur = 0;
            
        } else if (e.type === 'GiantTree') {
             scale = 1 + 0.05 * Math.sin(performance.now() / 400);
             ctx.scale(scale, scale);
             ctx.fillStyle = '#451a03'; // Bark
             ctx.beginPath();
             ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
             ctx.fill();
             
             ctx.strokeStyle = '#78350f';
             ctx.lineWidth = 4;
             ctx.beginPath();
             for(let i=0; i<5; i++) {
                 ctx.moveTo((Math.random()-0.5)*e.radius, (Math.random()-0.5)*e.radius);
                 ctx.lineTo((Math.random()-0.5)*e.radius*1.5, (Math.random()-0.5)*e.radius*1.5);
             }
             ctx.stroke();
             
             ctx.fillStyle = '#15803d'; // Leaves canopy
             ctx.globalAlpha = 0.8;
             for(let a=0; a<Math.PI*2; a+=Math.PI/3) {
                 ctx.beginPath();
                 ctx.arc(Math.cos(a)*e.radius*0.6, Math.sin(a)*e.radius*0.6, e.radius*0.5, 0, Math.PI*2);
                 ctx.fill();
             }
             ctx.globalAlpha = 1.0;
        } else if (e.type === 'Patozwiazek') {
             scale = 1 + 0.1 * Math.sin(performance.now() / 150);
             ctx.scale(scale, scale);
             
             // Chaotic glitchy outer ring
             for(let i=0; i<8; i++) {
                 ctx.fillStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
                 ctx.beginPath();
                 ctx.arc(Math.cos(i)*e.radius*0.8, Math.sin(i)*e.radius*0.8, 20 + Math.random()*15, 0, Math.PI*2);
                 ctx.fill();
             }
             
             ctx.fillStyle = '#111';
             ctx.beginPath();
             ctx.arc(0, 0, e.radius * 0.7, 0, Math.PI * 2);
             ctx.fill();
             
             ctx.fillStyle = '#fff';
             ctx.font = 'bold 30px "Jetbrains Mono"';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('PATO', 0, -10);
             ctx.fillText(tx(tx("ZWIĄZEK")), 0, 20);
        } else if (e.type === 'Root') {
             ctx.fillStyle = '#78350f'; 
             ctx.beginPath();
             ctx.moveTo(e.radius, 0);
             ctx.lineTo(-e.radius, e.radius/2);
             ctx.lineTo(-e.radius, -e.radius/2);
             ctx.fill();
        } else if (e.type === 'Hogweed') {
            // Looming Boss effect
            scale = 1 + 0.05 * Math.sin(performance.now() / 300);
            rot = 0.05 * Math.sin(performance.now() / 400);
            ctx.shadowColor = '#16a34a';
            ctx.shadowBlur = 25;
            ctx.translate(0, 10 * Math.sin(performance.now() / 200)); // Floating
        } else if (e.type === 'SnakeGourdHead') {
            // Looming Boss effect
            scale = 1 + 0.05 * Math.sin(performance.now() / 300);
            rot = 0.05 * Math.sin(performance.now() / 400);
            ctx.shadowColor = '#65a30d';
            ctx.shadowBlur = 25;
        }

        if (e.isAnomaly) {
            ctx.shadowColor = '#eab308'; // Yellow/gold glow
            ctx.shadowBlur = 20;
            // Glitch effect offset
            if (Math.random() < 0.2) {
                ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            }
        }

        ctx.rotate(rot);
        ctx.scale(scale, scale);

        if (e.type === 'SnakeGourdHead' || e.type === 'SnakeGourdSegment') {
            // Draw a snake gourd with 4 eyes (only for head, segments get 1 or none)
            ctx.fillStyle = '#65a30d'; // Gourd green
            ctx.beginPath();
            ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3f6212';
            ctx.lineWidth = 4;
            // Stripes
            ctx.beginPath();
            ctx.ellipse(0, 0, e.radius * 0.5, e.radius * 0.9, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            if (e.type === 'SnakeGourdHead') {
                // 4 Eyes
                ctx.fillStyle = '#ef4444'; // Red eyes
                const eyeYPositions = [-e.radius*0.6, -e.radius*0.2, e.radius*0.2, e.radius*0.6];
                for(let ey of eyeYPositions) {
                    ctx.beginPath();
                    ctx.ellipse(e.radius*0.3, ey, e.radius * 0.2, e.radius * 0.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000000'; // Pupil
                    ctx.beginPath();
                    ctx.arc(e.radius*0.35, ey, e.radius * 0.05, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ef4444'; // Reset red for next eye
                }
            } else {
                // simple segment pattern
                ctx.beginPath();
                ctx.moveTo(-e.radius, 0);
                ctx.lineTo(e.radius, 0);
                ctx.stroke();
            }
        } else if (e.type === 'Hogweed' || e.type === 'HogweedChild') {
            ctx.font = `${e.radius * 2 * (e.type === 'Hogweed' ? 1.0 : 0.8)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌿', 0, 0); 
            // Add toxic haze
            ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, e.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.font = `${e.radius * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let emoji = '🥦';
            if (e.type === 'Carrot') emoji = '🥕';
            if (e.type === 'Tomato') emoji = '🍅';
            if (e.type === 'Onion') emoji = '🧅';
            if (e.type === 'Cactus') emoji = '🌵';
            if (e.type === 'Mushroom') emoji = '🍄';
            if (e.type === 'Venus') emoji = '🌺';
            if (e.type === 'Celery') emoji = '🥬';
            if (e.type === 'PoliceCat' as any) emoji = '🐱';
            ctx.fillText(emoji, 0, 0); // draw at 0,0 since we translated
        }

        if (e.type === 'PoliceCat' as any) {
            // Draw French Baguette 🥖 behind/under the cat
            ctx.font = `${e.radius * 2}px Arial`;
            ctx.fillText('🥖', -e.radius * 0.4, e.radius * 0.6);

            // Draw cartoonish Mustache (czarne wąsy)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-2, 4);
            ctx.quadraticCurveTo(-8, 8, -14, 3);
            ctx.moveTo(2, 4);
            ctx.quadraticCurveTo(8, 8, 14, 3);
            ctx.stroke();

            // Draw cool Sunglasses (czarne okulary przeciwsłoneczne)
            ctx.fillStyle = '#111827';
            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
                (ctx as any).roundRect(-12, -8, 10, 7, 2);
                (ctx as any).roundRect(2, -8, 10, 7, 2);
            } else {
                ctx.rect(-12, -8, 10, 7);
                ctx.rect(2, -8, 10, 7);
            }
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(-3, -5);
            ctx.lineTo(3, -5);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#111827';
            ctx.stroke();

            // Slower glowing and pulsing red/blue siren light above cat head (troszeczke wolniej/bardziej widoczne)
            const sirenPulse = performance.now() / 450; 
            const isSirenRed = Math.floor(sirenPulse) % 2 === 0;
            ctx.save();
            ctx.translate(0, -e.radius * 0.9);
            ctx.fillStyle = isSirenRed ? '#ef4444' : '#3b82f6';
            ctx.shadowColor = isSirenRed ? '#ef4444' : '#3b82f6';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, -10, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Siren black stand base
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-4, -4, 8, 4);
            ctx.restore();
        }

        ctx.restore();
        ctx.shadowBlur = 0; // Prevent leak to text/UI

        // Status effects
        if (e.status.frozenTimer > 0) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.beginPath(); ctx.arc(e.pos.x, e.pos.y, e.radius + 5, 0, Math.PI*2); ctx.fill();
        }

        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        const formatAtoms = (key: string) => key.replace(/\d/g, m => '₀₁₂₃₄₅₆₇₈₉'[parseInt(m)]);
        const atxt = Object.entries(e.atoms).filter(([_,v])=>(v as number)>0).map(([k,v])=>`${formatAtoms(k)}: ${v}`).join(' + ');
        if (atxt) {
           ctx.fillText(atxt, e.pos.x, e.pos.y - e.radius - 15);
        }

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(e.pos.x - 20, e.pos.y - e.radius - 30, 40, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(e.pos.x - 20, e.pos.y - e.radius - 30, 40 * (e.hp / e.maxHp), 5);
      });

      // Player
      const p = state.player;
      ctx.globalAlpha = p.isDashing ? 0.5 : 1.0;
      if (!p.isDashing && p.iFrameTimer && p.iFrameTimer > 0) {
          ctx.globalAlpha = Math.floor(performance.now() / 100) % 2 === 0 ? 0.2 : 0.9;
      }
      if (p.invincibilityTimer && p.invincibilityTimer > 0) {
          ctx.globalAlpha = 1.0; // Overrides iframes
      }

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y + p.radius*0.8, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Starman trail
      if (p.invincibilityTimer && p.invincibilityTimer > 0) {
          const t = performance.now();
          ctx.save();
          ctx.translate(p.pos.x, p.pos.y);
          ctx.rotate(t / 200);
          ctx.fillStyle = `hsl(${(t / 5) % 360}, 100%, 50%)`;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
              ctx.lineTo(Math.cos(i * 4 * Math.PI / 5) * 40, Math.sin(i * 4 * Math.PI / 5) * 40);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
      }

      // Player & Companion Body
      const entitiesToDraw: { id: string, px: number, py: number, facing: number, isComp: boolean, isNet: boolean, nick: string, hp?: number, maxHp?: number, isDead?: boolean, deadTimer?: number }[] = [
          { id: state.selectedCharacter, px: p.pos.x, py: p.pos.y, facing: p.facing, isComp: false, isNet: false, nick: localStorage.getItem('lanNick') || 'Player', isDead: p.isDead, deadTimer: p.deadTimer }
      ];
      if (state.networkPlayers) {
          state.networkPlayers.forEach((np: any) => {
              if (np && np.pos && np.char) {
                  entitiesToDraw.push({ id: np.char, px: np.pos.x, py: np.pos.y, facing: 1, isComp: false, isNet: true, nick: np.nick || 'Player', hp: np.hp, maxHp: np.maxHp, isDead: np.isDead, deadTimer: np.deadTimer });
              }
          });
      }
      if (state.companion && (!state.networkPlayers || state.networkPlayers.length < 3)) {
          entitiesToDraw.push({
              id: state.companion, 
              px: p.pos.x + Math.cos(performance.now()/500)*40, 
              py: p.pos.y + Math.sin(performance.now()/500)*40, 
              facing: p.facing, 
              isComp: true,
              isNet: false,
              nick: ''
          });
      }

      entitiesToDraw.forEach(entity => {
          ctx.save();
          if (entity.isDead) {
              ctx.globalAlpha = 0.5;
              // Make them gray scale
              ctx.filter = 'grayscale(100%)';
          } else if (!entity.isNet && !entity.isComp) {
              if (p.isDashing) ctx.globalAlpha = 0.5;
              else if (p.iFrameTimer && p.iFrameTimer > 0) ctx.globalAlpha = Math.floor(performance.now() / 100) % 2 === 0 ? 0.2 : 0.9;
              
              if (p.invincibilityTimer && p.invincibilityTimer > 0) {
                  ctx.globalAlpha = 1.0;
                  ctx.filter = `saturate(200%) hue-rotate(${(performance.now()/5)%360}deg)`;
              }
          }
          ctx.translate(entity.px, entity.py);
          if (entity.isComp) {
              ctx.translate(0, Math.sin(performance.now()/200)*2);
              ctx.scale(0.8, 0.8);
          }
          ctx.scale(entity.facing, 1);

          // Tail
          const char = entity.id;
          const isBlackCat = char === 'black_cat';
          const isBohrCat = char === 'bohr_cat';
          
          ctx.beginPath();
          ctx.moveTo(-8, 15);
          const tailWiggle = Math.sin(performance.now() / 200) * 5;
          ctx.quadraticCurveTo(-25, 20, -15 + tailWiggle, 30 + tailWiggle);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#f97316'; // orange cat tail
      if (isBlackCat) ctx.strokeStyle = '#1e293b';
      if (isBohrCat) ctx.strokeStyle = '#1e3a8a';
      ctx.stroke();
      
      // Spacesuit / Scientist Lab Coat Torso
      if (isBlackCat) {
          // Amedeo Avo-gatto: 18th century high collar jacket
          ctx.fillStyle = '#111827'; // Dark charcoal coat
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(-10, 5, 20, 18, 5);
          } else {
              ctx.rect(-10, 5, 20, 18);
          }
          ctx.fill();

          // High collar
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(-6, 3, 12, 4);

          // White cravat/shirt sticking out
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-3, 6);
          ctx.lineTo(-4, 14);
          ctx.lineTo(4, 14);
          ctx.lineTo(3, 6);
          ctx.closePath();
          ctx.fill();
          
          // Tiny gold buttons on coat
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(-4, 11, 1.5, 0, Math.PI * 2);
          ctx.arc(4, 11, 1.5, 0, Math.PI * 2);
          ctx.arc(-4, 17, 1.5, 0, Math.PI * 2);
          ctx.arc(4, 17, 1.5, 0, Math.PI * 2);
          ctx.fill();
      } else if (isBohrCat) {
          // Niels Bohrr: Classic elegant navy suit with a red tie
          ctx.fillStyle = '#1e3a8a'; // Elegant navy suit
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(-11, 5, 22, 18, 4);
          } else {
              ctx.rect(-11, 5, 22, 18);
          }
          ctx.fill();

          // White shirt collar
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-6, 5);
          ctx.lineTo(-8, 12);
          ctx.lineTo(0, 13);
          ctx.lineTo(8, 12);
          ctx.lineTo(6, 5);
          ctx.closePath();
          ctx.fill();

          // Sleek red necktie
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(-1.8, 11);
          ctx.lineTo(1.8, 11);
          ctx.lineTo(2.5, 22);
          ctx.lineTo(0, 24);
          ctx.lineTo(-2.5, 22);
          ctx.closePath();
          ctx.fill();
      } else if (char === 'curie_cat') {
          // Miauria Purrie Miałkowska: elegant vintage black dress with ruffles
          ctx.fillStyle = '#0f172a'; // Deep charcoal/black vintage dress
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(-12, 5, 24, 22, 6);
          } else {
              ctx.rect(-12, 5, 24, 22);
          }
          ctx.fill();
          
          // Dress ruffles (chest pattern)
          ctx.strokeStyle = '#283245';
          ctx.lineWidth = 1;
          for(let i=0; i<4; i++) {
              ctx.beginPath();
              ctx.moveTo(-8, 10 + i * 3);
              ctx.quadraticCurveTo(0, 12 + i * 3, 8, 10 + i * 3);
              ctx.stroke();
          }
          
          // High collar
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.rect(-6, 3, 12, 4);
          ctx.fill();

          // Pearl necklace
          ctx.fillStyle = '#f8fafc';
          for(let i=0; i<=4; i++) {
              ctx.beginPath();
              ctx.arc(-6 + i*3, 7 + (i===2 ? 1 : 0), 1.5, 0, Math.PI * 2);
              ctx.fill();
          }
          
          // Holding a glowing flask in paw
          ctx.save();
          ctx.translate(14, 12); // Front paw position
          
          // Paw (White cat)
          ctx.beginPath();
          ctx.arc(-2, 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          // Flask
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-2, -6);
          ctx.lineTo(2, -6);
          ctx.lineTo(2, -2);
          ctx.lineTo(6, 4);
          ctx.lineTo(6, 8);
          ctx.lineTo(-6, 8);
          ctx.lineTo(-6, 4);
          ctx.lineTo(-2, -2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Glowing liquid
          ctx.fillStyle = '#8b5cf6';
          ctx.shadowColor = '#6d28d9';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(-5, 5);
          ctx.lineTo(5, 5);
          ctx.lineTo(5, 7.5);
          ctx.lineTo(-5, 7.5);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
      } else {
          ctx.fillStyle = '#cbd5e1'; // gray suit coat
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(-11, 5, 22, 18, 4);
          } else {
              ctx.rect(-11, 5, 22, 18);
          }
          ctx.fill();
          
          // White shirt collar beneath the head
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-6, 5);
          ctx.lineTo(-9, 13);
          ctx.lineTo(0, 15);
          ctx.lineTo(9, 13);
          ctx.lineTo(6, 5);
          ctx.closePath();
          ctx.fill();

          // Nobel Bowtie
          ctx.fillStyle = '#dc2626'; // Red bowtie
          ctx.beginPath();
          // Left wing
          ctx.moveTo(-4, 9);
          ctx.lineTo(-1, 11);
          ctx.lineTo(-4, 13);
          // Right wing
          ctx.moveTo(4, 9);
          ctx.lineTo(1, 11);
          ctx.lineTo(4, 13);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.arc(0, 11, 1.8, 0, Math.PI * 2);
          ctx.fill();
      }

      // Cat Head
      if (isBlackCat) {
          // Amedeo Avo-gatto: Black coat, prominent nose, large deep-set eyes, and bushy mutton chops
          ctx.save();
          ctx.filter = 'grayscale(100%) contrast(140%) brightness(30%)';
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐱', 0, -5);
          ctx.restore();

          // 1. Receding baldish peach hairline crown for accuracy
          ctx.fillStyle = '#fed7aa'; // light peach crown
          ctx.beginPath();
          ctx.arc(0, -11, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Sparse hairs on his crown
          ctx.strokeStyle = '#2d3748';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-2, -14);
          ctx.lineTo(-3, -11);
          ctx.moveTo(2, -14);
          ctx.lineTo(3, -12);
          ctx.stroke();

          // 2. Long fluffy historic mutton chop sideburns down cheeks as seen in portraits!
          ctx.fillStyle = '#f8fafc'; // fluffy white/grey hair
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.8;
          // Left mutton chops
          ctx.beginPath();
          ctx.arc(-13, -3, 4.5, 0, Math.PI * 2);
          ctx.arc(-14, -8, 3.5, 0, Math.PI * 2);
          ctx.arc(-11, 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Right mutton chops
          ctx.beginPath();
          ctx.arc(13, -3, 4.5, 0, Math.PI * 2);
          ctx.arc(14, -8, 3.5, 0, Math.PI * 2);
          ctx.arc(11, 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 3. Very prominent long pointy snout and nose
          ctx.fillStyle = '#1e293b'; // snout area
          ctx.beginPath();
          ctx.ellipse(0, -1, 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a'; // pointed black nose tip
          ctx.beginPath();
          ctx.moveTo(0, -2);
          ctx.lineTo(-2.5, 1);
          ctx.lineTo(2.5, 1);
          ctx.closePath();
          ctx.fill();

          // 4. Large heavy deep-set dark circular eyes
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(-5, -6, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(5, -6, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Heavy eyelids/eyebrows
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-8, -10);
          ctx.lineTo(-2, -9);
          ctx.moveTo(8, -10);
          ctx.lineTo(2, -9);
          ctx.stroke();
      } else if (isBohrCat) {
          // Niels Bohrr: Slate blue scientist cat with neat parted gray hair and smart spectacles
          ctx.save();
          ctx.filter = 'grayscale(100%) brightness(75%) contrast(110%)';
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐱', 0, -5);
          ctx.restore();

          // 1. Neatly combed and partitioned gray-brown physicist hair on top
          ctx.fillStyle = '#78716c'; // stone gray-brown
          ctx.strokeStyle = '#57534e';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(-3, -13, 5, 0, Math.PI * 2);
          ctx.arc(3, -12, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 2. Thick, prominent eyebrows sloping slightly in
          ctx.strokeStyle = '#1c1917';
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';
          ctx.beginPath();
          // Left eyebrow
          ctx.moveTo(-8, -10);
          ctx.lineTo(-3, -9);
          // Right eyebrow
          ctx.moveTo(8, -10);
          ctx.lineTo(3, -9);
          ctx.stroke();

          // 3. Circular silver wire scholarly spectacles (classic 20th century academic)
          ctx.strokeStyle = '#e2e8f0'; // silver steel
          ctx.lineWidth = 1.2;
          // Left ring
          ctx.beginPath();
          ctx.arc(-5.5, -6, 4.8, 0, Math.PI * 2);
          ctx.stroke();
          // Right ring
          ctx.beginPath();
          ctx.arc(5.5, -6, 4.8, 0, Math.PI * 2);
          ctx.stroke();
          // Bridge
          ctx.beginPath();
          ctx.moveTo(-0.7, -6);
          ctx.lineTo(0.7, -6);
          ctx.stroke();

          // 4. Glowing mini atomic electron orbit rotating around the cat head! (Super cute!)
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)'; // cyan ring
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(0, -6, 17, 6, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
          
          // Rotating tiny cyan glowing electron particle
          const time = performance.now() / 300; // slow beautiful orbit
          const ex = Math.cos(time) * 17;
          const ey = Math.sin(time) * 6;
          // Rotate coordinates by 30 deg (Math.PI / 6)
          const rx = ex * Math.cos(Math.PI / 6) - ey * Math.sin(Math.PI / 6);
          const ry = ex * Math.sin(Math.PI / 6) + ey * Math.cos(Math.PI / 6);
          
          ctx.fillStyle = '#22d3ee'; // bright cyan neon dot
          ctx.beginPath();
          ctx.arc(rx, -6 + ry, 2, 0, Math.PI * 2);
          ctx.fill();
      } else if (char === 'curie_cat') {
          // Miauria Purrie Miałkowska: White cat face, Vintage grey hair, no green eyes
          ctx.save();
          
          // White cat face
          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.arc(0, -6, 11, 0, Math.PI * 2); // head
          ctx.fill();
          // Ears
          ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-12, -20); ctx.lineTo(-3, -15); ctx.fill();
          ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(12, -20); ctx.lineTo(3, -15); ctx.fill();
          // Pink inner ears
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath(); ctx.moveTo(-8, -13); ctx.lineTo(-11, -18); ctx.lineTo(-4, -14); ctx.fill();
          ctx.beginPath(); ctx.moveTo(8, -13); ctx.lineTo(11, -18); ctx.lineTo(4, -14); ctx.fill();
          // Eyes (normal black)
          ctx.fillStyle = '#000000';
          ctx.beginPath(); ctx.arc(-4, -7, 1.5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(4, -7, 1.5, 0, Math.PI*2); ctx.fill();
          // Nose
          ctx.fillStyle = '#f472b6';
          ctx.beginPath(); ctx.arc(0, -3, 1.5, 0, Math.PI*2); ctx.fill();
          
          ctx.restore();

          // Vintage 19th century swept grey hair / bun
          ctx.fillStyle = '#64748b'; // grey/salt-and-pepper
          ctx.beginPath();
          // Main hair sweep
          ctx.arc(0, -13, 8, 0, Math.PI * 2);
          ctx.arc(-7, -11, 6, 0, Math.PI * 2);
          ctx.arc(7, -11, 6, 0, Math.PI * 2);
          // Large low bun at back
          ctx.arc(-9, -15, 5, 0, Math.PI * 2);
          ctx.arc(9, -15, 5, 0, Math.PI * 2);
          ctx.arc(0, -19, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Hair highlights
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          for (let i=-5; i<=5; i+=3) {
              ctx.beginPath();
              ctx.moveTo(i, -13);
              ctx.lineTo(i + (Math.random()*2-1), -19);
              ctx.stroke();
          }
      } else if (char === 'mendelejew') {
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = '#94a3b8';
          ctx.arc(0, -6, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-12, -20); ctx.lineTo(-3, -15); ctx.fill();
          ctx.beginPath(); ctx.moveTo(8, -12); ctx.lineTo(12, -20); ctx.lineTo(3, -15); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(0, 2, 9, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(-5, 0, 7, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(5, 0, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath(); ctx.arc(-4, -7, 1.5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(4, -7, 1.5, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(-4, -7, 3, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.arc(4, -7, 3, 0, Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-1, -7); ctx.lineTo(1, -7); ctx.stroke();
          ctx.restore();
      } else {
          // KINUS MIAULING GINGER SCIENTIST CAT
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐱', 0, -5);

          // 1. Receding light orange-peach bald forehead
          ctx.fillStyle = '#fed7aa'; // light peach
          ctx.beginPath();
          ctx.arc(0, -13, 6, 0, Math.PI * 2);
          ctx.fill();
          // Thin orange forehead boundary
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Wispy grey receding hair strands on top of the bald forehead
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-3, -15);
          ctx.quadraticCurveTo(-1, -17, 1, -16);
          ctx.moveTo(-2, -17);
          ctx.quadraticCurveTo(1, -18, 3, -17);
          ctx.stroke();

          // 2. Wavy white/grey fluffy sideburn hair clumps on ears/cheeks
          ctx.fillStyle = '#f1f5f9';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.8;
          // Left fluffy hair sideburns
          ctx.beginPath();
          ctx.arc(-13, -5, 4.5, 0, Math.PI * 2);
          ctx.arc(-14, -10, 3.5, 0, Math.PI * 2);
          ctx.arc(-12, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Right fluffy hair sideburns
          ctx.beginPath();
          ctx.arc(13, -5, 4.5, 0, Math.PI * 2);
          ctx.arc(14, -10, 3.5, 0, Math.PI * 2);
          ctx.arc(12, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 3. Thick scholarly grey eyebrows sloping inwards
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          // Left eyebrow
          ctx.moveTo(-8, -10);
          ctx.lineTo(-3, -9);
          // Right eyebrow
          ctx.moveTo(8, -10);
          ctx.lineTo(3, -9);
          ctx.stroke();

          // 4. Intelligence Glasses (Gold circular wire-frames)
          ctx.strokeStyle = '#eab308'; // retro golden
          ctx.lineWidth = 1;
          // Left glass ring
          ctx.beginPath();
          ctx.arc(-6, -6, 5, 0, Math.PI * 2);
          ctx.stroke();
          // Right glass ring
          ctx.beginPath();
          ctx.arc(6, -6, 5, 0, Math.PI * 2);
          ctx.stroke();
          // Gold bridge line connecting them
          ctx.beginPath();
          ctx.moveTo(-1, -6);
          ctx.lineTo(1, -6);
          ctx.stroke();
      }

      // Astronaut helmet
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, -6, p.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isBohrCat) {
          // Tesla Coils on Bohr's helmet!
          ctx.strokeStyle = '#64748b'; // metal
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          // Left coil base
          ctx.moveTo(-8, -25);
          ctx.lineTo(-12, -40);
          // Right coil base
          ctx.moveTo(8, -25);
          ctx.lineTo(12, -40);
          ctx.stroke();
          
          // Coil wrappings
          ctx.strokeStyle = '#f59e0b'; // copper orange
          ctx.lineWidth = 1;
          for(let i=0; i<4; i++) {
              ctx.beginPath();
              ctx.moveTo(-15 + i*0.5, -28 - i*3);
              ctx.lineTo(-9 + i*0.5, -30 - i*3);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(9 - i*0.5, -30 - i*3);
              ctx.lineTo(15 - i*0.5, -28 - i*3);
              ctx.stroke();
          }
          // Coil tops glowing
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(-12, -42, 3, 0, Math.PI * 2);
          ctx.arc(12, -42, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Sparks between coils occasionally
          if (Math.floor(performance.now() / 100) % 10 < 3) {
              ctx.strokeStyle = '#60a5fa';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(-9, -42);
              ctx.lineTo(0, -42 + (Math.random() * 8 - 4));
              ctx.lineTo(9, -42);
              ctx.stroke();
          }
      }

      ctx.restore();
      
      // Draw Nick Above
      if (entity.nick) {
          ctx.save();
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = entity.isNet ? '#10b981' : '#f8fafc';
          if (entity.isDead) ctx.fillStyle = '#64748b';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 4;
          let ny = entity.py - 45;
          if (entity.id === 'curie_cat') ny -= 10;
          ctx.fillText(entity.nick, entity.px, ny);
          if (entity.isDead && entity.deadTimer !== undefined) {
              ctx.font = 'bold 10px sans-serif';
              ctx.fillStyle = '#ef4444';
              ctx.fillText(`☠️ ${Math.ceil(entity.deadTimer)}s`, entity.px, ny - 15);
          }
          ctx.restore();
      }
      
      // Draw revive timer if actively reviving someone else (only for local player)
      if (!entity.isNet && !entity.isComp && engine.state.reviveTimer && engine.state.reviveTimer > 0) {
          ctx.save();
          ctx.fillStyle = '#00000088';
          ctx.fillRect(entity.px - 30, entity.py + 30, 60, 6);
          ctx.fillStyle = '#22c55e';
          const pct = Math.min(1.0, engine.state.reviveTimer / 4.0);
          ctx.fillRect(entity.px - 30, entity.py + 30, 60 * pct, 6);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.strokeRect(entity.px - 30, entity.py + 30, 60, 6);
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText("Odradzanie...", entity.px, entity.py + 45);
          ctx.restore();
      }
      
      // Draw HP Bar if Net Player
      if (entity.isNet && entity.hp !== undefined && entity.maxHp !== undefined && !entity.isDead) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(entity.px - 20, entity.py - 30, 40, 5);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(entity.px - 20, entity.py - 30, 40 * (entity.hp / entity.maxHp), 5);
      }
      });

      // Active Shield Indicator
      if (state.activeShield > 0) {
          ctx.beginPath();
          ctx.arc(p.pos.x, p.pos.y, p.radius + 15 + Math.sin(performance.now()/150)*2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(167, 139, 250, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)';
          ctx.lineWidth = 3;
          ctx.stroke();
      }

      // Gun
      if (state.selectedCharacter !== 'bohr_cat' && state.selectedCharacter !== 'curie_cat') {
          ctx.save();
          ctx.translate(p.pos.x, p.pos.y + 10);
          ctx.rotate(p.aimAngle);
          // Scientific Gun shape
          // To prevent upside-down gun when aiming left
          if (Math.abs(p.aimAngle) > Math.PI / 2) {
             ctx.scale(1, -1);
          }
          
          // Stock/Handle & Weapon Style
          if (state.equippedWeapon === 'shotgun') {
          // Double-Barrel Shotgun Shape
          // Wooden stock and grip
          ctx.fillStyle = '#78350f'; // rich reddish brown
          ctx.fillRect(-5, -4, 18, 9); // stock
          ctx.fillStyle = '#451a03'; // deeper dark brown grip
          ctx.fillRect(0, 4, 6, 8); // grip handle

          // Wooden forend handguard
          ctx.fillStyle = '#78350f';
          ctx.fillRect(13, -2, 10, 6);

          // Double steel barrels (represented side-by-side with grey shades)
          ctx.fillStyle = '#475569'; // steel blue-grey
          ctx.fillRect(23, -3, 20, 2.5); // upper barrel
          ctx.fillStyle = '#334155'; // darker steel shade
          ctx.fillRect(23, 0.5, 20, 2.5); // lower barrel

          // Trigger/Hinges metal detail
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(6, 4, 3, 3);

          // Dark muzzle openings
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(43, -3, 2.2, 6);
      } else {
          // Stock/Handle
          ctx.fillStyle = '#1e293b'; 
          ctx.fillRect(0, -4, 15, 12);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(2, 8, 8, 10); // Grip
          
          // Barrel
          ctx.fillStyle = '#475569';
          ctx.fillRect(15, -3, 20, 6);
          
          // Energy Core (Glowing)
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(10, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          
          // Muzzle
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(35, -4, 6, 8);
      }
      
      ctx.restore();
      }

      ctx.globalAlpha = 1.0;

      // Draw Projectiles
      state.projectiles.forEach(proj => {
        if (proj.pos.x + proj.radius < vx1 || proj.pos.x - proj.radius > vx2 || proj.pos.y + proj.radius < vy1 || proj.pos.y - proj.radius > vy2) {
            return;
        }

        let drawX = proj.pos.x;
        let drawY = proj.pos.y;
        
        // Tremble when stationary/slow (and it's a player projectile)
        if (proj.type !== 'EnemyBullet' && Math.hypot(proj.vel.x, proj.vel.y) < 10) {
            drawX += (Math.random() - 0.5) * 4;
            drawY += (Math.random() - 0.5) * 4;
        }

        if ((proj as any).isRadioactive) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10 + Math.sin(Date.now() / 150) * 5;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, proj.radius, 0, Math.PI * 2);
        
        switch (proj.type?.toUpperCase() || proj.type) {
            case 'H': ctx.fillStyle = '#60a5fa'; ctx.strokeStyle = '#3b82f6'; break;
            case 'HE': ctx.fillStyle = '#fce7f3'; ctx.strokeStyle = '#fbcfe8'; break;
            case 'LI': ctx.fillStyle = '#fca5a5'; ctx.strokeStyle = '#f87171'; break;
            case 'BE': ctx.fillStyle = '#86efac'; ctx.strokeStyle = '#4ade80'; break;
            case 'B': ctx.fillStyle = '#34d399'; ctx.strokeStyle = '#10b981'; break;
            case 'C': ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#64748b'; break;
            case 'N': ctx.fillStyle = '#a78bfa'; ctx.strokeStyle = '#8b5cf6'; break;
            case 'O': ctx.fillStyle = '#f87171'; ctx.strokeStyle = '#ef4444'; break;
            case 'NE': ctx.fillStyle = '#ef4444'; ctx.strokeStyle = '#f43f5e'; break;
            case 'NEH': ctx.fillStyle = '#f43f5e'; ctx.strokeStyle = '#e11d48'; break;
            case 'MG': ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#f59e0b'; break;
            case 'K': ctx.fillStyle = '#c084fc'; ctx.strokeStyle = '#a855f7'; break;
            case 'CA': ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#cbd5e1'; break;
            case 'CL': ctx.fillStyle = '#4ade80'; ctx.strokeStyle = '#22c55e'; break;
            case 'P': ctx.fillStyle = '#fb923c'; ctx.strokeStyle = '#f97316'; break;
            case 'SI': ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; break;
            case 'S': ctx.fillStyle = '#fde047'; ctx.strokeStyle = '#eab308'; break;
            case 'H2O': ctx.fillStyle = '#22d3ee'; ctx.strokeStyle = '#06b6d4'; break;
            case 'CH4': ctx.fillStyle = '#f97316'; ctx.strokeStyle = '#ea580c'; break;
            case 'NH3': ctx.fillStyle = '#00ffff'; ctx.strokeStyle = '#00cccc'; break;
            case 'CO2': ctx.fillStyle = '#78716c'; ctx.strokeStyle = '#57534e'; break;
            case 'NO2': ctx.fillStyle = '#aa00aa'; ctx.strokeStyle = '#880088'; break;
            case 'O3': ctx.fillStyle = '#ffff00'; ctx.strokeStyle = '#cccc00'; break;
            case 'H2S': ctx.fillStyle = '#fef08a'; ctx.strokeStyle = '#facc15'; break;
            case 'SO2': ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#d97706'; break;
            case 'H2SO4': ctx.fillStyle = '#ea580c'; ctx.strokeStyle = '#c2410c'; break;
            case 'RA': ctx.fillStyle = '#8b5cf6'; ctx.strokeStyle = '#7c3aed'; break;
            case 'PO': ctx.fillStyle = '#d946ef'; ctx.strokeStyle = '#c026d3'; break;
            case 'CH2O': ctx.fillStyle = '#a855f7'; ctx.strokeStyle = '#9333ea'; break;
            case 'SIO2': ctx.fillStyle = '#7dd3fc'; ctx.strokeStyle = '#38bdf8'; break;
            case 'SIC': ctx.fillStyle = '#475569'; ctx.strokeStyle = '#334155'; break;
            case 'LICL': ctx.fillStyle = '#fbbf24'; ctx.strokeStyle = '#f59e0b'; break;
            case 'LIH': ctx.fillStyle = '#fda4af'; ctx.strokeStyle = '#f43f5e'; break;
            case 'LI2O': ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#b91c1c'; break;
            case 'BEO': ctx.fillStyle = '#6ee7b7'; ctx.strokeStyle = '#059669'; break;
            case 'BECL2': ctx.fillStyle = '#a3e635'; ctx.strokeStyle = '#65a30d'; break;
            case 'BEH2': ctx.fillStyle = '#10b981'; ctx.strokeStyle = '#047857'; break;
            case 'BH3': ctx.fillStyle = '#fbcfe8'; ctx.strokeStyle = '#db2777'; break;
            case 'B2O3': ctx.fillStyle = '#fce7f3'; ctx.strokeStyle = '#be185d'; break;
            case 'BCL3': ctx.fillStyle = '#fdf2f8'; ctx.strokeStyle = '#9d174d'; break;
            case 'BN': ctx.fillStyle = '#f9a8d4'; ctx.strokeStyle = '#831843'; break;
            case 'C6H12O6': ctx.fillStyle = '#fef08a'; ctx.strokeStyle = '#eab308'; break;
            case 'CELLULOSE': ctx.fillStyle = '#bbf7d0'; ctx.strokeStyle = '#16a34a'; break;
            case 'KNO3': ctx.fillStyle = '#c084fc'; ctx.strokeStyle = '#a855f7'; break;
            case 'CACO3': ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#cbd5e1'; break;
            case 'CHLOROPHYLL': ctx.fillStyle = '#4ade80'; ctx.strokeStyle = '#22c55e'; break;
            case 'ETHANOL': ctx.fillStyle = '#fbcfe8'; ctx.strokeStyle = '#f472b6'; break;
            case 'VINEGAR': ctx.fillStyle = '#fef08a'; ctx.strokeStyle = '#eab308'; break;
            case 'COMBUSTION': ctx.fillStyle = '#f97316'; ctx.strokeStyle = '#ea580c'; break;
            case 'MGCL2': ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#e2e8f0'; break;
            case 'CACL2': ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; break;
            case 'MGO': ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#fbbf24'; break;
            case 'CAO': ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#cbd5e1'; break;
            case 'CAOH2': ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#e2e8f0'; break;
            case 'KCL': ctx.fillStyle = '#d8b4fe'; ctx.strokeStyle = '#c084fc'; break;
            case 'KOH': ctx.fillStyle = '#c084fc'; ctx.strokeStyle = '#a855f7'; break;
            case 'P2O5': ctx.fillStyle = '#fca5a5'; ctx.strokeStyle = '#f87171'; break;
            case 'SICL4': ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#64748b'; break;
            case 'NACL': ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#e2e8f0'; break;
            case 'NAOH': ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#94a3b8'; break;
            case 'NAHCO3': ctx.fillStyle = '#fef08a'; ctx.strokeStyle = '#fde047'; break;
            case 'AL2O3': ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#475569'; break;
            case 'ALCL3': ctx.fillStyle = '#64748b'; ctx.strokeStyle = '#334155'; break;
            case 'MOLECULE': ctx.fillStyle = '#fca5a5'; ctx.strokeStyle = '#f87171'; break;
            case 'ENEMYBULLET': ctx.fillStyle = '#22c55e'; ctx.strokeStyle = '#16a34a'; break;
            default: ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; break;
        }

        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        if (proj.type && proj.type !== 'EnemyBullet') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 9px monospace';
            ctx.shadowBlur = 0;
            
            let label = proj.type.toUpperCase();
            if ((proj as any).cachedLabel) {
                label = (proj as any).cachedLabel;
            } else {
                if ((proj as any).isIsotope && (proj as any).isotopeMassNum && (proj as any).baseAtomSymbol) {
                    const formatSuperscript = (num: number) => num.toString().split('').map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(char)]).join('');
                    label = `${formatSuperscript((proj as any).isotopeMassNum)}${(proj as any).baseAtomSymbol}`;
                } else if (proj.type === 'Molecule' && proj.atoms) {
                    const formatAtoms = (key: string) => key.replace(/\d/g, m => '₀₁₂₃₄₅₆₇₈₉'[parseInt(m)]);
                    const parts = Object.entries(proj.atoms).filter(([_,v])=>(v as number)>0).map(([k,v]) => {
                      if (v === 1) return formatAtoms(k);
                      return `${v}${formatAtoms(k)}`;
                    });
                    if (parts.length > 0) label = parts.join('+');
                    else label = '';
                } else if (proj.type === 'Molecule') {
                   label = '';
                }
                (proj as any).cachedLabel = label;
            }
            
            ctx.fillText(label, drawX, drawY);
        }
      });

      ctx.restore();

      // Minimap Overlay Layer (Futuristic Compact Radar)
      if (state.state === 'playing') {
        const mmWidth = 80;
        const mmHeight = 80;
        const mmScale = 11; 
        ctx.save();
        const isMobile = window.innerWidth < 1024;
        const mmX = isMobile ? 12 : 24;
        const mmY = canvas.height / 2 - mmHeight / 2;
        ctx.translate(mmX, mmY);
        
        // Glow backing
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(0, 0, mmWidth, mmHeight, 8);
        } else {
            ctx.rect(0, 0, mmWidth, mmHeight);
        }
        ctx.fillStyle = 'rgba(7, 7, 12, 0.85)';
        ctx.fill();
        
        // Scanlines grid background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 0.5;
        for (let g = 8; g < mmHeight; g += 8) {
            ctx.beginPath();
            ctx.moveTo(0, g);
            ctx.lineTo(mmWidth, g);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(g, 0);
            ctx.lineTo(g, mmHeight);
            ctx.stroke();
        }
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(0, 0, mmWidth, mmHeight, 8);
        } else {
            ctx.rect(0, 0, mmWidth, mmHeight);
        }
        ctx.clip(); // Keep minimap inside its rounded area

        const centX = mmWidth / 2;
        const centY = mmHeight / 2;

        state.rooms.forEach(room => {
            if (!room.visited && !room.cleared) {
                const rx = room.gridX - state.currentRoom.x;
                const ry = room.gridY - state.currentRoom.y;
                const drawX = centX + rx * mmScale - mmScale/2;
                const drawY = centY + ry * mmScale - mmScale/2;
                
                const isAdjacentVisited = state.rooms.some(r => r.visited && Math.abs(r.gridX - room.gridX) + Math.abs(r.gridY - room.gridY) === 1);
                
                if (isAdjacentVisited) {
                     ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                     ctx.beginPath();
                     if (typeof ctx.roundRect === 'function') {
                         ctx.roundRect(drawX, drawY, mmScale - 2, mmScale - 2, 2);
                     } else {
                         ctx.rect(drawX, drawY, mmScale - 2, mmScale - 2);
                     }
                     ctx.fill();
                     ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                     ctx.font = '8px sans-serif';
                     ctx.textAlign = 'center';
                     ctx.textBaseline = 'middle';
                     if (room.isBoss) {
                         ctx.fillText('💀', drawX + mmScale/2 - 1, drawY + mmScale/2 - 1);
                     } else {
                         ctx.fillText('?', drawX + mmScale/2 - 1, drawY + mmScale/2 - 1);
                     }
                }
                return;
            }
            
            const rx = room.gridX - state.currentRoom.x;
            const ry = room.gridY - state.currentRoom.y;
            const drawX = centX + rx * mmScale - mmScale/2;
            const drawY = centY + ry * mmScale - mmScale/2;
            
            ctx.fillStyle = room.cleared ? 'rgba(52, 211, 153, 0.75)' : 'rgba(239, 68, 68, 0.75)';
            if (room.isBoss) ctx.fillStyle = 'rgba(245, 158, 11, 0.9)'; // Amber gold for boss room
            
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(drawX, drawY, mmScale - 2, mmScale - 2, 2);
            } else {
                ctx.rect(drawX, drawY, mmScale - 2, mmScale - 2);
            }
            ctx.fill();

            if (room.isBoss) {
                 ctx.fillStyle = '#000';
                 ctx.font = '8px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillText('💀', drawX + mmScale/2 - 1, drawY + mmScale/2 - 1);
            }

            if (rx === 0 && ry === 0) {
                // Glow concentric pulsing radar ring
                const pulse = Math.sin(Date.now() / 150) * 1.5 + 4;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(drawX + mmScale/2 - 1, drawY + mmScale/2 - 1, pulse, 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(drawX + mmScale/2 - 1, drawY + mmScale/2 - 1, 2, 0, Math.PI*2);
                ctx.fill();
            }
        });
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (ws) { ws.close(); globalWs = null; }
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const startGame = () => {
    if (engineRef.current) {
        engineRef.current.resetGame();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#0a0a0f] overflow-hidden select-none text-slate-100 font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-1/2 left-0 w-32 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <canvas ref={canvasRef} className="block relative w-full h-full cursor-crosshair z-0" />
      <div style={{ transform: `scale(${engineRef.current?.state.uiScale || 1.0})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, width: `${100 / (engineRef.current?.state.uiScale || 1.0)}%`, height: `${100 / (engineRef.current?.state.uiScale || 1.0)}%`, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>

      {/* POLICE CAR RAID - AMBIENT SIREN VIGNETTE OVERLAY (troszeczke wolniej/bardziej widoczne) */}
      {engineRef.current?.state?.policeSpawning && (
          <div 
             className="absolute inset-0 pointer-events-none z-10 border-[8px] transition-all duration-555 ease-in-out" 
             style={{ 
                 borderColor: (Math.floor(Date.now() / 650) % 2 === 0) ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                 boxShadow: (Math.floor(Date.now() / 650) % 2 === 0) ? 'inset 0 0 35px rgba(239, 68, 68, 0.2)' : 'inset 0 0 35px rgba(59, 130, 246, 0.2)'
             }} 
          />
      )}

      {engineRef.current && gameStateUi === 'playing' && (
          <TouchControls engine={engineRef.current} />
      )}

      {/* PORTAL INTERACT PROMPT */}
      {gameStateUi === 'playing' && engineRef.current?.state.nearPortal && (
          <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto">
              <button 
                  onClick={() => {
                      if (engineRef.current) {
                          if (engineRef.current.state.nearPortalIsLobby) {
                              engineRef.current.enterDungeon();
                          } else {
                              engineRef.current.enterNextFloor();
                          }
                      }
                  }}
                  className="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md border-2 border-indigo-300 rounded-full px-6 py-3 text-white font-black tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse hover:animate-none transition-all cursor-pointer"
              >
                  🌀 {engineRef.current.state.nearPortalIsLobby ? "ENTER DUNGEON (E)" : tx("PRZEJDŹ NA NIŻSZE PIĘTRO (E)")}
              </button>
          </div>
      )}

      {/* OVERLAY HUD ENHANCED UI COMPANION */}
      {gameStateUi === 'playing' && engineRef.current && (() => {
         const activeBosses = engineRef.current.state.enemies.filter(e => ['GiantTree', 'Durian', 'Celery', 'Hogweed', 'SnakeGourdHead', 'MutantPolimer'].includes(e.type) && e.hp > 0);
         const totalBossHp = activeBosses.reduce((sum, b) => sum + b.hp, 0);
         const totalBossMaxHp = activeBosses.reduce((sum, b) => sum + b.maxHp, 0);
         const isBossPresent = totalBossHp > 0;
         return (
         <>

          {isBossPresent && (
             <div className="absolute top-1 md:top-2 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-[450px] pointer-events-none transition-all duration-1000 ease-out animate-in slide-in-from-top-10 fade-in">
                 <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-red-500/30 p-2 md:p-3 shadow-[0_0_30px_rgba(220,38,38,0.3)] flex flex-col gap-1 md:gap-2">
                     <div className="flex justify-between items-end relative pb-1">
                         <h2 className="absolute top-0 left-0 w-full text-center text-red-400 font-black text-sm md:text-xl tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none mb-0.5 z-10 pointer-events-none">
                             {activeBosses.length === 1 ? (
                                 {
                                     'Celery': 'Sal su moner',
                                     'SnakeGourdHead': tx("Tykwa węzowa z 4 oczami"),
                                     'Hogweed': 'Barszcz Sosnowskiego',
                                     'Durian': 'Radioaktywny Durian',
                                     'GiantTree': tx("Pradawny Dąb"),
                                     'MutantPolimer': 'Zmutowany Polimer'
                                 }[activeBosses[0].type as string] || activeBosses[0].type
                             ) : tx("WIELOKROTNE ZAGROŻENIE")}
                         </h2>
                         {/* Spacer for the absolute positioned title */}
                         <div className="h-4 md:h-6 w-full"></div>
                         <span className="absolute right-0 bottom-1 text-white font-mono font-bold text-xs md:text-sm bg-red-950/50 px-2 py-0.5 rounded border border-red-500/20 leading-none z-20">
                             {Math.ceil((totalBossHp / totalBossMaxHp) * 100)}%
                         </span>
                     </div>
                     <div className="w-full h-2 md:h-3 bg-slate-950/80 rounded-full overflow-hidden border border-slate-700 relative">
                         {/* Delayed background damage bar */}
                         <div 
                             className="absolute top-0 left-0 h-full bg-white/70 transition-all duration-1000 delay-100 ease-out" 
                             style={{ width: `${(totalBossHp / totalBossMaxHp) * 100}%` }}
                         />
                         {/* Main health bar */}
                         <div 
                             className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-700 via-rose-500 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-150 ease-out" 
                             style={{ width: `${(totalBossHp / totalBossMaxHp) * 100}%` }}
                         />
                     </div>
                 </div>
             </div>
          )}
                   {/* OPTIMIZED HUD & PAUSE MENUS */}
         <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-50 flex flex-col gap-2 pointer-events-none scale-75 lg:scale-90 origin-top-left w-64 lg:w-72 bg-slate-950/85 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
             {/* Header Row: Level + Currency */}
             <div className="flex items-center justify-between w-full border-b border-white/5 pb-2 font-sans">
                 <div className="flex items-center gap-2">
                     <span className="text-xl">🐱</span>
                     <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 leading-none">{tx("Poziom ")}{engineRef.current.state.level}</div>
                         <div className="text-[11px] font-bold tracking-tight text-white/90 leading-none mt-1">{tx("")}{engineRef.current.state.currentRoom.x}, {engineRef.current.state.currentRoom.y}</div>
                     </div>
                 </div>
                 
                 {/* Compact Currency Display */}
                 <div className="pointer-events-auto">
                     {engineRef.current.state.isLobby ? (
                         <div className="flex items-center gap-1 bg-purple-900/40 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] text-purple-300 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                             <span className="text-purple-400 font-black">p⁺</span> {engineRef.current.state.protons}
                         </div>
                     ) : (
                         <button 
                             onClick={() => { if(engineRef.current) engineRef.current.state.showingShop = true; setTriggerRender(r => r+1); }}
                             className="flex items-center gap-1 bg-yellow-900/40 border border-yellow-500/30 px-2.5 py-1 rounded-full text-[10px] text-yellow-300 font-bold shadow-[0_0_8px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-105 active:scale-95 transition-all outline-none"
                         >
                             <span className="text-yellow-400 font-black">e⁻</span> {formatMoney(engineRef.current.state.electrons)}
                         </button>
                     )}
                 </div>
             </div>

             {/* Stat Gauges (HP, Stamina, Heat) */}
             <div className="flex flex-col gap-1.5 w-full font-sans">
                 {/* HP Bar */}
                 <div className="flex flex-col gap-0.5">
                     <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 leading-none">
                         <span>{tx("")}</span>
                         <span className="text-white font-extrabold">{Math.floor(engineRef.current.state.player.hp)} / {engineRef.current.state.player.maxHp}</span>
                     </div>
                     <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                         <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all" style={{ width: `${Math.max(0, (engineRef.current.state.player.hp / engineRef.current.state.player.maxHp) * 100)}%` }}></div>
                     </div>
                 </div>

                 {/* Stamina Bar */}
                 <div className="flex flex-col gap-0.5">
                     <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 leading-none">
                         <span>{tx("Energia (Stamina)")}</span>
                         <span className="text-yellow-400 font-extrabold">{Math.floor(engineRef.current.state.player.stamina)}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                         <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.4)] transition-all" style={{ width: `${Math.max(0, engineRef.current.state.player.stamina)}%` }}></div>
                     </div>
                 </div>

                 {/* Heat Bar */}
                 <div className="flex flex-col gap-0.5">
                     <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 leading-none">
                         <span>{tx("Przegrzanie Lufy")}</span>
                         <span className={`${engineRef.current.state.overheated ? 'text-red-500 animate-pulse' : 'text-orange-400'} font-extrabold`}>{Math.floor(engineRef.current.state.heat)}%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                         <div className={`h-full transition-all ${engineRef.current.state.overheated ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-orange-600 to-red-500'}`} style={{ width: `${Math.max(0, engineRef.current.state.heat)}%` }}></div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Compact Combat log positioned floating below the player HUD */}
         {engineRef.current.state.showCombatLog && (
             <div className="absolute top-[138px] left-2 lg:top-[168px] lg:left-4 z-50 pointer-events-none scale-75 lg:scale-90 origin-top-left w-64 lg:w-72 flex flex-col gap-1 font-sans">
                 <div className="bg-slate-950/45 backdrop-blur-md border border-white/5 rounded-xl p-2 md:p-2.5 flex flex-col gap-0.5 text-[8px] lg:text-[10px] text-indigo-300 leading-tight">
                    <h4 className="text-[7px] uppercase font-black text-indigo-400/80 tracking-widest border-b border-white/5 pb-1 mb-1">{tx("Kombat Log:")}</h4>
                    {logs.slice(-3).map((l, i) => <div key={i} className="animate-pulse truncate">⚡ {l}</div>)}
                 </div>
             </div>
         )}

         {/* Settings / Pause button placed in the TOP RIGHT (standard mobile position) */}
         <div className="absolute top-2 right-2 lg:top-4 lg:right-4 z-50 pointer-events-auto font-sans flex flex-col gap-2">
             <button 
               onClick={() => { if (engineRef.current) engineRef.current.state.showingOptions = true; }}
               className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full px-3.5 py-2 font-black tracking-widest text-[9px] lg:text-[10px] text-slate-200 hover:bg-slate-900 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all cursor-pointer outline-none"
             >
               <span>⚙️</span> MENU
             </button>

             {engineRef.current?.state.enemies.some(e => e.type === 'PoliceCat') && (
                 <button 
                   onClick={() => {
                       if (engineRef.current && engineRef.current.state.electrons >= 5000) {
                           engineRef.current.state.electrons -= 5000;
                           engineRef.current.state.unpaidTax = 0;
                           engineRef.current.state.roomsSinceTaxOwed = 0;
                           engineRef.current.state.policeSpawning = false;
                           // Remove police
                           engineRef.current.state.enemies = engineRef.current.state.enemies.filter(e => e.type !== 'PoliceCat');
                           engineRef.current.addLog(tx("💸 Wpłacono 'darowiznę' dla Policji. (5000 e⁻)"));
                       } else if (engineRef.current) {
                           engineRef.current.addLog(tx("❌ Masz za mało elektronów na łapówkę! (Wymagane 5000 e⁻)"));
                       }
                   }}
                   className="bg-red-950/80 backdrop-blur-xl border border-red-500/50 rounded-full px-3.5 py-2 font-black tracking-widest text-[9px] lg:text-[10px] text-red-200 hover:bg-red-900 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all cursor-pointer outline-none animate-bounce"
                 >
                   <span>💰</span> DAJ ŁAPÓWKĘ (5000 e⁻)
                 </button>
             )}
         </div>

         {/* Revolver Magazine */}
          {engineRef.current.state.isLobby && !engineRef.current.state.characterSelected ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-auto bg-[#060814]/90 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
                  {(() => {
                      const st = engineRef.current!.state;
                      const isMulti = localStorage.getItem("lanActive") === "true";
                      
                      const catCharacters = [
                          {
                              id: 'ginger_cat',
                              name: tx('Kinus Miauling'),
                              weapon: 'Pistolet chemiczny',
                              cost: 0,
                              icon: '🐱',
                              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                              bgGradient: 'from-amber-950/40 to-slate-900/80',
                              borderColor: 'border-amber-500',
                              desc: tx('Klasyczny pistolet jednowiązkowy. Zbalansowany i uniwersalny kot laboratoryjny.'),
                              locked: false
                          },
                          {
                              id: 'black_cat',
                              name: tx('Amedeo Avo-Gatto'),
                              weapon: 'Strzelba (Shotgun 3x)',
                              cost: 1,
                              icon: '🐈‍⬛',
                              badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                              bgGradient: 'from-slate-900 to-indigo-950/60',
                              borderColor: 'border-indigo-500',
                              desc: tx('Wystrzeliwuje 3 pociski naraz z szerokim rozrzutem (kosztem dłuższego przeładowania). Błyskawicznie wywołuje reakcje na małym dystansie.'),
                              locked: !isMulti && !st.unlockedCharacters.includes('black_cat')
                          },
                          {
                              id: 'bohr_cat',
                              name: tx('Niels Bohr-kot'),
                              weapon: 'Tarcza orbitalna (Orbit)',
                              cost: 3,
                              icon: '😼',
                              badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                              bgGradient: 'from-cyan-950/50 to-slate-900',
                              borderColor: 'border-cyan-500',
                              desc: tx('Pociski krążą wokół kota po orbitach kwantowych, tworząc obrotową barierę atomową niszczącą wrogów w kontakcie.'),
                              locked: !isMulti && !st.unlockedCharacters.includes('bohr_cat')
                          },
                          {
                              id: 'curie_cat',
                              name: tx('Miauria Purrie Miałkowska'),
                              weapon: 'Rad (Ra) + Polon (Po) | +1 HP/s',
                              cost: 10,
                              icon: '😻',
                              badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
                              bgGradient: 'from-fuchsia-950/60 to-slate-900',
                              borderColor: 'border-fuchsia-500',
                              desc: tx('Startuje z radioaktywnym Radem (Ra) i Polonem (Po). Posiada pasywną regenerację zdrowia (+1.0 HP/s).'),
                              locked: !isMulti && !st.unlockedCharacters.includes('curie_cat')
                          },
                          {
                              id: 'mendelejew',
                              name: tx('Dmitrij Mendelejew'),
                              weapon: '4 losowe atomy z tablicy',
                              cost: 0,
                              floorReq: 5,
                              icon: '🦁',
                              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                              bgGradient: 'from-amber-950/60 to-slate-900',
                              borderColor: 'border-amber-500',
                              desc: tx('Legendarny twórca układu okresowego. Odblokowywany wyłącznie za pokonanie 5. poziomu gry. Zaczyna z 4 losowymi pierwiastkami z całej tablicy.'),
                              locked: !isMulti && !st.unlockedCharacters.includes('mendelejew')
                          }
                      ];

                      const selectedChar = catCharacters.find(c => c.id === st.selectedCharacter) || catCharacters[0];
                      const canAfford = selectedChar.locked && selectedChar.cost > 0 && st.protons >= selectedChar.cost;

                      return (
                          <div className="w-full max-w-3xl flex flex-col items-center">
                              {/* Header */}
                              <div className="text-center mb-3 sm:mb-4">
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                      Wybierz Kota
                                  </h2>
                                  <div className="flex items-center justify-center gap-2 mt-1">
                                      <span className="text-xs sm:text-sm text-slate-400 font-semibold">Kliknij kota, aby go przejrzeć. Wybór zatwierdzasz przyciskiem poniżej:</span>
                                      <span className="bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-inner">
                                          ⚛️ {st.protons} Protonów
                                      </span>
                                  </div>
                              </div>

                              {/* Characters Card Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 w-full mb-3 sm:mb-4">
                                  {catCharacters.map(char => {
                                      const isSelected = char.id === selectedChar.id;
                                      return (
                                          <button
                                              key={char.id}
                                              type="button"
                                              onClick={() => {
                                                  // Only preview / select the character - NEVER instantly confirm or start the game!
                                                  st.selectedCharacter = char.id as any;
                                                  setTriggerRender(r => r + 1);
                                              }}
                                              className={`relative p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer bg-gradient-to-b ${char.bgGradient} ${
                                                  isSelected 
                                                      ? `${char.borderColor} ring-4 ring-white/20 shadow-[0_0_25px_rgba(255,255,255,0.3)] scale-[1.03] z-10` 
                                                      : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                                              }`}
                                          >
                                              {/* Locked Badge */}
                                              {char.locked && (
                                                  <div className="absolute top-1.5 right-1.5 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-yellow-500/40 flex items-center gap-0.5">
                                                      <span>🔒</span>
                                                      {char.floorReq ? <span>🏆 Ukończ grę</span> : (char.cost > 0 ? <span>{char.cost}p⁺</span> : null)}
                                                  </div>
                                              )}

                                              {/* Avatar */}
                                              <div className="text-3xl sm:text-4xl my-1 sm:my-2 drop-shadow-md">
                                                  {char.icon}
                                              </div>

                                              {/* Name */}
                                              <div className="text-xs sm:text-sm font-black text-white leading-tight mb-1 truncate w-full">
                                                  {char.name}
                                              </div>

                                              {/* Element Badge */}
                                              <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${char.badgeColor} truncate w-full`}>
                                                  {char.weapon}
                                              </div>
                                          </button>
                                      );
                                  })}
                              </div>

                              {/* Selected Character Preview Panel */}
                              <div className="w-full bg-slate-900/90 border border-white/15 rounded-2xl p-3 sm:p-4 mb-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                                  <div className="text-4xl sm:text-5xl shrink-0 p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center">
                                      {selectedChar.icon}
                                  </div>
                                  <div className="flex-1 text-center sm:text-left min-w-0">
                                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                          <h3 className="text-base sm:text-lg font-black text-white">{selectedChar.name}</h3>
                                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${selectedChar.badgeColor}`}>
                                              {selectedChar.weapon}
                                          </span>
                                          {selectedChar.locked ? (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300">
                                                  🔒 Zablokowany
                                              </span>
                                          ) : (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                                                  ✓ Dostępny
                                              </span>
                                          )}
                                      </div>
                                      <p className="text-xs sm:text-sm text-slate-300 leading-snug">
                                          {selectedChar.desc}
                                      </p>
                                  </div>
                              </div>

                              {/* Action Buttons: Confirm Selection or Unlock */}
                              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                  {!selectedChar.locked ? (
                                      <button
                                          type="button"
                                          onClick={() => {
                                              // Explicit confirmation to play with this character!
                                              st.characterSelected = true;
                                              engineRef.current?.selectCharacter(st.selectedCharacter);
                                              engineRef.current?.saveGame();
                                              setTriggerRender(r => r + 1);
                                          }}
                                          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 active:scale-95 text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                                      >
                                          <span>✅</span>
                                          <span>Zatwierdź Postać i Rozpocznij ({selectedChar.name})</span>
                                      </button>
                                  ) : canAfford ? (
                                      <button
                                          type="button"
                                          onClick={() => {
                                              st.protons -= selectedChar.cost;
                                              st.unlockedCharacters.push(selectedChar.id as any);
                                              engineRef.current?.saveGame();
                                              setTriggerRender(r => r + 1);
                                          }}
                                          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-purple-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                                      >
                                          <span>🔓</span>
                                          <span>Odblokuj za {selectedChar.cost} Protonów (Masz: {st.protons} p⁺)</span>
                                      </button>
                                  ) : (
                                      <div className="w-full sm:w-auto px-6 py-3 bg-slate-800/80 border border-slate-700 text-slate-400 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 text-center">
                                          <span>🔒</span>
                                          <span>
                                              {selectedChar.floorReq 
                                                  ? '🏆 Zwycięzca gry: Ukończ całą grę (pokonaj 5. poziom), aby odblokować Mendelejewa!' 
                                                  : `Wymaga ${selectedChar.cost} Protonów do odblokowania (masz ${st.protons} p⁺)`}
                                          </span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      );
                  })()}
              </div>
         ) : (
           <div 
               className="absolute right-2 md:right-12 w-24 h-24 md:w-32 md:h-32 z-50 pointer-events-none flex items-center justify-center transition-all duration-75"
               style={{ 
                   top: '40%', 
                   transform: `translateY(calc(-50% + ${ (engineRef.current && (Math.abs(engineRef.current.state.player.vx) > 0.1 || Math.abs(engineRef.current.state.player.vy) > 0.1)) ? Math.sin(Date.now() / 90) * 8 : Math.sin(Date.now() / 300) * 2 }px)) rotate(${ (engineRef.current && (Math.abs(engineRef.current.state.player.vx) > 0.1 || Math.abs(engineRef.current.state.player.vy) > 0.1)) ? Math.cos(Date.now() / 120) * 7 : Math.sin(Date.now() / 450) * 1.5 }deg)` 
               }}
           >
              {(() => {
                  const st = engineRef.current!.state;
                  const items = st.unlockedAtoms.concat(st.unlockedMolecules);
                  const selIndex = items.indexOf(st.player.selectedAtom as any);
                  const rotDeg = -(selIndex >= 0 ? selIndex : 0) * (360 / items.length);

                  return (
                      <>
                      <div className="w-full h-full relative rounded-full border-4 border-cyan-500/80 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] pointer-events-auto transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-grab active:cursor-grabbing"
                        style={{ transform: `rotate(${rotDeg}deg)` }}
                        onTouchStart={(e) => e.stopPropagation()}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            atomTouchStartY.current = e.clientY;
                        }}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                            if (!atomTouchStartY.current) return;
                            const diff = atomTouchStartY.current - e.clientY;
                            if (Math.abs(diff) > 20) {
                                let newIdx = selIndex;
                                if (diff > 0) newIdx = (selIndex + 1) % items.length;
                                else newIdx = (selIndex - 1 + items.length) % items.length;
                                
                                if (st.equippedWeapon !== 'super') {
                                    st.player.selectedAtom = items[newIdx] as any;
                                }
                                setTriggerRender(r => r + 1);
                            }
                            atomTouchStartY.current = 0;
                        }}
                        onPointerLeave={(e) => {
                            if (atomTouchStartY.current) {
                                const diff = atomTouchStartY.current - e.clientY;
                                if (Math.abs(diff) > 20) {
                                    let newIdx = selIndex;
                                    if (diff > 0) newIdx = (selIndex + 1) % items.length;
                                    else newIdx = (selIndex - 1 + items.length) % items.length;
                                    
                                    if (st.equippedWeapon !== 'super') {
                                        st.player.selectedAtom = items[newIdx] as any;
                                    }
                                    setTriggerRender(r => r + 1);
                                }
                                atomTouchStartY.current = 0;
                            }
                        }}
                     >
                         {/* High tech rotating background elements */}
                         <div className="absolute inset-1 border border-dashed border-cyan-400/20 rounded-full animate-[spin_40s_linear_infinite] pointer-events-none" />
                         <div className="absolute inset-2.5 border border-indigo-500/30 rounded-full animate-[spin_15s_linear_infinite] pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${-rotDeg}deg)` }}>
                           {st.equippedWeapon === 'super' ? (
                               <button 
                                   onTouchStart={(e) => e.stopPropagation()}
                                   onPointerDown={(e) => {
                                       e.stopPropagation();
                                       e.nativeEvent.stopImmediatePropagation();
                                       atomTouchStartY.current = e.clientY;
                                   }}
                                   onClick={(e) => { e.stopPropagation(); setShowingRecipeBook(true); }}
                                   className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-2 border-white shadow-[0_0_20px_#fff] flex items-center justify-center font-bold text-white text-xs md:text-md cursor-pointer hover:scale-110 transition-all z-40 pointer-events-auto"
                               >
                                   {st.player.selectedReaction.toUpperCase() || 'Wybierz'}
                               </button>
                           ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-950 to-cyan-900 rounded-full border border-cyan-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_12px_rgba(34,211,238,0.5)] flex items-center justify-center text-xs md:text-sm animate-[pulse_1.5s_ease-in-out_infinite] pointer-events-none select-none">
                                  <span className="text-cyan-400 font-extrabold animate-pulse">⚛️</span>
                              </div>
                           )}
                        </div>
                        {items.map((atom, idx, arr) => {
                            const angle = (idx / arr.length) * Math.PI * 2 - Math.PI / 2;
                            const selected = idx === selIndex;
                            const r = window.innerWidth < 768 ? 45 : 55; // offset radius
                            const x = Math.cos(angle) * r;
                            const y = Math.sin(angle) * r;
                            
                            let bg = 'bg-blue-600', stroke = 'border-blue-400';
                            let textCol = 'text-white';
                            if (atom === 'O') { bg = 'bg-red-600'; stroke = 'border-red-400'; }
                            else if (atom === 'C') { bg = 'bg-slate-600'; stroke = 'border-slate-400'; }
                            else if (atom === 'N') { bg = 'bg-purple-600'; stroke = 'border-purple-400'; }
                            else if (atom === 'S') { bg = 'bg-yellow-500'; stroke = 'border-yellow-300'; textCol = 'text-black'; }
                            else if (atom === 'Si') { bg = 'bg-slate-300'; stroke = 'border-white'; textCol = 'text-black'; }
                            else if (atom === 'H') { bg = 'bg-blue-400'; stroke = 'border-blue-300'; }
                            else if (atom.length > 2) { bg = 'bg-cyan-600'; stroke = 'border-cyan-400'; } // molecules

                            return (
                                <div key={atom} className="absolute" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}>
                                    <button 
                                        onTouchStart={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            e.nativeEvent.stopImmediatePropagation();
                                            // Let parent handle drag start
                                            atomTouchStartY.current = e.clientY;
                                        }}
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            if(engineRef.current) {
                                                engineRef.current.state.player.selectedAtom = atom as any;
                                                engineRef.current.state.equippedWeapon = 'normal';
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className={`w-10 h-10 md:w-12 md:h-12 -ml-5 -mt-5 md:-ml-6 md:-mt-6 rounded-full ${bg} ${textCol} border-2 ${stroke} flex items-center justify-center font-black transition-all ${(selected && st.equippedWeapon !== 'super') ? 'shadow-[0_0_20px_#fff] z-30' : 'opacity-40 hover:opacity-100 z-10'} pointer-events-auto cursor-pointer`}
                                        style={{ transform: `rotate(${-rotDeg}deg) scale(${(selected && st.equippedWeapon !== 'super') ? 1.25 : 0.9})` }}
                                    >
                                        <span className={atom.length > 1 ? 'text-[8px] md:text-[10px]' : 'text-sm md:text-base'}>
                                            {(() => {
                                                const match = atom.match(/^(\d+)([A-Z][a-z]?)$/);
                                                if (match) {
                                                    const formatSuperscript = (numStr: string) => numStr.split('').map(char => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(char)]).join('');
                                                    return `${formatSuperscript(match[1])}${match[2]}`;
                                                }
                                                return atom;
                                            })()}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {/* Selection Indicator */}
                    {st.equippedWeapon !== 'super' && (
                        <div 
                            className="absolute border-4 border-yellow-400 rounded-full pointer-events-none z-20 shadow-[0_0_15px_rgba(250,204,21,0.5)] w-12 h-12 md:w-16 md:h-16"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(-50%, -50%) translateY(-${window.innerWidth < 768 ? 45 : 55}px)`
                            }}
                        ></div>
                    )}
                    <div className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-slate-400 tracking-widest bg-black/50 py-1 rounded-full pointer-events-none break-words">
                      {tx("PRZESUŃ BY WYBRAĆ")}
                    </div>
                    {st.hasSuperWeapon && (
                        <button 
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 border border-indigo-400 text-white font-bold py-1 px-4 rounded-full pointer-events-auto text-[10px] whitespace-nowrap z-50 shadow-lg"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                st.equippedWeapon = st.equippedWeapon === 'normal' ? 'super' : 'normal'; 
                                setTriggerRender(r => r + 1);
                            }}
                        >
                            ZMIEŃ BROŃ
                        </button>
                    )}
                    </>
                );
             })()}
          </div>
         )}
         </>
        );
      })()}

      {bossIntro?.active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[120]">
            <div className="text-center animate-[pulse_1s_ease-in-out_infinite] px-4">
                <h2 className="text-red-500 font-black text-lg md:text-2xl tracking-[0.5em] md:tracking-[1em] uppercase mb-4 shadow-red-500/50 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">{tx("")}</h2>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] mb-4 transition-transform">{bossIntro.name}</h1>
                <p className="text-md md:text-xl text-slate-300 italic max-w-2xl mx-auto block">
                    {bossIntro.description}
                </p>
            </div>
        </div>
      )}

      {reactionDiscovery?.active && engineRef.current && (
        <div className="absolute top-3 left-3 z-[110] bg-slate-950/90 border border-indigo-500/60 rounded-xl p-2.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2.5 max-w-[280px] backdrop-blur-md animate-slide-in pointer-events-auto">
             <div className="shrink-0 flex items-center justify-center cursor-pointer" onClick={() => { if (engineRef.current) { engineRef.current.state.reactionDiscovery = null; } setReactionDiscovery(null); }}>
                 <MoleculeGraphic atoms={reactionDiscovery.atoms || ['?']} size="sm" />
             </div>
             <div className="flex flex-col min-w-0 flex-1">
                 <div className="text-[8px] text-indigo-400 font-bold uppercase tracking-wider flex justify-between items-center mb-0.5">
                     <span className="truncate">{reactionDiscovery.equation === tx("Odblokowano nowy pierwiastek") ? tx("Nowy pierwiastek") : tx("Nowe wiązanie")}</span>
                     <span className="text-slate-400 hover:text-white cursor-pointer ml-1 text-xs" onClick={() => { if (engineRef.current) { engineRef.current.state.reactionDiscovery = null; } setReactionDiscovery(null); }}>✕</span>
                 </div>
                 <div className="text-xs font-black text-white leading-tight truncate">{reactionDiscovery.name}</div>
                 <div className="text-[10px] text-yellow-400 font-mono font-bold truncate">{reactionDiscovery.equation}</div>
                 <div className="text-[9px] text-slate-300 truncate">{reactionDiscovery.description}</div>
             </div>
        </div>
      )}

      {marketDiscovery?.active && engineRef.current && (
        <div className="absolute top-3 right-3 z-[110] bg-slate-950/90 border border-emerald-500/60 rounded-xl p-2.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 max-w-[280px] backdrop-blur-md animate-slide-in pointer-events-auto">
             <div className="flex flex-col min-w-0 flex-1">
                 <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider flex justify-between items-center mb-0.5">
                     <span>📈 Wiadomości z Giełdy</span>
                     <span className="text-slate-400 hover:text-white cursor-pointer text-xs" onClick={() => { if (engineRef.current) { engineRef.current.state.marketDiscovery = null; } setMarketDiscovery(null); }}>✕</span>
                 </div>
                 <div className="text-xs font-black text-white leading-tight truncate">{marketDiscovery.title}</div>
                 <div className="text-[9px] text-slate-300 line-clamp-2">{marketDiscovery.content}</div>
             </div>
        </div>
      )}

      {previewReaction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[115] backdrop-blur-md">
            <div className="bg-gradient-to-r from-slate-800 to-[#0a0a0f] border-2 border-slate-500 shadow-[0_0_50px_rgba(255,255,255,0.2)] p-6 md:p-8 rounded-3xl w-[90vw] max-w-4xl flex flex-row items-center gap-6 md:gap-12 transform scale-100">
                <div className="flex-shrink-0 relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center ml-4">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-500/50 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-3 md:inset-4 rounded-full border-2 border-slate-400/30 bg-slate-800/30 flex items-center justify-center">
                        <span className="text-2xl md:text-4xl font-black text-white">{previewReaction.equation.split('➔')[1]?.trim()}</span>
                    </div>
                    {previewReaction.atoms?.map((atom, idx, arr) => {
                        const angle = (idx / arr.length) * Math.PI * 2;
                        const r = window.innerWidth < 768 ? 64 : 96;
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;
                        let color = 'bg-blue-500';
                        if (atom === 'O') color = 'bg-red-500';
                        if (atom === 'C') color = 'bg-slate-500';
                        if (atom === 'N') color = 'bg-purple-500';
                        if (atom === 'S') color = 'bg-yellow-500';
                        if (atom === 'Si') color = 'bg-slate-400';
                        return (
                            <div key={idx} className={`absolute w-8 h-8 md:w-10 md:h-10 ${color} rounded-full border-2 border-white/50 flex items-center justify-center font-bold text-white shadow-lg text-sm md:text-base`} style={{ left: `calc(50% + ${x}px - ${window.innerWidth < 768 ? 16 : 20}px)`, top: `calc(50% + ${y}px - ${window.innerWidth < 768 ? 16 : 20}px)` }}>
                                {atom}
                            </div>
                        )
                    })}
                </div>

                <div className="flex flex-col text-left justify-center flex-1 py-4">
                    <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{tx("")}</h2>
                    <h1 className="text-2xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-2 md:mb-4">{previewReaction.name}</h1>
                    <div className="text-lg md:text-2xl font-mono text-yellow-400 font-bold mb-3 md:mb-6 tracking-widest bg-black/40 py-2 px-4 rounded-xl border border-slate-700 w-fit">
                        {previewReaction.equation}
                    </div>
                    <p className="text-sm md:text-lg text-slate-300 mb-4 md:mb-8 leading-relaxed">
                        {previewReaction.description}
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        {engineRef.current?.state.hasSuperWeapon && (
                            <button 
                                onClick={() => { 
                                    if(engineRef.current) {
                                        engineRef.current.state.player.selectedReaction = previewReaction.id;
                                        engineRef.current.state.equippedWeapon = 'super';
                                        setPreviewReaction(null);
                                        setShowingRecipeBook(false);
                                    }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 md:py-4 px-6 md:px-12 rounded-full tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 transition-all text-xs md:text-base w-fit"
                            >
                                {engineRef.current.state.player.selectedReaction === previewReaction.id ? 'WYBRANE DO SUPERBRONI' : 'WYBIERZ DO SUPERBRONI'}
                            </button>
                        )}
                        <button 
                            onClick={() => setPreviewReaction(null)}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 md:py-4 px-6 md:px-12 rounded-full tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-xs md:text-base w-fit"
                        >
                            ZAMKNIJ
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showingOptions && engineRef.current && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-black/80 text-slate-100 z-[100] backdrop-blur-md p-4">
             <div className={`bg-gradient-to-r from-slate-900 to-[#0a0a0f] border-2 border-slate-500 shadow-[0_0_35px_rgba(255,255,255,0.2)] w-full ${optionsTab === 'market' ? 'max-w-3xl' : 'max-w-sm'} rounded-2xl p-4 md:p-5 relative flex flex-col gap-3 max-h-[96vh] overflow-y-auto transition-all`}>
                {optionsTab !== 'main' ? (
                  <button 
                    className="absolute top-6 left-6 text-2xl hover:scale-110 transition-transform"
                    onClick={() => setOptionsTab('main')}>
                    🔙
                  </button>
                ) : null}
                <button 
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingOptions = false; setOptionsTab('main'); }}>
                  ❌
                </button>

                {optionsTab === 'main' && (
                  <>
                    <button 
                      className="absolute top-6 left-6 text-sm flex items-center gap-1 hover:scale-105 transition-transform text-red-400 bg-red-900/40 p-1.5 px-3 rounded-lg border border-red-500/30"
                      onClick={() => {
                          if (engineRef.current) {
                              engineRef.current.state.state = 'menu';
                              engineRef.current.state.showingOptions = false;
                          }
                          setOptionsTab('main');
                      }}>
                      {tx("🏠 Do Menu")}
                    </button>
                    <h2 className="text-xl font-black tracking-tight text-white text-center">{tx("☰ OPCJE")}</h2>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                        onClick={() => { if(engineRef.current) { engineRef.current.state.showingOptions = false; engineRef.current.state.showingShop = true; } }}
                        className="bg-green-600/50 hover:bg-green-500/55 border border-green-500/20 rounded-xl px-2 py-2.5 font-bold text-xs text-green-100 transition-all flex items-center justify-center gap-1.5"
                    >
                        {tx("🛒 Lab (Sklep)")}
                    </button>
                    
                    <button 
                        onClick={() => { if(engineRef.current) { engineRef.current.state.showingOptions = false; engineRef.current.state.showingRecipeBook = true; } }}
                        className="bg-indigo-900/50 hover:bg-indigo-800/55 border border-indigo-400/20 rounded-xl px-2 py-2.5 font-bold text-xs text-indigo-100 transition-all flex items-center justify-center gap-1.5"
                    >
                        {tx("📖 Księga Wiązań")}
                    </button>
                    
                    <button 
                        onClick={() => { if(engineRef.current) { engineRef.current.state.showingOptions = false; engineRef.current.state.showingStats = true; } }}
                        className="bg-blue-900/50 hover:bg-blue-800/55 border border-blue-400/20 rounded-xl px-2 py-2.5 font-bold text-xs text-blue-100 transition-all flex items-center justify-center gap-1.5"
                    >
                        {tx("📊 Statystyki")}
                    </button>

                    <button 
                        onClick={() => { if(engineRef.current) { engineRef.current.state.showingOptions = false; engineRef.current.state.showingSaves = true; } }}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-605 rounded-xl px-2 py-2.5 font-bold text-xs text-white transition-all flex items-center justify-center gap-1.5"
                    >
                        💾 {tx("Zapisy Gry")}
                    </button>
                    </div>

                    <div className="mt-1">
                      <button 
                          onClick={() => { if(engineRef.current) { engineRef.current.state.showingOptions = false; setShowingPeriodicTable(true); } }}
                          className="w-full bg-indigo-600/50 hover:bg-indigo-500/55 border border-indigo-500/20 rounded-xl px-2 py-2.5 text-xs font-bold text-indigo-100 transition-all flex items-center justify-center gap-1.5"
                      >
                          {tx("⚛️ Tablica Mendelejewa")}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      
                      <button 
                          onClick={() => setOptionsTab('feedback')}
                          className="bg-indigo-600/50 hover:bg-indigo-500/55 border border-indigo-500/20 rounded-xl px-2 py-2 text-xs font-bold text-indigo-100 transition-all flex items-center justify-center gap-1.5 col-span-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-2"
                      >
                          💬 {tx("Opinia i Prywatność")} (+50 p⁺)
                      </button>
                      <button 
                          onClick={() => setOptionsTab('investments')}
                          className="bg-amber-600/50 hover:bg-amber-500/55 border border-amber-500/20 rounded-xl px-2 py-2 text-xs font-bold text-amber-100 transition-all flex items-center justify-center gap-1.5"
                      >
                          {tx("📈 Giełda")}
                      </button>
                      <button 
                          onClick={() => setOptionsTab('settings')}
                          className="bg-gray-600/50 hover:bg-gray-500/55 border border-gray-500/20 rounded-xl px-2 py-2 text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-1.5"
                      >
                          {tx("⚙️ Ustawienia")}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <button 
                            className="w-full bg-red-600/80 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                            onClick={() => {
                                if (engineRef.current) {
                                    engineRef.current.resetGame();
                                    engineRef.current.state.state = 'menu';
                                    engineRef.current.state.showingOptions = false;
                                }
                                setOptionsTab('main');
                            }}
                        >
                            <span>🚪</span> {tx("WYJŚCIE DO MENU GŁÓWNEGO")}
                        </button>
                    </div>
                  </>
                )}
                
                {optionsTab === 'feedback' && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-xl font-black tracking-tight text-white mb-1.5 text-center">💬 OPINIA I PRYWATNOŚĆ</h2>
                    
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto font-sans">
                        <strong className="text-white block mb-1">Polityka Prywatności:</strong>
                        Aplikacja zbiera anonimowe logi błędów oraz opinie w celu poprawy jakości rozgrywki. Nie zbieramy i nie przetwarzamy danych osobowych (np. imienia, adresu e-mail, numeru telefonu, lokalizacji czy Google Advertising ID). Do analizy opinii oraz zachowań graczy wykorzystujemy anonimowe usługi analityczne (Third-party analytics services) w tym asystentów AI (np. Gemini/OpenAI API). Korzystając z funkcji "Wyślij opinię", akceptujesz te zasady.
                    </div>

                    <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30">
                        <strong className="text-red-400 block mb-2 text-xs uppercase tracking-widest text-center">
                           ⚠️ Zastrzeżenie!
                        </strong>
                        <p className="text-xs text-indigo-200 text-center mb-3">
                            Prosimy o szczere opinie na temat gry! Zastrzeżenie: Nie wpisuj tu żadnych danych osobowych (np. imienia, e-maila). System przetwarza je w 100% anonimowo.
                        </p>
                        
                        {(() => {
                            const hasProgression = engineRef.current?.state.unlockedAtoms.length >= 4 || engineRef.current?.state.unlockedCharacters.length >= 2;
                            const t = feedbackText.trim();
                            const uniqueChars = new Set(t.toLowerCase().split('')).size;
                            const isSpam = t.length < 25 || uniqueChars < 8;
                            
                            if (engineRef.current?.state.feedbackSubmitted) {
                                return (
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 text-center">
                                            <span className="text-2xl block mb-1">💖</span>
                                            <span className="text-green-300 font-bold text-sm block">Dziękujemy za opinię!</span>
                                            <span className="text-green-400/80 text-xs">Nagroda 50 p⁺ została przyznana.</span>
                                        </div>
                                        <button 
                                            onClick={() => { window.open('https://play.google.com/store/apps/details?id=com.hackermerge.game', '_blank'); }}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] text-xs mt-2"
                                        >
                                            ⭐ Oceń grę w Google Play!
                                        </button>
                                    </div>
                                );
                            }

                            if (!hasProgression) {
                                return (
                                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 text-center">
                                        <span className="text-3xl block mb-2 opacity-50">🔒</span>
                                        <span className="text-slate-300 font-bold text-sm block mb-1">Wymagany progres</span>
                                        <span className="text-slate-400 text-xs">Aby zapobiec nadużyciom, opcja wysyłania opinii i darmowych p⁺ jest dostępna dopiero po pokonaniu pierwszych bossów (minimum 4 odblokowane pierwiastki) lub odblokowaniu nowych postaci. Graj dalej!</span>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <textarea 
                                        className="w-full bg-black/50 border border-indigo-500/50 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-400 resize-none h-24 mb-2 placeholder-indigo-900"
                                        placeholder="Napisz co sądzisz o grze, co byś zmienił... (min. 25 znaków, wyczerpujące zdania)"
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                    ></textarea>
                                    
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && !isSpam) {
                                                engineRef.current.state.feedbackSubmitted = true;
                                                engineRef.current.state.protons += 50;
                                                engineRef.current.saveGame();
                                                setFeedbackText("");
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        disabled={isSpam}
                                        className={`w-full font-bold py-2.5 rounded-xl transition-all shadow-lg text-xs ${!isSpam ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        {!isSpam ? "Wyślij anonimową opinię i zgarnij +50 p⁺" : (t.length < 25 ? "Opinia jest za krótka (min. 25 znaków)" : "Napisz coś bardziej sensownego (spam znaków)")}
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                  </div>
                )}
{optionsTab === 'settings' && (
                  <>
                    <h2 className="text-xl font-black tracking-tight text-white mb-1.5 text-center">{tx("⚙️ USTAWIENIA")}</h2>
                    <button 
                        onTouchStart={() => {
                          if (devTimerRef.current) clearTimeout(devTimerRef.current);
                          devTimerRef.current = setTimeout(() => {
                            if(engineRef.current) engineRef.current.state.showingOptions = false;
                            setShowingDevMenu(true);
                            setTriggerRender(r => r + 1);
                          }, 6000);
                        }}
                        onTouchEnd={() => {
                          if (devTimerRef.current) {
                            clearTimeout(devTimerRef.current);
                            devTimerRef.current = null;
                          }
                        }}
                        onPointerDown={() => {
                          if (devTimerRef.current) clearTimeout(devTimerRef.current);
                          devTimerRef.current = setTimeout(() => {
                            if(engineRef.current) engineRef.current.state.showingOptions = false;
                            setShowingDevMenu(true);
                            setTriggerRender(r => r + 1);
                          }, 6000);
                        }}
                        onPointerUp={() => {
                          if (devTimerRef.current) {
                            clearTimeout(devTimerRef.current);
                            devTimerRef.current = null;
                          }
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                        onClick={() => { 
                          if(engineRef.current) { 
                            engineRef.current.state.showCombatLog = !engineRef.current.state.showCombatLog; 
                            engineRef.current.saveGame();
                            setTriggerRender(r => r + 1);
                          } 
                        }}
                        className={`w-full ${engineRef.current.state.showCombatLog ? 'bg-purple-600/50 hover:bg-purple-500/55 border-purple-400/30 text-purple-100' : 'bg-slate-705/50 hover:bg-slate-600/50 border-slate-500/30 text-slate-300'} border rounded-xl py-2 px-3 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95`}
                    >
                        💬 {tx("Kombat Log:")} {engineRef.current.state.showCombatLog ? tx("Włączony") : tx("Wyłączony")}
                    </button>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-slate-400 uppercase tracking-widest text-center font-bold">{tx("Poziom Trudności")}</span>
                        <div className="grid grid-cols-2 gap-2">
                            {['kids', 'easy', 'normal', 'hard'].map(diff => (
                                <button 
                                    key={diff}
                                    onClick={() => {
                                        if(engineRef.current) {
                                            engineRef.current.state.difficulty = diff as 'kids' | 'easy' | 'normal' | 'hard';
                                            engineRef.current.saveGame();
                                            setTriggerRender(r => r + 1);
                                        }
                                    }}
                                    className={`py-2 rounded-lg font-bold text-xs uppercase tracking-widest border transition-all ${engineRef.current.state.difficulty === diff ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                >
                                    {diff === 'kids' ? tx('Dla Dzieci') : diff === 'easy' ? tx('Łatwiejszy') : diff === 'normal' ? tx('Normalny') : tx('Trudny')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-slate-400 uppercase tracking-widest text-center font-bold">{tx("Język / Language")}</span>
                        <div className="grid grid-cols-2 gap-2">
                            {['pl', 'en'].map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => {
                                        if(engineRef.current) {
                                            engineRef.current.state.language = lang as 'pl' | 'en';
                                            engineRef.current.saveGame();
                                            setTriggerRender(r => r + 1);
                                        }
                                    }}
                                    className={`py-2 rounded-lg font-bold text-xs uppercase tracking-widest border transition-all ${engineRef.current.state.language === lang ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                >
                                    {lang === 'pl' ? 'Polski' : 'English'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-2">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs tracking-widest text-slate-300">{tx("Autopomijanie Zwycięstwa")}</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" 
                                    checked={engineRef.current?.state.autoNextLevel ?? true}
                                    onChange={(e) => {
                                        if(engineRef.current) {
                                            engineRef.current.state.autoNextLevel = e.target.checked;
                                            engineRef.current.saveGame(true);
                                            setTriggerRender(r => r + 1);
                                        }
                                    }} 
                                />
                                <div className={`block w-12 h-6 rounded-full transition-colors ${engineRef.current?.state.autoNextLevel ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${engineRef.current?.state.autoNextLevel ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 font-sans">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs tracking-widest text-slate-300">{tx(tx("Wyłącz Trzęsienie Ekranu"))}</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" 
                                    checked={engineRef.current?.state.disableScreenShake ?? false}
                                    onChange={(e) => {
                                        if(engineRef.current) {
                                            engineRef.current.state.disableScreenShake = e.target.checked;
                                            engineRef.current.saveGame(true);
                                            setTriggerRender(r => r + 1);
                                        }
                                    }} 
                                />
                                <div className={`block w-12 h-6 rounded-full transition-colors ${engineRef.current?.state.disableScreenShake ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${engineRef.current?.state.disableScreenShake ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6 font-sans flex flex-col gap-2">
                        <label className="text-slate-300 text-xs font-bold tracking-widest flex justify-between">
                            Zoom Kamery:
                            <span>{Math.round((engineRef.current?.state.cameraZoom || 0.5) * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0.2" max="2.0" step="0.05"
                            value={engineRef.current?.state.cameraZoom || 0.55}
                            onChange={(e) => {
                                if (engineRef.current) {
                                  engineRef.current.state.cameraZoom = parseFloat(e.target.value);
                                  engineRef.current.saveGame(true);
                                }
                                setTriggerRender(r=>r+1);
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
                            Skala Interfejsu (UI):
                            <span>{Math.round((engineRef.current?.state.uiScale || 1.0) * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.05"
                            value={engineRef.current?.state.uiScale || 1.0}
                            onChange={(e) => {
                                if (engineRef.current) {
                                  engineRef.current.state.uiScale = parseFloat(e.target.value);
                                  engineRef.current.saveGame(true);
                                }
                                setTriggerRender(r=>r+1);
                            }}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                  </>
                )}

                {optionsTab === 'investments' && (
                  <>
                    <h2 className="text-xl font-black tracking-tight text-white mb-1.5 text-center">📈 INWESTYCJE</h2>
                    
                    {/* INFO HEADER */}
                    <div className="bg-slate-950/40 border border-slate-500/20 p-2.5 rounded-xl flex justify-between items-center text-xs">
                        <span className="text-slate-400">Elektrony w portfelu:</span>
                        <span className="font-mono text-amber-400 font-bold">
                            {formatMoney(engineRef.current.state.electrons)} e⁻
                        </span>
                    </div>

                    <div className="flex gap-2 my-2">
                        <button 
                            className="bg-indigo-600/50 hover:bg-indigo-500/60 border border-indigo-400/30 text-indigo-100 font-bold py-4 px-4 rounded-xl flex-1 flex flex-col items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                            onClick={() => setOptionsTab('market')}
                        >
                            <span className="text-4xl text-white drop-shadow-md">🏛️</span>
                            <span className="text-xs tracking-widest uppercase font-black">{tx(tx("Wejdź na Giełdę"))}</span>
                        </button>
                    </div>
                    {/* KONTO OSZCZEDNOSCIOWE */}
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-white uppercase tracking-widest">{tx(tx("📈 Konto Oszczędnościowe (+3%)"))}</span>
                            <span className="font-mono text-green-400 font-bold text-xs bg-green-500/10 px-2 py-0.5 rounded">
                                {formatMoney(engineRef.current.state.savingsBalance)} e⁻
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                            Odsetki 3% naliczają się po każdym cyklu (4 pokoje). Wpłacaj i wypłacaj kiedy chcesz!
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-0.5 text-[10px]">
                            {/* WPŁATA */}
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">{tx(tx("Wpłać:"))}</span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.electrons >= 100) {
                                                engineRef.current.state.electrons -= 100;
                                                engineRef.current.state.savingsBalance += 100;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-green-600/30 hover:bg-green-600/50 text-green-300 font-semibold py-1 px-1 rounded text-[9px] flex-1 border border-green-500/15"
                                    >
                                        +100
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.electrons >= 1000) {
                                                engineRef.current.state.electrons -= 1000;
                                                engineRef.current.state.savingsBalance += 1000;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-green-600/30 hover:bg-green-600/50 text-green-300 font-semibold py-1 px-1 rounded text-[9px] flex-1 border border-green-500/15"
                                    >
                                        +1K
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current) {
                                                const amt = Math.floor(engineRef.current.state.electrons);
                                                if (amt > 0) {
                                                    engineRef.current.state.electrons -= amt;
                                                    engineRef.current.state.savingsBalance += amt;
                                                    engineRef.current.saveGame(true);
                                                    setTriggerRender(r => r + 1);
                                                }
                                            }
                                        }}
                                        className="bg-green-700/50 hover:bg-green-600/70 text-green-100 font-bold py-1 px-1 rounded text-[9px] flex-1 border border-green-500/30"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                            
                            {/* WYPŁATA */}
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">{tx(tx("Wypłać:"))}</span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.savingsBalance >= 100) {
                                                engineRef.current.state.savingsBalance -= 100;
                                                engineRef.current.state.electrons += 100;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-semibold py-1 px-1 rounded text-[9px] flex-1 border border-amber-500/15"
                                    >
                                        -100
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.savingsBalance >= 1000) {
                                                engineRef.current.state.savingsBalance -= 1000;
                                                engineRef.current.state.electrons += 1000;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-semibold py-1 px-1 rounded text-[9px] flex-1 border border-amber-500/15"
                                    >
                                        -1K
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current) {
                                                const amt = engineRef.current.state.savingsBalance;
                                                if (amt > 0) {
                                                    engineRef.current.state.savingsBalance = 0;
                                                    engineRef.current.state.electrons += amt;
                                                    engineRef.current.saveGame(true);
                                                    setTriggerRender(r => r + 1);
                                                }
                                            }
                                        }}
                                        className="bg-amber-700/50 hover:bg-amber-600/70 text-amber-100 font-bold py-1 px-1 rounded text-[9px] flex-1 border border-amber-500/30"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OBLIGACJE */}
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col gap-1.5 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-white uppercase tracking-widest leading-none">📜 Obligacje (+7%)</span>
                            {engineRef.current.state.bondsRoomsLeft > 0 ? (
                                <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-500/10 px-2 py-0.5 rounded animate-pulse">
                                    {formatMoney(engineRef.current.state.bondsBalance)} e⁻
                                </span>
                            ) : (
                                <span className="text-[10px] text-slate-500">Brak obligacji</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                            Odsetki 7% procentu składanego na cykl (4 pokoje). Środki blokowane na 2 cykle (8 pokoi), po czym automatycznie wypłacane z zyskiem!
                        </p>
                        
                        {engineRef.current.state.bondsRoomsLeft > 0 ? (
                            <div className="bg-[#0f172a] rounded-lg border border-cyan-500/20 p-2 text-center text-[10px]">
                                <span className="text-slate-400 block mb-0.5">Zablokowane lokowanie obligacji:</span>
                                <span className="font-bold text-cyan-300 text-xs">
                                     {tx(tx("Pozostałe cykle: "))}<span className="text-white text-sm font-black">{engineRef.current.state.bondsRoomsLeft}</span> / 2
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 mt-0.5">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">{tx(tx("Kup obligację jednorazowo:"))}</span>
                                <div className="flex gap-1 text-[10px]">
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.electrons >= 500) {
                                                engineRef.current.state.electrons -= 500;
                                                engineRef.current.state.bondsBalance = 500;
                                                engineRef.current.state.bondsRoomsLeft = 2;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold py-1 px-1.5 rounded text-[9.5px] border border-indigo-500/15 flex-1"
                                    >
                                        Wpłać 500
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current && engineRef.current.state.electrons >= 2000) {
                                                engineRef.current.state.electrons -= 2000;
                                                engineRef.current.state.bondsBalance = 2000;
                                                engineRef.current.state.bondsRoomsLeft = 2;
                                                engineRef.current.saveGame(true);
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold py-1 px-1.5 rounded text-[9.5px] border border-indigo-500/15 flex-1"
                                    >
                                        Wpłać 2K
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (engineRef.current) {
                                                const amt = Math.floor(engineRef.current.state.electrons);
                                                if (amt > 0) {
                                                    engineRef.current.state.electrons -= amt;
                                                    engineRef.current.state.bondsBalance = amt;
                                                    engineRef.current.state.bondsRoomsLeft = 2;
                                                    engineRef.current.saveGame(true);
                                                    setTriggerRender(r => r + 1);
                                                }
                                            }
                                        }}
                                        className="bg-indigo-700/50 hover:bg-indigo-600/70 text-indigo-100 font-extrabold py-1 px-1.5 rounded text-[9.5px] border border-indigo-500/30 flex-1"
                                    >
                                        WPŁAĆ MAX
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* LAN TRANSFER (z suwakiem) */}
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col gap-1.5 mt-2 transition-all">
                        <div className="flex justify-between items-center">
                            <span className="font-black text-xs text-white uppercase tracking-widest leading-none">💸 Transfer do Gracza z LAN</span>
                        </div>
                        {lanActive ? (
                            <>
                                <p className="text-[10px] text-slate-400 leading-normal">
                                    Wyślij elektrony innemu graczowi.
                                </p>
                                <div className="mt-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-slate-700/50">
                                    <span className="text-xl">😎</span>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white">Guest_77</div>
                                        <div className="text-[10px] text-cyan-400">Połączony</div>
                                    </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={Math.max(1, Math.floor(engineRef.current.state.electrons))} 
                                        value={transferAmount} 
                                        onChange={e => setTransferAmount(Number(e.target.value))} 
                                        className="flex-1 accent-cyan-500" 
                                    />
                                    <span className="text-xs font-mono font-bold text-cyan-300 w-12 text-right">{transferAmount} e⁻</span>
                                    </div>
                                    <button 
                                        className="w-full bg-cyan-600/50 hover:bg-cyan-500/60 border border-cyan-400/30 text-xs font-bold py-1.5 rounded transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                                        disabled={transferAmount <= 0 || engineRef.current.state.electrons < transferAmount}
                                        onClick={() => {
                                            if(engineRef.current && engineRef.current.state.electrons >= transferAmount && transferAmount > 0) {
                                                engineRef.current.state.electrons -= transferAmount;
                                                engineRef.current.addLog(`Wysłano ${transferAmount} e⁻ do Guest_77`);
                                                setTransferAmount(0);
                                                setTriggerRender(r=>r+1);
                                            }
                                        }}
                                    >
                                        Wyślij
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-[10px] text-slate-500 italic mt-1 pb-1">
                                {tx("Oczekiwanie na graczy... (Zaloguj się w Ustawieniach do sieci LAN)")}
                            </p>
                        )}
                    </div>

                  </>
                )}

                {optionsTab === 'market' && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                        <button 
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1 px-3 rounded-lg text-xs"
                            onClick={() => setOptionsTab('investments')}
                        >
                            ← Wróć
                        </button>
                        <h2 className="text-xl font-black tracking-tight text-white text-center">{tx("📊 GIEŁDA")}</h2>
                        <div className="w-12"></div>
                    </div>
                    
                    <div className="bg-slate-950/40 border border-slate-500/20 p-2.5 rounded-xl flex justify-between items-center text-xs mb-4">
                        <span className="text-slate-400">Elektrony w portfelu:</span>
                        <span className="font-mono text-amber-400 font-bold">
                            {engineRef.current ? formatMoney(engineRef.current.state.electrons) : 0} e⁻
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-2">
                        {engineRef.current && engineRef.current.state.market.assets.map(asset => {
                            const maxWplata = Math.floor(engineRef.current!.state.electrons);
                            const currentValue = asset.shares * asset.currentPrice;
                            const amnt = marketAmounts[asset.id] || 0;
                            const maxWypLata = Math.floor(currentValue);

                            const points = asset.history.map((val, i) => {
                                const min = Math.min(...asset.history, 0) * 0.9;
                                const max = Math.max(...asset.history, 1) * 1.1;
                                const divisor = Math.max(1, asset.history.length - 1);
                                const x = (i / divisor) * 200; // width 200
                                const y = 40 - ((val - min) / (max - min)) * 40; // height 40
                                return `${x},${y}`;
                            }).join(' ');

                            return (
                                <div key={asset.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-1.5 h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-xs text-indigo-300 uppercase tracking-widest leading-none">{asset.name}</span>
                                                <button onClick={() => setMarketExpandedDescs(prev => ({...prev, [asset.id]: !prev[asset.id]}))} className="text-white text-xs bg-indigo-500/40 hover:bg-indigo-500 w-5 h-5 rounded-full flex items-center justify-center font-bold pb-0.5 cursor-pointer transition-colors shadow-sm shrink-0">?</button>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                Kurs: <span className="text-white font-mono">{formatMoney(asset.currentPrice)} e⁻</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <div className="text-[10px] text-slate-400 leading-none mb-1">Twoje Udziały:</div>
                                            <div className="text-xs font-bold text-green-400 font-mono leading-none">{formatMoney(currentValue)} e⁻</div>
                                        </div>
                                    </div>
                                    
                                    {/* Opis */}
                                    <div className={`text-[9px] text-slate-400 leading-tight mt-0.5 mb-1 cursor-pointer transition-all ${marketExpandedDescs[asset.id] ? '' : 'line-clamp-2'}`} onClick={() => setMarketExpandedDescs(prev => ({...prev, [asset.id]: !prev[asset.id]}))}>
                                        {asset.desc}
                                    </div>
                                    
                                    <div className="w-full h-12 bg-[#0a0f1a] rounded-lg overflow-hidden border border-white/5 relative shrink-0">
                                        {/* Chart Box */}
                                        <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
                                            <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 mt-auto">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                            <span>Kwota: <span className="text-white">{amnt} e⁻</span></span>
                                            <span>MAX KUP: {maxWplata} e⁻</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max={Math.max(maxWplata, maxWypLata) || 100}
                                            value={Math.min(amnt, Math.max(maxWplata, maxWypLata))}
                                            onChange={e => setMarketAmounts(st => ({...st, [asset.id]: parseInt(e.target.value)}))}
                                            className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-2"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    const kwota = Math.min(amnt, maxWplata);
                                                    if (kwota > 0 && engineRef.current) {
                                                        const sharesBought = kwota / asset.currentPrice;
                                                        engineRef.current.state.electrons -= kwota;
                                                        asset.shares += sharesBought;
                                                        engineRef.current.saveGame(true);
                                                        setMarketAmounts(st => ({...st, [asset.id]: 0}));
                                                    }
                                                }}
                                                className="flex-1 bg-green-500/20 hover:bg-green-500/40 text-green-300 font-bold py-2 rounded-lg text-xs border border-green-500/30 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                            >KUP</button>
                                            <button 
                                                onClick={() => {
                                                    const kwota = Math.min(amnt, maxWypLata);
                                                    if (kwota > 0 && engineRef.current) {
                                                        const sharesSold = kwota / asset.currentPrice;
                                                        asset.shares -= sharesSold;
                                                        if (asset.shares < 0.001) asset.shares = 0; // fp fixing
                                                        engineRef.current.state.electrons += kwota;
                                                        if (!engineRef.current.state.taxEntries) {
                                                            engineRef.current.state.taxEntries = [];
                                                        }
                                                        engineRef.current.state.taxEntries.push({
                                                            id: `tax_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                                                            incomeAmount: kwota,
                                                            taxAmount: kwota * 0.19,
                                                            roomsSinceTaxOwed: 0,
                                                            paid: false,
                                                            description: `Sprzedaż aktywów: ${asset.name}`
                                                        });
                                                        engineRef.current.state.unpaidTax = engineRef.current.state.taxEntries
                                                            .filter(e => !e.paid)
                                                            .reduce((a, b) => a + b.taxAmount, 0);
                                                        engineRef.current.saveGame(true);
                                                        setMarketAmounts(st => ({...st, [asset.id]: 0}));
                                                    }
                                                }}
                                                className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 rounded-lg text-xs border border-red-500/30 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                            >SPRZEDAJ</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </>
                )}
             </div>
         </div>
      )}

      {showingLan && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0B0F19]/90 text-slate-100 z-[100] backdrop-blur-md p-2">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.3)] w-full max-w-md rounded-2xl p-4 relative flex flex-col gap-3">
                <button 
                    className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform text-slate-400 hover:text-white"
                    onClick={() => setShowingLan(false)}>
                    ×
                </button>
                <h2 className="text-xl font-black tracking-tight text-white text-center flex items-center justify-center gap-2">
                    <span className="text-indigo-400">⚛️</span> {tx("Tryb Wieloosobowy")}
                </h2>
                <p className="text-center text-slate-400 text-xs">Aż do 4 graczy! Bądź na tym samym linku.</p>
                
                <div className="flex flex-col items-center gap-3 mt-2">
                    <div className="bg-indigo-900/40 border border-indigo-500/40 rounded-xl p-4 flex flex-col items-center text-center w-full">
                        <div className="flex flex-col items-center mb-4 w-full">
                            <label className="text-[10px] text-indigo-300 font-bold mb-1 uppercase tracking-wider">Twój Nick</label>
                            <input 
                                type="text" 
                                maxLength={16}
                                value={lanNick}
                                onClick={e => e.stopPropagation()}
                                onChange={(e) => {
                                    setLanNick(e.target.value);
                                    localStorage.setItem('lanNick', e.target.value);
                                }}
                                className="bg-black/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white text-center focus:border-indigo-400 outline-none w-full max-w-[200px]"
                                placeholder="Wpisz swój nick..."
                            />
                        </div>

                        <div className="flex gap-2 w-full flex-col mt-2">
                            <h4 className="text-white font-bold text-xs border-b border-indigo-500/30 pb-1 mb-1">🌍 Przez Internet</h4>
                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = true;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs border border-indigo-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>👑</span> HOSTUJ (GLOBALNIE)
                            </button>
                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = false;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs border border-blue-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>🔌</span> DOŁĄCZ DO GRY
                            </button>

                            <h4 className="text-white font-bold text-xs border-b border-indigo-500/30 pb-1 mt-2 mb-1">🏠 Lokalnie (Szybciej)</h4>
                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = true;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-xs border border-green-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>📱</span> HOSTUJ Z KOMÓRKI (LAN)
                            </button>
                            <button 
                                onClick={() => {
                                    setShowingLan(false);
                                    setLanActive(true);
                                    localStorage.setItem('lanActive', 'true');
                                    if (engineRef.current) {
                                        engineRef.current.state.isHost = false;
                                        engineRef.current.state.showingLobby = true;
                                    }
                                }}
                                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg text-xs border border-teal-500/50 transition-all active:scale-95 w-full flex items-center justify-center gap-2"
                            >
                                <span>🛜</span> DOŁĄCZ PRZEZ LAN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {engineRef.current?.state.showingLobby && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/90 text-slate-100 z-[120] backdrop-blur-xl p-2 md:p-4">
             <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/50 w-full max-w-sm md:max-w-lg rounded-2xl md:rounded-3xl p-4 md:p-6 relative shadow-[0_0_50px_rgba(99,102,241,0.3)]">
                <button 
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-xl md:text-2xl hover:scale-110 transition-transform text-slate-400 hover:text-white"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingLobby = false; }}>
                  ×
                </button>
                <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2 text-white flex items-center gap-2 border-b border-indigo-500/30 pb-2 md:pb-3">
                   <div className="text-2xl md:text-3xl animate-pulse">👥</div> Lobby Wieloosobowe
                </h2>
                
                <p className="text-xs md:text-sm text-indigo-300 mb-3 md:mb-4 px-1">Oczekuj na pozostałych graczy. Gdy wszyscy będą gotowi, kliknij Start (uruchomi wybraną grę u wszystkich).</p>

                <div className="bg-black/40 rounded-xl p-3 md:p-4 border border-white/5 mb-4 md:mb-6">
                    <h3 className="font-bold text-slate-300 text-xs md:text-sm mb-2 md:mb-3">Obecni Gracze:</h3>
                    <div className="flex flex-col gap-1.5 md:gap-2 max-h-32 md:max-h-48 overflow-y-auto">
                        <div className="flex justify-between items-center bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-500/20">
                            <span className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                {lanNick} (Ty)
                            </span>
                        </div>
                        {engineRef.current.state.networkPlayers?.map((p: any) => (
                            <div key={p.id} className="flex justify-between items-center bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                                <span className="font-bold text-slate-300 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    {p.nick || 'Gracz'}
                                </span>
                            </div>
                        ))}
                        {(!engineRef.current.state.networkPlayers || engineRef.current.state.networkPlayers.length === 0) && (
                            <div className="text-center text-slate-500 text-xs py-2 italic animate-pulse">
                                Oczekiwanie na graczy...
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 md:gap-3">
                    {engineRef.current.state.isHost ? (
                        <button 
                            onClick={() => {
                                if (engineRef.current) {
                                    engineRef.current.state.showingLobby = false;
                                    engineRef.current.state.showingSaves = true;
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 md:py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex justify-center items-center gap-2 active:scale-95 text-xs md:text-base"
                        >
                            🚀 WYBIERZ ZAPIS I ROZPOCZNIJ
                        </button>
                    ) : (
                        <div className="bg-slate-800/80 border border-slate-600 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-center text-xs animate-pulse">
                            Oczekiwanie na hosta...
                        </div>
                    )}
                    <button 
                        onClick={() => { if(engineRef.current) engineRef.current.state.showingLobby = false; }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 md:py-2.5 px-4 rounded-xl border border-slate-600 transition-all text-xs md:text-sm"
                    >
                        {tx("Wróć do Menu")}
                    </button>
                </div>
             </div>
         </div>
      )}

      {showingSaves && engineRef.current && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[120] backdrop-blur-xl p-4">
             <div className="bg-white/5 border border-white/10 w-full max-w-md md:max-w-xl rounded-2xl p-3 md:p-5 relative shadow-2xl max-h-[96vh] overflow-y-auto">
                <button 
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-xl md:text-2xl hover:scale-110 transition-transform"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingSaves = false; }}>
                  ❌
                </button>
                <h2 className="text-sm md:text-lg font-black tracking-tight mb-2 md:mb-4 text-slate-300 border-b border-slate-700 pb-1 md:pb-2">💾 {tx("Zapisy Gry")}</h2>
                
                <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
                    {engineRef.current.getSaveSlotsInfo().map((slotInfo) => (
                        <div key={slotInfo.slot} className="bg-slate-900/50 border border-slate-600/50 rounded-xl p-2.5 flex flex-col justify-between shadow-md gap-2">
                            <div className="flex flex-row gap-3 items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white mb-0.5 leading-tight">Slot {slotInfo.slot} <span className="text-[10px] font-normal text-slate-400">{engineRef.current?.currentSaveSlot === slotInfo.slot ? '{tx("(Obecny)")}' : ''}</span></span>
                                    {slotInfo.empty ? (
                                        <span className="text-[10px] text-slate-500 leading-none">{tx("Pusty slot")}</span>
                                    ) : (
                                        <span className="text-[10px] text-indigo-300 leading-none font-mono">{tx("Poziom: ")}{slotInfo.level} | e⁻: {Number(slotInfo.electrons).toExponential(3)}</span>
                                    )}
                                </div>
                                <div className="flex gap-1.5 justify-end">
                                    {!slotInfo.empty && (
                                        <button onClick={() => { 
                                            engineRef.current?.loadGame(slotInfo.slot); 
                                            engineRef.current?.syncReactions();
                                            engineRef.current!.state.showingSaves = false; 
                                            setTriggerRender(r => r + 1);
                                            if (globalWs && globalWs.readyState === WebSocket.OPEN) {
                                                globalWs.send(JSON.stringify({ type: 'broadcast', payload: { event: 'start_game', hostState: { level: engineRef.current!.state.level, isLobby: engineRef.current!.state.isLobby, unlockedAtoms: engineRef.current!.state.unlockedAtoms } } }));
                                            }
                                        }} className="bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded-lg font-bold text-[10px] transition-all whitespace-nowrap">
                                            Wczytaj
                                        </button>
                                    )}
                                    {engineRef.current?.state.state === 'playing' ? (
                                        <button onClick={() => { 
                                            engineRef.current!.currentSaveSlot = slotInfo.slot; 
                                            engineRef.current?.saveGame(true); 
                                            setTriggerRender(r => r + 1); 
                                            engineRef.current!.state.showingSaves = false; 
                                            if (globalWs && globalWs.readyState === WebSocket.OPEN) {
                                                globalWs.send(JSON.stringify({ type: 'broadcast', payload: { event: 'start_game', hostState: { level: engineRef.current!.state.level, isLobby: engineRef.current!.state.isLobby, unlockedAtoms: engineRef.current!.state.unlockedAtoms } } }));
                                            }
                                        }} className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded-lg font-bold text-[10px] transition-all whitespace-nowrap">
                                            Zapisz
                                        </button>
                                    ) : (
                                        slotInfo.empty ? (
                                            <button onClick={() => { 
                                                engineRef.current!.currentSaveSlot = slotInfo.slot; 
                                                engineRef.current!.resetGame();
                                                engineRef.current!.state.state = 'playing';
                                                engineRef.current?.saveGame(true); 
                                                setTriggerRender(r => r + 1); 
                                                engineRef.current!.state.showingSaves = false; 
                                                if (globalWs && globalWs.readyState === WebSocket.OPEN) {
                                                    globalWs.send(JSON.stringify({ type: 'broadcast', payload: { event: 'start_game', hostState: { level: engineRef.current!.state.level, isLobby: engineRef.current!.state.isLobby, unlockedAtoms: engineRef.current!.state.unlockedAtoms } } }));
                                                }
                                            }} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-lg font-bold text-[10px] transition-all whitespace-nowrap">
                                                Nowa Gra
                                            </button>
                                        ) : null
                                    )}
                                    {!slotInfo.empty && (
                                        <button onClick={() => setDeleteSaveConfirm(slotInfo.slot)} className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded-lg font-bold text-[10px] transition-all whitespace-nowrap">
                                            Usuń
                                        </button>
                                    )}
                                </div>
                            </div>
                            {!slotInfo.empty && slotInfo.unlockedAtoms && slotInfo.unlockedAtoms.length > 0 && (
                                <div className="text-[9px] text-slate-400 mt-1 pb-1 pt-1 border-t border-slate-700/50">
                                    <span className="font-bold text-slate-300">{tx("Dostępne atomy:")}</span> {slotInfo.unlockedAtoms.join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {deleteSaveConfirm !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[130] p-4 rounded-2xl">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-sm w-full flex flex-col items-center">
                            <h3 className="text-white text-lg font-bold mb-2">{tx("")} Zapis</h3>
                            <p className="text-slate-400 text-sm mb-6 text-center">Czy na pewno chcesz bezpowrotnie usunąć zapis ze slotu {deleteSaveConfirm}?</p>
                            <div className="flex gap-4 w-full">
                                <button 
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all"
                                    onClick={() => setDeleteSaveConfirm(null)}
                                >Anuluj</button>
                                <button 
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                                    onClick={() => {
                                        if (engineRef.current) {
                                            engineRef.current.deleteSave(deleteSaveConfirm);
                                            if (engineRef.current.currentSaveSlot === deleteSaveConfirm) {
                                                engineRef.current.state.state = 'menu';
                                            }
                                        }
                                        setDeleteSaveConfirm(null);
                                        setTriggerRender(r => r + 1);
                                    }}
                                >{tx("")}</button>
                            </div>
                        </div>
                    </div>
                )}

                {infoModal !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[130] p-4 rounded-2xl" onClick={() => setInfoModal(null)}>
                        <div className="bg-slate-900 border border-indigo-700 p-6 rounded-xl max-w-sm w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <h3 className="text-white text-lg font-bold mb-4 text-indigo-300">Witaj Inwestorze!</h3>
                            <p className="text-slate-300 text-sm mb-6 text-center whitespace-pre-wrap">{infoModal}</p>
                            <button 
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                onClick={() => setInfoModal(null)}
                            >Rozumiem</button>
                        </div>
                    </div>
                )}
             </div>
         </div>
      )}

      {showingStats && engineRef.current && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[100] backdrop-blur-xl p-4">
             <div className="bg-white/5 border border-white/10 w-full max-w-2xl rounded-3xl p-8 relative shadow-2xl maxHeight-[90vh] overflow-y-auto">
                <button 
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingStats = false; }}>
                  ❌
                </button>
                <h2 className="text-3xl font-black tracking-tight mb-8 text-blue-300 border-b border-blue-900 pb-4">{tx("📊 Statystyki")} Wiązań</h2>
                
                <div className="grid grid-cols-1 gap-4">
                    {['ch4', 'nh3', 'h2o', 'co2', 'no2', 'h2s', 'so2', 'h2so4', 'sio2', 'sic'].map(id => {
                        const count = engineRef.current!.state.stats.reactionsCount[id] || 0;
                        if (count === 0) return null;
                        
                        let name = '';
                        if (id === 'ch4') name = 'Methane Blast';
                        if (id === 'nh3') name = 'Ammonia Freeze';
                        if (id === 'h2o') name = 'Water Blast';
                        if (id === 'co2') name = 'Acid Cloud';
                        if (id === 'no2') name = 'Toxic Gas';
                        if (id === 'h2s') name = 'Siarkowodór';
                        if (id === 'so2') name = 'Dwutlenek Siarki';
                        if (id === 'h2so4') name = 'Kwas Siarkowy';
                        if (id === 'sio2') name = 'Krzemionka (Szkło)';
                        if (id === 'sic') name = 'Węglik Krzemu';
                        if (id === 'h2so3') name = 'Kwas Siarkawy';
                        if (id === 'c3') name = 'Grafit';
                        if (id === 'c6') name = 'Diament';
                        
                        const total = Object.values(engineRef.current!.state.stats.reactionsCount).reduce((a: number, b: number) => a + b, 0) as number;
                        const perc = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                           <div key={id} className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex justify-between items-center shadow-lg">
                               <div className="font-bold text-lg text-white">{name} <span className="text-sm font-normal text-slate-400 ml-2">({perc}%)</span></div>
                               <div className="text-xl font-black text-yellow-400">Wykonano: {count}x</div>
                           </div>
                        );
                    })}
                    {Object.keys(engineRef.current!.state.stats.reactionsCount).length === 0 && (
                        <div className="text-center text-slate-500 py-8">Brak wykonanych wiązań.</div>
                    )}
                </div>

                {/* HILARIOUS SCROLL DEEP DARK VOID SPACER */}
                <div className="h-[1500px] flex flex-col justify-end items-center text-center pb-8 border-t border-dashed border-slate-900/40 mt-20">
                    <div className="text-slate-600 font-mono text-[10px] uppercase select-none space-y-2 max-w-md animate-pulse">
                        <p>🌌 Pustka w statystykach 🌌</p>
                        <p>Zjechałeś bardzo, bardzo głęboko...</p>
                        <p>Czy próbujesz ukryć faktury VAT przed Urzędem Skarbowym Mendelejewa?</p>
                        <p>Przewijaj dalej na własną odpowiedzialność...</p>
                        <p className="text-lg">⬇️</p>
                    </div>
                </div>

                {/* URZĄD SKARBOWY GŁÓWNEJ CYTADELI (USGC) */}
                <div id="urzad_skarbowy" className="bg-slate-950/90 border border-yellow-500/30 rounded-2xl p-6 mt-10 shadow-[0_0_30px_rgba(234,179,8,0.1)] flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-yellow-500/25 pb-3 text-left">
                        <span className="text-2xl">🏢</span>
                        <div>
                            <h3 className="font-extrabold text-lg text-yellow-400 uppercase tracking-widest">Urząd Skarbowy Głównej Cytadeli (USGC)</h3>
                            <p className="text-[10px] text-slate-400">Oficjalny System Poboru Podatków i Weryfikacji Kosztów Mendelejewa</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-white/5">
                            <span className="text-[10px] text-slate-400 uppercase font-black">ZALEGŁY PODATEK BELI SŁOMY:</span>
                            <span className="text-2xl font-black text-red-500 mt-1">{formatMoney(Math.ceil(engineRef.current.state.unpaidTax || 0))} e⁻</span>
                            <p className="text-[9px] text-slate-400 mt-2">
                                {engineRef.current.state.policeSpawning 
                                  ? "⚠️ ALARM! Oddziały policji na bagietkach zostały wysłane. Odkręć to natychmiast płacąc podatki!" 
                                  : `Zaległość liczona na podstawie Twoich zrealizowanych transakcji.`}
                            </p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl flex flex-col justify-between border border-white/5">
                            <span className="text-[10px] text-slate-400 uppercase font-black">DOSTĘPNE ELEKTRONY:</span>
                            <span className="text-2xl font-black text-green-400 mt-1">{formatMoney(engineRef.current.state.electrons)} e⁻</span>
                            <p className="text-[9px] text-slate-400 mt-2">Użyj swojego zbilansowanego konta elektronowego do uregulowania długu.</p>
                        </div>
                    </div>

                    {/* SZCZEGÓŁOWA TABELA PODATKOWA DLA KAŻDEGO PRZYCHODU */}
                    <div className="border-t border-slate-900/65 pt-4 text-left">
                        <h4 className="font-extrabold text-sm text-slate-300 uppercase mb-2 flex items-center gap-2">
                            <span>📊</span> Ewidencja Przychodów i Indywidualnych Podatków Beli Słomy:
                        </h4>
                        <p className="text-[10px] text-slate-400 mb-3">
                            Każdy zrealizowany przychód ma swój własny, oddzielny czas podatkowy (termin płatności). Przekroczenie 10 pokoi dla dowolnego wpisu przesyła zlecenie do kociej policji skarbowej!
                        </p>
                        
                        {engineRef.current.state.taxEntries && engineRef.current.state.taxEntries.filter(e => !e.paid).length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-2">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[9px]">
                                            <th className="p-2">Oprawca handlowy (Opis)</th>
                                            <th className="p-2 text-right">Przychód</th>
                                            <th className="p-2 text-right text-red-400">Podatek (19%)</th>
                                            <th className="p-2 text-center">Wiek (Pokoi)</th>
                                            <th className="p-2 text-center">Status</th>
                                            <th className="p-2 text-center">Akcja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {engineRef.current.state.taxEntries.filter(e => !e.paid).map(e => {
                                            const isOverdue = e.roomsSinceTaxOwed >= 10;
                                            return (
                                                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-2 font-semibold text-slate-200">{e.description}</td>
                                                    <td className="p-1 px-2 text-right font-mono text-green-400">{formatMoney(Math.floor(e.incomeAmount))} e⁻</td>
                                                    <td className="p-1 px-2 text-right font-mono text-red-400 font-bold">{formatMoney(Math.ceil(e.taxAmount))} e⁻</td>
                                                    <td className="p-1 text-center font-mono font-bold text-xs">
                                                        <span className={
                                                            e.roomsSinceTaxOwed >= 8 ? "text-red-500 animate-pulse" :
                                                            e.roomsSinceTaxOwed >= 5 ? "text-amber-500" :
                                                            "text-cyan-400"
                                                        }>
                                                            {e.roomsSinceTaxOwed}/10 pokoi
                                                        </span>
                                                        <div className="text-[9px] text-slate-500 font-normal">
                                                            {10 - e.roomsSinceTaxOwed > 0 ? `Zostało: ${10 - e.roomsSinceTaxOwed} pok.` : 'Nalot policji!'}
                                                        </div>
                                                    </td>
                                                    <td className="p-1 text-center">
                                                        {isOverdue ? (
                                                            <span className="bg-red-500/25 text-red-400 font-bold px-1.5 py-0.5 rounded text-[9px] animate-pulse">PRZETERMINOWANE</span>
                                                        ) : (
                                                            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px]">W terminie</span>
                                                        )}
                                                    </td>
                                                    <td className="p-1 text-center">
                                                        <button
                                                            disabled={engineRef.current.state.electrons < Math.ceil(e.taxAmount)}
                                                            onClick={() => {
                                                                if (engineRef.current) {
                                                                    engineRef.current.state.electrons -= Math.ceil(e.taxAmount);
                                                                    e.paid = true;
                                                                    e.taxAmount = 0;
                                                                    
                                                                    const unpaidEntries = engineRef.current.state.taxEntries.filter(x => !x.paid);
                                                                    engineRef.current.state.unpaidTax = unpaidEntries.reduce((acc, curr) => acc + curr.taxAmount, 0);
                                                                    
                                                                    const anyLeftWithOverdue = unpaidEntries.some(x => x.roomsSinceTaxOwed >= 10);
                                                                    if (!anyLeftWithOverdue) {
                                                                        engineRef.current.state.policeSpawning = false;
                                                                    }
                                                                    
                                                                    engineRef.current.saveGame(true);
                                                                    engineRef.current.addLog(`🧾 Sukces: Opłacono podatek dla pozycji "${e.description}"!`);
                                                                    setTriggerRender(r => r + 1);
                                                                }
                                                            }}
                                                            className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${
                                                                engineRef.current.state.electrons >= Math.ceil(e.taxAmount)
                                                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                                                                    : 'bg-red-950/30 text-red-500/40 cursor-not-allowed border border-red-900/10'
                                                            }`}
                                                        >
                                                            Zapłać
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic py-2">Brak zaległych przychodów i pojedynczych podatków do opłacenia.</p>
                        )}
                    </div>

                    {/* FACTURES LIST */}
                    <div className="border-t border-slate-900/65 pt-4 text-left">
                        <h4 className="font-extrabold text-sm text-slate-300 uppercase mb-2 flex items-center gap-2">
                            <span>🧾</span> Twoje Faktury VAT za Broń i Potki (Odpis od podatku):
                        </h4>
                        <p className="text-[10px] text-slate-400 mb-3">Zgodnie z dekretem USGC, legalnie zakupiony arsenał i eliksiry lecznicze dają prawo do 80-85% zwrotu! (Modyfikacje genetyczne są nielegalne i odrzucone).</p>
                        
                        {engineRef.current.state.invoices && engineRef.current.state.invoices.filter(f => !f.submitted).length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                                {engineRef.current.state.invoices.filter(f => !f.submitted).map(f => (
                                    <div key={f.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                            <p className="font-bold text-xs text-slate-200">{f.name}</p>
                                            <p className="text-[10px] text-slate-400">Koszt zakupu: {f.cost} e⁻ | <span className="text-green-400 font-bold">Odpis: -{f.writeOffAmount} e⁻</span></p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (engineRef.current) {
                                                    f.submitted = true;
                                                    const writeOff = f.writeOffAmount;
                                                    
                                                    // Deduct writeOff from unpaid tax entries (from oldest to newest)
                                                    let remainingWriteOff = writeOff;
                                                    if (!engineRef.current.state.taxEntries) {
                                                        engineRef.current.state.taxEntries = [];
                                                    }
                                                    const unpaidEntries = engineRef.current.state.taxEntries.filter(e => !e.paid);
                                                    for (const entry of unpaidEntries) {
                                                        if (remainingWriteOff <= 0) break;
                                                        const deduct = Math.min(entry.taxAmount, remainingWriteOff);
                                                        entry.taxAmount -= deduct;
                                                        remainingWriteOff -= deduct;
                                                        if (entry.taxAmount <= 0.01) {
                                                            entry.paid = true;
                                                            entry.taxAmount = 0;
                                                        }
                                                    }
                                                    
                                                    // Recalculate unpaidTax
                                                    engineRef.current.state.unpaidTax = engineRef.current.state.taxEntries
                                                        .filter(e => !e.paid)
                                                        .reduce((a, b) => a + b.taxAmount, 0);

                                                    const anyLeftWithOverdue = engineRef.current.state.taxEntries
                                                        .some(e => !e.paid && e.roomsSinceTaxOwed >= 10);
                                                    if (!anyLeftWithOverdue) {
                                                        engineRef.current.state.policeSpawning = false;
                                                    }
                                                    
                                                    engineRef.current.saveGame(true);
                                                    engineRef.current.addLog(`🧾 Wysłano fakturę! Obniżono Twój podatek o ${writeOff} e⁻.`);
                                                    setTriggerRender(r => r + 1);
                                                }
                                            }}
                                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-yellow-500/20 transition-all hover:scale-105">
                                            Wyślij do odpisu (-{f.writeOffAmount} e⁻)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic py-2">Brak nowych faktur do odliczenia. Kup blastera (bronie) lub eliksir leczniczy (potki) w sklepie, aby otrzymać fakturę VAT.</p>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-900/65 pt-4">
                        <button 
                            disabled={(engineRef.current.state.unpaidTax || 0) <= 0 || engineRef.current.state.electrons < engineRef.current.state.unpaidTax}
                            onClick={() => {
                                if (engineRef.current) {
                                    if (!engineRef.current.state.taxEntries) engineRef.current.state.taxEntries = [];
                                    const unpaidEntries = engineRef.current.state.taxEntries.filter(e => !e.paid);
                                    let totalCost = 0;
                                    unpaidEntries.forEach(e => {
                                        totalCost += Math.ceil(e.taxAmount);
                                        e.paid = true;
                                        e.taxAmount = 0;
                                    });
                                    engineRef.current.state.electrons = Math.max(0, engineRef.current.state.electrons - totalCost);
                                    engineRef.current.state.unpaidTax = 0;
                                    engineRef.current.state.roomsSinceTaxOwed = 0;
                                    engineRef.current.state.policeSpawning = false;
                                    engineRef.current.saveGame(true);
                                    engineRef.current.addLog(`🧾 Sukces: Wszystkie pozycje podatkowe opłacone! Policja skarbowa odpuściła.`);
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className={`flex-1 py-3 rounded-xl font-extrabold text-sm uppercase transition-all flex items-center justify-center gap-2 ${((engineRef.current.state.unpaidTax || 0) <= 0) ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-white/5' : (engineRef.current.state.electrons < engineRef.current.state.unpaidTax) ? 'bg-red-950/30 text-red-500/80 cursor-not-allowed border border-red-900/30' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.25)] hover:scale-[1.01]'}`}>
                            <span>🏦</span> Opłać Zbiorczo Podatki Beli Słomy ({formatMoney(Math.ceil(engineRef.current.state.unpaidTax))} e⁻)
                        </button>
                    </div>
                </div>
             </div>
         </div>
      )}

      {showingRecipeBook && engineRef.current && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[100] backdrop-blur-xl p-4">
             <div className="bg-white/5 border border-white/10 w-full max-w-3xl rounded-3xl p-8 relative shadow-2xl overflow-y-auto" style={{ maxHeight: '90vh' }}>
                <button 
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingRecipeBook = false; }}>
                  ❌
                </button>
                <h2 className="text-3xl font-black tracking-tight mb-8 text-indigo-300 border-b border-indigo-900 pb-4">{tx("")}</h2>
                
                <div className="flex flex-col gap-10">
                    {Object.entries(
                        REACTIONS_DB.reduce((acc, rx) => {
                            const cat = (rx as any).category || 'Inne';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(rx);
                            return acc;
                        }, {} as Record<string, typeof REACTIONS_DB>)
                    ).map(([cat, rxList]) => (
                        <div key={cat} className="animate-fade-in">
                            <h3 className="text-xl font-bold text-slate-300 border-b border-indigo-900/50 pb-2 mb-4 pl-2 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">{cat}</h3>
                            <div className={`grid grid-cols-1 gap-6 ${engineRef.current!.state.unlockedCharacters.includes('mendelejew') ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'}`}>
                                {rxList.map(rx => {
                                    const unlocked = engineRef.current!.state.unlockedReactions.includes(rx.id);
                                    
                                    return (
                                       <div key={rx.id} onClick={() => unlocked && setPreviewReaction({id: rx.id, name: rx.name, equation: rx.eq, description: rx.desc, atoms: rx.atoms})} className={`rounded-xl p-4 md:p-6 flex flex-row items-center gap-4 shadow-lg transition-all ${unlocked ? 'bg-indigo-900/20 hover:bg-indigo-800/40 border border-indigo-500/30 cursor-pointer hover:scale-[1.02] active:scale-95' : 'bg-slate-900/40 border border-slate-700/50 opacity-60 grayscale'}`}>
                                            <div className="shrink-0 scale-75 md:scale-100">
                                                <MoleculeGraphic atoms={unlocked ? rx.atoms : ['?']} size="sm" />
                                            </div>
                                            <div className="flex flex-col text-left overflow-hidden">
                                                <div className="font-black text-sm md:text-xl text-yellow-400 mb-1 tracking-widest leading-tight truncate">{unlocked ? rx.eq : '??? ➔ ???'}</div>
                                                <div className="font-bold text-xs md:text-lg mb-1 text-white truncate">{unlocked ? rx.name : 'Nieznane Wiązanie'}</div>
                                                {unlocked ? (
                                                    <div className="text-[10px] md:text-[11px] text-indigo-300 leading-snug line-clamp-2 md:line-clamp-none">{rx.desc}</div>
                                                ) : (
                                                    <div className="text-red-400 font-bold tracking-widest text-[10px] md:text-xs">ZABLOKOWANE</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      )}

      {engineRef.current && engineRef.current.state.showingMercenary && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[100] backdrop-blur-xl p-4">
             <div className="bg-green-950/90 border border-green-500/30 w-full max-w-2xl rounded-3xl p-8 relative shadow-[0_0_50px_rgba(34,197,94,0.2)] maxHeight-[90vh] overflow-y-auto">
                <button 
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform text-green-300"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingMercenary = false; setTriggerRender(r=>r+1); }}>
                  ✖
                </button>
                <div className="flex flex-col items-center mb-8 pb-4 border-b border-green-500/20">
                    <h2 className="text-4xl font-black tracking-tight text-green-400 mb-2">🐾 NAJEMNICY</h2>
                    <p className="text-green-200/70 font-medium tracking-wide">Wynajmij kociego najemnika by pomógł ci do końca tego piętra. (Znika po pokonaniu bossa!)</p>
                    <div className="flex justify-between items-center w-full mt-6 bg-black/40 p-4 rounded-xl border border-green-900">
                        <span className="font-bold text-lg text-slate-300">Koszt najmu w elektronach:</span>
                        <span className="text-2xl font-black text-yellow-400">{tx("500 e⁻ x Wynajęty Poziom")}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {[
                        { id: 'ginger_cat', name: 'Rudy Najemnik', emoji: '😾', element: 'C', cost: 500 * (engineRef.current.state.level || 1) },
                        { id: 'black_cat', name: 'Avo-Gatto Najemnik', emoji: '🐈‍⬛', element: 'H', cost: 600 * (engineRef.current.state.level || 1) },
                        { id: 'bohr_cat', name: 'Bohr Najemnik', emoji: '😼', element: 'N', cost: 800 * (engineRef.current.state.level || 1) },
                        { id: 'curie_cat', name: 'Curie Najemnik', emoji: '😻', element: 'Ra', cost: 1000 * (engineRef.current.state.level || 1) },
                        { id: 'schrodinger_cat', name: 'Schrodinger Najemnik', emoji: '🙀', element: 'S', cost: 1200 * (engineRef.current.state.level || 1) }
                    ].filter(merc => merc.id !== engineRef.current?.state.selectedCharacter).map(merc => {
                        const isCurrent = engineRef.current?.state.companion === merc.id;
                        const canAfford = (engineRef.current?.state.electrons || 0) >= merc.cost;
                        
                        return (
                            <div key={merc.id} className={`flex justify-between items-center p-4 rounded-2xl border ${isCurrent ? 'bg-green-500/20 border-green-400' : 'bg-black/30 border-green-500/20'} transition-all`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{merc.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-xl text-green-300">{merc.name}</h3>
                                        <p className="text-xs text-green-100/50">Strzela z pocisków {merc.element}</p>
                                    </div>
                                </div>
                                
                                {isCurrent ? (
                                    <div className="px-6 py-3 bg-green-900/50 text-green-300 font-bold rounded-xl border border-green-700/50 cursor-not-allowed">
                                        WYNAJĘTY
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            if (canAfford && engineRef.current) {
                                                engineRef.current.state.electrons -= merc.cost;
                                                engineRef.current.state.companion = merc.id;
                                                engineRef.current.state.showingMercenary = false;
                                                setTriggerRender(r => r + 1);
                                            }
                                        }}
                                        className={`px-6 py-3 font-bold rounded-xl whitespace-nowrap transition-all ${canAfford ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        KUP ({formatMoney(merc.cost)} e⁻)
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
         </div>
      )}

      {engineRef.current && engineRef.current.state.showingAlchemy && (
         <AlchemyTable 
            engine={engineRef.current} 
            onClose={() => { if(engineRef.current) { engineRef.current.state.showingAlchemy = false; engineRef.current.state.player.pos = { x: 0, y: 100 }; } setTriggerRender(r=>r+1); }} 
            setTriggerRender={setTriggerRender} 
         />
      )}

      {engineRef.current && engineRef.current.state.showingWorkshop && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[100] backdrop-blur-xl p-4">
             <div className="bg-slate-900/90 border border-indigo-500/30 w-full max-w-2xl rounded-3xl p-8 relative shadow-[0_0_50px_rgba(79,70,229,0.2)] maxHeight-[90vh] overflow-y-auto">
                <button 
                  className="absolute top-6 right-6 text-2xl hover:scale-110 transition-transform text-indigo-300"
                  onClick={() => { if(engineRef.current) { engineRef.current.state.showingWorkshop = false; engineRef.current.state.player.pos = { x: 0, y: 100 }; } setTriggerRender(r=>r+1); }}>
                  ✖
                </button>
                <div className="flex flex-col items-center mb-8 pb-4 border-b border-indigo-500/20">
                    <h2 className="text-4xl font-black tracking-tight text-indigo-400 mb-2">🔧 WARSZTAT</h2>
                    <p className="text-slate-400 font-medium tracking-wide">Trwałe ulepszenia sprzętu. Płacisz Protonami (p⁺).</p>
                    <div className="flex items-center gap-2 mt-4 bg-indigo-950/50 px-6 py-2 rounded-full border border-indigo-500/30">
                        <span className="text-sm font-bold text-indigo-300 uppercase">Twoje Protony:</span>
                        <span className="text-2xl font-black text-indigo-400">{engineRef.current.state.protons}</span>
                        <span className="text-lg font-bold text-indigo-500 uppercase mt-1">p⁺</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Armor Upgrade */}
                    <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                        <span className="text-4xl mb-3">🛡️</span>
                        <h3 className="text-xl font-bold text-blue-300 mb-1">Pancerz Skafandra</h3>
                        <p className="text-xs text-slate-400 mb-4 h-12">Zmniejsza otrzymywane obrażenia. {engineRef.current!.state.selectedCharacter === "bohr_cat" ? tx("Zmniejsza otrzymywane obrażenia. Max 40% redukcji na poziomie 3.") : tx("Zmniejsza otrzymywane obrażenia. Max 30% redukcji na poziomie 3.")}</p>
                        
                        <div className="flex gap-2 mb-6 w-full justify-center">
                            {[1, 2, 3].map(level => (
                                <div key={level} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-1 ${engineRef.current!.state.armorLevel >= level ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-transparent border-slate-600 text-slate-600'}`}>
                                        {level}
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-200">{(level + (engineRef.current!.state.selectedCharacter === 'bohr_cat' ? 1 : 0)) * 10}%</span>
                                </div>
                            ))}
                        </div>
                        
                        {(() => {
                            const currentLevel = engineRef.current!.state.armorLevel;
                            if (currentLevel >= 3) {
                                return <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold tracking-widest cursor-not-allowed">{tx("MAX POZIOM")}</button>;
                            }
                            const cost = currentLevel === 0 ? 1 : currentLevel === 1 ? 3 : 5;
                            const canAfford = engineRef.current!.state.protons >= cost;
                            return (
                                <button 
                                    onClick={() => {
                                        if (canAfford) {
                                            engineRef.current!.state.protons -= cost;
                                            engineRef.current!.state.armorLevel++;
                                            engineRef.current!.saveGame();
                                            setTriggerRender(r => r+1);
                                        }
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold tracking-widest transition-all ${canAfford ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    ULEPSZ ({cost} p⁺)
                                </button>
                            );
                        })()}
                    </div>

                    {/* SuperWeapon Unlock Upgrade */}
                    {engineRef.current!.state.unlockedCharacters.includes('mendelejew') && (
                        <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none"></div>
                            <span className="text-4xl mb-3">⚛️</span>
                            <h3 className="text-xl font-bold text-purple-300 mb-1">Moduł Reakcji (Pasyw)</h3>
                            <p className="text-xs text-slate-400 mb-4 h-12">Trwale odblokowuje wybór związków chemicznych (Super Broń) od początku gry.</p>
                            
                            <div className="flex gap-2 mb-6">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${engineRef.current!.state.hasSuperWeapon ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-transparent border-slate-600 text-slate-600'}`}>
                                    {engineRef.current!.state.hasSuperWeapon ? '✓' : '1'}
                                </div>
                            </div>
                            
                            {(() => {
                                const isPurchased = engineRef.current!.state.hasSuperWeapon;
                                if (isPurchased) {
                                    return <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold tracking-widest cursor-not-allowed">{tx("POSIADANE")}</button>;
                                }
                                const cost = 100;
                                const canAfford = engineRef.current!.state.protons >= cost;
                                return (
                                    <button 
                                        onClick={() => {
                                            if (canAfford) {
                                                engineRef.current!.state.protons -= cost;
                                                engineRef.current!.state.hasSuperWeapon = true;
                                                engineRef.current!.saveGame();
                                                setTriggerRender(r => r+1);
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-bold tracking-widest transition-all ${canAfford ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        ULEPSZ ({cost} p⁺)
                                    </button>
                                );
                            })()}
                        </div>
                    )}
                    
                    {/* Heat Upgrade */}
                    <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none"></div>
                        <span className="text-4xl mb-3">❄️</span>
                        <h3 className="text-xl font-bold text-orange-300 mb-1">Chłodzenie Broni</h3>
                        <p className="text-xs text-slate-400 mb-4 h-12">Bronie wolniej się nagrzewają i szybciej stygną. Szybszy powrót po przegrzaniu.</p>
                        
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3].map(level => (
                                <div key={level} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${engineRef.current!.state.heatLevel >= level ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-transparent border-slate-600 text-slate-600'}`}>
                                    {level}
                                </div>
                            ))}
                        </div>
                        
                        {(() => {
                            const currentLevel = engineRef.current!.state.heatLevel;
                            if (currentLevel >= 3) {
                                return <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold tracking-widest cursor-not-allowed">{tx("MAX POZIOM")}</button>;
                            }
                            const cost = currentLevel === 0 ? 1 : currentLevel === 1 ? 3 : 5;
                            const canAfford = engineRef.current!.state.protons >= cost;
                            return (
                                <button 
                                    onClick={() => {
                                        if (canAfford) {
                                            engineRef.current!.state.protons -= cost;
                                            engineRef.current!.state.heatLevel++;
                                            engineRef.current!.saveGame();
                                            setTriggerRender(r => r+1);
                                        }
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold tracking-widest transition-all ${canAfford ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    ULEPSZ ({cost} p⁺)
                                </button>
                            );
                        })()}
                    </div>
                </div>
             </div>
         </div>
      )}

      {engineRef.current && engineRef.current.state.showingShop && (
         <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-[100] backdrop-blur-xl p-2 md:p-4">
             <div className="bg-slate-900/90 border border-green-500/30 w-full max-w-lg rounded-2xl p-4 md:p-6 relative shadow-[0_0_50px_rgba(34,197,94,0.1)] max-h-[90vh] overflow-y-auto">
                <button 
                  className="absolute top-4 right-4 text-2xl hover:scale-110 transition-transform"
                  onClick={() => { if(engineRef.current) engineRef.current.state.showingShop = false; }}>
                  ❌
                </button>
                <h2 className="text-2xl font-black tracking-tight mb-4 text-green-300 border-b border-green-900/50 pb-2">🛒 Sklep Kosmiczny</h2>
                
                <div className="flex justify-between items-center bg-green-900/40 px-4 py-2 rounded-xl mb-4 shadow-inner border border-green-800/50">
                    <span className="font-bold text-sm text-slate-300">Dostępne elektrony:</span>
                    <span className="text-xl font-black text-yellow-400">{formatMoney(engineRef.current.state.electrons)} e⁻</span>
                </div>

                <div className="flex gap-2 mb-4 text-sm">
                    <button onClick={() => { if(engineRef.current) engineRef.current.state.shopTab = 'weapons'; setTriggerRender(r=>r+1); }} className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${engineRef.current.state.shopTab === 'weapons' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🔫 Bronie</button>
                    <button onClick={() => { if(engineRef.current) engineRef.current.state.shopTab = 'potions'; setTriggerRender(r=>r+1); }} className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${engineRef.current.state.shopTab === 'potions' ? 'bg-pink-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🧪 Potki</button>
                    <button onClick={() => { if(engineRef.current) engineRef.current.state.shopTab = 'stats'; setTriggerRender(r=>r+1); }} className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${engineRef.current.state.shopTab === 'stats' ? 'bg-amber-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>🧬 Statsy</button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {engineRef.current.state.shopTab === 'weapons' && [
                        { id: 'gun_1', name: 'Zoptymalizowana Lufa', cost: 200, requiredLevel: 0, desc: 'Zmniejsza przegrzewanie się broni i delikatnie zwiększa szybkostrzelność (-20%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 1; } } },
                        { id: 'gun_2', name: 'Komora Chłodząca', cost: 3000, requiredLevel: 1, desc: 'Dalsza redukcja ciepła. Twój blaster staje się zauważalnie lepszy (-35%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 2; } } },
                        { id: 'gun_3', name: 'Akcelerator Jonowy', cost: 150000, requiredLevel: 2, desc: 'Broń strzela znacznie szybciej i nie dławi się ciepłem tak łatwo (-50%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 3; } } },
                        { id: 'gun_4', name: 'Reaktor Plazmowy', cost: 4000000, requiredLevel: 3, desc: 'Przenosi moc strzału do nowego wymiaru prędkości (-65%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 4; } } },
                        { id: 'gun_5', name: 'Molekularny Dezintegrator', cost: 95000000, requiredLevel: 4, desc: 'Mityczna broń, prawie zerowe przegrzanie. Osiągasz pełen potencjał (-75%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 5; } } },
                        { id: 'gun_6', name: 'Działo Antymaterii', cost: 1500000000, requiredLevel: 5, desc: 'Zupełnie psuje prawa fizyki. Absurdalna szybkostrzelność (-85%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 6; } } },
                        { id: 'gun_7', name: 'Boska Lufa', cost: 50000000000, requiredLevel: 6, desc: 'Ostateczne oziębienie. Broń w ogóle się nie przegrzewa (-100%).', action: () => { if(engineRef.current) { engineRef.current.state.gunLevel = 7; } } },
                        { id: 'superweapon', name: 'Moduł Reakcji Łańcuchowej', cost: 1000000000, requiredLevel: 0, purchased: engineRef.current.state.hasSuperWeapon, desc: 'Osobny tryb broni: pozwala na strzelanie całymi wiązaniami chemicznymi (Q). Kosztuje dużo ciepła, ale daje kolosalną moc!', action: () => { if(engineRef.current) { engineRef.current.state.hasSuperWeapon = true; engineRef.current.state.equippedWeapon = 'super'; } } },
                    ].map((item: any) => {
                        item.cost = Math.floor(item.cost * (engineRef.current!.state.market.inflationMultiplier || 1.0));
                        const isPurchased = item.purchased !== undefined ? item.purchased : engineRef.current!.state.gunLevel >= (item.id.replace('gun_', '') as any) * 1;
                        const canSee = item.id === 'superweapon' || engineRef.current!.state.gunLevel >= item.requiredLevel;
                        if (!canSee) return null;
                        
                        return (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col justify-between w-full">
                            <div>
                                <h3 className="font-bold text-lg md:text-xl text-white mb-2">{item.name}</h3>
                                <p className="text-sm text-slate-400 mb-4">{item.desc}</p>
                            </div>
                            {isPurchased ? (
                                <button className="w-full bg-slate-700 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed">POSIADANE</button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        if (engineRef.current && engineRef.current.state.electrons >= item.cost) {
                                            engineRef.current.state.electrons -= item.cost;
                                            item.action();
                                            
                                            // Generate Invoice for Weapon purchase
                                            const name = item.name;
                                            const cost = item.cost;
                                            const writeOff = Math.floor(cost * 0.8); // 80% tax write-off
                                            engineRef.current.state.invoices.push({
                                                id: 'inv_w_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                                name: `Faktura VAT: Broń - ${name}`,
                                                writeOffAmount: writeOff,
                                                submitted: false,
                                                cost
                                            });
                                            
                                            engineRef.current.saveGame();
                                            setTriggerRender(r => r + 1);
                                        }
                                    }}
                                    className={`w-full font-bold py-3 rounded-xl transition-all ${engineRef.current.state.electrons >= item.cost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-red-900/50 text-red-500/50 cursor-not-allowed border border-red-500/20'}`}
                                >
                                    KUP ZA {formatMoney(item.cost)} e⁻
                                </button>
                            )}
                        </div>
                    )})}

                     {engineRef.current.state.shopTab === 'potions' && [
                        { id: 'heal', name: 'Mała Lecząca Potka', cost: Math.floor(25 * Math.pow(1.3, engineRef.current.state.healPotionPurchases)), count: engineRef.current.state.potions.heal, desc: 'Natychmiastowo leczy 30% maksymalnego życia.', action: () => { if(engineRef.current) { engineRef.current.state.potions.heal += 1; engineRef.current.state.healPotionPurchases += 1; } }, use: () => { if(engineRef.current) { engineRef.current.state.keys['z'] = true; } } },
                        { id: 'shield', name: 'Generator Tarczy', cost: Math.floor(80 * Math.pow(1.3, engineRef.current.state.shieldPotionPurchases)), count: engineRef.current.state.potions.shield, desc: tx("Tworzy tymczasową barierę absorbującą 50 obrażeń."), action: () => { if(engineRef.current) { engineRef.current.state.potions.shield += 1; engineRef.current.state.shieldPotionPurchases += 1; } }, use: () => { if(engineRef.current) { engineRef.current.state.keys['x'] = true; } } },
                        { id: 'stamina', name: 'Eliksir Furii', cost: Math.floor(25 * Math.pow(1.3, engineRef.current.state.staminaPotionPurchases)), count: engineRef.current.state.potions.stamina, desc: `Przyspiesza regenerację staminy i zwiększa wydajność na kilka sekund.`, action: () => { if(engineRef.current) { engineRef.current.state.potions.stamina += 1; engineRef.current.state.staminaPotionPurchases += 1; } }, use: () => { if(engineRef.current) { engineRef.current.state.keys['c'] = true; } } },
                    ].map((item: any) => {
                        item.cost = Math.floor(item.cost * (engineRef.current!.state.market.inflationMultiplier || 1.0));
                        return (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col justify-between w-full">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg md:text-xl text-white">{item.name}</h3>
                                <span className="bg-black/60 px-3 py-1 rounded-full text-xs font-black text-pink-400 border border-pink-500/30 whitespace-nowrap ml-2">Posiadasz: {item.count}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{item.desc}</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        if (engineRef.current && engineRef.current.state.electrons >= item.cost) {
                                            engineRef.current.state.electrons -= item.cost;
                                            item.action();
                                            
                                            // Generate Invoice for Potion purchase
                                            const name = item.name;
                                            const cost = item.cost;
                                            const writeOff = Math.floor(cost * 0.85); // 85% tax write-off
                                            engineRef.current.state.invoices.push({
                                                id: 'inv_p_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                                                name: `Faktura VAT: Mikstura - ${name}`,
                                                writeOffAmount: writeOff,
                                                submitted: false,
                                                cost
                                            });
                                            
                                            engineRef.current.saveGame();
                                            setTriggerRender(r => r+1);
                                        }
                                    }}
                                    className={`flex-1 font-bold py-2.5 rounded-xl transition-all ${engineRef.current.state.electrons >= item.cost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_12px_rgba(234,179,8,0.4)]' : 'bg-red-900/50 text-red-500/50 cursor-not-allowed border border-red-500/20'}`}
                                >
                                    KUP ZA {formatMoney(item.cost)} e⁻
                                </button>
                                <button 
                                    disabled={item.count <= 0}
                                    onClick={() => {
                                        item.use();
                                        if (engineRef.current) {
                                            // Tick the engine update so use takes immediate effect, saving and updating React state
                                            engineRef.current.update(0);
                                        }
                                        setTriggerRender(r => r+1);
                                    }}
                                    className={`flex-1 font-bold py-2.5 rounded-xl transition-all ${item.count > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'}`}
                                >
                                    UŻYJ TERAZ
                                </button>
                            </div>
                        </div>
                        );
                    })}

                    {engineRef.current.state.shopTab === 'stats' && (
                        <div className="bg-red-950/50 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-200 mb-2">
                            <span className="text-2xl animate-bounce">🚨</span>
                            <div className="text-xs">
                                <p className="font-extrabold text-red-400 uppercase tracking-widest">{tx("")}</p>
                                <p className="opacity-90">{tx("")}<span className="underline font-bold">{tx("")}</span>{tx("")}<span className="text-yellow-400 font-bold">{tx("")}</span></p>
                            </div>
                        </div>
                    )}

                    {engineRef.current.state.shopTab === 'stats' && [
                        { id: 'hp', name: tx("Wzrost Max Życia"), cost: Math.floor(50 * Math.pow(1.3, engineRef.current.state.maxHpLevel)), count: engineRef.current.state.maxHpLevel, desc: tx("Zwiększa maksymalne punkty życia o +5%."), action: () => { if(engineRef.current) engineRef.current.state.maxHpLevel += 1; } },
                        { id: 'regen', name: tx("Powolna Regeneracja"), cost: Math.floor(150 * Math.pow(1.3, engineRef.current.state.regenLevel)), count: engineRef.current.state.regenLevel, desc: tx("Automatycznie odnawia zdrowie o 0.25 HP na sekundę za każdy poziom."), action: () => { if(engineRef.current) engineRef.current.state.regenLevel += 1; } },
                        { id: 'speed', name: tx("Szybkość Poruszania"), cost: Math.floor(100 * Math.pow(1.3, engineRef.current.state.speedLevel)), count: engineRef.current.state.speedLevel, desc: tx("Zwiększa podstawową szybkość i zasięg dasha."), action: () => { if(engineRef.current) engineRef.current.state.speedLevel += 1; } },

                    ].map((item: any) => {
                        item.cost = Math.floor(item.cost * (engineRef.current!.state.market.inflationMultiplier || 1.0));
                        return (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col justify-between w-full">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg md:text-xl text-white">{item.name}</h3>
                                <span className="bg-black/60 px-3 py-1 rounded-full text-xs font-black text-amber-400 border border-amber-500/30 whitespace-nowrap ml-2">{tx("Poziom: ")}{item.count}</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{item.desc}</p>
                            <button 
                                onClick={() => {
                                    if (engineRef.current && engineRef.current.state.electrons >= item.cost) {
                                        engineRef.current.state.electrons -= item.cost;
                                        item.action();
                                        engineRef.current.state.player.maxHp = Math.round(45 * Math.pow(1.05, engineRef.current.state.maxHpLevel));
                                        if (item.id === 'hp') {
                                            const oldMaxHp = Math.round(45 * Math.pow(1.05, engineRef.current.state.maxHpLevel - 1));
                                            const hpDiff = engineRef.current.state.player.maxHp - oldMaxHp;
                                            engineRef.current.state.player.hp += Math.max(1, hpDiff);
                                        }
                                        engineRef.current.state.player.speed = 350 + engineRef.current.state.speedLevel * 20;
                                        engineRef.current.saveGame();
                                        setTriggerRender(r => r + 1);
                                    }
                                }}
                                className={`w-full font-bold py-3 rounded-xl transition-all ${engineRef.current.state.electrons >= item.cost ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-red-900/50 text-red-500/50 cursor-not-allowed border border-red-500/20'}`}
                            >
                                ULEPSZ ZA {formatMoney(item.cost)} e⁻
                            </button>
                        </div>
                        );
                    })}
                </div>
             </div>
         </div>
      )}

      {engineRef.current?.state?.arrestedDeath && (
          <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-black/95 text-slate-100 z-[200] backdrop-blur-3xl p-4">
              <div className="bg-red-950/40 border border-red-500/50 w-full max-w-sm rounded-2xl p-5 relative shadow-[0_0_30px_rgba(239,68,68,0.4)] text-center animate-pulse">
                  <span className="text-4xl max-w-full block mb-2">👮🚓🐱🥖</span>
                  <h2 className="text-2xl font-black tracking-tight text-red-500 uppercase mb-2">🚨 ARESZTOWANIE! 🚨</h2>
                  <p className="text-base font-bold text-red-300 mb-1">{tx("")}</p>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      {tx("")}<span className="text-red-400 font-extrabold underline">{tx("")}</span> 
                      <br /><br />
                      Unikanie podatków we wszechświecie Mendelejewa skończyło się nalotem policjantów.
                  </p>
                  <div className="flex flex-col gap-2 w-full">
                      <button 
                        onClick={() => {
                            if (engineRef.current) {
                                const st = engineRef.current.state;
                                const bribeCost = (st.unpaidTax || 1000) * 2;
                                if (st.electrons >= bribeCost) {
                                    st.electrons -= bribeCost;
                                    st.arrestedDeath = false;
                                    st.player.isDead = false;
                                    st.player.hp = st.player.maxHp;
                                    st.player.deadTimer = 0;
                                    st.policeSpawning = false;
                                    st.taxEntries = [];
                                    st.unpaidTax = 0;
                                    st.roomsSinceTaxOwed = 0;
                                    engineRef.current.addLog(`💼 ${tx(" Wręczyłeś łapówkę (")}${bribeCost}${tx(" e⁻). Policja odjechała.")}`);
                                }
                            }
                            setTriggerRender(r => r + 1);
                        }}
                        className={`font-extrabold px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all text-xs uppercase tracking-wider ${((engineRef.current?.state?.electrons || 0) >= ((engineRef.current?.state?.unpaidTax || 1000) * 2)) ? 'bg-yellow-600 hover:bg-yellow-500 text-white hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-50' }`}
                      >
                         Łapówka ({(engineRef.current?.state?.unpaidTax || 1000) * 2} e⁻)
                      </button>
                      
                      <button 
                        onClick={() => {
                            if (engineRef.current) {
                                const st = engineRef.current.state;
                                st.electrons = 0;
                                st.arrestedDeath = false;
                                st.player.isDead = false;
                                st.player.hp = st.player.maxHp;
                                st.player.deadTimer = 0;
                                st.policeSpawning = false;
                                st.taxEntries = [];
                                st.unpaidTax = 0;
                                st.roomsSinceTaxOwed = 0;
                                engineRef.current.addLog(`📜 ${tx(" Zgłoszono niewypłacalność. Tracisz wszystkie elektrony, ale odzyskujesz wolność.")}`);
                            }
                            setTriggerRender(r => r + 1);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] hover:scale-105 transition-all text-xs uppercase tracking-wider">
                        Zgłoś niewypłacalność (Strata elektronów)
                      </button>

                      <button 
                        onClick={() => {
                            if (engineRef.current) {
                                engineRef.current.forceWipeReset();
                            }
                            setTriggerRender(r => r + 1);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] hover:scale-105 transition-all text-[10px] uppercase tracking-wider opacity-80">
                        Poddaj się (Reset)
                      </button>
                  </div>
              </div>
          </div>
      )}

      {gameStateUi === 'menu' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-50 backdrop-blur-md p-3 md:p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center max-w-4xl w-full">
             {/* Left side: Main Title & Play Button */}
             <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2">
               <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] leading-none mb-1 text-white flex items-baseline justify-center md:justify-start">
                 <span>Chem</span>
                 {/* Atom instead of dot on 'i' */}
                 <span className="relative inline-flex flex-col items-center justify-end h-[1em]">
                     <span className="absolute top-[-0.3em] md:top-[-0.4em] left-1/2 -translate-x-1/2 w-[24px] h-[24px] md:w-[32px] md:h-[32px] z-10 flex items-center justify-center">
                         {/* Typowy szkolny model atomu (Rutherford-Bohr) */}
                         <svg viewBox="0 0 100 100" className="w-[140%] h-[140%] overflow-visible drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {/* Jądro */}
                            <circle cx="50" cy="50" r="10" fill="#a855f7" className="drop-shadow-[0_0_8px_#a855f7]" />
                            <circle cx="47" cy="47" r="3" fill="#fbcfe8" opacity="0.8" />

                            {/* Orbita 1 */}
                            <g transform="rotate(0 50 50)">
                                <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#818cf8" strokeWidth="2.5" opacity="0.6" />
                                <circle r="5" fill="#fde047" className="drop-shadow-[0_0_5px_#fde047]">
                                    <animateMotion dur="2s" repeatCount="indefinite" path="M 95,50 A 45 15 0 1 1 5,50 A 45 15 0 1 1 95,50" />
                                </circle>
                            </g>

                            {/* Orbita 2 */}
                            <g transform="rotate(60 50 50)">
                                <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#67e8f9" strokeWidth="2.5" opacity="0.4" />
                                <circle r="4.5" fill="#22d3ee" className="drop-shadow-[0_0_5px_#22d3ee]">
                                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 95,50 A 45 15 0 1 0 5,50 A 45 15 0 1 0 95,50" />
                                </circle>
                            </g>

                            {/* Orbita 3 */}
                            <g transform="rotate(120 50 50)">
                                <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="#f472b6" strokeWidth="2.5" opacity="0.4" />
                                <circle r="4" fill="#f43f5e" className="drop-shadow-[0_0_5px_#f43f5e]">
                                    <animateMotion dur="3s" repeatCount="indefinite" path="M 95,50 A 45 15 0 1 1 5,50 A 45 15 0 1 1 95,50" />
                                </circle>
                            </g>
                         </svg>
                     </span>
                     <span className="text-[1.05em]">ı</span>
                 </span>
                 {/* Whiskers and Muzzle inside 'C' */}
                 <span className="relative inline-block ml-[2px]">
                     C
                     <span className="absolute top-[50%] left-[55%] md:left-[60%] -translate-y-1/2 -translate-x-1/2 opacity-90 pointer-events-none flex justify-center items-center">
                         <svg width="40" height="40" viewBox="0 0 40 40" className="w-[30px] md:w-[45px] overflow-visible">
                            {/* Whiskers left */}
                            <path d="M -5 14 Q 5 18 12 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-wiggle origin-[12px_20px]" />
                            <path d="M -5 26 Q 5 22 12 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-wiggle-reverse origin-[12px_20px]" />
                            
                            {/* Nose */}
                            <path d="M 16 18 L 24 18 L 20 22 Z" fill="#f472b6" className="animate-bounce" style={{animationDuration: '2s'}}/>
                            
                            {/* Whiskers right */}
                            <path d="M 45 14 Q 35 18 28 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-wiggle-reverse origin-[28px_20px]" />
                            <path d="M 45 26 Q 35 22 28 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-wiggle origin-[28px_20px]" />
                         </svg>
                     </span>
                 </span>
                 <span>at</span>
                 {/* Tail on 's' */}
                 <span className="relative inline-block">
                     s
                     <span className="absolute bottom-[0.1em] md:bottom-[0.1em] right-[-0.55em] md:right-[-0.7em] pointer-events-none">
                         <svg width="30" height="20" viewBox="0 0 30 20" className="w-[18px] md:w-[28px] origin-[0px_20px] animate-[waggle_1.5s_ease-in-out_infinite] overflow-visible">
                            <path d="M 0 16 Q 10 25 28 5" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
                         </svg>
                     </span>
                 </span>
               </h1>
               <p 
                 className={`text-xs md:text-sm lg:text-base mb-4 md:mb-6 ${scanProgress > 0 ? "text-[#00ffcc] animate-pulse cursor-wait" : "text-indigo-300 cursor-crosshair hover:text-indigo-200"} font-bold uppercase tracking-widest mt-2 transition-colors duration-500 relative overflow-hidden`}
                 onPointerDown={(e) => {
                     if (catbotModeUnlocked || showCatbotHacking) return;
                     setScanProgress(0);
                     setEasterEggScanning(true);
                     if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);
                     if (easterEggIntervalRef.current) clearInterval(easterEggIntervalRef.current);
                     
                     const startTime = Date.now();

                     // timer to show the hacking screen after 6 seconds (1s hold + 5s scan)
                     easterEggTimerRef.current = window.setTimeout(() => {
                         setShowCatbotHacking(true);
                         setEasterEggScanning(false);
                         setScanProgress(0);
                         clearInterval(easterEggIntervalRef.current!);
                     }, 6000);
                     
                     // interval for scanning phase (starts after 1000ms)
                     easterEggIntervalRef.current = window.setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        if (elapsed >= 1000) {
                            // over next 5000ms, go from 0 to 100
                            const progress = ((elapsed - 1000) / 5000) * 100;
                            setScanProgress(Math.min(100, progress));
                        }
                     }, 100);
                 }}
                 onPointerUp={() => {
                     setEasterEggScanning(false);
                     setScanProgress(0);
                     if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);
                     if (easterEggIntervalRef.current) clearInterval(easterEggIntervalRef.current);
                 }}
                 onPointerLeave={() => {
                     setEasterEggScanning(false);
                     setScanProgress(0);
                     if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);
                     if (easterEggIntervalRef.current) clearInterval(easterEggIntervalRef.current);
                 }}
                 style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
               >
                 <span className="relative z-10">{scanProgress > 0 ? `${tx("SKANOWANIE...")} ${Math.floor(scanProgress)}%` : "Dungeon Bullet Hell 💧🌱🔥"}</span>
                 {scanProgress > 0 && (
                    <span className="absolute top-0 left-0 h-full bg-[#00ffcc]/20 z-0 transition-all duration-100 ease-linear block" style={{width: `${scanProgress}%`}}></span>
                 )}
               </p>
               
               <button 
                 onClick={() => {
                     setLanActive(false);
                     localStorage.removeItem('lanActive');
                     if (engineRef.current) {
                         engineRef.current.state.isHost = true; // In singleplayer, you are host essentially
                         engineRef.current.state.showingSaves = true;
                     }
                 }}
                 className="bg-indigo-600 border border-indigo-400 hover:bg-indigo-505 rounded-full px-6 md:px-8 py-2.5 md:py-3.5 font-bold tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all active:scale-95 text-white animate-pulse"
               >
                 {tx("WYBIERZ ZAPIS / NOWA GRA")}
               </button>

               {catbotModeUnlocked && (
                  <button 
                     onClick={() => setIsCatbotEngineRunning(true)}
                     className="mt-3 bg-[#110000] border-2 border-[#ff003c] hover:bg-[#ff003c] text-[#ff003c] hover:text-black rounded-full px-6 md:px-8 py-2.5 md:py-3.5 font-bold tracking-widest text-xs md:text-sm shadow-[0_0_20px_rgba(255,0,60,0.4)] transition-all active:scale-95 animate-none flex justify-center items-center gap-2 mx-auto"
                  >
                     <span className="text-lg">🤖🐱</span> URUCHOM KOTBOT O.S
                  </button>
               )}

               <div className="flex flex-col gap-2 mt-3 w-full max-w-[300px]">
                 <div className="flex gap-2 w-full">
                     <button 
                       onClick={() => {
                           if (engineRef.current) { engineRef.current.state.showingOptions = true; setOptionsTab('settings'); }
                       }}
                       className="flex-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-full px-4 py-2.5 font-bold tracking-widest text-[10px] md:text-xs shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all active:scale-95 text-slate-300"
                     >
                       {tx("USTAWIENIA")}
                     </button>
    
                     <button 
                       onClick={() => setShowingLan(true)}
                       className="flex-1 bg-cyan-900 border border-cyan-700 hover:bg-cyan-800 rounded-full px-4 py-2.5 font-bold tracking-widest text-[10px] md:text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 text-cyan-100"
                     >
                       {tx("WIELOOSOBOWY")}
                     </button>
                 </div>
               </div>

             </div>

             {/* Right side: Mock Gameplay Simulation */}
             <div className="bg-white/5 backdrop-blur-md p-3 md:p-5 rounded-2xl text-left border border-white/10 shadow-2xl md:w-1/2 max-w-sm flex flex-col gap-3">
               <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1 border-b border-indigo-500/20 pb-1">{tx("Budowa Atomu")} {tx("(kliknij by zobaczyć)")}</h2>
               <div className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform" onClick={() => setShowingPeriodicTable(true)}>
                   <MenuGameplay selectedZ={menuSelectedZ} language={engineRef.current?.state.language || 'pl'} />
               </div>
               <p className="text-[8px] md:text-[9px] text-indigo-300/40 italic mt-auto border-t border-indigo-500/10 pt-1">
                 {tx("")}
               </p>
             </div>
          </div>
        </div>
      )}



      
      {/* Tutorial modal - disabled from auto-popup to prevent blocking gameplay on load */}
      {false && engineRef.current && !engineRef.current.state.hasSeenTutorial && gameStateUi === 'playing' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/90 text-slate-100 z-[100] backdrop-blur-xl animate-in fade-in zoom-in duration-300 p-2 sm:p-4 overflow-y-auto">
          <div className="relative my-auto w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900/95 border-2 border-indigo-500 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-7 shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.state.hasSeenTutorial = true;
                        engineRef.current.saveGame();
                        setTriggerRender(r => r + 1);
                    }
                }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all text-sm font-bold z-10"
                title="Zamknij"
            >
                ✕
            </button>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-indigo-400 mb-2 sm:mb-4 tracking-tight text-center pr-6">
                Witaj w Hacker Merge! 🎮
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-1 space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-black/50 p-2 sm:p-3 rounded-xl border border-indigo-500/30 flex items-center gap-2 sm:gap-3">
                        <div className="text-2xl sm:text-3xl shrink-0">🕹️</div>
                        <div className="min-w-0">
                            <strong className="text-white block text-xs sm:text-sm font-bold truncate">Ruch postacią</strong>
                            <span className="text-[10px] sm:text-xs text-slate-400 block leading-tight">Joystick na ekranie lub klawisze W, A, S, D</span>
                        </div>
                    </div>
                    <div className="bg-black/50 p-2 sm:p-3 rounded-xl border border-indigo-500/30 flex items-center gap-2 sm:gap-3">
                        <div className="text-2xl sm:text-3xl shrink-0">🎯</div>
                        <div className="min-w-0">
                            <strong className="text-white block text-xs sm:text-sm font-bold truncate">Cel i Strzał</strong>
                            <span className="text-[10px] sm:text-xs text-slate-400 block leading-tight">Dotknij/przeciągnij lub myszka (LPM)</span>
                        </div>
                    </div>
                    <div className="bg-black/50 p-2 sm:p-3 rounded-xl border border-indigo-500/30 flex items-center gap-2 sm:gap-3">
                        <div className="text-2xl sm:text-3xl shrink-0">❄️</div>
                        <div className="min-w-0">
                            <strong className="text-white block text-xs sm:text-sm font-bold truncate">Przegrzewanie (Heat)</strong>
                            <span className="text-[10px] sm:text-xs text-slate-400 block leading-tight">Uważaj na pasek przegrzania broni pod postacią</span>
                        </div>
                    </div>
                    <div className="bg-black/50 p-2 sm:p-3 rounded-xl border border-indigo-500/30 flex items-center gap-2 sm:gap-3">
                        <div className="text-2xl sm:text-3xl shrink-0">⚛️</div>
                        <div className="min-w-0">
                            <strong className="text-white block text-xs sm:text-sm font-bold truncate">Super Broń</strong>
                            <span className="text-[10px] sm:text-xs text-slate-400 block leading-tight">Księga Reakcji, twórz związki i strzelaj (Q / ikona)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900/40 p-2 sm:p-2.5 rounded-xl border border-indigo-500/40 text-center text-[10px] sm:text-xs text-indigo-200 leading-snug">
                    Pauzuj (przycisk menu lub klawisz ESC), aby otworzyć Opcje, Księgę Związków lub Sklep!
                </div>
            </div>

            <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.state.hasSeenTutorial = true;
                        engineRef.current.saveGame();
                        setTriggerRender(r => r + 1);
                    }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black py-2.5 sm:py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] text-xs sm:text-base mt-2 sm:mt-3 shrink-0"
            >
                ZROZUMIAŁEM, GRAMY! 🔥
            </button>
          </div>
        </div>
      )}

      {gameStateUi === 'proton_tutorial' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/90 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="text-[120px] mb-4 animate-bounce drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]">💥</div>
          <h1 className="text-6xl font-black text-yellow-400 tracking-tighter drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] mb-4 text-center">
            ZDOBYTO PROTON!
          </h1>
          <p className="text-xl mb-4 text-slate-300 max-w-xl text-center leading-relaxed">
            {tx("")}<span className="text-yellow-400 font-bold">{tx("Proton")}</span>!
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-2xl text-center">
            <p className="text-slate-400 mb-2">
              Protony to <strong className="text-white">{tx("")}</strong>. 
            </p>
            <p className="text-slate-400">
              Możesz za nie permanentnie odblokować nowe postaci (np. Czarnego Kota ze strzelbą) w warsztacie (tym jasnym kółku w Lobby).
            </p>
          </div>
          <button 
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.state.state = 'victory_screen';
              }
            }}
            className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/50 rounded-full px-10 py-5 font-bold tracking-widest text-lg hover:bg-yellow-500/40 text-yellow-200 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] mb-4"
          >
            ROZUMIEM
          </button>
        </div>
      )}

      {devPasswordPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-4 pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl max-w-sm w-full flex flex-col items-center">
                <h3 className="text-white text-xl font-bold mb-4 font-mono">{tx("")}</h3>
                <input 
                   autoFocus
                   type="password"
                   className="w-full bg-slate-800 text-white p-3 rounded mb-4 text-center text-xl font-mono focus:outline-none focus:ring-2 focus:ring-slate-500"
                   value={devPasswordInp}
                   onChange={e => setDevPasswordInp(e.target.value)}
                   onKeyDown={e => {
                      if (e.key === 'Enter') {
                          if (devPasswordInp === 'maslo' || devPasswordInp === '/maslo') {
                              setShowingDevMenu(true);
                              setDevPasswordPrompt(false);
                          } else {
                              setDevPasswordPrompt(false);
                              if (engineRef.current) engineRef.current.state.devPaused = false;
                          }
                      } else if (e.key === 'Escape') {
                          setDevPasswordPrompt(false);
                          if (engineRef.current) engineRef.current.state.devPaused = false;
                      }
                   }}
                />
            </div>
        </div>
      )}

      {showingDevMenu && (
        <div 
          className="absolute z-[200] bg-[#0f172a]/95 border border-cyan-500/50 rounded-lg max-w-[260px] w-full shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          style={{ left: devMenuPos.x, top: devMenuPos.y, touchAction: 'none' }}
        >
            <div 
                className="flex justify-between items-center p-3 pb-2 cursor-move select-none border-b border-cyan-500/30"
                onPointerDown={(e) => {
                    setIsDragDev(true);
                    setDragStartDev({ x: e.clientX - devMenuPos.x, y: e.clientY - devMenuPos.y });
                    e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                    if (isDragDev) {
                        setDevMenuPos({ x: e.clientX - dragStartDev.x, y: e.clientY - dragStartDev.y });
                    }
                }}
                onPointerUp={(e) => {
                    setIsDragDev(false);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onPointerCancel={(e) => {
                    setIsDragDev(false);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
            >
                <h2 className="text-cyan-400 text-sm font-black font-mono flex items-center gap-1 pointer-events-none">
                    <span>🛠️</span> Dev Menu
                </h2>
                <button 
                  onPointerDown={e => e.stopPropagation()} 
                  onClick={() => { setShowingDevMenu(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} 
                  className="text-slate-400 hover:text-white text-base font-bold"
                >
                  ×
                </button>
            </div>
            <div className="p-3 space-y-1.5 text-xs max-h-[70vh] overflow-y-auto">
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="text-slate-300 font-bold">Protony ({engineRef.current?.state.protons})</span>
                        <div className="flex gap-1">
                            <button onClick={() => { if(engineRef.current) { engineRef.current.state.protons += 1; setTriggerRender(r=>r+1); } }} className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-[10px] font-bold text-white">+1</button>
                            <button onClick={() => { if(engineRef.current) { engineRef.current.state.protons += 10; setTriggerRender(r=>r+1); } }} className="bg-blue-700 hover:bg-blue-500 px-2 py-0.5 rounded text-[10px] font-bold text-white">+10</button>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="text-slate-300 font-bold">Elektrony ({Math.floor(engineRef.current?.state.electrons || 0)})</span>
                        <div className="flex gap-1">
                            <button onClick={() => { if(engineRef.current) { engineRef.current.state.electrons += 100; setTriggerRender(r=>r+1); } }} className="bg-yellow-600 hover:bg-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold text-white">+100</button>
                            <button onClick={() => { if(engineRef.current) { engineRef.current.state.electrons += 1000; setTriggerRender(r=>r+1); } }} className="bg-yellow-700 hover:bg-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold text-white">+1K</button>
                        </div>
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-bold">{tx("")}</span>
                        <button 
                            onClick={() => { if(engineRef.current) { engineRef.current.state.devGodMode = !engineRef.current.state.devGodMode; setTriggerRender(r=>r+1); } }} 
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${engineRef.current?.state.devGodMode ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            {engineRef.current?.state.devGodMode ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1.5">
                        <span className="text-slate-300 font-bold mb-1">{tx("")}</span>
                        <div className="flex flex-wrap gap-1">
                            {[
                                { id: 'ginger_cat', name: 'Rudy' },
                                { id: 'black_cat', name: 'Czarny' },
                                { id: 'bohr_cat', name: 'Bohr' },
                                { id: 'curie_cat', name: 'Curie' },
                                { id: 'schrodinger_cat', name: 'Schrodinger' }
                            ].filter(merc => merc.id !== engineRef.current?.state.selectedCharacter).map(merc => (
                                <button 
                                    key={merc.id}
                                    onClick={() => { 
                                        if (engineRef.current) { 
                                            engineRef.current.state.companion = merc.id;
                                            setTriggerRender(r=>r+1); 
                                        } 
                                    }} 
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${engineRef.current?.state.companion === merc.id ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                >
                                    {merc.name}
                                </button>
                            ))}
                            {engineRef.current?.state.companion && (
                                <button 
                                    onClick={() => { if(engineRef.current) { engineRef.current.state.companion = null; setTriggerRender(r=>r+1); } }}
                                    className="bg-red-900/50 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold ml-auto"
                                >
                                    Usuń
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-bold">Odblokuj pierwiastki</span>
                        <button 
                            onClick={() => { 
                                if(engineRef.current) { 
                                    const allAtoms = ['H', 'He', 'C', 'N', 'O', 'S', 'Si', 'Ra', 'Po', 'Cl', 'P'];
                                    engineRef.current.state.unlockedAtoms = [...allAtoms] as any[]; 
                                    engineRef.current.state.unlockedAlchemyAtoms = [...allAtoms];
                                    engineRef.current.state.unlockedReactions = REACTIONS_DB.map(r => r.id);
                                    engineRef.current.saveGame();
                                    setTriggerRender(r=>r+1); 
                                } 
                            }} 
                            className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                        >
                            ALL
                        </button>
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300 font-bold">InstaKill</span>
                        <button 
                            onClick={() => { if(engineRef.current) { engineRef.current.state.devInstaKill = !engineRef.current.state.devInstaKill; setTriggerRender(r=>r+1); } }} 
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${engineRef.current?.state.devInstaKill ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            {engineRef.current?.state.devInstaKill ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1">
                        <button onClick={() => {
                            if (engineRef.current) {
                                engineRef.current.state.unlockedAlchemyAtoms = PERIODIC_TABLE.slice(0, 88).map(el => el.symbol);
                                engineRef.current.syncReactions();
                                engineRef.current.saveGame();
                                setTriggerRender(r=>r+1);
                            }
                        }} className="bg-orange-600 hover:bg-orange-500 py-1.5 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(234,88,12,0.4)] mb-1">
                            🔓 ODBLOKUJ WSZYSTKO (PIERW. + WIĄZANIA)
                        </button>
                        <button onClick={() => setShowingDevBossTests(!showingDevBossTests)} className="bg-purple-700 hover:bg-purple-600 py-1.5 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]">
                            👾 TESTY BOSSÓW
                        </button>
                        {showingDevBossTests && (
                            <div className="grid grid-cols-2 gap-1 mt-1">
                                <button onClick={() => { engineRef.current?.devSpawnBoss('Celery'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="bg-green-700 hover:bg-green-600 text-[10px] py-1 rounded text-white font-bold">{tx("Poziom ")}1 (Seler)</button>
                                <button onClick={() => { engineRef.current?.devSpawnBoss('SnakeGourdHead'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="bg-lime-700 hover:bg-lime-600 text-[10px] py-1 rounded text-white font-bold">{tx("Poziom ")}2 (Tykwa)</button>
                                <button onClick={() => { engineRef.current?.devSpawnBoss('Hogweed'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="bg-emerald-700 hover:bg-emerald-600 text-[10px] py-1 rounded text-white font-bold">{tx("Poziom ")}2 (Barszcz)</button>
                                <button onClick={() => { engineRef.current?.devSpawnBoss('Durian'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="bg-yellow-600 hover:bg-yellow-500 text-[10px] py-1 rounded text-white font-bold">{tx("Poziom ")}3 (Durian)</button>
                                <button onClick={() => { engineRef.current?.devSpawnBoss('GiantTree'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="col-span-2 bg-stone-700 hover:bg-stone-600 text-[10px] py-1 rounded text-white font-bold">{tx("")}</button>
                                <button onClick={() => { engineRef.current?.devSpawnBoss('Patozwiazek'); setShowingDevMenu(false); setShowingDevBossTests(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="col-span-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-[10px] py-1 rounded text-white font-bold">{tx("")}</button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1">
                        <button 
                            onClick={() => { 
                                if(engineRef.current) { 
                                    engineRef.current.state.unlockedReactions = REACTIONS_DB.map(r => r.id);
                                    setShowingRecipeBook(true); 
                                    setShowingDevMenu(false); 
                                } 
                            }} 
                            className="bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                        >
                            📖 Otwórz / Odblokuj Księgę Reakcji
                        </button>
                        <button 
                            onClick={() => { 
                                if(engineRef.current) { 
                                    engineRef.current.state.policeSpawning = true; 
                                    engineRef.current.state.roomsSinceTaxOwed = 10;
                                    if (!engineRef.current.state.taxEntries) {
                                        engineRef.current.state.taxEntries = [];
                                    }
                                    engineRef.current.state.taxEntries.push({
                                        id: 'dev_test_' + Date.now(),
                                        description: tx("Podatek Beli Słomy (Fiskalny Test Deweloperski)"),
                                        incomeAmount: 500,
                                        taxAmount: 150,
                                        roomsSinceTaxOwed: 10,
                                        paid: false,
                                        timestamp: new Date().toISOString()
                                    });
                                    engineRef.current.state.unpaidTax = engineRef.current.state.taxEntries
                                        .filter((e: any) => !e.paid)
                                        .reduce((sum: number, e: any) => sum + e.taxAmount, 0);
                                    engineRef.current.addLog(tx("🚨 URZĄD SKARBOWY WYSYŁA KOTY POLICJANTÓW NA BAGIETKACH! 🚨"));
                                    setShowingDevMenu(false);
                                } 
                            }} 
                            className="bg-red-700 hover:bg-red-500 py-1.5 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                        >
                            🚨 Spawn Police Portal
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('catbotModeUnlocked');
                                setCatbotModeUnlocked(false);
                                setEasterEggScanning(false);
                                setScanProgress(0);
                                setShowingDevMenu(false);
                                if(engineRef.current) engineRef.current.addLog("⚙️ Zresetowano stan hackowania Catbota.");
                            }} 
                            className="bg-yellow-700 hover:bg-yellow-600 py-1.5 rounded text-[10px] font-bold text-white shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                        >
                            🔄 Resetuj Tryb Kotbota
                        </button>
                    </div>
                </div>

                <div className="mt-3 text-center">
                    <button onClick={() => { setShowingDevMenu(false); if(engineRef.current) engineRef.current.state.devPaused=false; }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 w-full rounded-lg text-xs transition-all shadow">ZAMKNIJ</button>
                </div>
        </div>
      )}

      {showingPeriodicTable && (
        <div className="absolute inset-0 z-[150] flex flex-col bg-[#0a0a0f] text-slate-100 pointer-events-auto">
            <div className="p-2 md:p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
               <h1 className="text-sm md:text-xl font-bold tracking-widest text-indigo-400 uppercase">
                  {engineRef.current?.state.state === 'menu' ? tx('Wybór Pierwiastka do Wizualizacji') : tx("TABLICA MENDELEJEWA")}
               </h1>
               <button 
                 className="bg-slate-700 hover:bg-red-600 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-base rounded font-bold"
                 onClick={() => setShowingPeriodicTable(false)}
               >
                 {tx("Zamknij")}
               </button>
            </div>
            <div className="flex-1 overflow-auto relative">
                <PeriodicTable 
                    language={engineRef.current?.state.language || 'pl'}
                    unlockedAtoms={engineRef.current?.state.state === 'lobby' ? (engineRef.current?.state.unlockedAlchemyAtoms || ['H']) : (engineRef.current?.state.unlockedAtoms || ['H'])}
                    isMenuMode={engineRef.current?.state.state === 'menu'}
                    onSelectAtom={(z) => {
                         if (engineRef.current?.state.state === 'menu') {
                             setMenuSelectedZ(z);
                         }
                         setSelectedAtomDetails(z);
                    }}
                />
                {selectedAtomDetails && (
                    <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-900 border border-indigo-500/50 w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col shadow-2xl maxHeight-[90vh]">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-indigo-950/20">
                                <h3 className="text-xl font-bold text-white">{tx("Budowa i Wiązania:")} {tx(PERIODIC_TABLE.find(x => x.z === selectedAtomDetails)?.name || '')} ({PERIODIC_TABLE.find(x => x.z === selectedAtomDetails)?.symbol})</h3>
                                <button onClick={() => setSelectedAtomDetails(null)} className="text-slate-400 hover:text-white text-xl">✖</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/2 flex flex-col relative min-h-[350px] border border-slate-700 rounded-xl overflow-hidden bg-black/50 pointer-events-none">
                                    <MenuGameplay selectedZ={selectedAtomDetails} language={engineRef.current?.state.language || 'pl'} />
                                </div>
                                <div className="md:w-1/2 flex flex-col gap-4">
                                    <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-xs border-b border-indigo-900 pb-2">{tx("Możliwe Wiązania")}</h4>
                                    <div className="flex flex-col gap-3 overflow-y-auto pr-2" style={{maxHeight:'50vh'}}>
                                        {REACTIONS_DB.filter(rx => rx.atoms.includes(PERIODIC_TABLE.find(x => x.z === selectedAtomDetails)?.symbol || '')).map(rx => {
                                            const isUnlockedMenuContext = engineRef.current?.state.state === 'menu' || engineRef.current?.state.state === 'lobby';
                                            const isUnlocked = isUnlockedMenuContext ? true : engineRef.current?.state.unlockedReactions.includes(rx.id);
                                            return (
                                                <button key={rx.id} onClick={() => setSelectedReactionDetails(rx.id)} className={`p-3 rounded-xl border ${isUnlocked ? 'border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/40' : 'border-slate-700/50 bg-slate-800/30 grayscale opacity-60 hover:opacity-80'} flex gap-3 items-center shadow-lg relative overflow-hidden transition-all text-left`}>
                                                    <div className="shrink-0 w-16 h-16 flex items-center justify-center -ml-4 -my-4 relative z-10 scale-[0.65]">
                                                        <MoleculeGraphic atoms={isUnlocked ? rx.atoms : ['?']} size="sm" />
                                                    </div>
                                                    <div className="flex flex-col relative z-10 w-full text-left">
                                                        <div className="text-[10px] font-black text-yellow-500">{isUnlocked ? rx.eq : '???'}</div>
                                                        <div className="text-sm font-bold text-white leading-none">{isUnlocked ? tx(rx.name) : tx("Zablokowane")}</div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                        {REACTIONS_DB.filter(rx => rx.atoms.includes(PERIODIC_TABLE.find(x => x.z === selectedAtomDetails)?.symbol || '')).length === 0 && (
                                            <div className="text-slate-500 text-sm italic py-4">{tx("Brak dostępnych wiązań dla tego pierwiastka w grze... jeszcze.")}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedReactionDetails && (
                            <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                                <div className="bg-slate-900 border border-fuchsia-500/50 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(217,70,239,0.2)]">
                                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-fuchsia-950/20">
                                        <h3 className="text-xl font-bold text-white flex gap-2 items-center">
                                            {tx("Szczegóły Wiązania")}
                                        </h3>
                                        <button onClick={() => setSelectedReactionDetails(null)} className="text-slate-400 hover:text-white text-xl">✖</button>
                                    </div>
                                    <div className="p-6 flex flex-col md:flex-row gap-6">
                                        <div className="shrink-0 flex items-center justify-center bg-black/50 border border-slate-700 rounded-xl p-4 w-full md:w-auto min-w-[200px]">
                                            <MoleculeGraphic atoms={REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.atoms || []} size="lg" />
                                        </div>
                                        <div className="flex flex-col gap-4 w-full">
                                            <div>
                                                <h4 className="text-2xl font-black text-white">{tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.name || "")}</h4>
                                                <div className="text-yellow-500 font-mono text-sm font-bold">{REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.eq}</div>
                                            </div>
                                            <div className="bg-fuchsia-900/20 border border-fuchsia-500/20 rounded-lg p-3 text-sm text-fuchsia-100">
                                                <span className="font-bold text-fuchsia-300 block mb-1">{tx("Działanie (Superbroń):")}</span>
                                                {tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.desc || "")}
                                            </div>
                                            {REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.funFact && (
                                                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-100">
                                                    <span className="font-bold text-blue-300 block mb-1">{tx("Ciekawostka IRL:")}</span>
                                                    {tx(REACTIONS_DB.find(r => r.id === selectedReactionDetails)?.funFact || "")}
                                                </div>
                                            )}
                                            <div className="mt-auto pt-4 flex justify-end">
                                              <button onClick={() => setSelectedReactionDetails(null)} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded text-white font-bold">{tx("Wróć")}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

      {gameStateUi === 'gameover' && engineRef.current && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-black/90 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className="text-[120px] mb-2 animate-pulse drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">☠️</div>
          <h1 className="text-5xl md:text-7xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] mb-2 text-center uppercase">
            {tx("KONIEC GRY")}
          </h1>
          <p className="text-lg md:text-xl mb-8 uppercase tracking-widest font-bold text-slate-400 text-center">
            {tx("Eksperyment Zakończony Niepowodzeniem")}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[300px]">
            {(() => {
                const cost = 50 * ((engineRef.current.state.revivesUsed || 0) + 1);
                const canAfford = engineRef.current.state.protons >= cost;
                const canRevive = (engineRef.current.state.revivesUsed || 0) < 2;
                
                if (!canRevive) {
                    return <div className="text-center text-slate-400 font-bold mb-4 bg-slate-900/50 py-3 rounded-xl border border-slate-700/50">{tx("Wykorzystano limit wskrzeszeń (2/2)")}</div>;
                }
                
                return (
                    <>
                        <button 
                            disabled={!canAfford}
                            onClick={() => {
                                if (engineRef.current && canAfford && canRevive) {
                                    engineRef.current.state.protons -= cost;
                                    engineRef.current.revivePlayer();
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className={`w-full py-4 rounded-xl font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                        >
                            <span>{tx("Wskrześ za")}</span> 
                            <span className="text-indigo-300 mx-1">{cost}</span> 
                            <span>p⁺</span>
                        </button>
                        
                        <button 
                            onClick={() => {
                                // Simulate Ad
                                if (engineRef.current && canRevive) {
                                    alert(tx("Symulacja Reklamy... (Tu odpaliłoby się wideo). Otrzymujesz Drugie Życie!"));
                                    engineRef.current.revivePlayer();
                                    setTriggerRender(r => r + 1);
                                }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span>{tx("📺 Obejrzyj Reklamę")}</span>
                        </button>
                    </>
                );
            })()}
            
            <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.forceWipeReset();
                        setTriggerRender(r => r + 1);
                    }
                }}
                className="w-full mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all hover:scale-105 uppercase tracking-widest text-sm"
            >
                {tx("Zakończ Podejście")} ({tx("Wróć do Menu")})
            </button>
          </div>
        </div>
      )}

      {gameStateUi === 'victory_screen' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-20 backdrop-blur-md animate-in fade-in zoom-in duration-700 p-2 md:p-4">
          <div className="w-full text-center flex flex-col items-center justify-center overflow-y-auto max-h-screen py-4 md:py-10">
                            {(engineRef.current?.state.level || 1) === 6 ? (
                  <h1 className="text-4xl md:text-8xl font-black text-amber-400 tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] mb-2 text-center">{tx("WYGRANA!")}</h1>
              ) : (
                  <h1 className="text-4xl md:text-8xl font-black text-green-400 tracking-tighter drop-shadow-[0_0_20px_rgba(74,222,128,0.6)] mb-2 text-center">{tx("VICTORY")}</h1>
              )}
              <p className="text-xl md:text-2xl mb-4 md:mb-8 uppercase tracking-widest font-bold text-slate-300 text-center">
                Dungeon {tx("Poziom ")}<span className="text-white">{(engineRef.current?.state.level || 1) - 1}</span>{tx(" Oczyszczony!")}
              </p>

              {(engineRef.current?.state.level || 1) === 6 && (
                  <div className="max-w-xl text-center mb-4 md:mb-8 bg-amber-900/40 p-4 rounded-xl border border-amber-500/30 text-amber-200 font-bold text-sm md:text-base">
                      {tx("Gratulacje! Przetrwałeś 5 poziomów i ukończyłeś grę!")}<br/>
                      <span className="text-yellow-300 font-black text-lg block mt-2 mb-1">🏆 {tx("ODBLOKOWANO NOWĄ POSTAĆ: MENDELEJEW")} 🏆</span>
                      <span className="text-xs text-amber-300/70">{tx("Mendelejew zawsze zaczyna z 4 losowymi pierwiastkami.")}</span>
                  </div>
              )}
              
              <div className="bg-[#1e293b]/70 border border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-[400px] mb-6 md:mb-8 shadow-2xl backdrop-blur-xl">
                 <h2 className="text-center text-lg md:text-xl font-bold text-indigo-300 mb-3 md:mb-4 border-b border-slate-700 pb-2">{tx("Statystyki Zabitych")}</h2>
                 <ul className="max-h-[120px] md:max-h-[200px] overflow-auto space-y-1.5 md:space-y-2 pr-2">
                {engineRef.current && Object.entries(engineRef.current.state.dungeonKills || {}).length > 0 ? (
                    Object.entries(engineRef.current.state.dungeonKills).map(([type, count]) => (
                        <li key={type} className="flex justify-between items-center text-slate-300">
                           <span>{type}</span>
                           <span className="font-mono text-yellow-400">{count}x</span>
                        </li>
                    ))
                ) : (
                    <li className="text-slate-500 text-center">{tx("")}</li>
                )}
             </ul>
          </div>
          
                    {(engineRef.current?.state.level || 1) < 6 ? (
              <button 
                onClick={nextLevelFromVictory}
                className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-full px-8 py-4 md:px-10 md:py-5 font-bold tracking-widest text-base md:text-lg hover:bg-green-500/20 text-green-200 transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] mb-4"
              >
                DALEJ {engineRef.current?.state.autoNextLevel ? `(${victoryTimer}s)` : ''}
              </button>
          ) : (
              <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.resetGame();
                        engineRef.current.state.state = 'menu';
                        setGameStateUi('menu');
                    }
                }}
                className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 rounded-full px-8 py-4 md:px-10 md:py-5 font-bold tracking-widest text-base md:text-lg hover:bg-amber-500/20 text-amber-200 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] mb-4"
              >
                {tx("WYJŚCIE DO MENU")}
              </button>
          )}
          </div>
        </div>
      )}
      
      {gameStateUi === 'proton_tutorial' && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col items-center justify-center bg-[#0a0a0f]/80 text-slate-100 z-50 backdrop-blur-md">
          <div className="bg-[#1e293b] border-2 border-purple-500 rounded-2xl p-8 max-w-lg text-center shadow-[0_0_50px_rgba(168,85,247,0.4)]">
             <div className="text-6xl mb-4">💥</div>
             <h2 className="text-3xl font-black text-purple-400 mb-4 tracking-tight">ZDOBYTO PROTON!</h2>
             <p className="text-slate-300 text-lg mb-6 leading-relaxed">
               {tx("")}<span className="font-bold text-purple-300">{tx("Proton")}</span>{tx("")}
               {tx("")}<span className="underline">{tx("Lobby")}</span>{tx("")}
               Użyj Protonów, aby kupować nowe postacie na początku gry!
             </p>
             <button 
                onClick={() => {
                    if (engineRef.current) {
                        engineRef.current.state.state = 'playing';
                        setGameStateUi('playing');
                    }
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all"
             >
                ZROZUMIANO
             </button>
          </div>
        </div>
      )}
      {showCatbotHacking && (
        <CatbotLandingHacking 
            onComplete={() => {
                setShowCatbotHacking(false);
                setCatbotModeUnlocked(true);
                localStorage.setItem('catbotModeUnlocked', 'true');
                if (engineRef.current) {
                    const st = engineRef.current.state;
                    st.protons = (st.protons || 0) + 15;
                    if (!st.unlockedCharacters.includes('black_cat')) {
                        st.unlockedCharacters.push('black_cat');
                    }
                    if (!st.unlockedCharacters.includes('bohr_cat')) {
                        st.unlockedCharacters.push('bohr_cat');
                    }
                    if (!st.unlockedCharacters.includes('curie_cat')) {
                        st.unlockedCharacters.push('curie_cat');
                    }
                    engineRef.current.addLog(tx("🤖 KOTBOT O.S: Zhakowano system! Otrzymałeś +15 Protonów i odblokowałeś wszystkie Koty!"));
                    engineRef.current.saveGame();
                }
                setIsCatbotEngineRunning(true);
                setTriggerRender(r => r + 1);
            }} 
            onExit={() => {
                setShowCatbotHacking(false);
                setEasterEggScanning(false);
                setScanProgress(0);
            }} 
        />
      )}
      
      {isCatbotEngineRunning && (
          <CatbotEngine onExit={() => setIsCatbotEngineRunning(false)} />
      )}
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;

const AtomSelector = ({ selected, id, name, symbol, color, borderColor, textColor, onClick }: any) => (
    <div onClick={onClick} className={`flex flex-col items-center transition-all cursor-pointer ${selected ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-80'}`}>
        <div className={`w-14 h-14 rounded-full ${color} border-2 ${borderColor} flex items-center justify-center text-xl font-black ${selected ? 'shadow-[0_0_20px_rgba(255,255,255,0.4)]' : ''}`}>
            {symbol}
        </div>
        <span className={`text-[10px] mt-2 font-bold tracking-tighter ${textColor}`}>[{id}] {name}</span>
    </div>
);
