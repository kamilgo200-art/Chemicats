import { GameState, Vector2, Projectile, Enemy, Particle, AtomType, RoomInfo } from '../types';
import { REACTIONS_DB } from '../components/ReactionsDB';

let nextId = 1;

const ROOM_WIDTH = 1400;
const ROOM_HEIGHT = 1050;
const WALL_THICKNESS = 40;
const DOOR_SIZE = 200;

export class GameEngine {
  public state: GameState;
  public currentSaveSlot: number = 1;
  
  private lastTime: number = 0;
  private canvasSize: Vector2 = { x: 800, y: 600 };
  private fireTimer: number = 0;

  private lastSaveTime: number = 0;

  constructor() {
    this.state = this.getInitialState(false);
    this.syncReactions();
  }

  public selectCharacter(char: string) {
      if (!this.state.charUpgrades) return;
      // Save current
      this.state.charUpgrades[this.state.selectedCharacter] = {
         maxHpLevel: this.state.maxHpLevel,
         regenLevel: this.state.regenLevel,
         speedLevel: this.state.speedLevel,
         gunLevel: this.state.gunLevel,
         armorLevel: this.state.armorLevel,
         heatLevel: this.state.heatLevel,
         hasSuperWeapon: this.state.hasSuperWeapon
      };
      
      this.state.selectedCharacter = char;
      
      // Load new
      const upg = this.state.charUpgrades[char] || { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false };
      this.state.maxHpLevel = upg.maxHpLevel;
      this.state.regenLevel = upg.regenLevel;
      this.state.speedLevel = upg.speedLevel;
      this.state.gunLevel = upg.gunLevel;
      this.state.armorLevel = upg.armorLevel;
      this.state.heatLevel = upg.heatLevel;
      this.state.hasSuperWeapon = upg.hasSuperWeapon;
      
      this.state.characterSelected = true;
      if (char === 'bohr_cat') {
          this.state.equippedWeapon = this.state.hasSuperWeapon ? 'super' : 'orbit';
      } else {
          this.state.equippedWeapon = this.state.hasSuperWeapon ? 'super' : (char === 'black_cat' ? 'shotgun' : 'normal');
      }
      this.state.player.maxHp = Math.round(45 * Math.pow(1.05, this.state.maxHpLevel));
      this.state.player.hp = this.state.player.maxHp;
      this.state.player.speed = 350 + this.state.speedLevel * 20;

      // Special initial atoms
      if (this.state.isLobby) {
          if (char === 'curie_cat') {
              this.state.unlockedAtoms = ['Ra', 'Po'];
              this.state.player.selectedAtom = 'Ra' as AtomType;
              if (!this.state.unlockedAlchemyAtoms.includes('Ra')) this.state.unlockedAlchemyAtoms.push('Ra');
              if (!this.state.unlockedAlchemyAtoms.includes('Po')) this.state.unlockedAlchemyAtoms.push('Po');
          } else if (char === 'mendelejew') {
              const pool = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Sc', 'Ti', 'Fe'];
              const shuffled = [...pool].sort(() => 0.5 - Math.random());
              this.state.unlockedAtoms = shuffled.slice(0, 4);
              this.state.player.selectedAtom = this.state.unlockedAtoms[0] as AtomType;
          } else {
              const defaultBase = ['H', 'O'];
              this.state.unlockedAtoms = this.state.baseAtoms.length > 0 ? [...this.state.baseAtoms] : defaultBase;
              this.state.player.selectedAtom = this.state.unlockedAtoms[0] as AtomType;
          }
      }
      this.syncReactions();
  }

  public syncReactions() {
      // Reactions are now unlocked dynamically via triggerReaction, so we don't automatically sync them here.
  }

  public saveGlobalSettings() {
      if (typeof window === 'undefined') return;
      const settings = {
          language: this.state.language,
          difficulty: this.state.difficulty,
          autoNextLevel: this.state.autoNextLevel,
          showCombatLog: this.state.showCombatLog,
          disableScreenShake: this.state.disableScreenShake,
          uiScale: this.state.uiScale,
          cameraZoom: this.state.cameraZoom
      };
      localStorage.setItem('mendelejew_global_settings', JSON.stringify(settings));
  }

  public saveGame(force: boolean = false) {
      this.saveGlobalSettings();
    if (this.state.state !== 'playing' && this.state.state !== 'menu') return;
    const now = performance.now();
    if (!force && now - this.lastSaveTime < 1000) return; // limit to 1 save per second
    this.lastSaveTime = now;
    
    // Sync current character stats to charUpgrades
    if (this.state.charUpgrades && this.state.selectedCharacter) {
       this.state.charUpgrades[this.state.selectedCharacter] = {
           maxHpLevel: this.state.maxHpLevel,
           regenLevel: this.state.regenLevel,
           speedLevel: this.state.speedLevel,
           gunLevel: this.state.gunLevel,
           armorLevel: this.state.armorLevel,
           heatLevel: this.state.heatLevel,
           hasSuperWeapon: this.state.hasSuperWeapon
       };
    }
    
    try {
      localStorage.setItem(`mendelejew_save_${this.currentSaveSlot}`, JSON.stringify({
        level: this.state.level,
        unlockedAtoms: this.state.unlockedAtoms,
        unlockedReactions: this.state.unlockedReactions,
        electrons: this.state.electrons,
        savingsBalance: this.state.savingsBalance,
        bondsBalance: this.state.bondsBalance,
        bondsRoomsLeft: this.state.bondsRoomsLeft,
        feedbackSubmitted: this.state.feedbackSubmitted,
        alchemyUnlocked: this.state.alchemyUnlocked,
        lobbyElectrons: this.state.lobbyElectrons,
        neutrons: this.state.neutrons,
        betaDecayVaultNeutrons: this.state.betaDecayVaultNeutrons,
        betaDecayLastTimestamp: this.state.betaDecayLastTimestamp,
        unlockedAlchemyAtoms: this.state.unlockedAlchemyAtoms,
        baseAtoms: this.state.baseAtoms,
        protons: this.state.protons,
        unlockedCharacters: this.state.unlockedCharacters,
        showProtonTutorial: this.state.showProtonTutorial,
        hasSeenTutorial: this.state.hasSeenTutorial,
        revivesUsed: this.state.revivesUsed,
        maxHpLevel: this.state.maxHpLevel,
        regenLevel: this.state.regenLevel,
        speedLevel: this.state.speedLevel,
        potions: this.state.potions,
        hasSuperWeapon: this.state.hasSuperWeapon,
        gunLevel: this.state.gunLevel,
        armorLevel: this.state.armorLevel,
        heatLevel: this.state.heatLevel,
        difficulty: this.state.difficulty,
        stats: this.state.stats,
        charUpgrades: this.state.charUpgrades,
        isLobby: this.state.isLobby,
        rooms: this.state.rooms,
        currentRoom: this.state.currentRoom,
        playerPos: this.state.player.pos,
        playerHp: this.state.player.hp,
        characterSelected: this.state.characterSelected,
        selectedCharacter: this.state.selectedCharacter,
        equippedWeapon: this.state.equippedWeapon,
        enemies: this.state.enemies,
        drops: this.state.drops,
        projectiles: this.state.projectiles,
        market: this.state.market,
        unpaidTax: this.state.unpaidTax,
        roomsSinceTaxOwed: this.state.roomsSinceTaxOwed,
        policeSpawning: this.state.policeSpawning,
        invoices: this.state.invoices,
        taxEntries: this.state.taxEntries,
        investmentRoomCounter: this.state.investmentRoomCounter,
        arrestedDeath: this.state.arrestedDeath
      }));
    } catch(e) {}
  }

  public loadGame(slot: number) {
      this.currentSaveSlot = slot;
      const isHost = this.state.isHost;
      const np = this.state.networkPlayers;
      const oldShowingSaves = this.state.showingSaves;
      const oldShowingLobby = this.state.showingLobby;
      this.state = this.getInitialState(true);
      this.state.state = 'playing';
      this.state.isHost = isHost;
      this.state.networkPlayers = np;
      this.state.showingSaves = oldShowingSaves;
      this.state.showingLobby = oldShowingLobby;
      this.syncReactions();
      
      const isMultiplayer = localStorage.getItem('lanActive') === 'true';
      if (isMultiplayer) {
          this.state.isLobby = true;
          this.state.characterSelected = false;
          // In multiplayer we want to start together in the room. Wait until we go through the gate.
      }
  }

  public triggerKonami() {
      if (this.state.player.konamiUsedInRun) {
          this.addLog("Gwiazdka zużyta w tym podejściu!");
          return;
      }
      this.state.player.konamiUsedInRun = true;
      this.state.player.invincibilityTimer = 10.0;
      this.addLog("⭐ GWIAZDKA! Masz 10s nieśmiertelności!");
  }

  public deleteSave(slot: number) {
      localStorage.removeItem(`mendelejew_save_${slot}`);
  }

  public getSaveSlotsInfo() {
      const slots = [];
      for(let i=1; i<=5; i++) {
          try {
              const saved = localStorage.getItem(`mendelejew_save_${i}`);
              if (saved) {
                  const parsed = JSON.parse(saved);
                  slots.push({ 
                      slot: i, 
                      empty: false, 
                      level: parsed.level || 1, 
                      electrons: parsed.electrons || 0,
                      unlockedAtoms: parsed.unlockedAtoms || ['H']
                  });
              } else {
                  slots.push({ slot: i, empty: true, unlockedAtoms: [] });
              }
          } catch(e) {
              slots.push({ slot: i, empty: true, unlockedAtoms: [] });
          }
      }
      return slots;
  }

  public hardReset() {
      // Not used individually now, users will delete individual slots
  }

  public resetGame() {
    const isHost = this.state.isHost;
    const np = this.state.networkPlayers;
    const oldShowingSaves = this.state.showingSaves;
    const oldShowingLobby = this.state.showingLobby;
    this.state = this.getInitialState(true);
    this.state.state = 'playing';
    this.state.isHost = isHost;
    this.state.networkPlayers = np;
    this.state.showingSaves = oldShowingSaves;
    this.state.showingLobby = oldShowingLobby;
  }

  public getInitialState(loadCurrentSlot: boolean = true): GameState {
    let rooms = [{
      gridX: 0, gridY: 0,
      doors: { North: false, South: false, East: false, West: false },
      cleared: true, visited: true, isBoss: false, enemyCount: 0
    }];
    let currentRoom = { x: 0, y: 0 };
    let isLobby = true;
    let characterSelected = false;
    let selectedCharacter = 'ginger_cat';
    let equippedWeapon: 'normal'|'super'|'shotgun' = 'normal';
    let playerPos = { x: 0, y: 0 };
    let playerHp = -1;
    let enemies: any[] = [];
    let drops: any[] = [];
    let projectiles: any[] = [];

    let level = 1;
        let unlockedAtoms = ['H', 'O'];
    if (!loadCurrentSlot && selectedCharacter === 'curie_cat') {
        unlockedAtoms = ['Ra', 'Po'];
    } else if (!loadCurrentSlot && selectedCharacter === 'mendelejew') {
        const pool = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Sc', 'Ti', 'Fe'];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        unlockedAtoms = shuffled.slice(0, 4);
    }
    let unlockedReactions: string[] = [];
    let electrons = 0;
    let savingsBalance = 0;
    let bondsBalance = 0;
    let bondsRoomsLeft = 0;
    let feedbackSubmitted = false;
    let alchemyUnlocked = false;
    let lobbyElectrons = 0;
    let neutrons = 0;
    let betaDecayVaultNeutrons = 0;
    let betaDecayLastTimestamp = 0;
    let unlockedAlchemyAtoms = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Sc', 'Ti', 'Fe'];
    let baseAtoms = ['H', 'O'];
    
        let charUpgrades: Record<string, any> = {
      ginger_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      black_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      bohr_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      curie_cat: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false },
      mendelejew: { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false }
    };
    
    let maxHpLevel = 0;
    let regenLevel = 0;
    let speedLevel = 0;
    let potions = { heal: 0, shield: 0, stamina: 0 };
    let hasSuperWeapon = false;
    let gunLevel = 0;
    let armorLevel = 0;
    let heatLevel = 0;
    let difficulty: 'kids' | 'easy' | 'normal' | 'hard' = 'normal';
    let language: 'pl' | 'en' = 'pl';
        let autoNextLevel = true;
    let disableScreenShake = false;
    let uiScale = 1.0;
    let showCombatLog = false;
    let cameraZoom = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 1.0 : 0.55;

    if (typeof window !== 'undefined') {
        const globalStr = localStorage.getItem('mendelejew_global_settings');
        if (globalStr) {
            try {
                const global = JSON.parse(globalStr);
                if (global.difficulty) difficulty = global.difficulty;
                if (global.language) language = global.language;
                if (global.autoNextLevel !== undefined) autoNextLevel = global.autoNextLevel;
                if (global.disableScreenShake !== undefined) disableScreenShake = global.disableScreenShake;
                if (global.uiScale !== undefined) uiScale = global.uiScale;
                if (global.showCombatLog !== undefined) showCombatLog = global.showCombatLog;
                if (global.cameraZoom !== undefined) cameraZoom = global.cameraZoom;
            } catch(e) {}
        }
    }

        let stats = { reactionsCount: {}, reactionDamage: {}, totalDamage: 0 };
    let protons = 0;
    let unlockedCharacters = ['ginger_cat'];
    let showProtonTutorial = false;
    let hasSeenTutorial = true;
    let revivesUsed = 0;
    
    let unpaidTax = 0;
    let roomsSinceTaxOwed = 0;
    let policeSpawning = false;
    let taxEntries: any[] = [];
    let investmentRoomCounter = 0;
    
    let marketAssets = [
      {
        id: 'atom500', name: '📈 ETF Atom 500', 
        desc: 'Globalny fundusz ETF śledzący akcje 500 najpotężniejszych spółek Głównej Wielkiej Cytadeli Światowej. Bardzo stabilny i zdywersyfikowany wielkoskalowy koszyk rynkowy.',
        history: [100], currentPrice: 100, shares: 0,
        meanReturn: 0.10, minReturn: -0.30, maxReturn: 0.30
      },
      {
        id: 'tech100', name: '🚀 ETF Technology 100', 
        desc: 'Agresywny fundusz grupujący 100 największych i najbardziej dochodowych korporacji technologicznych we wszechświecie. Wysokie ryzyko, najwyższe potencjalne zwroty.',
        history: [100], currentPrice: 100, shares: 0,
        meanReturn: 0.13, minReturn: -0.40, maxReturn: 0.40
      },
      {
        id: 'crypto_proton', name: '🪙 Bit Elektron (BE)', 
        desc: 'Wysoce niestabilny krypto-zasób oparty na spekulacjach. Ogromne ryzyko bolesnych strat, ale szansa na gargantuiczne zyski (to the moon!).',
        history: [10], currentPrice: 10, shares: 0,
        meanReturn: 0.0, minReturn: -0.80, maxReturn: 1.00
      },
      {
        id: 'alphabet', name: '🔤 Zetabet (Z)',
        desc: 'Ogromna korporacja technologiczna zajmująca się indeksowaniem całego wszechświata Mendelejewa. Wszyscy z niej korzystają, ale nikt nie czyta regulaminu.',
        history: [50], currentPrice: 50, shares: 0,
        meanReturn: 0.05, minReturn: -0.60, maxReturn: 0.70
      },
      {
        id: 'tsmc', name: '💻 TCMC',
        desc: 'Tajna Cytadela MikroCzipów. Jedyna firma we wszechświecie wytwarzająca układy scalone niezbędne do blasterów. Posiada twardy monopol technologiczny.',
        history: [40], currentPrice: 40, shares: 0,
        meanReturn: 0.05, minReturn: -0.60, maxReturn: 0.70
      },
      {
        id: 'amazon', name: '📦 Dżunglezon (DZ)',
        desc: 'Międzygalaktyczny dostawca paczek, wysyłający atomy z opcją Prime w 2 minuty. Dostawa zawsze na czas, albo kurier traci życie.',
        history: [60], currentPrice: 60, shares: 0,
        meanReturn: 0.05, minReturn: -0.60, maxReturn: 0.70
      },
      {
        id: 'microsoft', name: '🪟 MikroMiękki (MM)',
        desc: 'Twórcy sławnego systemu operacyjnego Okna, który wiesza się na każdej czarnej dziurze, ale i tak zdominował światowe systemy.',
        history: [45], currentPrice: 45, shares: 0,
        meanReturn: 0.05, minReturn: -0.60, maxReturn: 0.70
      }
    ];

    if (loadCurrentSlot) {
        try {
            const saved = localStorage.getItem(`mendelejew_save_${this.currentSaveSlot}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.level) level = parsed.level;
                // Atoms drop back down on death but we want to load them here, wait, where do they reset? We do it in player death logic.
                if (parsed.unlockedAtoms) unlockedAtoms = parsed.unlockedAtoms;
                if (parsed.unlockedReactions) unlockedReactions = parsed.unlockedReactions;
                if (parsed.electrons) electrons = parsed.electrons;
                if (parsed.savingsBalance !== undefined) savingsBalance = parsed.savingsBalance;
                if (parsed.bondsBalance !== undefined) bondsBalance = parsed.bondsBalance;
                if (parsed.bondsRoomsLeft !== undefined) bondsRoomsLeft = parsed.bondsRoomsLeft;
                if (parsed.feedbackSubmitted !== undefined) feedbackSubmitted = parsed.feedbackSubmitted;
                if (parsed.alchemyUnlocked !== undefined) alchemyUnlocked = parsed.alchemyUnlocked;
                if (parsed.lobbyElectrons !== undefined) lobbyElectrons = parsed.lobbyElectrons;
                if (parsed.neutrons !== undefined) neutrons = parsed.neutrons;
                if (parsed.betaDecayVaultNeutrons !== undefined) betaDecayVaultNeutrons = parsed.betaDecayVaultNeutrons;
                if (parsed.betaDecayLastTimestamp !== undefined) betaDecayLastTimestamp = parsed.betaDecayLastTimestamp;
                if (parsed.unlockedAlchemyAtoms !== undefined) unlockedAlchemyAtoms = parsed.unlockedAlchemyAtoms;
                if (parsed.baseAtoms !== undefined) baseAtoms = parsed.baseAtoms;
                if (parsed.protons) protons = parsed.protons;
                if (parsed.unlockedCharacters) unlockedCharacters = parsed.unlockedCharacters;
                if (parsed.showProtonTutorial) showProtonTutorial = parsed.showProtonTutorial;
                if (parsed.hasSeenTutorial !== undefined) {
                    hasSeenTutorial = parsed.hasSeenTutorial;
                } else {
                    hasSeenTutorial = true;
                }
                if (parsed.revivesUsed !== undefined) revivesUsed = parsed.revivesUsed;
                if (parsed.maxHpLevel) maxHpLevel = parsed.maxHpLevel;
                if (parsed.regenLevel) regenLevel = parsed.regenLevel;
                if (parsed.speedLevel) speedLevel = parsed.speedLevel;
                if (parsed.potions) potions = parsed.potions;
                if (parsed.hasSuperWeapon) hasSuperWeapon = parsed.hasSuperWeapon;
                if (parsed.gunLevel) gunLevel = parsed.gunLevel;
                if (parsed.armorLevel) armorLevel = parsed.armorLevel;
                if (parsed.heatLevel) heatLevel = parsed.heatLevel;
                if (parsed.stats) stats = parsed.stats;
                if (parsed.difficulty) difficulty = parsed.difficulty;
                
                if (parsed.charUpgrades) {
                   charUpgrades = parsed.charUpgrades;
                } else {
                   // Migration
                   charUpgrades.ginger_cat = { maxHpLevel, regenLevel, speedLevel, gunLevel, armorLevel, heatLevel, hasSuperWeapon };
                   charUpgrades.black_cat = { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false };
                }
                if (!charUpgrades[selectedCharacter]) charUpgrades[selectedCharacter] = { maxHpLevel: 0, regenLevel: 0, speedLevel: 0, gunLevel: 0, armorLevel: 0, heatLevel: 0, hasSuperWeapon: false };
                
                // Keep the backward compatible flat props updated for UI that might use them initially, but we'll migrate them.
                maxHpLevel = charUpgrades[selectedCharacter].maxHpLevel;
                regenLevel = charUpgrades[selectedCharacter].regenLevel;
                speedLevel = charUpgrades[selectedCharacter].speedLevel;
                gunLevel = charUpgrades[selectedCharacter].gunLevel;
                armorLevel = charUpgrades[selectedCharacter].armorLevel;
                heatLevel = charUpgrades[selectedCharacter].heatLevel;
                hasSuperWeapon = charUpgrades[selectedCharacter].hasSuperWeapon;

                if (parsed.rooms) rooms = parsed.rooms;
                if (parsed.currentRoom) currentRoom = parsed.currentRoom;
                if (parsed.isLobby !== undefined) isLobby = parsed.isLobby;
                if (parsed.characterSelected !== undefined) characterSelected = parsed.characterSelected;
                if (parsed.selectedCharacter) selectedCharacter = parsed.selectedCharacter;
                if (parsed.equippedWeapon) equippedWeapon = parsed.equippedWeapon;
                if (parsed.playerPos) playerPos = parsed.playerPos;
                if (parsed.playerHp !== undefined) playerHp = parsed.playerHp;
                if (parsed.enemies) enemies = parsed.enemies;
                if (parsed.drops) drops = parsed.drops;
                if (parsed.projectiles) projectiles = parsed.projectiles;
                if (parsed.market) {
                    parsed.market.assets.forEach((savedAsset: any) => {
                        const existingAsset = marketAssets.find(a => a.id === savedAsset.id);
                        if (existingAsset) {
                           existingAsset.currentPrice = savedAsset.currentPrice;
                           existingAsset.history = savedAsset.history;
                           existingAsset.shares = savedAsset.shares;
                        }
                    });
                }
                if (parsed.unpaidTax !== undefined) unpaidTax = parsed.unpaidTax;
                if (parsed.roomsSinceTaxOwed !== undefined) roomsSinceTaxOwed = parsed.roomsSinceTaxOwed;
                if (parsed.policeSpawning !== undefined) policeSpawning = parsed.policeSpawning;
                if (parsed.taxEntries) taxEntries = parsed.taxEntries;
                if (parsed.investmentRoomCounter !== undefined) investmentRoomCounter = parsed.investmentRoomCounter;
            }
        } catch(e) {}
    }

    const baseMaxHp = Math.round(45 * Math.pow(1.05, maxHpLevel));
    if (playerHp === -1) playerHp = baseMaxHp;

    const invoices = (loadCurrentSlot ? (() => {
        try {
            const saved = localStorage.getItem(`mendelejew_save_${this.currentSaveSlot}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.invoices || [];
            }
        } catch(e){}
        return [];
    })() : []) as any[];

    const arrestedDeath = (loadCurrentSlot ? (() => {
        try {
            const saved = localStorage.getItem(`mendelejew_save_${this.currentSaveSlot}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return !!parsed.arrestedDeath;
            }
        } catch(e){}
        return false;
    })() : false);

      return {
      player: {
        pos: playerPos,
        radius: 15,
        speed: 350 + speedLevel * 20,
        hp: playerHp,
        maxHp: baseMaxHp,
        stamina: 100,
        maxStamina: 100,
        selectedAtom: unlockedAtoms.length > 0 ? (unlockedAtoms[0] as any) : 'H',
        selectedReaction: '',
        isDashing: false,
        dashTimer: 0,
        dashCooldown: 0,
        dashDir: { x: 0, y: 0 },
        facing: 1,
        aimAngle: 0
      },
      projectiles: projectiles,
      enemies: enemies,
      particles: [],
      rooms: rooms,
      currentRoom: currentRoom,
      keys: {},
      mouse: { x: 0, y: 0 },
      isMouseDown: false,
      joystickMove: { x: 0, y: 0 },
      joystickAim: { x: 0, y: 0 },
      isJoystickShooting: false,
      autoAim: false,
      score: 0,
      state: 'menu',
      camera: { x: 0, y: 0 },
      cameraZoom,
      screenShake: 0,
      log: [],
      showCombatLog: showCombatLog,
      level,
      unlockedAtoms,
      unlockedReactions,
      market: { 
        assets: marketAssets,
        trend: 'neutral',
        trendTimer: 0,
        inflationMultiplier: 1.0
      },
      marketTimer: 0,
      showingMarket: false,
      isLobby: isLobby,
      reactionDiscovery: null,
      marketDiscovery: null,
      showingRecipeBook: false,
      showingOptions: false,
      showingStats: false,
      showingSaves: false,
      showingLobby: false,
      electrons,
      savingsBalance,
      bondsBalance,
      bondsRoomsLeft,
      feedbackSubmitted,
      showingShop: false,
      showingWorkshop: false,
      showingMercenary: false,
      showingAlchemy: false,
      alchemyUnlocked,
      lobbyElectrons,
      neutrons,
      betaDecayVaultNeutrons,
      betaDecayLastTimestamp,
      unlockedAlchemyAtoms,
      baseAtoms,
      staminaPotionPurchases: 0,
      healPotionPurchases: 0,
      shieldPotionPurchases: 0,
      unlockedMolecules: [], // Remove eventually
      drops: drops,
      shopTab: 'weapons',
      heat: 0,
      overheated: false,
      nearPortal: false,
      nearPortalIsLobby: false,
      maxHpLevel,
      regenLevel,
      speedLevel,
      potions,
      hasSuperWeapon,
      equippedWeapon: equippedWeapon,
      activeShield: 0,
      activeStaminaRegen: 0,
      pickupRadiusBonus: 0,
      devGodMode: false,
      devInstaKill: false,
      devPaused: false,
      gunLevel,
      armorLevel,
      heatLevel,
      selectedCharacter: selectedCharacter,
      difficulty,
      language,
      autoNextLevel,
      disableScreenShake,
      uiScale,
      protons,
      unlockedCharacters,
      characterSelected: characterSelected,
      companion: null,
      showProtonTutorial,
      revivesUsed,
      dungeonKills: {},
      unpaidTax,
      roomsSinceTaxOwed,
      policeSpawning,
      invoices,
      taxEntries,
      investmentRoomCounter,
      arrestedDeath,
      showingBossIntro: false,
      bossIntroTimer: 0,
      bossIntroName: "",
      bossIntroDesc: "",
      stats,
      charUpgrades
    };
  }

  public enterNextFloor() {
        const uncompletedCount = this.state.rooms.filter(r => !r.visited).length;
        if (uncompletedCount > 0) {
            this.addLog(`Portal czasoprzestrzenny: Pominięto ${uncompletedCount} pokoi. Przewijanie czasu inwestycyjnego o ${uncompletedCount} pok. (${(uncompletedCount / 3).toFixed(2)} tury)...`);
            for (let step = 0; step < uncompletedCount; step++) {
                if (this.state.difficulty !== 'kids') {
                    if (!this.state.taxEntries) {
                        this.state.taxEntries = [];
                    }
                    this.state.taxEntries.forEach((entry: any) => {
                        if (!entry.paid) {
                            entry.roomsSinceTaxOwed++;
                        }
                    });
                    
                    const anyOverdue = this.state.taxEntries.some((entry: any) => !entry.paid && entry.roomsSinceTaxOwed >= 10);
                    if (anyOverdue && !this.state.policeSpawning) {
                        this.state.policeSpawning = true;
                        this.addLog("🚨 MASZ PRZETERMINOWANY PODATEK BELI SŁOMY DZIĘKI SKOKOWI W PORTALU! 🚨");
                    }
                }
                
                if (this.state.investmentRoomCounter === undefined) {
                    this.state.investmentRoomCounter = 0;
                }
                this.state.investmentRoomCounter++;
                if (this.state.investmentRoomCounter >= 4) {
                    this.state.investmentRoomCounter = 0;
                    this.updateMarket();

                    if (this.state.savingsBalance > 0) {
                        const prev = this.state.savingsBalance;
                        this.state.savingsBalance = parseFloat((this.state.savingsBalance * 1.03).toFixed(1));
                        const diff = (this.state.savingsBalance - prev).toFixed(1);
                        this.addLog(`📈 Oszczędności: +${diff} e⁻ odsetek! (Tura z pominiętych pokoi)`);
                    }
                    if (this.state.bondsBalance > 0 && this.state.bondsRoomsLeft > 0) {
                        const prev = this.state.bondsBalance;
                        this.state.bondsBalance = parseFloat((this.state.bondsBalance * 1.07).toFixed(1));
                        this.state.bondsRoomsLeft--;
                        const diff = (this.state.bondsBalance - prev).toFixed(1);
                        this.addLog(`📜 Obligacja: +${diff} e⁻ odsetek (${this.state.bondsRoomsLeft} cykli do zapadalności) - tura z pominiętych pokoi`);
                        
                        if (this.state.bondsRoomsLeft === 0) {
                            const payout = this.state.bondsBalance;
                            this.state.electrons += payout;
                            this.state.bondsBalance = 0;
                            this.addLog(`📜 Obligacje zapadły! Autowypłata: ${Math.floor(payout)} e⁻ do portfela!`);
                        }
                    }
                } else {
                    const diffLeft = 4 - this.state.investmentRoomCounter;
                    this.addLog(`💼 Cykl ekonomiczny: ${this.state.investmentRoomCounter}/4 pok. (Kolejny cykl za ${diffLeft} pok.) - przewinięte w portalu`);
                }
            }
        }
        
                this.state.level++;
        this.state.companion = null;
        
        if (this.state.level === 6) {
             if (!this.state.unlockedCharacters.includes('mendelejew')) {
                 this.state.unlockedCharacters.push('mendelejew');
             }
        }
        
        const progressionAtoms = ['O', 'H', 'C', 'S', 'Fe', 'Sc', 'Ti', 'Na', 'N', 'P', 'Cl', 'K', 'Mg', 'Ca', 'Si', 'Al'];
        const nextAtom = progressionAtoms.find(a => !this.state.unlockedAtoms.includes(a));
        if (nextAtom) {
            this.state.unlockedAtoms.push(nextAtom);
            if (!this.state.unlockedAlchemyAtoms.includes(nextAtom)) {
                 this.state.unlockedAlchemyAtoms.push(nextAtom);
                 this.syncReactions();
            }
            this.triggerReaction('unlock_' + nextAtom.toLowerCase(), `Odkryto: ${nextAtom}`, 'Odblokowano nowy pierwiastek', `Możesz teraz używać ${nextAtom} w walce.`, [nextAtom as AtomType]);
            this.addLog(`NOWY ATOM ODBLOKOWANY: ${nextAtom}!`);
        }

        this.saveGame(true);
        this.addLog(`POZIOM ${this.state.level} ODBLOKOWANY!`);
        
        if (!this.state.showProtonTutorial) {
            this.state.showProtonTutorial = true;
            this.state.state = 'proton_tutorial';
        } else {
            this.state.state = 'victory_screen';
        }
  }

  public enterDungeon() {
      this.state.revivesUsed = 0;
      this.state.isLobby = false;
      this.state.electrons = 0;
      this.state.bondsBalance = 0;
      this.state.bondsRoomsLeft = 0;
      this.state.savingsBalance = 0;
      this.state.market.assets.forEach(asset => {
         asset.shares = 0;
         asset.history = [asset.currentPrice]; // Reset chart!
      });
      this.state.unpaidTax = 0;
      this.state.taxEntries = [];
      this.state.policeSpawning = false;
      this.state.drops = [];
      this.state.projectiles = [];
      this.state.rooms = this.generateDungeon(10 + this.state.level * 2);
      this.state.currentRoom = { x: 0, y: 0 };
      this.state.player.pos = { x: 0, y: 0 };
      this.state.dungeonKills = {};
      
      const r0 = this.state.rooms.find(r => r.gridX===0 && r.gridY===0);
      if (r0) {
          r0.cleared = false;
          r0.enemyCount = 3 + this.state.level;
          this.spawnEnemiesForRoom(r0);
      }
      this.saveGame();
  }

  private generateDungeon(numRooms: number): RoomInfo[] {
    const rooms: Map<string, RoomInfo> = new Map();
    const queue: {x: number, y: number}[] = [{x: 0, y: 0}];
    
    rooms.set('0,0', {
      gridX: 0, gridY: 0,
      doors: { North: false, South: false, East: false, West: false },
      cleared: true, visited: true, isBoss: false, enemyCount: 0
    });

    let roomsCreated = 1;

    while (roomsCreated < numRooms && queue.length > 0) {
      const idx = Math.floor(Math.random() * queue.length);
      const curr = queue[idx];
      queue.splice(idx, 1);

      const dirs = [
        { d: 'North', x: 0, y: -1, opp: 'South' },
        { d: 'South', x: 0, y: 1, opp: 'North' },
        { d: 'East', x: 1, y: 0, opp: 'West' },
        { d: 'West', x: -1, y: 0, opp: 'East' }
      ] as const;

      for (const dir of [...dirs].sort(() => Math.random() - 0.5)) {
        if (roomsCreated >= numRooms) break;
        const nx = curr.x + dir.x;
        const ny = curr.y + dir.y;
        const nKey = `${nx},${ny}`;
        const currKey = `${curr.x},${curr.y}`;
        
        const currRoom = rooms.get(currKey)!;

        if (!rooms.has(nKey)) {
          // create room
          const isMultiPlayer = this.state.networkPlayers && this.state.networkPlayers.length > 0;
          const isBoss = roomsCreated === numRooms - 1;
          const isMercenary = !isMultiPlayer && this.state.level >= 2 && roomsCreated === Math.floor(numRooms / 2);
          const newRoom: RoomInfo = {
            gridX: nx, gridY: ny,
            doors: { North: false, South: false, East: false, West: false },
            cleared: false, visited: false, isBoss, isMercenary, enemyCount: isBoss ? 1 : isMercenary ? 0 : 3 + Math.floor(Math.random() * 4)
          };
          if (isMercenary) newRoom.cleared = true; // No enemies in mercenary room
          newRoom.doors[dir.opp as keyof typeof newRoom.doors] = true;
          currRoom.doors[dir.d as keyof typeof currRoom.doors] = true;
          
          rooms.set(nKey, newRoom);
          queue.push({x: nx, y: ny});
          roomsCreated++;
        } else {
          // Add extra connections randomly
          if (Math.random() < 0.2) {
             const existRoom = rooms.get(nKey)!;
             currRoom.doors[dir.d as keyof typeof currRoom.doors] = true;
             existRoom.doors[dir.opp as keyof typeof existRoom.doors] = true;
          }
        }
      }
    }
    
    // Post-process: ensure all adjacent rooms are connected
    for (const room of rooms.values()) {
        const nx = room.gridX + 1;
        const ny = room.gridY;
        if (rooms.has(`${nx},${ny}`)) {
            room.doors.East = true;
            rooms.get(`${nx},${ny}`)!.doors.West = true;
        }
        
        const sx = room.gridX;
        const sy = room.gridY + 1;
        if (rooms.has(`${sx},${sy}`)) {
            room.doors.South = true;
            rooms.get(`${sx},${sy}`)!.doors.North = true;
        }
    }
    
    return Array.from(rooms.values());
  }

  public resize(width: number, height: number) {
    this.canvasSize = { x: width, y: height };
  }

  private addLog(msg: string) {
     this.state.log.unshift(msg);
     if (this.state.log.length > 5) this.state.log.pop();
  }

  public forceWipeReset() {
      this.state.state = 'playing';
      // Actually wipe local save & restart to lobby
      this.state.arrestedDeath = false;
      this.state.isLobby = true;
      this.state.characterSelected = false;
      this.state.electrons = 0;
      this.state.bondsBalance = 0;
      this.state.bondsRoomsLeft = 0;
      this.state.savingsBalance = 0;
      this.state.market.assets.forEach(asset => {
        asset.shares = 0;
        let startPrice = 100;
        if (asset.id === 'crypto_proton') startPrice = 10;
        else if (asset.id === 'alphabet') startPrice = 50;
        else if (asset.id === 'tsmc') startPrice = 40;
        asset.currentPrice = startPrice;
        asset.history = [startPrice];
      });
      this.state.level = 1;
      this.state.maxHpLevel = 0;
      this.state.regenLevel = 0;
      this.state.speedLevel = 0;
      this.state.gunLevel = 0;
      this.state.hasSuperWeapon = false;
      this.state.equippedWeapon = 'normal';
      this.state.activeShield = 0;
      this.state.activeStaminaRegen = 0;
      this.state.pickupRadiusBonus = 0;
      this.state.potions = { heal: 0, shield: 0, stamina: 0 };
      this.state.staminaPotionPurchases = 0;
      this.state.healPotionPurchases = 0;
      this.state.shieldPotionPurchases = 0;
      const defaultBase = this.state.selectedCharacter === 'curie_cat' ? ['Ra', 'Po'] : ['H', 'O'];
      this.state.unlockedAtoms = this.state.baseAtoms.length > 0 ? [...this.state.baseAtoms] : defaultBase;
      this.state.rooms = [{ gridX: 0, gridY: 0, doors: { North: false, South: false, East: false, West: false }, visited: true, cleared: true, enemyCount: 0, isBoss: false }];
      this.state.player.pos = { x: 0, y: 0 };
      this.state.player.hp = 45;
      this.state.player.maxHp = 45;
      this.state.player.speed = 350;
      this.state.player.stamina = this.state.player.maxStamina;
      this.state.player.isDead = false;
      this.state.player.konamiUsedInRun = false;
      this.state.player.invincibilityTimer = 0;
      this.state.enemies = [];
      this.state.projectiles = [];
      this.state.drops = [];
      this.state.unpaidTax = 0;
      this.state.roomsSinceTaxOwed = 0;
      this.state.taxEntries = [];
      this.state.policeSpawning = false;
      this.saveGame();
  }

  private die() {
      const p = this.state.player;
      const isMultiPlayer = this.state.networkPlayers && this.state.networkPlayers.length > 0;
      
      if (this.state.arrestedDeath) {
          p.isDead = true;
          return; // Wait for user decision on the Arrested Death screen
      }
      
      if (isMultiPlayer && !this.state.isLobby) {
          p.isDead = true;
          p.deadTimer = 20;
          p.hp = 0;
          this.addLog("☠️ Zginąłeś! Odrodzenie za 20s lub przy pomocy sojusznika (4s).");
          // Check if everyone is dead
          const allDead = this.state.networkPlayers.every((np: any) => np.isDead || np.hp <= 0);
          if (!allDead) {
              return; // wait to be revived
          }
          this.addLog("☠️ Cała drużyna zginęła.");
      }

      p.isDead = true;
      p.hp = 0;
      this.state.state = 'gameover';
  }

  public revivePlayer() {
      this.state.player.hp = this.state.player.maxHp;
      this.state.player.isDead = false;
      this.state.player.iFrameTimer = 3.0;
      this.state.state = 'playing';
      this.state.revivesUsed++;
  }

  public update(dt: number) {
    if (this.state.state !== 'playing' || this.state.devPaused) return;
    if (this.state.showingRecipeBook || this.state.showingOptions || this.state.showingShop || this.state.showingStats || this.state.showingSaves || this.state.showingLobby || this.state.showingWorkshop || this.state.showingMercenary || this.state.showingAlchemy) return;
    
    if (this.state.showingBossIntro) {
        if (this.state.bossIntroTimer !== undefined && this.state.bossIntroTimer > 0) {
            this.state.bossIntroTimer -= dt;
            if (this.state.bossIntroTimer <= 0) {
                this.state.showingBossIntro = false;
            }
        } else {
            this.state.showingBossIntro = false;
        }
        return; // Pause game logic during boss intro
    }

    if (this.state.screenShake > 0) {
      this.state.screenShake -= dt * 10;
      if (this.state.screenShake < 0) this.state.screenShake = 0;
    }

    this.state.nearPortal = false;
    this.state.nearPortalIsLobby = false;

    

    this.checkRoomTransition();
    this.updatePlayer(dt);
    this.updateCompanion(dt);
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateParticles(dt);

    // No limit on drops for epic chain reactions!

    // Highly optimized collision loop: skip currency (e-) and protons (p+) since they don't need to bounce
    for (let i = 0; i < this.state.drops.length; i++) {
        const d1 = this.state.drops[i];
        if (!d1.isAtom && !d1.isPortal) continue;
        for (let j = i + 1; j < this.state.drops.length; j++) {
            const d2 = this.state.drops[j];
            if (!d2.isAtom && !d2.isPortal) continue;
            const dx = d1.pos.x - d2.pos.x;
            const dy = d1.pos.y - d2.pos.y;
            const distSq = dx*dx + dy*dy;
            if (distSq < 400 && distSq > 0.1) { // 20^2
                const dist = Math.sqrt(distSq);
                const push = (20 - dist) / dist * 600; // MUCH stronger bounce
                d1.vel.x += dx * push * dt;
                d1.vel.y += dy * push * dt;
                d2.vel.x -= dx * push * dt;
                d2.vel.y -= dy * push * dt;
            }
        }
    }

    for (let i=this.state.drops.length-1; i>=0; i--) {
        const d = this.state.drops[i];
        
        if (!d.isAtom) {
            d.life -= dt;
        }
        
        if (d.vel) {
            d.pos.x += d.vel.x * dt;
            d.pos.y += d.vel.y * dt;
            // Less friction so they slide longer
            d.vel.x *= 0.985;
            d.vel.y *= 0.985;
            
            // Jiggle lightly
            d.vel.x += (Math.random() - 0.5) * 150 * dt;
            d.vel.y += (Math.random() - 0.5) * 150 * dt;

            // Bounce off walls
            const rX = Math.floor((d.pos.x + ROOM_WIDTH / 2) / ROOM_WIDTH);
            const rY = Math.floor((d.pos.y + ROOM_HEIGHT / 2) / ROOM_HEIGHT);
            const rCX = rX * ROOM_WIDTH;
            const rCY = rY * ROOM_HEIGHT;
            const hw = ROOM_WIDTH / 2;
            const hh = ROOM_HEIGHT / 2;
            
            if (d.pos.x < rCX - hw + WALL_THICKNESS + 15) { d.pos.x = rCX - hw + WALL_THICKNESS + 15; d.vel.x *= -0.9; }
            if (d.pos.x > rCX + hw - WALL_THICKNESS - 15) { d.pos.x = rCX + hw - WALL_THICKNESS - 15; d.vel.x *= -0.9; }
            if (d.pos.y < rCY - hh + WALL_THICKNESS + 15) { d.pos.y = rCY - hh + WALL_THICKNESS + 15; d.vel.y *= -0.9; }
            if (d.pos.y > rCY + hh - WALL_THICKNESS - 15) { d.pos.y = rCY + hh - WALL_THICKNESS - 15; d.vel.y *= -0.9; }
        }

        const dist = this.distance(d.pos, this.state.player.pos);
        if (!d.isPortal && dist < 120 + this.state.pickupRadiusBonus) {
            const dir = this.normalize({ x: this.state.player.pos.x - d.pos.x, y: this.state.player.pos.y - d.pos.y });
            d.pos.x += dir.x * 600 * dt;
            d.pos.y += dir.y * 600 * dt;
        }
        if (dist < this.state.player.radius + 60 + this.state.pickupRadiusBonus * 0.5) { // Large collect radius for fun
            if (d.isPortal) {
                this.state.nearPortal = true;
                this.state.nearPortalIsLobby = false;
            } else if (d.isProton) {
                    this.state.protons += 1;
                    if (!this.state.showProtonTutorial) {
                        this.state.showProtonTutorial = true;
                        this.state.state = 'proton_tutorial';
                        this.addLog("💥 ZDOBYTO PROTON! To waluta do odblokowywania. Trwale zostaje po śmierci.");
                    }
                } else {
                    this.state.electrons += d.value;
                }
                this.saveGame(); // Save changes
                this.state.drops.splice(i, 1);
                continue;
            }
        if (d.life <= 0) this.state.drops.splice(i, 1);
    }
    this.updateCamera();
  }

  private checkRoomTransition() {
    const p = this.state.player;
    // Calculate which room player is in based on globally coordinates
    const rx = Math.round(p.pos.x / ROOM_WIDTH);
    const ry = Math.round(p.pos.y / ROOM_HEIGHT);

    if (rx !== this.state.currentRoom.x || ry !== this.state.currentRoom.y) {
      this.state.currentRoom = { x: rx, y: ry };
      // User requested: "Woda w walce nie moze zniknac zaden atom czy zwizek tylko po za walka niech wszystko zniknie kiedy wchodzisz do nowej walki"
      // Clear projectiles safely when changing rooms so atoms stay during combat but disappear after
      this.state.projectiles = []; 
      
      const room = this.state.rooms.find(r => r.gridX === rx && r.gridY === ry);
      if (room) {
        room.visited = true;
        if (!room.cleared && room.enemyCount > 0) {
           this.spawnEnemiesForRoom(room);
           if (this.state.difficulty === 'kids') {
               this.state.unpaidTax = 0;
               this.state.taxEntries = [];
               this.state.policeSpawning = false;
           } else {
               if (!this.state.taxEntries) {
                   this.state.taxEntries = [];
               }
               let anyOverdue = false;
               this.state.taxEntries.forEach((entry: any) => {
                   if (!entry.paid) {
                       entry.roomsSinceTaxOwed++;
                       if (entry.roomsSinceTaxOwed >= 10) {
                           anyOverdue = true;
                       }
                   }
               });
               if (anyOverdue && !this.state.policeSpawning) {
                   this.state.policeSpawning = true;
                   this.addLog("🚨 MASZ PRZETERMINOWANY PODATEK BELI SŁOMY! 🚨");
                   this.addLog("🚨 URZĄD SKARBOWY WYSYŁA KOTY POLICJANTÓW NA BAGIETKACH! 🚨");
               }
           }
        }
      }
    }

    // Check if room is cleared
    const currRoom = this.state.rooms.find(r => r.gridX === rx && r.gridY === ry);
    if (currRoom && !currRoom.cleared) {
       const activeEnemies = this.state.enemies.filter(e => !['C3Wall', 'C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(e.type as string));
       if (activeEnemies.length === 0 && currRoom.enemyCount > 0) {
           currRoom.cleared = true;
           this.state.pickupRadiusBonus += 30; // Zwiększamy zasięg 
           this.addLog("ROOM CLEARED!");
           this.releaseOrbitingProjectiles();
           this.addParticle(p.pos, '#00ff00', 300, 10);

            // Process investments (1 cykl = 4 pokoje)
            if (this.state.investmentRoomCounter === undefined) {
                this.state.investmentRoomCounter = 0;
            }
            this.state.investmentRoomCounter++;
            
            if (this.state.investmentRoomCounter >= 4) {
                this.state.investmentRoomCounter = 0;
                this.updateMarket();

                if (this.state.savingsBalance > 0) {
                    const prev = this.state.savingsBalance;
                    this.state.savingsBalance = parseFloat((this.state.savingsBalance * 1.03).toFixed(1));
                    const diff = (this.state.savingsBalance - prev).toFixed(1);
                    this.addLog(`📈 Oszczędności: +${diff} e⁻ odsetek! (Cykl zakończony)`);
                }
                if (this.state.bondsBalance > 0 && this.state.bondsRoomsLeft > 0) {
                    const prev = this.state.bondsBalance;
                    this.state.bondsBalance = parseFloat((this.state.bondsBalance * 1.07).toFixed(1));
                    this.state.bondsRoomsLeft--;
                    const diff = (this.state.bondsBalance - prev).toFixed(1);
                    this.addLog(`📜 Obligacja: +${diff} e⁻ odsetek (${this.state.bondsRoomsLeft} cykli do zapadalności)`);
                    
                    if (this.state.bondsRoomsLeft === 0) {
                        const payout = this.state.bondsBalance;
                        this.state.electrons += payout;
                        this.state.bondsBalance = 0;
                        this.addLog(`📜 Obligacje zapadły! Autowypłata: ${Math.floor(payout)} e⁻ do portfela!`);
                    }
                }
            } else {
                const diffLeft = 4 - this.state.investmentRoomCounter;
                this.addLog(`💼 Cykl ekonomiczny: ${this.state.investmentRoomCounter}/4 pok. (Kolejny cykl i akcje giełdowe za ${diffLeft} pok.)`);
            }
           this.saveGame(true); // Auto save exactly when room clears

           if (currRoom.isBoss) {
               this.addLog("Oczyszczono komnatę Bossa.");
           }
       }
    }
  }

    public devSpawnBoss(bossType: string) {
      if (this.state.state !== 'playing') return;
      
      const p = this.state.player;
      
      // Clear specific things
      this.state.enemies = [];
      this.state.projectiles = [];
      
      p.pos.x = 0;
      p.pos.y = 0;
      
      const cx = 0;
      const cy = -400;
      
         let bossName = '';
         let bossDesc = '';
         let bossHp = 10000;
         let bossSpeed = 100;
         let bossRadius = 35;
         let bossAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         
         if (bossType === 'Celery') {
             bossName = 'Sal su moner';
             bossDesc = 'Potężny Seler, wchłaniacz tlenu.';
             bossHp = 175000;
             bossSpeed = 60;
             bossRadius = 35;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         } else if (bossType === 'SnakeGourdHead') {
             bossName = 'Tykwa węzowa z 4 oczami';
             bossDesc = 'Długa i niebezpieczna, osaczy Cię z każdej strony!';
             bossHp = 200000;
             bossSpeed = 160; 
             bossRadius = 45;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         } else if (bossType === 'Hogweed') {
             bossName = 'Barszcz Sosnowskiego';
             bossDesc = 'Toksyczny i rozrastający się... Uważaj na żrący dotyk!';
             bossHp = 300000;
             bossSpeed = 40;
             bossRadius = 60;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         } else if (bossType === 'Durian') {
             bossName = 'Radioaktywny Durian';
             bossDesc = 'Król owoców... Miotający sterylnymi kolcami i zatruwający otoczenie radem!';
             bossHp = 450000;
             bossSpeed = 70;
             bossRadius = 75;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         } else if (bossType === 'GiantTree') {
             bossName = 'Pradawny Dąb';
             bossDesc = 'Monumentalne drzewo o gęstych korzeniach. Strzeż się barier drewnianych!';
             bossHp = 600000;
             bossSpeed = 0;
             bossRadius = 90;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         } else if (bossType === 'MutantPolimer') {
             bossName = 'Zmutowany Hiper-Polimer';
             bossDesc = 'Błąd natury. Niestabilna mutacja wszechrzeczy, chaos i destrukcja!';
             bossHp = 1250000;
             bossSpeed = 200;
             bossRadius = 120;
             bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         }

         bossHp = Math.floor(bossHp * (1 + (this.state.level - 1) * 0.5));
         const multiPlayerCount = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
         bossHp = Math.floor(bossHp * (1 + multiPlayerCount * 0.8));
         if (this.state.difficulty === 'kids') bossHp = Math.floor(bossHp * 0.3);
         if (this.state.difficulty === 'easy') bossHp = Math.floor(bossHp * 0.7);

         const headId = nextId++;
         this.state.enemies.push({
          id: headId,
          pos: { x: cx, y: cy },
          radius: bossRadius, speed: bossSpeed, hp: bossHp, maxHp: bossHp,
          type: bossType as any, atoms: { ...bossAtoms },
          attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
         });

         if (bossType === 'SnakeGourdHead') {
             let lastId = headId;
             for(let i=1; i<=35; i++) {
                 const segId = nextId++;
                 this.state.enemies.push({
                  id: segId,
                  pos: { x: cx, y: cy - i * 45 },
                  radius: 35, speed: bossSpeed, hp: Math.floor(45000 * (1 + (this.state.level - 1) * 0.5)), maxHp: Math.floor(45000 * (1 + (this.state.level - 1) * 0.5)),
                  type: 'SnakeGourdSegment' as any, atoms: { ...bossAtoms },
                  attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                  leaderId: lastId, segmentIndex: i
                 });
                 lastId = segId;
             }
         }
        
        this.state.showingBossIntro = true;
        this.state.bossIntroTimer = 4.0;
        this.state.bossIntroName = bossName;
        this.state.bossIntroDesc = bossDesc;
  }

  private spawnEnemiesForRoom(room: RoomInfo) {
    this.state.enemies = []; // Clear
    const roomCenterX = room.gridX * ROOM_WIDTH;
    const roomCenterY = room.gridY * ROOM_HEIGHT;
    
    if (room.isBoss) {
         let bossCount = this.state.level >= 4 ? 2 : 1;
         if (this.state.level >= 7) bossCount = 3;
         let fullBossName = '';
         let fullBossDesc = '';
         
         for (let bIndex = 0; bIndex < bossCount; bIndex++) {
             let bossType = 'Celery';
             if (this.state.level === 2) {
                 bossType = Math.random() < 0.5 ? 'SnakeGourdHead' : 'Hogweed';
             } else if (this.state.level === 3) {
                 const r = Math.random();
                 if (r < 0.25) bossType = 'SnakeGourdHead';
                 else if (r < 0.5) bossType = 'Hogweed';
                 else if (r < 0.75) bossType = 'Durian';
                 else bossType = 'GiantTree';
             } else if (this.state.level >= 4) {
                 bossType = Math.random() < 0.5 ? 'GiantTree' : 'MutantPolimer';
             }

             let bossName = '';
             let bossDesc = '';
             let bossHp = 10000;
             let bossSpeed = 100;
             let bossRadius = 35;
             let bossAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             
             if (bossType === 'Celery') {
                 bossName = 'Sal su moner';
                 bossDesc = 'Potężny Seler, wchłaniacz tlenu.';
                 bossHp = 175000;
                 bossSpeed = 60;
                 bossRadius = 35;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             } else if (bossType === 'SnakeGourdHead') {
                 bossName = 'Tykwa węzowa z 4 oczami';
                 bossDesc = 'Długa i niebezpieczna, osaczy Cię z każdej strony!';
                 bossHp = 200000;
                 bossSpeed = 160; 
                 bossRadius = 45;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             } else if (bossType === 'Hogweed') {
                 bossName = 'Barszcz Sosnowskiego';
                 bossDesc = 'Toksyczny i rozrastający się... Uważaj na żrący dotyk!';
                 bossHp = 300000;
                 bossSpeed = 40;
                 bossRadius = 60;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             } else if (bossType === 'Durian') {
                 bossName = 'Radioaktywny Durian';
                 bossDesc = 'Król owoców... Miotający sterylnymi kolcami i zatruwający otoczenie radem!';
                 bossHp = 450000;
                 bossSpeed = 70;
                 bossRadius = 75;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             } else if (bossType === 'GiantTree') {
                 bossName = 'Pradawny Dąb';
                 bossDesc = 'Monumentalne drzewo o gęstych korzeniach. Strzeż się barier drewnianych!';
                 bossHp = 600000;
                 bossSpeed = 0;
                 bossRadius = 90;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             } else if (bossType === 'MutantPolimer') {
                 bossName = 'Zmutowany Hiper-Polimer';
                 bossDesc = 'Błąd natury. Niestabilna mutacja wszechrzeczy, chaos i destrukcja!';
                 bossHp = 1250000;
                 bossSpeed = 200;
                 bossRadius = 120;
                 bossAtoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
             }

             bossHp = Math.floor(bossHp * (1 + (this.state.level - 1) * 0.5));
             const multiPlayerCount2 = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
             bossHp = Math.floor(bossHp * (1 + multiPlayerCount2 * 0.8));
             if (this.state.difficulty === 'kids') bossHp = Math.floor(bossHp * 0.3);
             if (this.state.difficulty === 'easy') bossHp = Math.floor(bossHp * 0.7);

             const headId = nextId++;
             let offsetX = 0;
             let offsetY = 0;
             if (bossCount === 2) {
                 offsetX = bIndex === 0 ? -150 : 150;
             }

             this.state.enemies.push({
              id: headId,
              pos: { x: roomCenterX + offsetX, y: roomCenterY + offsetY },
              radius: bossRadius, speed: bossSpeed, hp: bossHp, maxHp: bossHp,
              type: bossType as any, atoms: { ...bossAtoms },
              attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
             });

             if (bossType === 'SnakeGourdHead') {
                 let lastId = headId;
                 for(let i=1; i<=35; i++) {
                     const segId = nextId++;
                     this.state.enemies.push({
                      id: segId,
                      pos: { x: roomCenterX + offsetX, y: roomCenterY + offsetY - i * 45 },
                      radius: 35, speed: bossSpeed, hp: Math.floor(45000 * (1 + (this.state.level - 1) * 0.5)), maxHp: Math.floor(45000 * (1 + (this.state.level - 1) * 0.5)),
                      type: 'SnakeGourdSegment' as any, atoms: { ...bossAtoms },
                      attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                      leaderId: lastId, segmentIndex: i
                     });
                     lastId = segId;
                 }
             }
             
             if (bIndex === 0) {
                 fullBossName = bossName;
                 fullBossDesc = bossDesc;
             } else {
                 fullBossName += ` & ${bossName}`;
                 fullBossDesc += ` + ${bossDesc}`;
             }
         }
         
         this.state.showingBossIntro = true;
         this.state.bossIntroTimer = 4.0; // 4 seconds intro
         this.state.bossIntroName = fullBossName;
         this.state.bossIntroDesc = fullBossDesc;
         
         return;
    }

    const isMultiPlayer = this.state.networkPlayers && this.state.networkPlayers.length > 0;
    const finalEnemyCount = Math.floor(room.enemyCount * (1 + (isMultiPlayer ? this.state.networkPlayers.length * 0.5 : 0)));
    for(let i=0; i<finalEnemyCount; i++) {
        const r = Math.random();
        let type = 'Broccoli';
        
         if (this.state.level === 1) {
              if (r > 0.4) type = 'Carrot';
         } else if (this.state.level === 2) {
              if (r > 0.7) type = 'Tomato';
              else if (r > 0.4) type = 'Carrot';
              else if (r > 0.2) type = 'Mushroom';
         } else if (this.state.level === 3) {
              if (r > 0.8) type = 'Onion';
              else if (r > 0.5) type = 'Tomato';
              else if (r > 0.2) type = 'Mushroom';
         } else if (this.state.level === 4) {
              if (r > 0.8) type = 'Cactus';
              else if (r > 0.5) type = 'Onion';
              else if (r > 0.2) type = 'Tomato';
         } else {
              if (r > 0.8) type = 'Venus';
              else if (r > 0.6) type = 'Cactus';
              else if (r > 0.4) type = 'Onion';
              else if (r > 0.2) type = 'Mushroom';
              else type = 'Carrot';
         }

        let radius, speed, hp;
        if (type === 'Broccoli') { radius = 25; speed = 100; hp = 350 * 25; }
        else if (type === 'Carrot') { radius = 15; speed = 180; hp = 200 * 25; }
        else if (type === 'Tomato') { radius = 20; speed = 120; hp = 450 * 25; }
        else if (type === 'Onion') { radius = 22; speed = 150; hp = 550 * 25; }
        else if (type === 'Mushroom') { radius = 18; speed = 110; hp = 350 * 25; }
        else if (type === 'Cactus') { radius = 25; speed = 60; hp = 1000 * 25; }
        else if (type === 'Venus') { radius = 30; speed = 140; hp = 800 * 25; }
        else { radius = 22; speed = 150; hp = 650 * 25; }  

        hp = Math.floor(hp * (1 + (this.state.level - 1) * 0.5)); // smooth generic scaling per level
        const multiPlayerCount = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
        hp = Math.floor(hp * (1 + multiPlayerCount * 0.5)); // scaling by multiplayer
        if (this.state.difficulty === 'kids') hp = Math.floor(hp * 0.2); // Kids mode makes enemies much weaker
        if (this.state.difficulty === 'easy') hp = Math.floor(hp * 0.6);
        if (this.state.difficulty === 'hard') hp = Math.floor(hp * 1.55);

         let initAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
         if (type === 'Carrot') { initAtoms = { H: 4, O: 2, C: 3, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 1, Mg: 0, Ca: 0 }; }
         if (type === 'Tomato') { initAtoms = { H: 3, O: 3, C: 2, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 1, Mg: 0, Ca: 0 }; }
         if (type === 'Broccoli') { initAtoms = { H: 4, O: 2, C: 2, N: 1, S: 1, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 1, Mg: 1, Ca: 1 }; }
         if (type === 'Onion') { initAtoms = { H: 2, O: 1, C: 2, N: 0, S: 2, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 1, Mg: 0, Ca: 0 }; }
         if (type === 'Cactus') { initAtoms = { H: 2, O: 2, C: 2, N: 0, S: 0, Si: 1, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 1, Ca: 2 }; } // Calcium oxalates
         if (type === 'Mushroom') { initAtoms = { H: 3, O: 2, C: 2, N: 1, S: 1, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 1, K: 1, Mg: 0, Ca: 0 }; } // Chitin contains N, P
         if (type === 'Venus') { initAtoms = { H: 4, O: 3, C: 4, N: 2, S: 0, Si: 1, Ra: 0, Po: 0, Cl: 0, P: 1, K: 1, Mg: 1, Ca: 0 }; }
         if (type === 'SnakeGourdHead' || type === 'Hogweed') { initAtoms = { H: 6, O: 5, C: 6, N: 2, S: 2, Si: 2, Ra: 0, Po: 0, Cl: 0, P: 2, K: 2, Mg: 1, Ca: 1 }; }

         let isAnomaly = false;
         if (Math.random() < 0.05) {
             isAnomaly = true;
             hp *= 3.0;
             speed *= 1.2;
         }

        this.state.enemies.push({
          id: nextId++,
          pos: { 
            x: roomCenterX + (Math.random() - 0.5) * (ROOM_WIDTH - 300),
            y: roomCenterY + (Math.random() - 0.5) * (ROOM_HEIGHT - 300)
          },
          radius: radius,
          speed: speed,
          hp: hp,
          maxHp: hp,
          type: type as any,
          atoms: initAtoms,
          attackTimer: 1.0,
          status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
          isAnomaly: isAnomaly
        });
    }
  }

  private updateCamera() {
    let focusPos = this.state.player.pos;
    if (this.state.player.isDead && this.state.networkPlayers && this.state.networkPlayers.length > 0) {
        // Find an alive player to spectate
        const aliveNp = this.state.networkPlayers.find(np => !np.isDead && np.hp > 0);
        if (aliveNp) {
            focusPos = aliveNp.pos;
        }
    }
    this.state.camera.x = focusPos.x - (this.canvasSize.x / 2 / this.state.cameraZoom);
    this.state.camera.y = focusPos.y - (this.canvasSize.y / 2 / this.state.cameraZoom);
  }

  private addParticle(pos: Vector2, color: string, speedLimit: number = 100, count: number = 3, sizeMp: number = 1) {
    if (this.state.particles.length > 150) {
      count = Math.min(count, 1);
    }
    if (this.state.particles.length > 250) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedLimit;
      this.state.particles.push({
        id: nextId++,
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        color,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        size: (2 + Math.random() * 4) * sizeMp
      });
    }
  }

  private distance(p1: Vector2, p2: Vector2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  private normalize(v: Vector2) {
    const len = Math.hypot(v.x, v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  private resolveWallCollisions(p: { pos: Vector2, radius: number, id?: number }) {
    const rx = Math.round(p.pos.x / ROOM_WIDTH);
    const ry = Math.round(p.pos.y / ROOM_HEIGHT);
    const room = this.state.rooms.find(r => r.gridX === rx && r.gridY === ry);
    if (!room) return;

    const rcx = rx * ROOM_WIDTH;
    const rcy = ry * ROOM_HEIGHT;
    const hw = ROOM_WIDTH / 2;
    const hh = ROOM_HEIGHT / 2;

    const locked = !room.cleared;

    // West Wall
    if (p.pos.x - p.radius < rcx - hw + WALL_THICKNESS) {
       if (!room.doors.West || locked || Math.abs(p.pos.y - rcy) > DOOR_SIZE/2) {
           p.pos.x = rcx - hw + WALL_THICKNESS + p.radius;
       }
    }
    // East Wall
    if (p.pos.x + p.radius > rcx + hw - WALL_THICKNESS) {
       if (!room.doors.East || locked || Math.abs(p.pos.y - rcy) > DOOR_SIZE/2) {
           p.pos.x = rcx + hw - WALL_THICKNESS - p.radius;
       }
    }
    // North Wall
    if (p.pos.y - p.radius < rcy - hh + WALL_THICKNESS) {
       if (!room.doors.North || locked || Math.abs(p.pos.x - rcx) > DOOR_SIZE/2) {
           p.pos.y = rcy - hh + WALL_THICKNESS + p.radius;
       }
    }
    // South Wall
    if (p.pos.y + p.radius > rcy + hh - WALL_THICKNESS) {
       if (!room.doors.South || locked || Math.abs(p.pos.x - rcx) > DOOR_SIZE/2) {
           p.pos.y = rcy + hh - WALL_THICKNESS - p.radius;
       }
    }

    const getMass = (type?: string): number => {
        if (!type || type === 'player') return 12.0;
        if (type === 'C6Wall') return 150.0;
        if (type === 'Fe3CWall') return 80.0;
        if (type === 'Fe2O3Wall') return 30.0;
        if (type === 'C3Wall') return 15.0;
        if (type === 'WoodWall') return 5.0;
        if (['GiantTree', 'MutantPolimer', 'Durian', 'Celery', 'Hogweed', 'SnakeGourdHead'].includes(type)) return 50.0;
        return 3.0;
    };

    // Dynamic Game Walls
    for (const w of this.state.enemies) {
        if (['C3Wall', 'C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(w.type as string)) {
            if (p.id !== undefined && p.id === w.id) continue;
            
            const dx = p.pos.x - w.pos.x;
            const dy = p.pos.y - w.pos.y;
            const dist = Math.hypot(dx, dy);
            const minDist = p.radius + w.radius;
            if (dist < minDist && dist > 0.001) {
                const pushDist = minDist - dist;
                
                const isPlayer = !(p as any).type;
                const pType = isPlayer ? 'player' : (p as any).type;
                
                const m1 = getMass(pType);
                const m2 = getMass(w.type);
                const totalMass = m1 + m2;
                
                // Displacement inversely proportional to mass
                const pFactor = m2 / totalMass;
                const wFactor = m1 / totalMass;
                
                p.pos.x += (dx / dist) * pushDist * pFactor;
                p.pos.y += (dy / dist) * pushDist * pFactor;
                
                w.pos.x -= (dx / dist) * pushDist * wFactor;
                w.pos.y -= (dy / dist) * pushDist * wFactor;

                // Pressure reactive effects - high compression causes physical reactions/explosions
                if (pushDist > 7) {
                    const nextId = Math.floor(Math.random() * 10000000);
                    
                    if (!(w as any).pressureTimer || (w as any).pressureTimer <= 0) {
                        (w as any).pressureTimer = 0.25; // 0.25 second cooldown for repeating triggers
                        
                        if (w.type === 'C3Wall' && pushDist > 14) {
                            // C3Wall graphite converts to C6Wall diamond!
                            w.type = 'C6Wall' as any;
                            w.maxHp = 35000;
                            w.hp = 35000;
                            w.life = (w.life || 8.0) + 12.0; // Extend life
                            this.addParticle(w.pos, '#ffffff', 400, 30);
                            this.triggerReaction('c6_under_pressure', 'Diament z Ciśnienia', 'C₃ ➔ C₆ (Ciśnienie)', 'Fizyczna siła sprasowała struktury grafitu w niezniszczalny diament!', ['C','C','C']);
                            this.state.screenShake = 15;
                        } 
                        else if (w.type === 'WoodWall' && pushDist > 9) {
                            // WoodWall splinters and breaks!
                            w.hp = 0; // destroyed
                            this.addParticle(w.pos, '#78350f', 200, 15);
                            this.addLog("💥 Drewniany mur pękł pod naporem ciśnienia sypiąc drzazgami!");
                            
                            // Shoot splinters in 8 directions
                            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                                this.state.projectiles.push({
                                    id: nextId + a,
                                    pos: { x: w.pos.x, y: w.pos.y },
                                    vel: { x: Math.cos(a) * 350, y: Math.sin(a) * 350 },
                                    type: 'H' as any,
                                    atoms: { H: 1, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 },
                                    radius: 6,
                                    damage: 300,
                                    life: 1.5
                                });
                            }
                            this.state.screenShake = 8;
                        }
                        else if (w.type === 'Fe2O3Wall' && pushDist > 10) {
                            // Rust wall crumbles into a corrosive cloud!
                            w.hp = 0; // destroyed
                            this.addParticle(w.pos, '#ea580c', 300, 25);
                            this.addLog("💥 Rdza ugięła się pod naciskiem, uwalniając niszczycielską chmurę zarodników!");
                            
                            // Hit enemies in the area with corrosion and slow
                            this.state.enemies.forEach(other => {
                                if (other.id !== w.id && this.distance(w.pos, other.pos) < 220) {
                                    other.hp -= 2500;
                                    other.status.slowTimer += 6.0;
                                    other.status.dotTimer += 8.0;
                                    other.status.dotDamage += 120;
                                }
                            });
                            this.state.screenShake = 10;
                        }
                        else if (w.type === 'Fe3CWall' && pushDist > 12) {
                            // Steel sparked and reflects damage slightly
                            this.addParticle(w.pos, '#e2e8f0', 100, 10);
                            this.state.screenShake = 4;
                            
                            // Deal pressure spark dmg
                            if (!isPlayer && (p as any).hp > 0) {
                                (p as any).hp -= 1500;
                                this.addLog("⚡ Iskiernik stalowy razi wroga prądem twardości!");
                            }
                        }
                        else if (w.type === 'C6Wall' && pushDist > 16) {
                            // Optical refraction from diamond under heavy crushing
                            this.addParticle(w.pos, '#38bdf8', 350, 40);
                            this.state.screenShake = 5;
                            
                            // Stun nearby enemies
                            this.state.enemies.forEach(other => {
                                if (other.id !== w.id && this.distance(w.pos, other.pos) < 250) {
                                    other.status.frozenTimer += 5.0; // heavy stun
                                }
                            });
                            this.addLog("✨ Diament błysnął tęczą barw pod srogim uściskiem, oślepiając wrogów!");
                        }
                        
                        // Shock-sensitive chemicals explode under high compression pressure (e.g. slammed into player/walls)
                        const isWallEnemy = ['C3Wall', 'C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(w.type as string);
                        if (!isWallEnemy && pushDist > 6) {
                            const wa = w.atoms;
                            // Nitrogen Trichloride (NCl3) - highly sensitive shock/friction explosive!
                            if ((wa.N || 0) >= 1 && (wa.Cl || 0) >= 3) {
                                const forms = Math.floor(Math.min(wa.N || 0, (wa.Cl || 0) / 3));
                                wa.N = (wa.N || 0) - forms;
                                wa.Cl = (wa.Cl || 0) - forms * 3;
                                w.hp -= 3000 * forms;
                                this.addLog("💥 Detonacja uderzeniowa: NCl₃ eksplodował od ciężkiego ciśnienia!");
                                this.triggerReaction('shock_ncl3', 'Detonacja NCl₃ z Nacisku', 'NCl₃ (Uderzenie) ➔ Wybuch', 'Trójchlorek azotu zdetonował samorzutnie pod wpływem naprężenia mechanicznego!', ['N','Cl','Cl','Cl']);
                                this.addParticle(w.pos, '#fbbf24', 600, 50 * forms, 2);
                                this.state.screenShake = 12;
                                // Damage nearby enemies
                                this.state.enemies.forEach(other => {
                                    if (other.id !== w.id && this.distance(w.pos, other.pos) < 200) {
                                        other.hp -= 2500 * forms;
                                    }
                                });
                            }
                            // White Phosphorus (P4) - sensitive igniter!
                            else if ((wa.P || 0) >= 4) {
                                const forms = Math.floor((wa.P || 0) / 4);
                                wa.P = (wa.P || 0) - forms * 4;
                                w.hp -= 2500 * forms;
                                this.addLog("🔥 Zapłon tarciowy: P₄ rozbłysnął białym ogniem od uścisku!");
                                this.triggerReaction('shock_p4', 'Zapłon P₄ z Tarcia', 'P₄ (Tarcie) ➔ Wybuch', 'Biały fosfor uległ zapaleniu pod wpływem tarcia kinetycznego i ciśnienia!', ['P','P','P','P']);
                                this.addParticle(w.pos, '#facc15', 700, 60 * forms, 3);
                                this.state.screenShake = 10;
                                // Apply heavy burning DOT to surrounding enemies
                                this.state.enemies.forEach(other => {
                                    if (other.id !== w.id && this.distance(w.pos, other.pos) < 250) {
                                        other.hp -= 1500 * forms;
                                        other.status.dotTimer += 10.0 * forms;
                                        other.status.dotDamage += 120 * forms;
                                    }
                                });
                            }
                            // Sodium-water reaction triggered under extreme pressure
                            else if ((wa.Na || 0) >= 2 && (wa.H || 0) >= 2 && (wa.O || 0) >= 1) {
                                const forms = Math.floor(Math.min((wa.Na || 0) / 2, (wa.H || 0) / 2, wa.O || 0));
                                wa.Na = (wa.Na || 0) - forms * 2;
                                wa.H = (wa.H || 0) - forms * 2;
                                wa.O = (wa.O || 0) - forms;
                                w.hp -= 4000 * forms;
                                this.addLog("🌊 Reakcja uderzeniowa: Sód zetknął się z wodą pod naciskiem!");
                                this.triggerReaction('shock_sodium_water', 'Nacisk Sód-Woda', '2Na + H₂O (Ciśnienie) ➔ Wybuch', 'Gwałtowne pęknięcie pęcherzyków zmusiło sód do reakcji z wodą!', ['Na','Na','H','H','O']);
                                this.addParticle(w.pos, '#38bdf8', 600, 70 * forms, 2);
                                this.state.screenShake = 15;
                                this.state.enemies.forEach(other => {
                                    if (other.id !== w.id && this.distance(w.pos, other.pos) < 300) {
                                        other.hp -= 3500 * forms;
                                        other.status.slowTimer += 5.0 * forms;
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
  }

  private updateMarket() {
      let biggestGain = 0;
      let biggestDrop = 0;
      let gainAsset = '';
      let dropAsset = '';

      this.state.market.assets.forEach(asset => {
          const oldPrice = asset.currentPrice;
          const u1 = Math.random() || 0.0001;
          const u2 = Math.random() || 0.0001;
          const normal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2); // N(0, 1)
          
          const stdDev = (asset.maxReturn - asset.minReturn) / 4;
          let ret = asset.meanReturn + normal * stdDev;
          
          if (asset.history.length >= 5) {
              const ma5 = asset.history.slice(-5).reduce((a, b) => a + b, 0) / 5;
              const deviation = (asset.currentPrice - ma5) / ma5;
              let meanReversionFactor = 0.15; // default for ETFs
              if (asset.id === 'crypto_proton') {
                  meanReversionFactor = 0.0; // no mean reversion for crypto
              } else if (['alphabet', 'tsmc', 'amazon', 'microsoft'].includes(asset.id)) {
                  meanReversionFactor = 0.08; // weaker mean reversion for individual stocks
              }
              ret -= deviation * meanReversionFactor; // Mean reversion
          }
          
          if (ret < asset.minReturn) ret = asset.minReturn;
          if (ret > asset.maxReturn) ret = asset.maxReturn;

          asset.currentPrice *= (1 + ret);
          if (asset.currentPrice < 1) asset.currentPrice = 1;
          asset.history.push(asset.currentPrice);
          if (asset.history.length > 20) asset.history.shift();

          const changePct = ((asset.currentPrice - oldPrice) / oldPrice) * 100;
          if (changePct > biggestGain) {
             biggestGain = changePct;
             gainAsset = asset.name;
          }
          if (changePct < biggestDrop) {
             biggestDrop = changePct;
             dropAsset = asset.name;
          }
      });
      // Spowolniona inflacja o połowę, uruchamia się razem z inwestycjami co 4 pokoje
      this.state.market.inflationMultiplier = (this.state.market.inflationMultiplier || 1.0) * 1.03;

      let newsText = `Zaktualizowano kursy (co 4 dni).`;
      if (gainAsset) newsText += ` Rekordzista: ${gainAsset} (+${biggestGain.toFixed(1)}%).`;
      if (dropAsset) newsText += ` Największy spadek: ${dropAsset} (${biggestDrop.toFixed(1)}%).`;

      this.state.marketDiscovery = {
          active: true,
          title: 'Wiadomości z Giełdy',
          content: newsText
      };
      this.addLog(newsText);
  }

  private updatePlayer(dt: number) {
    const p = this.state.player;
    const isInCombat = this.state.enemies.length > 0;
    
    if (p.isDead) {
        if (p.deadTimer && p.deadTimer > 0) {
            p.deadTimer -= dt;
            if (p.deadTimer <= 0) {
                p.isDead = false;
                p.hp = Math.floor(p.maxHp * 0.5); // Revive with 50% hp
                p.deadTimer = 0;
                this.addLog("✨ Odrodziłeś się!");
            }
        }
        return;
    }

    if (p.iFrameTimer && p.iFrameTimer > 0) {
        p.iFrameTimer -= dt;
    }

    if (p.invincibilityTimer && p.invincibilityTimer > 0) {
        p.invincibilityTimer -= dt;
        p.iFrameTimer = 0.5; // Stay invincible
        // Starman touch: damage/kill enemies unconditionally when touching
        for (const enemy of this.state.enemies) {
            if (this.distance(p.pos, enemy.pos) < p.radius + enemy.radius) {
                enemy.hp -= 999999;
            }
        }
    }

    for (let i = 1; i <= 9; i++) {
        if (this.state.keys[i.toString()]) {
            const arr = this.state.equippedWeapon === 'super' ? this.state.unlockedReactions : this.state.unlockedAtoms;
            if (arr[i - 1]) {
                p.selectedAtom = arr[i - 1] as any;
            }
        }
    }

    if (p.dashCooldown > 0) p.dashCooldown -= dt;

    if (this.state.keys['e']) {
        this.state.keys['e'] = false;
        if (this.state.nearPortal) {
            if (this.state.nearPortalIsLobby) {
                this.enterDungeon();
            } else {
                this.enterNextFloor();
            }
        }
    }

    if (this.state.keys['z'] && this.state.potions.heal > 0 && p.hp < p.maxHp) {
        this.state.keys['z'] = false;
        if (this.state.showingShop) {
            this.state.potions.heal--;
            const healAmt = Math.round(p.maxHp * 0.3);
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            this.addLog(`💊 Użyto mikstury leczenia (uleczono 30% życia: +${healAmt} HP)`);
            this.saveGame();
        } else {
            this.addLog('⚠️ Mikstury leczenia można używać TYLKO w sklepie!');
        }
    }
    if (this.state.keys['x'] && this.state.potions.shield > 0 && this.state.activeShield <= 0) {
        this.state.keys['x'] = false;
        if (this.state.showingShop) {
            this.state.potions.shield--;
            this.state.activeShield = 50;
            this.addLog('🛡️ Aktywowano barierę tarczy (w sklepie)');
            this.saveGame();
        } else {
            this.addLog('⚠️ Generatora tarczy można używać TYLKO w sklepie!');
        }
    }
    if (this.state.keys['c'] && this.state.potions.stamina > 0 && this.state.activeStaminaRegen <= 0) {
        this.state.keys['c'] = false;
        if (this.state.showingShop) {
            this.state.potions.stamina--;
            const furyDuration = 5 + this.state.staminaPotionPurchases;
            this.state.activeStaminaRegen = furyDuration;
            this.addLog(`⚡ Eliksir Furii aktywowany (w sklepie, ${furyDuration}s)`);
            this.saveGame();
        } else {
            this.addLog('⚠️ Eliksiru Furii można używać TYLKO w sklepie!');
        }
    }
    
    if (this.state.activeStaminaRegen > 0) {
        this.state.activeStaminaRegen -= dt;
    }
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.pos.x += p.dashDir.x * p.speed * 3 * dt;
      p.pos.y += p.dashDir.y * p.speed * 3 * dt;
      this.addParticle(p.pos, '#ffffff', 20, 1);
      this.resolveWallCollisions(p);
      return; 
    } else {
      p.isDashing = false;
    }

    let rawDx = this.state.joystickMove.x;
    let rawDy = this.state.joystickMove.y;
    if (this.state.keys['w']) rawDy -= 1;
    if (this.state.keys['s']) rawDy += 1;
    if (this.state.keys['a']) rawDx -= 1;
    if (this.state.keys['d']) rawDx += 1;

    const moveDir = this.normalize({ x: rawDx, y: rawDy });

    const wantsDash = this.state.keys[' '] || this.state.keys['shift'];
    let dashStaminaCost = 30;
    if (this.state.difficulty === 'kids') dashStaminaCost = 0;
    else if (this.state.difficulty === 'easy') dashStaminaCost = 15;
    else if (this.state.difficulty === 'hard') dashStaminaCost = 35;

    if (wantsDash && p.dashCooldown <= 0 && p.stamina >= dashStaminaCost && (moveDir.x !== 0 || moveDir.y !== 0)) {
      p.isDashing = true;
      p.dashTimer = 0.2;
      p.dashCooldown = 1.0;
      p.dashDir = moveDir;
      p.stamina -= dashStaminaCost;
      this.state.keys[' '] = false;
      this.state.keys['shift'] = false;
      return;
    }

    p.pos.x += moveDir.x * p.speed * dt;
    p.pos.y += moveDir.y * p.speed * dt;
    this.resolveWallCollisions(p);

    let aimDir = { x: 1, y: 0 };
    if (this.state.isJoystickShooting) {
        aimDir = this.normalize(this.state.joystickAim);
    } else {
        const worldMouse = {
          x: this.state.mouse.x / this.state.cameraZoom + this.state.camera.x,
          y: this.state.mouse.y / this.state.cameraZoom + this.state.camera.y
        };
        aimDir = this.normalize({
          x: worldMouse.x - p.pos.x,
          y: worldMouse.y - p.pos.y
        });
    }

    let isAutoShooting = false;
    
    if (this.state.autoAim && this.state.enemies.length > 0 && !this.state.isLobby) {
        let closestDist = Infinity;
        let closestEnemy = null;
        for (const e of this.state.enemies) {
            const dist = this.distance(p.pos, e.pos);
            if (dist < closestDist) {
                closestDist = dist;
                closestEnemy = e;
            }
        }
        if (closestEnemy) {
            aimDir = this.normalize({
                x: closestEnemy.pos.x - p.pos.x,
                y: closestEnemy.pos.y - p.pos.y
            });
            isAutoShooting = true;
        }
    }

    if (aimDir.x === 0 && aimDir.y === 0) aimDir = {x: 1, y: 0};
    
    p.aimAngle = Math.atan2(aimDir.y, aimDir.x);
    if (Math.abs(aimDir.x) > 0.01) {
        p.facing = aimDir.x > 0 ? 1 : -1;
    } else if (moveDir.x !== 0) {
        p.facing = moveDir.x > 0 ? 1 : -1;
    }

    if (this.state.isLobby) {
        if (!this.state.characterSelected) {
            p.pos = {x: 0, y: 0};
            return; // Don't process stamina or shooting until selected
        } else {
            p.stamina = p.maxStamina;
            p.hp = p.maxHp;
            const distToPortal = this.distance(p.pos, { x: 0, y: -200 });
            if (distToPortal < p.radius + 50) {
                this.enterDungeon();
                return;
            }

            const distToWorkshop = this.distance(p.pos, { x: -80, y: 250 });
            if (distToWorkshop < p.radius + 60) {
                this.state.showingWorkshop = true;
                p.pos = { x: 0, y: 100 }; // Teleport near center upon exiting so it doesn't instantly trigger again
                this.state.isMouseDown = false;
                return;
            }

            const distToAlchemy = this.distance(p.pos, { x: 80, y: 250 });
            if (distToAlchemy < p.radius + 60) {
                // If touching Alchemy table
                if (!this.state.alchemyUnlocked) {
                    if (this.state.electrons >= 10 && this.state.isMouseDown) { // 10 Protons = elections? Wait, electrons are protony mechanically in game? User says "10 protonow", in game currency is electrons. If I have to use electrons, ok. Wait, maybe in game there are "protony"? Let's assume user means electrons, but I should check. No, protons drop from bosses.
                        // I will make it cost electrons, or add a prompt. Let's trigger showingAlchemy instead, and handle unlock inside the UI component.
                    }
                }
                this.state.showingAlchemy = true;
                p.pos = { x: 0, y: 100 }; 
                this.state.isMouseDown = false;
                return;
            }
        }
    } else {
        const currRoom = this.state.rooms.find(r => r.gridX === this.state.currentRoom.x && r.gridY === this.state.currentRoom.y);
        if (currRoom?.isMercenary) {
            const roomCenterX = currRoom.gridX * ROOM_WIDTH;
            const roomCenterY = currRoom.gridY * ROOM_HEIGHT;
            if (this.state.isMouseDown) {
                const cx = this.canvasSize.x / 2;
                const cy = this.canvasSize.y / 2;
                const worldMouse = { 
                    x: (this.state.mouse.x - cx) / this.state.cameraZoom + this.state.camera.x, 
                    y: (this.state.mouse.y - cy) / this.state.cameraZoom + this.state.camera.y 
                };
                if (this.distance(worldMouse, {x: roomCenterX, y: roomCenterY}) < 120) {
                    this.state.showingMercenary = true;
                    this.state.isMouseDown = false;
                    return;
                }
            }
        }
    }

    if (p.stamina < p.maxStamina && p.dashTimer <= 0) {
      let staminaRegenRate = this.state.activeStaminaRegen > 0 ? 100 : 20;
      if (this.state.difficulty === 'easy') staminaRegenRate += 10;
      if (this.state.difficulty === 'kids') staminaRegenRate += 40;
      // High- conductivity stamina boost out of combat
      if (!isInCombat && !this.state.isLobby) {
          if (this.state.difficulty === 'kids') staminaRegenRate += 150;
          else if (this.state.difficulty === 'easy') staminaRegenRate += 50;
      }
      p.stamina += staminaRegenRate * dt;
      if (p.stamina > p.maxStamina) p.stamina = p.maxStamina;
    }

    const heatDecayMultiplier = 1 + (this.state.heatLevel * 0.3); // 1.0, 1.3, 1.6, 1.9
    if (this.state.heat > 0) {
       let heatDecayRate = 25 * heatDecayMultiplier;
       if (this.state.difficulty === 'easy') heatDecayRate *= 1.5; // 50% faster cooling-down!
       if (this.state.difficulty === 'kids') heatDecayRate = 999;  // instant cooling!
       this.state.heat -= dt * heatDecayRate; // Heat decay
       if (this.state.heat <= 0) {
           this.state.heat = 0;
           this.state.overheated = false;
       }
    }

    // Health Regeneration
    if (p.hp < p.maxHp) {
       let regen = 0.25 + this.state.regenLevel * 0.25;
       if (this.state.selectedCharacter === 'curie_cat') regen += 1.0;
       
       // Out of combat special boosts for lower difficulties
       if (!isInCombat && !this.state.isLobby) {
           if (this.state.difficulty === 'kids') regen += 30.0;
           else if (this.state.difficulty === 'easy') regen += 8.0;
       }
       p.hp += regen * dt;
       if (p.hp > p.maxHp) p.hp = p.maxHp;
    }

    if (this.fireTimer > 0) this.fireTimer -= dt;
    const isWantsToShoot = this.state.isMouseDown || this.state.isJoystickShooting || isAutoShooting;
    const canShoot = this.state.isLobby || isInCombat;
    if (isWantsToShoot && this.fireTimer <= 0 && !p.isDashing && p.stamina >= (this.state.difficulty === 'kids' ? 0 : (this.state.difficulty === 'easy' ? 2 : 3)) && !this.state.overheated && canShoot) {
      const staminaBefore = p.stamina;
      p.stamina -= (this.state.difficulty === 'kids' ? 0 : (this.state.difficulty === 'easy' ? 1.5 : 3));
      
      let radSelfDamage = 4;
      if (this.state.difficulty === 'kids') radSelfDamage = 0;
      else if (this.state.difficulty === 'easy') radSelfDamage = 1;
      else if (this.state.difficulty === 'hard') radSelfDamage = 8; // Double the hazard on hard mode!
      
      let speed = 500, radius = 6, damage = 10;
      let newAtoms: Record<string, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, He: 0, F: 0, Na: 0, Al: 0, Fe: 0, Li: 0, Be: 0, B: 0, Mg: 0, K: 0, Ca: 0, Ne: 0 };
      
      let heatCost = 13;
      let fireTime = 0.2;

      let isIsotope = false;
      let isotopeMassNum = 0;
      let baseAtom = p.selectedAtom as string;
      const matchIsotope = typeof p.selectedAtom === 'string' && (p.selectedAtom as string).match(/^(\d+)([A-Z][a-z]?)$/);
      if (matchIsotope) {
          isIsotope = true;
          isotopeMassNum = parseInt(matchIsotope[1]);
          baseAtom = matchIsotope[2];
      }

      if (this.state.equippedWeapon !== 'super') {
          if (baseAtom === 'H') { speed = 1050; radius = 5; damage = 35; newAtoms['H'] = 1; fireTime = 0.30; heatCost = 9.75; }
          else if (baseAtom === 'He') { speed = 900; radius = 6; damage = 20; newAtoms['He'] = 1; fireTime = 0.25; heatCost = 8.5; }
          else if (baseAtom === 'Li') { speed = 800; radius = 8; damage = 50; newAtoms['Li'] = 1; fireTime = 0.40; heatCost = 15; }
          else if (baseAtom === 'Be') { speed = 750; radius = 8; damage = 60; newAtoms['Be'] = 1; fireTime = 0.45; heatCost = 16; }
          else if (baseAtom === 'B') { speed = 750; radius = 9; damage = 70; newAtoms['B'] = 1; fireTime = 0.40; heatCost = 16; }
          else if (baseAtom === 'C') { speed = 700; radius = 9; damage = 60; newAtoms['C'] = 1; fireTime = 0.50; heatCost = 18.25; }
          else if (baseAtom === 'N') { speed = 700; radius = 7; damage = 40; newAtoms['N'] = 1; fireTime = 0.40; heatCost = 14; }
          else if (baseAtom === 'O') { speed = 700; radius = 10; damage = 80; newAtoms['O'] = 1; fireTime = 0.40; heatCost = 14; }
          else if (baseAtom === 'F') { speed = 850; radius = 8; damage = 85; newAtoms['F'] = 1; fireTime = 0.35; heatCost = 15; }
          else if (baseAtom === 'Ne') { speed = 1000; radius = 7; damage = 95; newAtoms['Ne'] = 1; fireTime = 0.28; heatCost = 13.5; }
          else if (baseAtom === 'Na') { speed = 720; radius = 9; damage = 70; newAtoms['Na'] = 1; fireTime = 0.45; heatCost = 16; }
          else if (baseAtom === 'Al') { speed = 680; radius = 11; damage = 110; newAtoms['Al'] = 1; fireTime = 0.55; heatCost = 21; }
          else if (baseAtom === 'Fe') { speed = 600; radius = 14; damage = 150; newAtoms['Fe'] = 1; fireTime = 0.70; heatCost = 26; }
          else if (baseAtom === 'S') { speed = 700; radius = 10; damage = 75; newAtoms['S'] = 1; fireTime = 0.60; heatCost = 21.5; }
          else if (baseAtom === 'Si') { speed = 700; radius = 12; damage = 50; newAtoms['Si'] = 1; fireTime = 0.70; heatCost = 24.75; }
          else if (baseAtom === 'P') { speed = 650; radius = 11; damage = 90; newAtoms['P'] = 1; fireTime = 0.65; heatCost = 22; }
          else if (baseAtom === 'Cl') { speed = 600; radius = 11; damage = 80; newAtoms['Cl'] = 1; fireTime = 0.65; heatCost = 20; }
          else if (baseAtom === 'Mg') { speed = 650; radius = 12; damage = 100; newAtoms['Mg'] = 1; fireTime = 0.60; heatCost = 22; }
          else if (baseAtom === 'K') { speed = 700; radius = 15; damage = 120; newAtoms['K'] = 1; fireTime = 0.70; heatCost = 26; }
          else if (baseAtom === 'Ca') { speed = 600; radius = 16; damage = 140; newAtoms['Ca'] = 1; fireTime = 0.8; heatCost = 28; }
          else if (baseAtom === 'Sc') { speed = 620; radius = 14; damage = 150; newAtoms['Sc'] = 1; fireTime = 0.7; heatCost = 27; }
          else if (baseAtom === 'Ti') { speed = 650; radius = 15; damage = 170; newAtoms['Ti'] = 1; fireTime = 0.75; heatCost = 29; }
          else if (baseAtom === 'Ra' as any) { speed = 700; radius = 22; damage = 120; newAtoms['Ra'] = 1; fireTime = 0.6; heatCost = 22; if(!this.state.devGodMode) p.hp = Math.max(1, p.hp - radSelfDamage); this.state.screenShake += 3; this.addParticle(p.pos, '#8b5cf6', 60, 6); }
          else if (baseAtom === 'Po' as any) { speed = 900; radius = 15; damage = 200; newAtoms['Po'] = 1; fireTime = 0.8; heatCost = 30; if(!this.state.devGodMode) p.hp = Math.max(1, p.hp - radSelfDamage); this.state.screenShake += 5; this.addParticle(p.pos, '#d946ef', 70, 7); }
          else if (baseAtom === 'H2O' as any) { speed = 700; radius = 12; damage = 0; newAtoms['H'] = 2; newAtoms['O'] = 1; p.stamina -= 12; fireTime = 0.8; heatCost = 34; }
          else if (baseAtom === 'CH4' as any) { speed = 700; radius = 15; damage = 0; newAtoms['C'] = 1; newAtoms['H'] = 4; p.stamina -= 25; fireTime = 1.0; heatCost = 50.5; }
          else if (baseAtom === 'NH3' as any) { speed = 700; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['H'] = 3; p.stamina -= 20; fireTime = 0.8; heatCost = 43; }
          else if (baseAtom === 'CO2' as any) { speed = 700; radius = 16; damage = 0; newAtoms['C'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 1.0; heatCost = 45.5; }
          else if (baseAtom === 'NO2' as any) { speed = 700; radius = 14; damage = 0; newAtoms['N'] = 1; newAtoms['O'] = 2; p.stamina -= 15; fireTime = 0.8; heatCost = 39; }
          else if (baseAtom === 'H2S' as any) { speed = 700; radius = 18; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; p.stamina -= 30; fireTime = 1.2; heatCost = 57; }
          else if (baseAtom === 'SO2' as any) { speed = 700; radius = 15; damage = 0; newAtoms['S'] = 1; newAtoms['O'] = 2; p.stamina -= 20; fireTime = 1.0; heatCost = 49.5; }
          else if (baseAtom === 'H2SO4' as any) { speed = 700; radius = 20; damage = 0; newAtoms['H'] = 2; newAtoms['S'] = 1; newAtoms['O'] = 4; p.stamina -= 40; fireTime = 1.6; heatCost = 85; }
          else if (baseAtom === 'SiO2' as any) { speed = 700; radius = 18; damage = 0; newAtoms['Si'] = 1; newAtoms['O'] = 2; p.stamina -= 25; fireTime = 1.2; heatCost = 55; }
          else if (baseAtom === 'SiC' as any) { speed = 700; radius = 22; damage = 0; newAtoms['Si'] = 1; newAtoms['C'] = 1; p.stamina -= 35; fireTime = 1.4; heatCost = 65.5; }
          else { speed = 0; fireTime = 0.1; }
      }

      let isRadioactive = false;
      if (isIsotope) {
          const atomicZMapping: Record<string, number> = {
              H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10,
              Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, K: 19, Ca: 20, Fe: 26, Po: 84, Ra: 88, Mg_12: 12
          };
          const Z = atomicZMapping[baseAtom] || 1;
          let expectedN = Math.round(Z * 1.1);
          if (Z > 20) expectedN = Math.round(Z * 1.3);
          if (Z > 50) expectedN = Math.round(Z * 1.4);
          if (Z > 80) expectedN = Math.round(Z * 1.5);
          if (Z === 1) expectedN = 0;
          if (Z === 2) expectedN = 2;

          const n = isotopeMassNum - Z;
          const nDiff = n - expectedN;
          const maxTol = Math.max(1, Math.floor(Z * 0.15));
          isRadioactive = Math.abs(nDiff) > maxTol;

          if (nDiff < 0) {
              speed = speed * (1.0 + Math.abs(nDiff) * 0.15);
              damage = damage * (1.0 - Math.abs(nDiff) * 0.08);
          } else if (nDiff > 0) {
              damage = damage * (1.0 + nDiff * 0.20);
              speed = Math.max(speed * 0.6, speed * (1.0 - nDiff * 0.08));
              radius = radius + nDiff * 0.6;
          }

          damage = Math.round(Math.min(10000, damage));
          speed = Math.min(2500, speed);
          radius = Math.min(80, radius);
      }
      let projType: any = p.selectedAtom;
      if (this.state.equippedWeapon === 'super') {
          if (p.selectedReaction === 'h2o') { speed = 800; radius = 20; damage = 400; newAtoms['H'] = 2; newAtoms['O'] = 1; (newAtoms as any).H2O = 1; projType = 'H2O'; p.stamina -= 20; fireTime = 1.6; heatCost = 70; }
          if (p.selectedReaction === 'ch4') { speed = 600; radius = 30; damage = 600; newAtoms['C'] = 1; newAtoms['H'] = 4; (newAtoms as any).CH4 = 1; projType = 'CH4'; p.stamina -= 40; fireTime = 2.4; heatCost = 110; }
          else if (p.selectedReaction === 'nh3') { speed = 650; radius = 25; damage = 500; newAtoms['N'] = 1; newAtoms['H'] = 3; (newAtoms as any).NH3 = 1; projType = 'NH3'; p.stamina -= 35; fireTime = 2.0; heatCost = 95; }
          else if (p.selectedReaction === 'co2') { speed = 550; radius = 28; damage = 450; newAtoms['C'] = 1; newAtoms['O'] = 2; (newAtoms as any).CO2 = 1; projType = 'CO2'; p.stamina -= 35; fireTime = 2.0; heatCost = 95; }
          else if (p.selectedReaction === 'no2') { speed = 600; radius = 24; damage = 480; newAtoms['N'] = 1; newAtoms['O'] = 2; (newAtoms as any).NO2 = 1; projType = 'NO2'; p.stamina -= 30; fireTime = 1.8; heatCost = 87.5; }
          else if (p.selectedReaction === 'h2s') { speed = 650; radius = 32; damage = 550; newAtoms['H'] = 2; newAtoms['S'] = 1; (newAtoms as any).H2S = 1; projType = 'H2S'; p.stamina -= 45; fireTime = 2.4; heatCost = 105; }
          else if (p.selectedReaction === 'so2') { speed = 550; radius = 26; damage = 500; newAtoms['S'] = 1; newAtoms['O'] = 2; (newAtoms as any).SO2 = 1; projType = 'SO2'; p.stamina -= 40; fireTime = 2.2; heatCost = 102.5; }
          else if (p.selectedReaction === 'h2so4') { speed = 500; radius = 40; damage = 800; newAtoms['H'] = 2; newAtoms['S'] = 1; newAtoms['O'] = 4; (newAtoms as any).H2SO4 = 1; projType = 'H2SO4'; p.stamina -= 60; fireTime = 3.6; heatCost = 145; }
          else if (p.selectedReaction === 'sio2') { speed = 550; radius = 35; damage = 400; newAtoms['Si'] = 1; newAtoms['O'] = 2; (newAtoms as any).SiO2 = 1; projType = 'SiO2'; p.stamina -= 40; fireTime = 2.4; heatCost = 110; }
          else if (p.selectedReaction === 'sic') { speed = 500; radius = 40; damage = 700; newAtoms['Si'] = 1; newAtoms['C'] = 1; (newAtoms as any).SiC = 1; projType = 'SiC'; p.stamina -= 50; fireTime = 3.0; heatCost = 127.5; }
          else if (p.selectedReaction === 'licl') { speed = 750; radius = 30; damage = 500; newAtoms['Li'] = 1; newAtoms['Cl'] = 1; (newAtoms as any).LiCl = 1; projType = 'LiCl'; p.stamina -= 45; fireTime = 2.2; heatCost = 90; }
          else if (p.selectedReaction === 'lih') { speed = 850; radius = 25; damage = 600; newAtoms['Li'] = 1; newAtoms['H'] = 1; (newAtoms as any).LiH = 1; projType = 'LiH'; p.stamina -= 40; fireTime = 2.0; heatCost = 85; }
          else if (p.selectedReaction === 'li2o') { speed = 650; radius = 45; damage = 700; newAtoms['Li'] = 2; newAtoms['O'] = 1; (newAtoms as any).Li2O = 1; projType = 'Li2O'; p.stamina -= 55; fireTime = 2.6; heatCost = 115; }
          else if (p.selectedReaction === 'beo') { speed = 550; radius = 50; damage = 550; newAtoms['Be'] = 1; newAtoms['O'] = 1; (newAtoms as any).BeO = 1; projType = 'BeO'; p.stamina -= 50; fireTime = 2.5; heatCost = 110; }
          else if (p.selectedReaction === 'becl2') { speed = 600; radius = 55; damage = 750; newAtoms['Be'] = 1; newAtoms['Cl'] = 2; (newAtoms as any).BeCl2 = 1; projType = 'BeCl2'; p.stamina -= 60; fireTime = 2.8; heatCost = 125; }
          else if (p.selectedReaction === 'beh2') { speed = 900; radius = 35; damage = 850; newAtoms['Be'] = 1; newAtoms['H'] = 2; (newAtoms as any).BeH2 = 1; projType = 'BeH2'; p.stamina -= 65; fireTime = 3.0; heatCost = 140; }
          else if (p.selectedReaction === 'bh3') { speed = 700; radius = 40; damage = 650; newAtoms['B'] = 1; newAtoms['H'] = 3; (newAtoms as any).BH3 = 1; projType = 'BH3'; p.stamina -= 55; fireTime = 2.4; heatCost = 100; }
          else if (p.selectedReaction === 'b2o3') { speed = 500; radius = 60; damage = 800; newAtoms['B'] = 2; newAtoms['O'] = 3; (newAtoms as any).B2O3 = 1; projType = 'B2O3'; p.stamina -= 70; fireTime = 3.0; heatCost = 130; }
          else if (p.selectedReaction === 'bcl3') { speed = 600; radius = 50; damage = 750; newAtoms['B'] = 1; newAtoms['Cl'] = 3; (newAtoms as any).BCl3 = 1; projType = 'BCl3'; p.stamina -= 65; fireTime = 2.8; heatCost = 120; }
          else if (p.selectedReaction === 'bn') { speed = 1000; radius = 25; damage = 1000; newAtoms['B'] = 1; newAtoms['N'] = 1; (newAtoms as any).BN = 1; projType = 'BN'; p.stamina -= 60; fireTime = 2.5; heatCost = 110; }
          else if (p.selectedReaction === 'c6h12o6') { speed = 400; radius = 60; damage = 3500; newAtoms['C'] = 6; newAtoms['H'] = 12; newAtoms['O'] = 6; (newAtoms as any).C6H12O6 = 1; projType = 'C6H12O6'; p.stamina -= 120; fireTime = 4.0; heatCost = 250; }
          else if (p.selectedReaction === 'cellulose') { speed = 350; radius = 80; damage = 4000; newAtoms['C'] = 6; newAtoms['H'] = 10; newAtoms['O'] = 5; (newAtoms as any).Cellulose = 1; projType = 'CELLULOSE'; p.stamina -= 130; fireTime = 4.5; heatCost = 270; }
          else if (p.selectedReaction === 'kno3') { speed = 500; radius = 50; damage = 4500; newAtoms['K'] = 1; newAtoms['N'] = 1; newAtoms['O'] = 3; (newAtoms as any).KNO3 = 1; projType = 'KNO3'; p.stamina -= 90; fireTime = 3.5; heatCost = 150; }
          else if (p.selectedReaction === 'caco3') { speed = 400; radius = 50; damage = 3000; newAtoms['Ca'] = 1; newAtoms['C'] = 1; newAtoms['O'] = 3; (newAtoms as any).CaCO3 = 1; projType = 'CACO3'; p.stamina -= 80; fireTime = 3.0; heatCost = 130; }
          else if (p.selectedReaction === 'chlorophyll') { speed = 600; radius = 100; damage = 8000; newAtoms['C'] = 55; newAtoms['H'] = 72; newAtoms['N'] = 4; newAtoms['O'] = 5; newAtoms['Mg'] = 1; (newAtoms as any).Chlorophyll = 1; projType = 'CHLOROPHYLL'; p.stamina -= 200; fireTime = 6.0; heatCost = 400; }
          else if (p.selectedReaction === 'ethanol') { speed = 550; radius = 40; damage = 1200; newAtoms['C'] = 2; newAtoms['H'] = 6; newAtoms['O'] = 1; (newAtoms as any).Ethanol = 1; projType = 'ETHANOL'; p.stamina -= 50; fireTime = 2.5; heatCost = 150; }
          else if (p.selectedReaction === 'vinegar') { speed = 400; radius = 50; damage = 1500; newAtoms['C'] = 2; newAtoms['H'] = 4; newAtoms['O'] = 2; (newAtoms as any).Vinegar = 1; projType = 'VINEGAR'; p.stamina -= 60; fireTime = 2.8; heatCost = 160; }
          else if (p.selectedReaction === 'combustion') { speed = 1500; radius = 250; damage = 25000; newAtoms['C'] = 2; newAtoms['H'] = 6; newAtoms['O'] = 7; (newAtoms as any).Combustion = 1; projType = 'COMBUSTION'; p.stamina -= 99; fireTime = 4.5; heatCost = 800; }
          else if (p.selectedReaction === 'mgcl2') { speed = 600; radius = 40; damage = 700; newAtoms['Mg'] = 1; newAtoms['Cl'] = 2; (newAtoms as any).MgCl2 = 1; projType = 'MGCL2'; p.stamina -= 50; fireTime = 2.4; heatCost = 120; }
          else if (p.selectedReaction === 'cacl2') { speed = 550; radius = 45; damage = 800; newAtoms['Ca'] = 1; newAtoms['Cl'] = 2; (newAtoms as any).CaCl2 = 1; projType = 'CACL2'; p.stamina -= 55; fireTime = 2.6; heatCost = 130; }
          else if (p.selectedReaction === 'mgo') { speed = 800; radius = 30; damage = 1200; newAtoms['Mg'] = 1; newAtoms['O'] = 1; (newAtoms as any).MgO = 1; projType = 'MGO'; p.stamina -= 60; fireTime = 2.0; heatCost = 150; }
          else if (p.selectedReaction === 'cao') { speed = 500; radius = 40; damage = 900; newAtoms['Ca'] = 1; newAtoms['O'] = 1; (newAtoms as any).CaO = 1; projType = 'CAO'; p.stamina -= 50; fireTime = 2.5; heatCost = 130; }
          else if (p.selectedReaction === 'caoh2') { speed = 450; radius = 50; damage = 1500; newAtoms['Ca'] = 1; newAtoms['O'] = 2; newAtoms['H'] = 2; (newAtoms as any).CaOH2 = 1; projType = 'CAOH2'; p.stamina -= 70; fireTime = 3.0; heatCost = 180; }
          else if (p.selectedReaction === 'kcl') { speed = 700; radius = 35; damage = 1000; newAtoms['K'] = 1; newAtoms['Cl'] = 1; (newAtoms as any).KCl = 1; projType = 'KCL'; p.stamina -= 55; fireTime = 2.2; heatCost = 140; }
          else if (p.selectedReaction === 'koh') { speed = 650; radius = 45; damage = 1600; newAtoms['K'] = 1; newAtoms['O'] = 1; newAtoms['H'] = 1; (newAtoms as any).KOH = 1; projType = 'KOH'; p.stamina -= 65; fireTime = 2.8; heatCost = 170; }
          else if (p.selectedReaction === 'p2o5') { speed = 500; radius = 60; damage = 2200; newAtoms['P'] = 2; newAtoms['O'] = 5; (newAtoms as any).P2O5 = 1; projType = 'P2O5'; p.stamina -= 80; fireTime = 3.5; heatCost = 220; }
          else if (p.selectedReaction === 'sicl4') { speed = 400; radius = 70; damage = 1300; newAtoms['Si'] = 1; newAtoms['Cl'] = 4; (newAtoms as any).SiCl4 = 1; projType = 'SICL4'; p.stamina -= 75; fireTime = 3.2; heatCost = 200; }
          else if (p.selectedReaction === 'nacl') { speed = 650; radius = 40; damage = 750; newAtoms['Na'] = 1; newAtoms['Cl'] = 1; (newAtoms as any).NaCl = 1; projType = 'NACL'; p.stamina -= 50; fireTime = 2.4; heatCost = 120; }
          else if (p.selectedReaction === 'naoh') { speed = 550; radius = 50; damage = 1300; newAtoms['Na'] = 1; newAtoms['O'] = 1; newAtoms['H'] = 1; (newAtoms as any).NaOH = 1; projType = 'NAOH'; p.stamina -= 60; fireTime = 2.8; heatCost = 160; }
          else if (p.selectedReaction === 'nahco3') { speed = 400; radius = 65; damage = 900; newAtoms['Na'] = 1; newAtoms['H'] = 1; newAtoms['C'] = 1; newAtoms['O'] = 3; (newAtoms as any).NaHCO3 = 1; projType = 'NAHCO3'; p.stamina -= 70; fireTime = 3.2; heatCost = 180; }
          else if (p.selectedReaction === 'al2o3') { speed = 450; radius = 55; damage = 2500; newAtoms['Al'] = 2; newAtoms['O'] = 3; (newAtoms as any).Al2O3 = 1; projType = 'AL2O3'; p.stamina -= 80; fireTime = 3.5; heatCost = 210; }
          else if (p.selectedReaction === 'alcl3') { speed = 500; radius = 60; damage = 1800; newAtoms['Al'] = 1; newAtoms['Cl'] = 3; (newAtoms as any).AlCl3 = 1; projType = 'ALCL3'; p.stamina -= 65; fireTime = 3.0; heatCost = 175; }
          else if (p.selectedReaction === 'hf') { speed = 750; radius = 30; damage = 1400; newAtoms['H'] = 1; newAtoms['F'] = 1; (newAtoms as any).HF = 1; projType = 'HF'; p.stamina -= 45; fireTime = 2.0; heatCost = 100; }
          else if (p.selectedReaction === 'cf4') { speed = 650; radius = 50; damage = 1600; newAtoms['C'] = 1; newAtoms['F'] = 4; (newAtoms as any).CF4 = 1; projType = 'CF4'; p.stamina -= 65; fireTime = 2.8; heatCost = 135; }
          else if (p.selectedReaction === 'naf') { speed = 700; radius = 40; damage = 1500; newAtoms['Na'] = 1; newAtoms['F'] = 1; (newAtoms as any).NaF = 1; projType = 'NaF'; p.stamina -= 50; fireTime = 2.4; heatCost = 120; }
          else if (p.selectedReaction === 'alf3') { speed = 600; radius = 55; damage = 2200; newAtoms['Al'] = 1; newAtoms['F'] = 3; (newAtoms as any).AlF3 = 1; projType = 'AlF3'; p.stamina -= 70; fireTime = 3.0; heatCost = 160; }
          else if (p.selectedReaction === 'fef3') { speed = 550; radius = 60; damage = 2000; newAtoms['Fe'] = 1; newAtoms['F'] = 3; (newAtoms as any).FeF3 = 1; projType = 'FeF3'; p.stamina -= 70; fireTime = 3.0; heatCost = 165; }
          else if (p.selectedReaction === 'thermite') { speed = 500; radius = 120; damage = 15000; newAtoms['Al'] = 2; newAtoms['Fe'] = 2; newAtoms['O'] = 3; (newAtoms as any).Thermite = 1; projType = 'Thermite'; p.stamina -= 110; fireTime = 4.2; heatCost = 450; }
          else if (p.selectedReaction === 'sodium_water') { speed = 600; radius = 90; damage = 8000; newAtoms['Na'] = 2; newAtoms['H'] = 2; newAtoms['O'] = 1; (newAtoms as any).SodiumWater = 1; projType = 'SodiumWater'; p.stamina -= 80; fireTime = 3.2; heatCost = 250; }
          else if (p.selectedReaction === 'neonium') { speed = 850; radius = 45; damage = 4200; newAtoms['Ne'] = 1; newAtoms['H'] = 1; (newAtoms as any).NeH = 1; projType = 'NeH'; p.stamina -= 60; fireTime = 2.2; heatCost = 150; }
          else { speed = 0; fireTime = 0.2; }
      }

      let gunModifier = 1.15; // Zmniejszona podstawowa szybkość strzelania (wyższy mnożnik)
      if (this.state.gunLevel === 1) gunModifier = 1.0;
      if (this.state.gunLevel === 2) gunModifier = 0.85;
      if (this.state.gunLevel === 3) gunModifier = 0.70;
      if (this.state.gunLevel === 4) gunModifier = 0.55;
      if (this.state.gunLevel === 5) gunModifier = 0.40;
      if (this.state.gunLevel === 6) gunModifier = 0.30;
      if (this.state.gunLevel >= 7) gunModifier = 0.20;

      this.fireTimer = fireTime * gunModifier;
      if (this.state.equippedWeapon === 'shotgun') {
          this.fireTimer *= 2.5; // wolniej przeładowuje
      }
      
      const heatGainMultiplier = 1 - (this.state.heatLevel * 0.1); // max 1 - 0.3 = 0.7 (mniej pomaga, więc szybciej się przegrzewa)
      let finalHeatCost = heatCost * heatGainMultiplier * Math.sqrt(gunModifier); // slower reduction than fire rate
      
      // Ensure at max upgrades it overheats slowly
      const expectedDecayPerSec = 25 * (1 + (this.state.heatLevel * 0.3));
      const fireRatePerSec = 1 / Math.max(0.01, this.fireTimer);
      const minNetHeatPerSec = 20.0; // Zwiększone przegrzewanie (osiąga 100 bardzo szybko, ok 5s ciągłego ognia max)
      
      if (fireRatePerSec * finalHeatCost <= expectedDecayPerSec) {
          finalHeatCost = (expectedDecayPerSec + minNetHeatPerSec) / fireRatePerSec;
      }

      this.state.heat += finalHeatCost;
      if (this.state.heat >= 100) {
          this.state.heat = 100;
          this.state.overheated = true;
          this.addLog("🔥 BRON PRZEGRZANA!");
      }

      if (p.hp <= 0) {
          this.die();
      }

      if (this.state.selectedCharacter === 'bohr_cat') {
          // Bohr's unique orbiting mechanic!
          let orbitRadius = 150;
          if (projType === 'H') orbitRadius = 150;
          else if (projType === 'O') orbitRadius = 200;
          else if (projType === 'C') orbitRadius = 250;
          else if (projType === 'N') orbitRadius = 300;
          else if (projType === 'S') orbitRadius = 350;
          else if (projType === 'Si') orbitRadius = 400;
          else orbitRadius = 450; // molecules / reactions

          const startAngle = Math.random() * Math.PI * 2;
          const isotopeFields = isIsotope ? {
              isIsotope: true,
              isotopeMassNum,
              isRadioactive,
              baseAtomSymbol: baseAtom
          } : {};

          this.state.projectiles.push({
            id: nextId++,
            pos: { x: p.pos.x + Math.cos(startAngle) * orbitRadius, y: p.pos.y + Math.sin(startAngle) * orbitRadius },
            vel: { x: -Math.sin(startAngle) * 300, y: Math.cos(startAngle) * 300 },
            type: projType,
            atoms: newAtoms,
            radius, damage, life: 120.0,
            isOrbiting: true,
            orbitAngle: startAngle,
            orbitRadius: orbitRadius,
            ...isotopeFields
          });
      } else if (this.state.equippedWeapon === 'shotgun') {
          const isotopeFields = isIsotope ? {
              isIsotope: true,
              isotopeMassNum,
              isRadioactive,
              baseAtomSymbol: baseAtom
          } : {};

          // Fire 3 projectiles in a spread (wider spread angle as requested)
          for (let i = -1; i <= 1; i++) {
              const spreadAngle = p.aimAngle + i * 0.45;
              this.state.projectiles.push({
                id: nextId++,
                pos: { x: p.pos.x, y: p.pos.y },
                vel: { x: Math.cos(spreadAngle) * speed, y: Math.sin(spreadAngle) * speed },
                type: projType,
                atoms: { ...newAtoms },
                radius, damage, life: 120.0,
                ...isotopeFields
              });
          }
      } else {
          const isotopeFields = isIsotope ? {
              isIsotope: true,
              isotopeMassNum,
              isRadioactive,
              baseAtomSymbol: baseAtom
          } : {};

          this.state.projectiles.push({
            id: nextId++,
            pos: { x: p.pos.x, y: p.pos.y },
            vel: { x: aimDir.x * speed, y: aimDir.y * speed },
            type: projType,
            atoms: newAtoms,
            radius, damage, life: 120.0,
            ...isotopeFields
          });
      }

      // Re-scale stamina subtraction based on chosen difficulty
      const rawCost = staminaBefore - p.stamina;
      if (rawCost > 0) {
          p.stamina = staminaBefore;
          let scaledCost = rawCost;
          if (this.state.difficulty === 'kids') scaledCost = 0;
          else if (this.state.difficulty === 'easy') scaledCost *= 0.6; // 40% stamina cost reduction
          else if (this.state.difficulty === 'hard') scaledCost *= 1.15; // 15% stamina cost increase
          p.stamina -= scaledCost;
          if (p.stamina < 0) p.stamina = 0;
      }
    }
  }

  private checkReactions(enemy: Enemy) {
    if (enemy.type === 'C3Wall') {
        if (enemy.atoms.C >= 6) {
           enemy.type = 'C6Wall' as any;
           enemy.life += 10.0; // Extend life when upgraded
           enemy.hp = 35000;
           enemy.maxHp = 35000;
           enemy.atoms.C -= 6;
           this.addParticle(enemy.pos, '#ffffff', 300, 25);
           this.triggerReaction('c6_from_c3', 'Diament z Grafitu', 'Stary Grafit + 3C ➔ Diament', 'Kolejne warstwy węgla sprasowały grafit w diament.', ['C','C','C']);
        }
        return; 
    }
    if (['C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(enemy.type as string)) {
        return; 
    }

    const a = enemy.atoms;

    // NCl3
    if (a.N >= 1 && a.Cl >= 3) {
       const forms = Math.floor(Math.min(a.N, a.Cl/3));
       a.N -= forms; a.Cl -= forms * 3;
       this.triggerReaction('ncl3', 'Trójchlorek Azotu', 'N + 3Cl ➔ NCl₃', 'Ekstremalnie czuły ładunek wybuchowy! Eksploduje w kontakcie z wrogiem z potężną siłą.', ['N','Cl','Cl','Cl']);
       enemy.hp -= 450 * forms;
       enemy.status.frozenTimer += 1.0 * forms;
       this.addParticle(enemy.pos, '#fbbf24', 250, 40);
    }
    // PCl5
    if (a.P >= 1 && a.Cl >= 5) {
       const forms = Math.floor(Math.min(a.P, a.Cl/5));
       a.P -= forms; a.Cl -= forms * 5;
       this.triggerReaction('pcl5', 'Pentachlorek Fosforu', 'P + 5Cl ➔ PCl₅', 'Wściekle reaktywny i toksyczny opad wyniszczający wszystko w okolicy.', ['P','Cl','Cl','Cl','Cl','Cl']);
       enemy.hp -= 200 * forms;
       enemy.status.dotTimer += 10.0 * forms;
       enemy.status.dotDamage += 150 * forms;
       this.addParticle(enemy.pos, '#84cc16', 300, 35);
    }


    // P4
    if (a.P >= 4) {
       const forms = Math.floor(a.P/4);
       a.P -= forms * 4;
       this.triggerReaction('p4', 'Biały Fosfor (Zapalający)', '4P ➔ P₄', 'Ogromna eksplozja zapalająca o długotrwałym efekcie spalania.', ['P','P','P','P']);
       enemy.hp -= 400 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#facc15', 500, 45); // yellow fire
    }
    // PH3
    if (a.P >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.P, a.H/3));
       a.P -= forms; a.H -= forms * 3;
       this.triggerReaction('ph3', 'Fosfiniak (Fosforowodór)', 'P + 3H ➔ PH₃', 'Niezwykle trujący i palny gaz obezwładniający cel.', ['P','H','H','H']);
       enemy.hp -= 300 * forms;
       enemy.status.slowTimer += 6.0 * forms;
       this.addParticle(enemy.pos, '#a3e635', 300, 30);
    }
    // H3PO4
    if (a.H >= 3 && a.P >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/3, a.P, a.O/4));
       a.H -= forms * 3; a.P -= forms; a.O -= forms * 4;
       this.triggerReaction('h3po4', 'Kwas Fosforowy', '3H + P + 4O ➔ H₃PO₄', 'Kwas ortofosforowy całkowicie zatrzymujący wroga w kwasie i niszczący pancerz.', ['H','P','O','O']);
       enemy.hp -= 500 * forms;
       enemy.status.frozenTimer += 8.0 * forms;
       this.addParticle(enemy.pos, '#3b82f6', 200, 40);
    }


    // Cl2
    if (a.Cl >= 2) {
       const forms = Math.floor(a.Cl/2);
       a.Cl -= forms * 2;
       this.triggerReaction('cl2', 'Chlor (Gaz)', '2Cl ➔ Cl₂', 'Toksyczny zielony gaz, dusi wroga.', ['Cl','Cl']);
       enemy.hp -= 220 * forms;
       enemy.status.dotTimer = 6.0;
       enemy.status.dotDamage = 60 * forms;
       this.addParticle(enemy.pos, '#10b981', 300, 35);
    }
    // HCl
    if (a.H >= 1 && a.Cl >= 1) {
       const forms = Math.floor(Math.min(a.H, a.Cl));
       a.H -= forms; a.Cl -= forms;
       this.triggerReaction('hcl', 'Kwas Solny', 'H + Cl ➔ HCl', 'Żrący kwas uderzający cel punktowo z potężną siłą.', ['H','Cl']);
       enemy.hp -= 180 * forms;
       this.addParticle(enemy.pos, '#34d399', 150, 25);
    }
    // Neonium Superacid (NeH+)
    if ((a.Ne || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Ne || 0, a.H || 0));
       a.Ne = (a.Ne || 0) - forms;
       a.H = (a.H || 0) - forms;
       this.triggerReaction('neonium', 'Superkwas Neoniowy (NeH⁺)', 'Ne + H ➔ NeH⁺', 'Niezwykle silny i ekstremalnie żrący superkwas, który natychmiast rozpuszcza pancerze organiczne i metalowe wrogów zadając im gigantyczne obrażenia.', ['Ne','H']);
       enemy.hp -= 4200 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 350 * forms;
       enemy.status.slowTimer += 4.0 * forms;
       this.addParticle(enemy.pos, '#f43f5e', 700, 150 * forms, 2.5); // glowing rose-pink neon flare
    }
    // CCl4
    if (a.C >= 1 && a.Cl >= 4) {
       const forms = Math.floor(Math.min(a.C, a.Cl/4));
       a.C -= forms; a.Cl -= forms * 4;
       this.triggerReaction('ccl4', 'Tetrachlorometan', 'C + 4Cl ➔ CCl₄', 'Potężny wybuch kwasowy zamrażający wszystko dookoła.', ['C','Cl','Cl','Cl','Cl']);
       enemy.hp -= 600 * forms;
       enemy.status.frozenTimer += 4.0 * forms;
       this.addParticle(enemy.pos, '#a7f3d0', 400, 40);
    }

    // Priorities matter! Let's check from most atoms required to least.
    
    // H2SO4 Sulfuric Acid (2H, 1S, 4O) -> Supreme Acid
    if (a.H >= 2 && a.S >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/2, a.S, a.O/4));
       a.H -= forms * 2; a.S -= forms; a.O -= forms * 4;
       (a as any).H2SO4 = ((a as any).H2SO4 || 0) + forms;
       this.triggerReaction('h2so4', 'Kwas Siarkowy', '2H + S + 4O ➔ H₂SO₄', 'Ostateczny, potężny kwas rozpuszczający wszystko na swojej drodze.', ['H','H','S','O','O','O','O']);
       enemy.hp -= 500 * forms;
       enemy.status.dotTimer = 10.0;
       enemy.status.dotDamage = 100 * forms;
       this.addParticle(enemy.pos, '#aaee00', 400, 40);
    }
    
    // H2SO3 Sulfurous Acid (2H, 1S, 3O)
    if (a.H >= 2 && a.S >= 1 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.H/2, a.S, a.O/3));
       a.H -= forms * 2; a.S -= forms; a.O -= forms * 3;
       (a as any).H2SO3 = ((a as any).H2SO3 || 0) + forms;
       this.triggerReaction('h2so3', 'Kwas Siarkawy', '2H + S + 3O ➔ H₂SO₃', 'Bardzo krótki, lecz gwałtowny rozkład. Silnie rani w czasie.', ['H','H','S','O','O','O']);
       enemy.hp -= 300 * forms;
       enemy.status.dotTimer = 5.0;
       enemy.status.dotDamage = 150 * forms;
       this.addParticle(enemy.pos, '#ccff33', 300, 30);
    }

    // licl: Li + Cl
    if ((a.Li || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li, a.Cl));
       a.Li -= forms; a.Cl -= forms;
       (a as any).LiCl = ((a as any).LiCl || 0) + forms;
       this.triggerReaction('licl', 'Chlorek Litu', 'Li + Cl ➔ LiCl', 'Mocna toksyna.', ['Li','Cl']);
       enemy.hp -= 250 * forms;
       enemy.status.dotTimer += 8.0 * forms;
       enemy.status.dotDamage += 60 * forms;
       this.addParticle(enemy.pos, '#fbbf24', 400, 40);
    }
    // lih: Li + H
    if ((a.Li || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li, a.H));
       a.Li -= forms; a.H -= forms;
       (a as any).LiH = ((a as any).LiH || 0) + forms;
       this.triggerReaction('lih', 'Wodorek Litu', 'Li + H ➔ LiH', 'Rozpala cel.', ['Li','H']);
       enemy.hp -= 300 * forms;
       enemy.status.dotTimer += 6.0 * forms;
       enemy.status.dotDamage += 80 * forms;
       this.addParticle(enemy.pos, '#fda4af', 450, 30);
    }
    // li2o: 2Li + O
    if ((a.Li || 0) >= 2 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li/2, a.O));
       a.Li -= forms * 2; a.O -= forms;
       (a as any).Li2O = ((a as any).Li2O || 0) + forms;
       this.triggerReaction('li2o', 'Tlenek Litu', '2Li + O ➔ Li₂O', 'Żrący opar.', ['Li','Li','O']);
       enemy.hp -= 400 * forms;
       enemy.status.dotTimer += 10.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#dc2626', 500, 50);
    }
    // beo: Be + O
    if ((a.Be || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Be, a.O));
       a.Be -= forms; a.O -= forms;
       (a as any).BeO = ((a as any).BeO || 0) + forms;
       this.triggerReaction('beo', 'Tlenek Berylu', 'Be + O ➔ BeO', 'Twarde szpilki.', ['Be','O']);
       enemy.hp -= 350 * forms;
       enemy.status.slowTimer += 8.0 * forms;
       this.addParticle(enemy.pos, '#6ee7b7', 400, 45);
    }
    // becl2: Be + 2Cl
    if ((a.Be || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Be, a.Cl/2));
       a.Be -= forms; a.Cl -= forms * 2;
       (a as any).BeCl2 = ((a as any).BeCl2 || 0) + forms;
       this.triggerReaction('becl2', 'Chlorek Berylu', 'Be + 2Cl ➔ BeCl₂', 'Rozpuszczająca chmura.', ['Be','Cl','Cl']);
       enemy.hp -= 500 * forms;
       enemy.status.dotTimer += 15.0 * forms;
       enemy.status.dotDamage += 120 * forms;
       enemy.status.slowTimer += 10.0 * forms;
       this.addParticle(enemy.pos, '#a3e635', 550, 60);
    }
    // beh2: Be + 2H
    if ((a.Be || 0) >= 1 && (a.H || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Be, a.H/2));
       a.Be -= forms; a.H -= forms * 2;
       (a as any).BeH2 = ((a as any).BeH2 || 0) + forms;
       this.triggerReaction('beh2', 'Wodorek Berylu', 'Be + 2H ➔ BeH₂', 'Wybuchowa fala spalania.', ['Be','H','H']);
       enemy.hp -= 800 * forms;
       this.addParticle(enemy.pos, '#10b981', 800, 80);
    }
    // bh3: B + 3H
    if ((a.B || 0) >= 1 && (a.H || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B, a.H/3));
       a.B -= forms; a.H -= forms * 3;
       (a as any).BH3 = ((a as any).BH3 || 0) + forms;
       this.triggerReaction('bh3', 'Boran', 'B + 3H ➔ BH₃', 'Toksyczny gaz wnikający w przeciwników.', ['B','H','H','H']);
       enemy.hp -= 150 * forms;
       enemy.status.dotTimer += 10.0 * forms;
       enemy.status.dotDamage += 70 * forms;
       enemy.status.slowTimer += 4.0 * forms;
       this.addParticle(enemy.pos, '#fbcfe8', 450, 40);
    }
    // b2o3: 2B + 3O
    if ((a.B || 0) >= 2 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B/2, a.O/3));
       a.B -= forms * 2; a.O -= forms * 3;
       (a as any).B2O3 = ((a as any).B2O3 || 0) + forms;
       this.triggerReaction('b2o3', 'Tlenek Boru', '2B + 3O ➔ B₂O₃', 'Szeroka fala rozgrzanego szkła.', ['B','B','O','O','O']);
       enemy.hp -= 900 * forms;
       this.addParticle(enemy.pos, '#fce7f3', 700, 80);
    }
    // bcl3: B + 3Cl
    if ((a.B || 0) >= 1 && (a.Cl || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B, a.Cl/3));
       a.B -= forms; a.Cl -= forms * 3;
       (a as any).BCl3 = ((a as any).BCl3 || 0) + forms;
       this.triggerReaction('bcl3', 'Chlorek Boru', 'B + 3Cl ➔ BCl₃', 'Żrący zielonkawy dym.', ['B','Cl','Cl','Cl']);
       enemy.hp -= 400 * forms;
       enemy.status.slowTimer += 12.0 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 90 * forms;
       this.addParticle(enemy.pos, '#fdf2f8', 600, 60);
    }
    // bn: B + N
    if ((a.B || 0) >= 1 && (a.N || 0) >= 1) {
       const forms = Math.floor(Math.min(a.B, a.N));
       a.B -= forms; a.N -= forms;
       (a as any).BN = ((a as any).BN || 0) + forms;
       this.triggerReaction('bn', 'Azotek Boru', 'B + N ➔ BN', 'Superszybka, ostra struktura.', ['B','N']);
       enemy.hp -= 1500 * forms; // massive single target
       this.addParticle(enemy.pos, '#f9a8d4', 300, 25);
    }
    // c6h12o6: 6C + 12H + 6O
    if ((a.C || 0) >= 6 && (a.H || 0) >= 12 && (a.O || 0) >= 6) {
       const forms = Math.floor(Math.min(a.C/6, a.H/12, a.O/6));
       a.C -= forms * 6; a.H -= forms * 12; a.O -= forms * 6;
       (a as any).C6H12O6 = ((a as any).C6H12O6 || 0) + forms;
       this.triggerReaction('c6h12o6', 'Fruktoza', '6C + 12H + 6O ➔ C₆H₁₂O₆', 'Wielki cukrowy impuls potężnie opóźniający.', ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O','O']);
       enemy.hp -= 1200 * forms;
       enemy.status.slowTimer += 25.0 * forms;
       this.addParticle(enemy.pos, '#fef08a', 900, 100);
    }
    // cellulose: 6C + 10H + 5O (simplified)
    if ((a.C || 0) >= 6 && (a.H || 0) >= 10 && (a.O || 0) >= 5) {
       const forms = Math.floor(Math.min(a.C/6, a.H/10, a.O/5));
       a.C -= forms * 6; a.H -= forms * 10; a.O -= forms * 5;
       (a as any).Cellulose = ((a as any).Cellulose || 0) + forms;
       this.triggerReaction('cellulose', 'Celuloza', '6C + 10H + 5O ➔ (C₆H₁₀O₅)n', 'Ogromny splątany korzeń! Więzi wrogów.', ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O']);
       enemy.hp -= 1500 * forms;
       enemy.status.dotTimer += 20.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#166534', 1000, 120);
    }

    // mgcl2: Mg + 2Cl
    if ((a.Mg || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Mg, a.Cl/2));
       a.Mg -= forms; a.Cl -= forms * 2;
       (a as any).MgCl2 = ((a as any).MgCl2 || 0) + forms;
       this.triggerReaction('mgcl2', 'Chlorek Magnezu', 'Mg + 2Cl ➔ MgCl₂', 'Sól krystaliczna boleśnie drażniąca tkanki.', ['Mg','Cl','Cl']);
       enemy.hp -= 200 * forms;
       enemy.status.slowTimer += 10.0 * forms;
       this.addParticle(enemy.pos, '#ffffff', 250, 40);
    }
    // cacl2: Ca + 2Cl
    if ((a.Ca || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Ca, a.Cl/2));
       a.Ca -= forms; a.Cl -= forms * 2;
       (a as any).CaCl2 = ((a as any).CaCl2 || 0) + forms;
       this.triggerReaction('cacl2', 'Chlorek Wapnia', 'Ca + 2Cl ➔ CaCl₂', 'Potężny środek suszący! Wysysa wilgoć z organizmów.', ['Ca','Cl','Cl']);
       enemy.hp -= 400 * forms;
       enemy.status.dotTimer += 8.0 * forms;
       enemy.status.dotDamage += 120 * forms;
       this.addParticle(enemy.pos, '#cbd5e1', 250, 40);
    }
    // mgo: Mg + O
    if ((a.Mg || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Mg, a.O));
       a.Mg -= forms; a.O -= forms;
       (a as any).MgO = ((a as any).MgO || 0) + forms;
       this.triggerReaction('mgo', 'Tlenek Magnezu', 'Mg + O ➔ MgO', 'Oślepiająco jasny błysk! Dezorientuje cel.', ['Mg','O']);
       enemy.hp -= 800 * forms;
       enemy.status.frozenTimer += 3.0 * forms;
       this.addParticle(enemy.pos, '#ffffff', 400, 60);
    }
    // cao: Ca + O
    if ((a.Ca || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Ca, a.O));
       a.Ca -= forms; a.O -= forms;
       (a as any).CaO = ((a as any).CaO || 0) + forms;
       this.triggerReaction('cao', 'Tlenek Wapnia', 'Ca + O ➔ CaO', 'Wapno palone żrące biologiczne pancerze.', ['Ca','O']);
       enemy.hp -= 500 * forms;
       enemy.status.dotTimer += 8.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#e2e8f0', 300, 50);
    }
    // caoh2: Ca + 2O + 2H
    if ((a.Ca || 0) >= 1 && (a.O || 0) >= 2 && (a.H || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Ca, a.O/2, a.H/2));
       a.Ca -= forms; a.O -= forms * 2; a.H -= forms * 2;
       (a as any).CaOH2 = ((a as any).CaOH2 || 0) + forms;
       this.triggerReaction('caoh2', 'Wodorotlenek Wapnia', 'Ca + 2O + 2H ➔ Ca(OH)₂', 'Silnie zasadowa reakcja gaszenia wapna!', ['Ca','O','O','H','H']);
       enemy.hp -= 1500 * forms;
       enemy.status.slowTimer += 12.0 * forms;
       this.addParticle(enemy.pos, '#f8fafc', 400, 80);
    }
    // kcl: K + Cl
    if ((a.K || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.K, a.Cl));
       a.K -= forms; a.Cl -= forms;
       (a as any).KCl = ((a as any).KCl || 0) + forms;
       this.triggerReaction('kcl', 'Chlorek Potasu', 'K + Cl ➔ KCl', 'Rozerwanie solne uderzające we wroga.', ['K','Cl']);
       enemy.hp -= 600 * forms;
       enemy.status.slowTimer += 4.0 * forms;
       this.addParticle(enemy.pos, '#d8b4fe', 300, 50);
    }
    // koh: K + O + H
    if ((a.K || 0) >= 1 && (a.O || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.K, a.O, a.H));
       a.K -= forms; a.O -= forms; a.H -= forms;
       (a as any).KOH = ((a as any).KOH || 0) + forms;
       this.triggerReaction('koh', 'Wodorotlenek Potasu', 'K + O + H ➔ KOH', 'Absolutnie żrący strzał topiący pancerze.', ['K','O','H']);
       enemy.hp -= 1200 * forms;
       enemy.status.dotTimer += 8.0 * forms;
       enemy.status.dotDamage += 150 * forms;
       this.addParticle(enemy.pos, '#c084fc', 350, 70);
    }
    // p2o5: 2P + 5O
    if ((a.P || 0) >= 2 && (a.O || 0) >= 5) {
       const forms = Math.floor(Math.min(a.P/2, a.O/5));
       a.P -= forms * 2; a.O -= forms * 5;
       (a as any).P2O5 = ((a as any).P2O5 || 0) + forms;
       this.triggerReaction('p2o5', 'Pięciotlenek Fosforu', '2P + 5O ➔ P₂O₅', 'Szybko wysusza wroga na wiór!', ['P','P','O','O','O','O','O']);
       enemy.hp -= 2200 * forms;
       enemy.status.frozenTimer += 2.0 * forms;
       enemy.status.dotTimer += 10.0 * forms;
       enemy.status.dotDamage += 100 * forms;
       this.addParticle(enemy.pos, '#fca5a5', 500, 100);
    }
    // sicl4: Si + 4Cl
    if ((a.Si || 0) >= 1 && (a.Cl || 0) >= 4) {
       const forms = Math.floor(Math.min(a.Si, a.Cl/4));
       a.Si -= forms; a.Cl -= forms * 4;
       (a as any).SiCl4 = ((a as any).SiCl4 || 0) + forms;
       this.triggerReaction('sicl4', 'Tetrachlorek Krzemu', 'Si + 4Cl ➔ SiCl₄', 'Duszący dym tetrachlorku krzemu ograniczający poruszanie się.', ['Si','Cl','Cl','Cl','Cl']);
       enemy.hp -= 700 * forms;
       enemy.status.slowTimer += 15.0 * forms;
       enemy.status.dotTimer += 5.0 * forms;
       enemy.status.dotDamage += 50 * forms;
       this.addParticle(enemy.pos, '#94a3b8', 400, 80);
    }

    // ethanol: 2C + 6H + O
    if ((a.C || 0) >= 2 && (a.H || 0) >= 6 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.C/2, a.H/6, a.O));
       a.C -= forms * 2; a.H -= forms * 6; a.O -= forms;
       (a as any).Ethanol = ((a as any).Ethanol || 0) + forms;
       this.triggerReaction('ethanol', 'C₂H₅OH (Etanol)', '2C + 6H + O ➔ C₂H₅OH', 'Upijająca mgła powodująca losowe ruchy i obrażenia!', ['C','C','H','H','H','H','H','H','O']);
       enemy.hp -= 500 * forms;
       enemy.status.frozenTimer += 1.0 * forms;
       enemy.status.slowTimer += 15.0 * forms;
       this.addParticle(enemy.pos, '#fbcfe8', 300, 50 * forms);
    }

    // vinegar: 2C + 4H + 2O
    if ((a.C || 0) >= 2 && (a.H || 0) >= 4 && (a.O || 0) >= 2) {
       const forms = Math.floor(Math.min(a.C/2, a.H/4, a.O/2));
       a.C -= forms * 2; a.H -= forms * 4; a.O -= forms * 2;
       (a as any).Vinegar = ((a as any).Vinegar || 0) + forms;
       this.triggerReaction('vinegar', 'CH₃COOH (Kwas Octowy)', '2C + 4H + 2O ➔ CH₃COOH', 'Kwaśny zapach pożerający warstwy pancerza.', ['C','C','H','H','H','H','O','O']);
       enemy.hp -= 750 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 60 * forms;
       this.addParticle(enemy.pos, '#fef08a', 400, 80 * forms);
    }

    // combustion: 2C + 6H + 7O (Ethanol + 3O2)
    if ((a.C || 0) >= 2 && (a.H || 0) >= 6 && (a.O || 0) >= 7) {
       const forms = Math.floor(Math.min(a.C/2, a.H/6, a.O/7));
       a.C -= forms * 2; a.H -= forms * 6; a.O -= forms * 7;
       (a as any).Combustion = ((a as any).Combustion || 0) + forms;
       this.triggerReaction('combustion', 'Gwałtowne Utlenianie Etanolu', 'C₂H₅OH + 3O₂ ➔ 2CO₂ + 3H₂O', 'Potężna reaktywna eksploazja utleniająca wszystko dookoła!', ['C','C','H','H','H','H','H','H','O','O','O','O','O','O','O']);
       this.addParticle(enemy.pos, '#f97316', 700, 300 * forms); // orange massive explosion
       this.state.enemies.forEach(other => {
         if (this.distance(enemy.pos, other.pos) < 600) {
           let dmg = 15000 * forms;
           if (['Durian', 'Celery', 'SnakeGourdHead', 'GiantTree', 'Hogweed'].includes(other.type)) {
               dmg *= 1.25;
           }
           other.hp -= dmg;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 500 * forms;
         }
       });
    }

    // C6 Diamond (6C) -> Absolute Stun
    if (a.C >= 6) {
       const forms = Math.floor(a.C/6);
       a.C -= forms * 6;
       (a as any).C6 = ((a as any).C6 || 0) + forms;
       this.triggerReaction('c6', 'Diament', '6C ➔ C₆', 'Najtwardszy materiał tnie wroga, zadając krytyczne obrażenia i ogłuszając.', ['C','C','C','C','C','C']);
       enemy.hp -= 4000 * forms;
       enemy.status.frozenTimer = 10.0 * forms;
       this.addParticle(enemy.pos, '#ffffff', 500, 50);
    }
    
    // C3 Graphite (3C) -> Damage / Slow
    if (a.C >= 3) {
       const forms = Math.floor(a.C/3);
       a.C -= forms * 3;
       (a as any).C3 = ((a as any).C3 || 0) + forms;
       this.triggerReaction('c3', 'Grafit', '3C ➔ C₃', 'Tworzy grafitowy pył wokół celu, rażąc go i spowalniając.', ['C','C','C']);
       enemy.hp -= 800 * forms;
       enemy.status.slowTimer = 8.0 * forms;
       this.addParticle(enemy.pos, '#555555', 300, 30);
    }

    // Fe3C Stal (3Fe, 1C)
    if (a.Fe >= 3 && a.C >= 1) {
       const forms = Math.floor(Math.min(a.Fe/3, a.C));
       a.Fe -= forms * 3; a.C -= forms;
       this.triggerReaction('fe3c', 'Stal (Cementyt)', '3Fe + C ➔ Fe₃C', 'Potężne uderzenie stalą z góry, miażdżące cel.', ['Fe','Fe','Fe','C']);
       this.addParticle(enemy.pos, '#78716c', 300, 50);
       enemy.hp -= 2000 * forms;
       (enemy.status as any).stunTimer = ((enemy.status as any).stunTimer || 0) + 3.0 * forms;
    }

    // Fe2O3 Rdza (2Fe, 3O)
    if (a.Fe >= 2 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.Fe/2, a.O/3));
       a.Fe -= forms * 2; a.O -= forms * 3;
       this.triggerReaction('fe2o3', 'Rdza (Tlenek Żelaza)', '2Fe + 3O ➔ Fe₂O₃', 'Pomarańczowa chmura rdzy. Poważnie spowalnia i uszkadza biologiczne cele zakażeniem.', ['Fe','Fe','O','O','O']);
       enemy.hp -= 200 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 80 * forms;
       enemy.status.slowTimer += 10.0 * forms;
       this.addParticle(enemy.pos, '#ea580c', 400, 40 * forms);
    }

    // FeS2 Piryt (1Fe, 2S)
    if (a.Fe >= 1 && a.S >= 2) {
       const forms = Math.floor(Math.min(a.Fe, a.S/2));
       a.Fe -= forms; a.S -= forms * 2;
       this.triggerReaction('fes', 'Piryt (Złoto Głupców)', 'Fe + 2S ➔ FeS₂', 'Rozrzuca złote iskry uderzając wielokrotnie zadając duże obrażenia!', ['Fe','S','S']);
       enemy.hp -= 900 * forms;
       this.addParticle(enemy.pos, '#facc15', 350, 40 * forms);
       this.state.screenShake = 15;
    }

    // HNO3 Nitric Acid: 1H, 1N, 3O
    if (a.H >= 1 && a.N >= 1 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.H, a.N, a.O/3));
       a.H -= forms; a.N -= forms; a.O -= forms * 3;
       this.triggerReaction('hno3', 'Kwas Azotowy', 'H + N + 3O ➔ HNO₃', 'Silny, żrący kwas azotowy niszczący pancerz mutanta.', ['H','N','O','O','O']);
       enemy.hp -= 450 * forms;
       enemy.status.dotTimer += 8.0 * forms;
       enemy.status.dotDamage += 70 * forms;
       this.addParticle(enemy.pos, '#facc15', 300, 30 * forms);
    }

    // H2CO3 Carbonic acid: 2H, 1C, 3O
    if (a.H >= 2 && a.C >= 1 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.H/2, a.C, a.O/3));
       a.H -= forms * 2; a.C -= forms; a.O -= forms * 3;
       this.triggerReaction('h2co3', 'Kwas Węglowy', '2H + C + 3O ➔ H₂CO₃', 'Bąbelkujący, lekki kwas osłabia wroga i utrudnia ruchy.', ['H','H','C','O','O','O']);
       enemy.hp -= 200 * forms;
       enemy.status.slowTimer += 6.0 * forms;
       enemy.status.dotTimer += 5.0 * forms;
       enemy.status.dotDamage += 40 * forms;
       this.addParticle(enemy.pos, '#38bdf8', 250, 20 * forms);
    }

    // HCN Hydrogen cyanide: 1H, 1C, 1N
    if (a.H >= 1 && a.C >= 1 && a.N >= 1) {
       const forms = Math.floor(Math.min(a.H, a.C, a.N));
       a.H -= forms; a.C -= forms; a.N -= forms;
       this.triggerReaction('hcn', 'Cyjanowodór', 'H + C + N ➔ HCN', 'Zabójcza trucizna. Omijając pancerz bezpośrednio uderza w układ nerwowy.', ['H','C','N']);
       enemy.hp -= 800 * forms;
       enemy.status.frozenTimer += 1.0 * forms;
       this.addParticle(enemy.pos, '#a3e635', 200, 15 * forms);
    }

    // CH4 Methane (1C, 4H) -> Fire Explosion
    if (a.C >= 1 && a.H >= 4) {
       const forms = Math.floor(Math.min(a.C, a.H/4));
       a.C -= forms; a.H -= forms * 4;
       (a as any).CH4 = ((a as any).CH4 || 0) + forms;
       this.triggerReaction('ch4', 'Methane Blast', 'C + 4H ➔ CH₄', 'Wielka ognista eksplozja odrzucająca wrogów.', ['H','H','H','H','C']);
       this.state.screenShake = 20;
       enemy.hp -= 300 * forms;
       this.addParticle(enemy.pos, '#ff4400', 600, 40, 2);
       this.state.enemies.forEach(other => {
         if (other.id !== enemy.id && this.distance(enemy.pos, other.pos) < 300) other.hp -= 200 * forms;
       });
    }

    // NH3 Ammonia (1N, 3H) -> Freeze/Stun
    if (a.N >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.N, a.H/3));
       a.N -= forms; a.H -= forms * 3;
       (a as any).NH3 = ((a as any).NH3 || 0) + forms;
       this.triggerReaction('nh3', 'Ammonia Freeze', 'N + 3H ➔ NH₃', 'Gwałtowne pchnięcie cieplne zamrażające wrogów na kość.', ['H','H','H','N']);
       enemy.status.frozenTimer = 4.0 * forms;
       this.addParticle(enemy.pos, '#00ffff', 200, 20);
    }

    // H2O Water (2H, 1O) -> Accumulates inside enemy, causes rot
    if (a.H >= 2 && a.O >= 1) {
       const formCount = Math.floor(Math.min(a.H / 2, a.O));
       a.H -= formCount * 2; a.O -= formCount;
       (a as any).H2O = ((a as any).H2O || 0) + formCount;
       this.triggerReaction('h2o', 'Woda (Gnicie)', '2H + O ➔ H₂O', 'H₂O kumuluje się w organizmie, powodując gnicie rośliny (obrażenia z czasem wzrastające wraz z ilością H₂O).', ['H','H','O']);
       this.addParticle(enemy.pos, '#ffffff', 500, 50 * formCount);
       this.addParticle(enemy.pos, '#44aaff', 800, 60 * formCount);
       this.state.screenShake = 15;
    }

    // Reaction for Radium + Oxygen (RaO - Radium Oxide / Tlenek Radu)
    if (a.Ra >= 1 && a.O >= 1) {
       const forms = Math.floor(Math.min(a.Ra, a.O));
       a.Ra -= forms; a.O -= forms;
       this.triggerReaction('rao', 'Tlenek Radu (RaO)', 'Ra + O ➔ RaO', 'Radioaktywny bąbel! Niszczy pobliskich wrogów od wewnątrz promieniowaniem fioletowym.', ['Ra','O']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#8b5cf6', 300, 30 * forms); // Purple burst
       this.state.enemies.forEach(other => {
         if (this.distance(enemy.pos, other.pos) < 250) {
           other.hp -= 350 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 60 * forms;
         }
       });
    }

    // Reaction for Polonium + Hydrogen (PoH2 - Polonium Hydride / Wodorek Polonu)
    if (a.Po >= 1 && a.H >= 2) {
       const forms = Math.floor(Math.min(a.Po, a.H/2));
       a.Po -= forms; a.H -= forms * 2;
       this.triggerReaction('poh2', 'Wodorek Polonu (PoH₂)', 'Po + 2H ➔ PoH₂', 'Niewidzialnie śmiercionośny opar, zadający gigantyczne obrażenia wszystkim w okolicy!', ['Po','H','H']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#c026d3', 400, 40 * forms); // Fuchsia burst
       this.state.enemies.forEach(other => {
         if (this.distance(enemy.pos, other.pos) < 350) {
           other.hp -= 500 * forms;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 80 * forms;
         }
       });
    }

    // Reaction for Polonium + Radium + Carbon (Ultra radioactive decay)
    if (a.Po >= 1 && a.Ra >= 1 && a.C >= 1) {
       const forms = Math.floor(Math.min(a.Po, a.Ra, a.C));
       a.Po -= forms; a.Ra -= forms; a.C -= forms;
       this.triggerReaction('porac', 'Krytyczny Rozpad', 'Po + Ra + C ➔ BUM!', 'Bąbel promieniowania! Reakcja łańcuchowa wyniszcza obszar!', ['Po','Ra','C']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#d946ef', 600, 100 * forms); 
       this.state.screenShake += 25;
       this.state.enemies.forEach(other => {
         other.hp -= 1000 * forms;
         other.status.frozenTimer += 5.0 * forms; 
         other.status.dotTimer += 20.0 * forms;
         other.status.dotDamage += 150 * forms;
       });
    }

    // Reaction for Radium + Carbon (RaC2 - Radium Carbide)
    if (a.Ra >= 1 && a.C >= 2) {
       const forms = Math.floor(Math.min(a.Ra, a.C/2));
       a.Ra -= forms; a.C -= forms * 2;
       this.triggerReaction('rac2', 'Węglik Radu (RaC₂)', 'Ra + 2C ➔ RaC₂', 'Maksymalnie ciężki siewca promieniowania unieruchamiający cel na długi czas.', ['Ra','C','C']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#581c87', 400, 40 * forms); 
       enemy.status.frozenTimer += 10.0 * forms;
       enemy.hp -= 400 * forms;
       this.state.screenShake += 10;
    }

    // Reaction for Polonium + Oxygen (PoO2 - Polonium Dioxide)
    if (a.Po >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.Po, a.O/2));
       a.Po -= forms; a.O -= forms * 2;
       this.triggerReaction('poo2', 'Dwutlenek Polonu (PoO₂)', 'Po + 2O ➔ PoO₂', 'Chmura radioaktywnego tlenu wyniszcza otoczenie potężnymi falami gorąca!', ['Po','O','O']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#be185d', 500, 50 * forms); 
       this.state.enemies.forEach(other => {
         if (this.distance(enemy.pos, other.pos) < 300) {
           other.hp -= 600 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }

    // Reaction for Radium + Hydrogen (RaH2 - Radium Hydride)
    if (a.Ra >= 1 && a.H >= 2) {
       const forms = Math.floor(Math.min(a.Ra, a.H/2));
       a.Ra -= forms; a.H -= forms * 2;
       this.triggerReaction('rah2', 'Wodorek Radu (RaH₂)', 'Ra + 2H ➔ RaH₂', 'Wybuchowy radioaktywny gaz, pożerający twarde tkanki wroga.', ['Ra','H','H']);
       this.addParticle({x: enemy.pos.x, y: enemy.pos.y}, '#9333ea', 300, 30 * forms); 
       enemy.hp -= 500 * forms;
       enemy.status.dotTimer += 12.0 * forms;
       enemy.status.dotDamage += 50 * forms;
    }

    // CO2 Carbon Dioxide (1C, 2O) -> Acid Rain DOT
    if (a.C >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.C, a.O/2));
       a.C -= forms; a.O -= forms * 2;
       (a as any).CO2 = ((a as any).CO2 || 0) + forms;
       this.triggerReaction('co2', 'Acid Cloud', 'C + 2O ➔ CO₂', 'Toksyczna i zżerająca wrogów chmura kwasu.', ['O','O','C']);
       enemy.status.dotTimer = 5.0 * forms;
       enemy.status.dotDamage = 30 * forms; // dmg per sec
       this.addParticle(enemy.pos, '#88ff88', 100, 20);
    }

    // NO2 Nitrogen Dioxide (1N, 2O) -> Toxic Gas Slow
    if (a.N >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.N, a.O/2));
       a.N -= forms; a.O -= forms * 2;
       (a as any).NO2 = ((a as any).NO2 || 0) + forms;
       this.triggerReaction('no2', 'Toxic Gas', 'N + 2O ➔ NO₂', 'Gaz duszący wrogów i spowalniający ich ruchy.', ['O','O','N']);
       enemy.status.slowTimer = 5.0 * forms;
       this.addParticle(enemy.pos, '#aa00aa', 150, 20);
    }
    
    // O3 Ozone (3O) -> Chain Lightning
    if (a.O >= 3) {
       const forms = Math.floor(a.O / 3);
       a.O -= forms * 3;
       (a as any).O3 = ((a as any).O3 || 0) + forms;
       this.triggerReaction('o3', 'Ozone Shock', '3O ➔ O₃', 'Skoncentrowane wyładowanie ozonowe. Zamraża i niszczy.', ['O','O','O']);
       enemy.hp -= 250 * forms;
       enemy.status.frozenTimer = 1.0 * forms;
       this.addParticle(enemy.pos, '#ffff00', 300, 15);
    }

    // H2S Hydrogen Sulfide (2H, 1S) -> Toxic Explosion
    if (a.H >= 2 && a.S >= 1) {
       const forms = Math.floor(Math.min(a.H/2, a.S));
       a.H -= forms * 2; a.S -= forms;
       (a as any).H2S = ((a as any).H2S || 0) + forms;
       this.triggerReaction('h2s', 'Siarkowodór', '2H + S ➔ H₂S', 'Eksplozja toksycznego gazu. Poważnie zatruwa i spowalnia cel.', ['H','H','S']);
       enemy.status.dotTimer = 8.0 * forms;
       enemy.status.dotDamage = 50 * forms;
       enemy.status.slowTimer = 4.0 * forms;
       this.addParticle(enemy.pos, '#ccff00', 250, 25);
    }

    // SO2 Sulfur Dioxide (1S, 2O) -> Sticky Slow / Stun
    if (a.S >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.S, a.O/2));
       a.S -= forms; a.O -= forms * 2;
       (a as any).SO2 = ((a as any).SO2 || 0) + forms;
       this.triggerReaction('so2', 'Dwutlenek Siarki', 'S + 2O ➔ SO₂', 'Gęsty dym duszący i niemal całkowicie unieruchamiający wroga.', ['O','O','S']);
       enemy.hp -= 100 * forms;
       enemy.status.frozenTimer = 2.0 * forms;
       this.addParticle(enemy.pos, '#ffaa00', 200, 20);
    }
  }

  private triggerReaction(id: string, name: string, eq: string, desc: string, atoms: string[]) {
       this.state.stats.reactionsCount[id] = (this.state.stats.reactionsCount[id] || 0) + 1;
       
       if (!this.state.unlockedReactions.includes(id)) {
           this.state.unlockedReactions.push(id);
           this.state.reactionDiscovery = {
               active: true,
               name: name,
               equation: eq,
               description: desc,
               atoms
           };
           this.saveGame();
       }
       this.addLog("🔥 " + name + "!");
  }

  private checkProjectileReactions(proj: Projectile) {
    const a = proj.atoms;

    // H2SO4 Sulfuric Acid (2H, 1S, 4O)
    if (a.H >= 2 && a.S >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/2, a.S, a.O/4));
       a.H -= forms * 2; a.S -= forms; a.O -= forms * 4;
       this.triggerReaction('h2so4', 'Kwas Siarkowy', '2H + S + 4O ➔ H₂SO₄', 'Ostateczny, potężny kwas rozpuszczający wszystko na duzym obszarze.', ['H','H','S','O','O','O','O']);
       this.addParticle(proj.pos, '#aaee00', 500, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 500 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage = 100 * forms;
         }
       });
    }

    // H2SO3 Sulfurous Acid (2H, 1S, 3O)
    if (a.H >= 2 && a.S >= 1 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.H/2, a.S, a.O/3));
       a.H -= forms * 2; a.S -= forms; a.O -= forms * 3;
       this.triggerReaction('h2so3', 'Kwas Siarkawy', '2H + S + 3O ➔ H₂SO₃', 'Bardzo krótki, lecz gwałtowny rozkład. Silnie rani w czasie.', ['H','H','S','O','O','O']);
       this.addParticle(proj.pos, '#ccff33', 300, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 300 * forms;
           other.status.dotTimer += 5.0 * forms;
           other.status.dotDamage += 150 * forms;
         }
       });
    }

    // C6 Diamond (6C)
    if (a.C >= 6) {
       const forms = Math.floor(a.C/6);
       a.C -= forms * 6;
       this.triggerReaction('c6', 'Diament', '6C ➔ C₆', 'Ekstremalne ciśnienie stworzyło drobiny diamentu, zadające niszczycielskie obrażenia fizyczne pobliskim celom.', ['C','C','C','C','C','C']);
       this.addParticle(proj.pos, '#ffffff', 500, 30);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 4000 * forms;
           other.status.frozenTimer += 10.0 * forms;
         }
       });
    }

    // C3 Graphite (3C)
    if (a.C >= 3) {
       const forms = Math.floor(a.C/3);
       a.C -= forms * 3;
       this.triggerReaction('c3', 'Grafit', '3C ➔ C₃', 'Tworzy grafitowy pył paraliżujący ruch.', ['C','C','C']);
       this.addParticle(proj.pos, '#555555', 400, 40);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 800 * forms;
           other.status.slowTimer += 8.0 * forms;
         }
       });
    }

    // Fe3C Stal (3Fe, 1C)
    if (a.Fe >= 3 && a.C >= 1) {
       const forms = Math.floor(Math.min(a.Fe/3, a.C));
       a.Fe -= forms * 3; a.C -= forms;
       this.triggerReaction('fe3c', 'Stal (Cementyt)', '3Fe + C ➔ Fe₃C', 'Masywne żelazne odłamki eksplodują we wszystkich kierunkach!', ['Fe','Fe','Fe','C']);
       this.addParticle(proj.pos, '#78716c', 400, 40);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 2000 * forms;
           (other.status as any).stunTimer = ((other.status as any).stunTimer || 0) + 3.0 * forms;
         }
       });
    }

    // Fe2O3 Rdza (2Fe, 3O)
    if (a.Fe >= 2 && a.O >= 3) {
       const forms = Math.floor(Math.min(a.Fe/2, a.O/3));
       a.Fe -= forms * 2; a.O -= forms * 3;
       this.triggerReaction('fe2o3', 'Rdza (Tlenek Żelaza)', '2Fe + 3O ➔ Fe₂O₃', 'Pomarańczowa chmura rdzy. Poważnie spowalnia i uszkadza biologiczne cele zakażeniem.', ['Fe','Fe','O','O','O']);
       this.addParticle(proj.pos, '#ea580c', 400, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 200 * forms;
           other.status.dotTimer += 12.0 * forms;
           other.status.dotDamage += 80 * forms;
           other.status.slowTimer += 10.0 * forms;
         }
       });
    }

    // FeS2 Piryt (1Fe, 2S)
    if (a.Fe >= 1 && a.S >= 2) {
       const forms = Math.floor(Math.min(a.Fe, a.S/2));
       a.Fe -= forms; a.S -= forms * 2;
       this.triggerReaction('fes', 'Piryt (Złoto Głupców)', 'Fe + 2S ➔ FeS₂', 'Rozrzuca złote iskry uderzając wielokrotnie zadając duże obrażenia!', ['Fe','S','S']);
       this.addParticle(proj.pos, '#facc15', 350, 40 * forms);
       this.state.screenShake = 15;
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 900 * forms;
         }
       });
    }

    // CH4 Methane
    if (a.C >= 1 && a.H >= 4) {
       const forms = Math.floor(Math.min(a.C, a.H/4));
       a.C -= forms; a.H -= forms * 4;
       this.triggerReaction('ch4', 'Methane Blast', 'C + 4H ➔ CH₄', 'Potężny wybuch metanu. Zadaje ogromne obrażenia obszarowe wszystkiemu wokoło.', ['C','H','H','H','H']);
       this.state.screenShake = 20;
       this.addParticle(proj.pos, '#ff4400', 600, 40 * forms, 2);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) other.hp -= 200 * forms;
       });
    }

    // NH3 Ammonia
    if (a.N >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.N, a.H/3));
       a.N -= forms; a.H -= forms * 3;
       this.triggerReaction('nh3', 'Ammonia Freeze', 'N + 3H ➔ NH₃', 'Gwałtowne pchnięcie cieplne z otoczenia zamraża amoniakiem pobliskich wrogów.', ['N','H','H','H']);
       this.addParticle(proj.pos, '#00ffff', 250, 30 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) other.status.frozenTimer += 4.0 * forms;
       });
    }

    // H2O Water
    if (a.H >= 2 && a.O >= 1) {
       const forms = Math.floor(Math.min(a.H / 2, a.O));
       a.H -= forms * 2;
       a.O -= forms;
       (a as any).H2O = ((a as any).H2O || 0) + forms;
       proj.type = 'H2O' as any;
       
       if (forms > 0) {
           this.triggerReaction('h2o', 'Woda (Gnicie)', '2H + O ➔ H₂O', 'H₂O obmywa wrogów - złączenie w powietrzu formuje kroplę H₂O, która gnije roślinę po trafieniu.', ['H','H','O']);
           this.state.screenShake = 15;
           this.addParticle(proj.pos, '#ffffff', 500, 50 * forms);
           this.addParticle(proj.pos, '#44aaff', 800, 60 * forms);
       }
    }

    // Formaldehyd C + H2O -> C-H2O
    if (a.C >= 1 && (a as any).H2O >= 1) {
       const forms = Math.floor(Math.min(a.C, (a as any).H2O));
       a.C -= forms;
       (a as any).H2O -= forms;
       proj.type = 'CH2O' as any;
       this.triggerReaction('ch2o', 'Formaldehyd (CH₂O)', 'C + H₂O ➔ CH₂O', 'Trujący i duszący formaldehyd. Uszkadza tkanki wroga.', ['C','H','H','O']);
       this.addParticle(proj.pos, '#a855f7', 400, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 80 * forms;
           other.hp -= 200 * forms;
         }
       });
    }

    // CO2 Acid Cloud
    if (a.C >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.C, a.O/2));
       a.C -= forms; a.O -= forms * 2;
       this.triggerReaction('co2', 'Acid Cloud', 'C + 2O ➔ CO₂', 'Gęsta chmura kwaśna zatruwa wrogów na danym obszarze.', ['C','O','O']);
       this.addParticle(proj.pos, '#88ff88', 150, 20 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.status.dotTimer += 5.0 * forms;
           other.status.dotDamage = 30 * forms;
         }
       });
    }

    // NO2 Toxic Gas
    if (a.N >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.N, a.O/2));
       a.N -= forms; a.O -= forms * 2;
       this.triggerReaction('no2', 'Toxic Gas', 'N + 2O ➔ NO₂', 'Toksyczny gaz upośledza funkcje życiowe i poważnie spowalnia rośliny.', ['N','O','O']);
       this.addParticle(proj.pos, '#aa00aa', 200, 20 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.status.slowTimer += 5.0 * forms;
         }
       });
    }

    // H2S Siarkowodór
    if (a.H >= 2 && a.S >= 1) {
       const forms = Math.floor(Math.min(a.H/2, a.S));
       a.H -= forms * 2; a.S -= forms;
       this.triggerReaction('h2s', 'Siarkowodór', '2H + S ➔ H₂S', 'Eksplozja toksycznego gazu. Poważnie zatruwa i spowalnia cel.', ['H','H','S']);
       this.addParticle(proj.pos, '#ccff00', 300, 30 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage = 50 * forms;
           other.status.slowTimer += 4.0 * forms;
         }
       });
    }

    // SO2 Dwutlenek Siarki
    if (a.S >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.S, a.O/2));
       a.S -= forms; a.O -= forms * 2;
       this.triggerReaction('so2', 'Dwutlenek Siarki', 'S + 2O ➔ SO₂', 'Gęsty dym duszący i niemal całkowicie unieruchamiający bliskich wrogów.', ['S','O','O']);
       this.addParticle(proj.pos, '#ffaa00', 250, 25 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 100 * forms;
           other.status.frozenTimer += 2.0 * forms;
         }
       });
    }

    // SiO2 Silicon Dioxide
    if (a.Si >= 1 && a.O >= 2) {
       const forms = Math.floor(Math.min(a.Si, a.O/2));
       a.Si -= forms; a.O -= forms * 2;
       this.triggerReaction('sio2', 'Krzemionka (Szkło)', 'Si + 2O ➔ SiO₂', 'Tworzy trwałą, ale kruchą barierę, zwalniającą wrogów na ogromnym obszarze.', ['Si','O','O']);
       this.addParticle(proj.pos, '#a5f3fc', 400, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 50 * forms;
           other.status.slowTimer += 10.0 * forms;
          }
        });
       }

    // NCl3
    if (a.N >= 1 && a.Cl >= 3) {
       const forms = Math.floor(Math.min(a.N, a.Cl/3));
       a.N -= forms; a.Cl -= forms * 3;
       this.triggerReaction('ncl3', 'Trójchlorek Azotu', 'N + 3Cl ➔ NCl₃', 'Wielka strefowa eksplozja przy najmniejszym dotyku!', ['N','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#fbbf24', 450, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 350 * forms;
         }
       });
    }
    // PCl5
    if (a.P >= 1 && a.Cl >= 5) {
       const forms = Math.floor(Math.min(a.P, a.Cl/5));
       a.P -= forms; a.Cl -= forms * 5;
       this.triggerReaction('pcl5', 'Pentachlorek Fosforu', 'P + 5Cl ➔ PCl₅', 'Rozprysk potężnej toksyny kwasowej.', ['P','Cl','Cl','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#84cc16', 400, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 200 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }


    // P4
    if (a.P >= 4) {
       const forms = Math.floor(a.P/4);
       a.P -= forms * 4;
       this.triggerReaction('p4', 'Biały Fosfor (Zapalający)', '4P ➔ P₄', 'Obszarowa eksplozja zapalająca wszystko dookoła.', ['P','P','P','P']);
       this.addParticle(proj.pos, '#facc15', 400, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 200 * forms;
           other.status.dotTimer = 10.0 * forms;
           other.status.dotDamage = 80 * forms;
         }
       });
    }
    // PH3
    if (a.P >= 1 && a.H >= 3) {
       const forms = Math.floor(Math.min(a.P, a.H/3));
       a.P -= forms; a.H -= forms * 3;
       this.triggerReaction('ph3', 'Fosforowodór', 'P + 3H ➔ PH₃', 'Eksplozja toksycznego gazu.', ['P','H','H','H']);
       this.addParticle(proj.pos, '#a3e635', 350, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 150 * forms;
           other.status.slowTimer += 4.0 * forms;
         }
       });
    }
    // H3PO4
    if (a.H >= 3 && a.P >= 1 && a.O >= 4) {
       const forms = Math.floor(Math.min(a.H/3, a.P, a.O/4));
       a.H -= forms * 3; a.P -= forms; a.O -= forms * 4;
       this.triggerReaction('h3po4', 'Kwas Fosforowy', '3H + P + 4O ➔ H₃PO₄', 'Eksplozja ortofosforowa zatrzymująca wrogów!', ['H','P','O','O']);
       this.addParticle(proj.pos, '#3b82f6', 300, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 150) {
           other.hp -= 200 * forms;
           other.status.frozenTimer += 5.0 * forms;
         }
       });
    }

    // SiC Karborund
    if (a.Si >= 1 && a.C >= 1) {
       const forms = Math.floor(Math.min(a.Si, a.C));
       a.Si -= forms; a.C -= forms;
       this.triggerReaction('sic', 'Węglik Krzemu', 'Si + C ➔ SiC', 'Tworzy strefę o absurdalnej twardości. Zadaje spore obrażenia i zatrzymuje (zamraża) wrogów na długo.', ['Si','C']);
       this.addParticle(proj.pos, '#334155', 500, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 200 * forms;
           other.status.frozenTimer += 5.0 * forms; // Hard stun
         }
       });
    }

    // Cl2
    if (a.Cl >= 2) {
       const forms = Math.floor(a.Cl/2);
       a.Cl -= forms * 2;
       this.triggerReaction('cl2', 'Chlor (Gaz)', '2Cl ➔ Cl₂', 'Toksyczna chmura zielonego gazu.', ['Cl','Cl']);
       this.addParticle(proj.pos, '#10b981', 350, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 120 * forms;
           other.status.dotTimer = 6.0;
           other.status.dotDamage = 60 * forms;
         }
       });
    }
    // HCl
    if (a.H >= 1 && a.Cl >= 1) {
       const forms = Math.floor(Math.min(a.H, a.Cl));
       a.H -= forms; a.Cl -= forms;
       this.triggerReaction('hcl', 'Kwas Solny', 'H + Cl ➔ HCl', 'Gwałtowny wyrzut kwasu solnego o potężnej sile żrącej!', ['H','Cl']);
       this.addParticle(proj.pos, '#34d399', 200, 30 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 150) {
           other.hp -= 150 * forms;
         }
       });
    }

    // licl: Li + Cl
    if ((a.Li || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li, a.Cl));
       a.Li -= forms; a.Cl -= forms;
       (a as any).LiCl = ((a as any).LiCl || 0) + forms;
       this.triggerReaction('licl', 'Chlorek Litu', 'Li + Cl ➔ LiCl', 'Mocna toksyna.', ['Li','Cl']);
       this.addParticle(proj.pos, '#fbbf24', 400, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 200 * forms;
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage += 60 * forms;
         }
       });
    }
    // lih: Li + H
    if ((a.Li || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li, a.H));
       a.Li -= forms; a.H -= forms;
       (a as any).LiH = ((a as any).LiH || 0) + forms;
       this.triggerReaction('lih', 'Wodorek Litu', 'Li + H ➔ LiH', 'Rozpala cel.', ['Li','H']);
       this.addParticle(proj.pos, '#fda4af', 500, 40 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 250 * forms;
           other.status.dotTimer += 6.0 * forms;
           other.status.dotDamage += 80 * forms;
         }
       });
    }
    // li2o: 2Li + O
    if ((a.Li || 0) >= 2 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Li/2, a.O));
       a.Li -= forms * 2; a.O -= forms;
       (a as any).Li2O = ((a as any).Li2O || 0) + forms;
       this.triggerReaction('li2o', 'Tlenek Litu', '2Li + O ➔ Li₂O', 'Żrący opar.', ['Li','Li','O']);
       this.addParticle(proj.pos, '#dc2626', 600, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 300 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }
    // beo: Be + O
    if ((a.Be || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Be, a.O));
       a.Be -= forms; a.O -= forms;
       (a as any).BeO = ((a as any).BeO || 0) + forms;
       this.triggerReaction('beo', 'Tlenek Berylu', 'Be + O ➔ BeO', 'Twarde szpilki.', ['Be','O']);
       this.addParticle(proj.pos, '#6ee7b7', 500, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 250 * forms;
           other.status.slowTimer += 8.0 * forms;
         }
       });
    }
    // becl2: Be + 2Cl
    if ((a.Be || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Be, a.Cl/2));
       a.Be -= forms; a.Cl -= forms * 2;
       (a as any).BeCl2 = ((a as any).BeCl2 || 0) + forms;
       this.triggerReaction('becl2', 'Chlorek Berylu', 'Be + 2Cl ➔ BeCl₂', 'Rozpuszczająca chmura.', ['Be','Cl','Cl']);
       this.addParticle(proj.pos, '#a3e635', 700, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 500) {
           other.hp -= 400 * forms;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 120 * forms;
           other.status.slowTimer += 10.0 * forms;
         }
       });
    }
    // beh2: Be + 2H
    if ((a.Be || 0) >= 1 && (a.H || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Be, a.H/2));
       a.Be -= forms; a.H -= forms * 2;
       (a as any).BeH2 = ((a as any).BeH2 || 0) + forms;
       this.triggerReaction('beh2', 'Wodorek Berylu', 'Be + 2H ➔ BeH₂', 'Wybuchowa fala spalania.', ['Be','H','H']);
       this.addParticle(proj.pos, '#10b981', 800, 80 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 600) {
           other.hp -= 700 * forms;
         }
       });
    }

    // bh3: B + 3H
    if ((a.B || 0) >= 1 && (a.H || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B, a.H/3));
       a.B -= forms; a.H -= forms * 3;
       (a as any).BH3 = ((a as any).BH3 || 0) + forms;
       this.triggerReaction('bh3', 'Boran', 'B + 3H ➔ BH₃', 'Toksyczny gaz wnikający w przeciwników.', ['B','H','H','H']);
       this.addParticle(proj.pos, '#fbcfe8', 500, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 150 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 50 * forms;
           other.status.slowTimer += 4.0 * forms;
         }
       });
    }

    // b2o3: 2B + 3O
    if ((a.B || 0) >= 2 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B/2, a.O/3));
       a.B -= forms * 2; a.O -= forms * 3;
       (a as any).B2O3 = ((a as any).B2O3 || 0) + forms;
       this.triggerReaction('b2o3', 'Tlenek Boru', '2B + 3O ➔ B₂O₃', 'Szeroka fala rozgrzanego szkła.', ['B','B','O','O','O']);
       this.addParticle(proj.pos, '#fce7f3', 750, 90 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 800 * forms;
         }
       });
    }

    // bcl3: B + 3Cl
    if ((a.B || 0) >= 1 && (a.Cl || 0) >= 3) {
       const forms = Math.floor(Math.min(a.B, a.Cl/3));
       a.B -= forms; a.Cl -= forms * 3;
       (a as any).BCl3 = ((a as any).BCl3 || 0) + forms;
       this.triggerReaction('bcl3', 'Chlorek Boru', 'B + 3Cl ➔ BCl₃', 'Żrący zielonkawy dym.', ['B','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#fdf2f8', 650, 70 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 350 * forms;
           other.status.dotTimer += 12.0 * forms;
           other.status.dotDamage += 70 * forms;
           other.status.slowTimer += 12.0 * forms;
         }
       });
    }

    // bn: B + N
    if ((a.B || 0) >= 1 && (a.N || 0) >= 1) {
       const forms = Math.floor(Math.min(a.B, a.N));
       a.B -= forms; a.N -= forms;
       (a as any).BN = ((a as any).BN || 0) + forms;
       this.triggerReaction('bn', 'Azotek Boru', 'B + N ➔ BN', 'Superszybka, ostra struktura.', ['B','N']);
       this.addParticle(proj.pos, '#f9a8d4', 350, 30 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 150) {
           other.hp -= 1200 * forms;
         }
       });
    }

    // c6h12o6: 6C + 12H + 6O
    if ((a.C || 0) >= 6 && (a.H || 0) >= 12 && (a.O || 0) >= 6) {
       const forms = Math.floor(Math.min(a.C/6, a.H/12, a.O/6));
       a.C -= forms * 6; a.H -= forms * 12; a.O -= forms * 6;
       (a as any).C6H12O6 = ((a as any).C6H12O6 || 0) + forms;
       this.triggerReaction('c6h12o6', 'Fruktoza', '6C + 12H + 6O ➔ C₆H₁₂O₆', 'Wielki cukrowy impuls potężnie opóźniający.', ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O','O']);
       this.addParticle(proj.pos, '#fef08a', 800, 150 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 500) {
           other.hp -= 800 * forms;
           other.status.slowTimer += 25.0 * forms;
         }
       });
    }

    // kno3: K + N + 3O
    if ((a.K || 0) >= 1 && (a.N || 0) >= 1 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.K, a.N, a.O/3));
       a.K -= forms; a.N -= forms; a.O -= forms * 3;
       (a as any).KNO3 = ((a as any).KNO3 || 0) + forms;
       this.triggerReaction('kno3', 'Saletra Potasowa', 'K + N + 3O ➔ KNO₃', 'Składnik prochu. Obszarowy wybuch nawozowy!', ['K','N','O','O','O']);
       this.addParticle(proj.pos, '#c084fc', 800, 120 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 1500 * forms;
         }
       });
    }

    // caco3: Ca + C + 3O
    if ((a.Ca || 0) >= 1 && (a.C || 0) >= 1 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Ca, a.C, a.O/3));
       a.Ca -= forms; a.C -= forms; a.O -= forms * 3;
       (a as any).CaCO3 = ((a as any).CaCO3 || 0) + forms;
       this.triggerReaction('caco3', 'Węglan Wapnia', 'Ca + C + 3O ➔ CaCO₃', 'Skalista chmura miażdżąca z pancerzy wrogów.', ['Ca','C','O','O','O']);
       this.addParticle(proj.pos, '#e2e8f0', 700, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 800 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 40 * forms;
         }
       });
    }

    // chlorophyll: 55C + 72H + 4N + 5O + Mg
    if ((a.C || 0) >= 55 && (a.H || 0) >= 72 && (a.N || 0) >= 4 && (a.O || 0) >= 5 && (a.Mg || 0) >= 1) {
       const forms = Math.floor(Math.min(a.C/55, a.H/72, a.N/4, a.O/5, a.Mg));
       a.C -= forms * 55; a.H -= forms * 72; a.N -= forms * 4; a.O -= forms * 5; a.Mg -= forms;
       (a as any).Chlorophyll = ((a as any).Chlorophyll || 0) + forms;
       this.triggerReaction('chlorophyll', 'Chlorofil A', '55C + 72H + 4N + 5O + Mg ➔ Chlorofil', 'Reakcja fotosyntezy! Wielka wiązka czystego światła.', ['Mg','N','N','N','N','O','C','C','C','H','H','H']);
       this.addParticle(proj.pos, '#4ade80', 1000, 300 * forms);
       this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + 500 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 600) {
           other.hp -= 2000 * forms;
           other.status.frozenTimer += 10.0 * forms;
         }
       });
    }

    // cellulose: 6C + 10H + 5O
    if ((a.C || 0) >= 6 && (a.H || 0) >= 10 && (a.O || 0) >= 5) {
       const forms = Math.floor(Math.min(a.C/6, a.H/10, a.O/5));
       a.C -= forms * 6; a.H -= forms * 10; a.O -= forms * 5;
       (a as any).Cellulose = ((a as any).Cellulose || 0) + forms;
       this.triggerReaction('cellulose', 'Celuloza', '6C + 10H + 5O ➔ (C₆H₁₀O₅)n', 'Ogromny splątany korzeń! Więzi wrogów.', ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O']);
       this.addParticle(proj.pos, '#166534', 850, 160 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 450) {
           other.hp -= 1000 * forms;
           other.status.dotTimer += 20.0 * forms;
           other.status.dotDamage += 80 * forms;
         }
       });
    }

    // ethanol: 2C + 6H + O
    if ((a.C || 0) >= 2 && (a.H || 0) >= 6 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.C/2, a.H/6, a.O));
       a.C -= forms * 2; a.H -= forms * 6; a.O -= forms;
       (a as any).Ethanol = ((a as any).Ethanol || 0) + forms;
       this.triggerReaction('ethanol', 'C₂H₅OH (Etanol)', '2C + 6H + O ➔ C₂H₅OH', 'Upijająca mgła powodująca losowe ruchy i obrażenia!', ['C','C','H','H','H','H','H','H','O']);
       this.addParticle(proj.pos, '#fbcfe8', 400, 80 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 400 * forms;
           other.status.frozenTimer += 1.0 * forms;
           other.status.slowTimer += 15.0 * forms;
         }
       });
    }

    // vinegar: 2C + 4H + 2O
    if ((a.C || 0) >= 2 && (a.H || 0) >= 4 && (a.O || 0) >= 2) {
       const forms = Math.floor(Math.min(a.C/2, a.H/4, a.O/2));
       a.C -= forms * 2; a.H -= forms * 4; a.O -= forms * 2;
       (a as any).Vinegar = ((a as any).Vinegar || 0) + forms;
       this.triggerReaction('vinegar', 'CH₃COOH (Kwas Octowy)', '2C + 4H + 2O ➔ CH₃COOH', 'Kwaśny zapach pożerający warstwy pancerza.', ['C','C','H','H','H','H','O','O']);
       this.addParticle(proj.pos, '#fef08a', 500, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 700 * forms;
           other.status.dotTimer += 12.0 * forms;
           other.status.dotDamage += 60 * forms;
         }
       });
    }

    // combustion: 2C + 6H + 7O (Ethanol + 3O2)
    if ((a.C || 0) >= 2 && (a.H || 0) >= 6 && (a.O || 0) >= 7) {
       const forms = Math.floor(Math.min(a.C/2, a.H/6, a.O/7));
       a.C -= forms * 2; a.H -= forms * 6; a.O -= forms * 7;
       (a as any).Combustion = ((a as any).Combustion || 0) + forms;
       this.triggerReaction('combustion', 'Gwałtowne Utlenianie Etanolu', 'C₂H₅OH + 3O₂ ➔ 2CO₂ + 3H₂O', 'Potężna reaktywna eksploazja utleniająca wszystko dookoła!', ['C','C','H','H','H','H','H','H','O','O','O','O','O','O','O']);
       this.addParticle(proj.pos, '#f97316', 700, 300 * forms); // orange massive explosion
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 600) {
           let dmg = 15000 * forms;
           // Deal massively more damage to specific organic things
           if (['Durian', 'Celery', 'SnakeGourdHead', 'GiantTree', 'Hogweed'].includes(other.type)) {
               dmg *= 1.25; // Slight bonus to organic bosses
           }
           other.hp -= dmg;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 500 * forms;
         }
       });
    }

    // mgcl2: Mg + 2Cl
    if ((a.Mg || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Mg, a.Cl/2));
       a.Mg -= forms; a.Cl -= forms * 2;
       this.triggerReaction('mgcl2', 'Chlorek Magnezu', 'Mg + 2Cl ➔ MgCl₂', 'Rozpryskująca się sól krystaliczna spowalniająca wrogów.', ['Mg','Cl','Cl']);
       this.addParticle(proj.pos, '#ffffff', 300, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 300 * forms;
           other.status.slowTimer += 10.0 * forms;
         }
       });
    }

    // cacl2: Ca + 2Cl
    if ((a.Ca || 0) >= 1 && (a.Cl || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Ca, a.Cl/2));
       a.Ca -= forms; a.Cl -= forms * 2;
       this.triggerReaction('cacl2', 'Chlorek Wapnia', 'Ca + 2Cl ➔ CaCl₂', 'Potężny środek suszący! Wysysa wilgoć z organizmów.', ['Ca','Cl','Cl']);
       this.addParticle(proj.pos, '#cbd5e1', 350, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 600 * forms;
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage += 120 * forms;
         }
       });
    }

    // mgo: Mg + O
    if ((a.Mg || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Mg, a.O));
       a.Mg -= forms; a.O -= forms;
       this.triggerReaction('mgo', 'Tlenek Magnezu', 'Mg + O ➔ MgO', 'Oślepiająco jasny błysk spalającego się magnezu!', ['Mg','O']);
       this.addParticle(proj.pos, '#ffffff', 600, 150 * forms);
       this.state.screenShake = 30;
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 1500 * forms;
           other.status.frozenTimer += 4.0 * forms;
         }
       });
    }

    // cao: Ca + O
    if ((a.Ca || 0) >= 1 && (a.O || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Ca, a.O));
       a.Ca -= forms; a.O -= forms;
       this.triggerReaction('cao', 'Tlenek Wapnia (Wapno Palone)', 'Ca + O ➔ CaO', 'Chmura wapna palonego żrąca biologiczne pancerze.', ['Ca','O']);
       this.addParticle(proj.pos, '#e2e8f0', 400, 70 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 800 * forms;
           other.status.dotTimer += 10.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }

    // caoh2: Ca + 2O + 2H
    if ((a.Ca || 0) >= 1 && (a.O || 0) >= 2 && (a.H || 0) >= 2) {
       const forms = Math.floor(Math.min(a.Ca, a.O/2, a.H/2));
       a.Ca -= forms; a.O -= forms * 2; a.H -= forms * 2;
       this.triggerReaction('caoh2', 'Wodorotlenek Wapnia', 'Ca + 2O + 2H ➔ Ca(OH)₂', 'Silnie zasadowa reakcja gaszenia wapna (lasowanie)!', ['Ca','O','O','H','H']);
       this.addParticle(proj.pos, '#f8fafc', 500, 200 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 2000 * forms;
           other.status.slowTimer += 12.0 * forms;
         }
       });
    }

    // kcl: K + Cl
    if ((a.K || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.K, a.Cl));
       a.K -= forms; a.Cl -= forms;
       this.triggerReaction('kcl', 'Chlorek Potasu', 'K + Cl ➔ KCl', 'Rozerwanie solne, dezorientujące wrogów szarpnięciem.', ['K','Cl']);
       this.addParticle(proj.pos, '#d8b4fe', 300, 50 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 200) {
           other.hp -= 400 * forms;
           other.status.slowTimer += 5.0 * forms;
         }
       });
    }

    // koh: K + O + H
    if ((a.K || 0) >= 1 && (a.O || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.K, a.O, a.H));
       a.K -= forms; a.O -= forms; a.H -= forms;
       this.triggerReaction('koh', 'Wodorotlenek Potasu (Kaustyczny)', 'K + O + H ➔ KOH', 'Absolutnie żrący strzał topiący pancerze.', ['K','O','H']);
       this.addParticle(proj.pos, '#c084fc', 450, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 1800 * forms;
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage += 300 * forms;
         }
       });
    }

    // p2o5: 2P + 5O
    if ((a.P || 0) >= 2 && (a.O || 0) >= 5) {
       const forms = Math.floor(Math.min(a.P/2, a.O/5));
       a.P -= forms * 2; a.O -= forms * 5;
       this.triggerReaction('p2o5', 'Pięciotlenek Fosforu', '2P + 5O ➔ P₂O₅', 'Wybuchowy desykant! Całkowicie wysusza i dezintegruje wrogów na obszarze.', ['P','P','O','O','O','O','O']);
       this.addParticle(proj.pos, '#fca5a5', 550, 200 * forms);
       this.state.screenShake = 10;
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 450) {
           other.hp -= 3500 * forms;
           other.status.frozenTimer += 3.0 * forms;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }

    // sicl4: Si + 4Cl
    if ((a.Si || 0) >= 1 && (a.Cl || 0) >= 4) {
       const forms = Math.floor(Math.min(a.Si, a.Cl/4));
       a.Si -= forms; a.Cl -= forms * 4;
       this.triggerReaction('sicl4', 'Tetrachlorek Krzemu', 'Si + 4Cl ➔ SiCl₄', 'Duszący dym tetrachlorku krzemu ograniczający poruszanie się.', ['Si','Cl','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#94a3b8', 500, 120 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 900 * forms;
           other.status.slowTimer += 15.0 * forms;
           other.status.dotTimer += 5.0 * forms;
           other.status.dotDamage += 50 * forms;
         }
       });
    }

    // nacl: Na + Cl
    if ((a.Na || 0) >= 1 && (a.Cl || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Na, a.Cl));
       a.Na -= forms; a.Cl -= forms;
       this.triggerReaction('nacl', 'NaCl (Chlorek Sodu)', 'Na + Cl ➔ NaCl', 'Ogromny, trzeszczący ładunek soli!', ['Na','Cl']);
       this.addParticle(proj.pos, '#f8fafc', 350, 60 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 250) {
           other.hp -= 400 * forms;
           other.status.dotTimer += 8.0 * forms;
           other.status.dotDamage += 80 * forms;
         }
       });
    }

    // naoh: Na + O + H
    if ((a.Na || 0) >= 1 && (a.O || 0) >= 1 && (a.H || 0) >= 1) {
       const forms = Math.floor(Math.min(a.Na, a.O, a.H));
       a.Na -= forms; a.O -= forms; a.H -= forms;
       this.triggerReaction('naoh', 'NaOH (Wodorotlenek Sodu)', 'Na + O + H ➔ NaOH', 'Silnie kaustyczna para sodowa!', ['Na','O','H']);
       this.addParticle(proj.pos, '#cbd5e1', 400, 80 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 300) {
           other.hp -= 1000 * forms;
           other.status.dotTimer += 12.0 * forms;
           other.status.dotDamage += 150 * forms;
         }
       });
    }

    // nahco3: Na + H + C + 3O
    if ((a.Na || 0) >= 1 && (a.H || 0) >= 1 && (a.C || 0) >= 1 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Na, a.H, a.C, a.O/3));
       a.Na -= forms; a.H -= forms; a.C -= forms; a.O -= forms * 3;
       this.triggerReaction('nahco3', 'NaHCO₃ (Soda Oczyszczona)', 'Na + H + C + 3O ➔ NaHCO₃', 'Gazująca chmura osłabiająca wrogów!', ['Na','H','C','O','O','O']);
       this.addParticle(proj.pos, '#fef08a', 450, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 600 * forms;
           other.status.slowTimer += 12.0 * forms;
         }
       });
    }

    // al2o3: 2Al + 3O
    if ((a.Al || 0) >= 2 && (a.O || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Al/2, a.O/3));
       a.Al -= forms * 2; a.O -= forms * 3;
       this.triggerReaction('al2o3', 'Al₂O₃ (Korund)', '2Al + 3O ➔ Al₂O₃', 'Masywny potężny kryształ niszczący masą.', ['Al','Al','O','O','O']);
       this.addParticle(proj.pos, '#94a3b8', 600, 150 * forms);
       this.state.screenShake = 20;
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 400) {
           other.hp -= 3000 * forms;
           other.status.frozenTimer += 5.0 * forms;
         }
       });
    }

    // alcl3: Al + 3Cl
    if ((a.Al || 0) >= 1 && (a.Cl || 0) >= 3) {
       const forms = Math.floor(Math.min(a.Al, a.Cl/3));
       a.Al -= forms; a.Cl -= forms * 3;
       this.triggerReaction('alcl3', 'AlCl₃ (Chlorek Glinu)', 'Al + 3Cl ➔ AlCl₃', 'Zagęszczająca kwasowa mgła!', ['Al','Cl','Cl','Cl']);
       this.addParticle(proj.pos, '#64748b', 500, 100 * forms);
       this.state.enemies.forEach(other => {
         if (this.distance(proj.pos, other.pos) < 350) {
           other.hp -= 1200 * forms;
           other.status.dotTimer += 15.0 * forms;
           other.status.dotDamage += 100 * forms;
         }
       });
    }

     // hf: H + F
     if ((a.H || 0) >= 1 && (a.F || 0) >= 1) {
        const forms = Math.floor(Math.min(a.H, a.F));
        a.H -= forms; a.F -= forms;
        this.triggerReaction('hf', 'Kwas Fluorowodorowy (HF)', 'H + F ➔ HF', 'Smaruje silnie żrący kwas korozyjny, rozpuszczający pancerze krzemowe i zadający ogromne rany.', ['H','F']);
        this.addParticle(proj.pos, '#bef264', 350, 80 * forms);
        this.state.enemies.forEach(other => {
          if (this.distance(proj.pos, other.pos) < 250) {
            let dmg = 1500 * forms;
            let isSilicon = other.type && (
              other.type.toString().includes('Si') || 
              other.type.toString().includes('Cactus') || 
              other.type.toString().includes('Sand') || 
              other.type.toString().includes('Wall')
            );
            if (isSilicon) {
               dmg *= 2.5;
            }
            other.hp -= dmg;
            other.status.dotTimer += 12.0 * forms;
            other.status.dotDamage += 160 * forms;
          }
        });
     }

     // cf4: C + 4F
     if ((a.C || 0) >= 1 && (a.F || 0) >= 4) {
        const forms = Math.floor(Math.min(a.C, a.F/4));
        a.C -= forms; a.F -= forms * 4;
        this.triggerReaction('cf4', 'Kryogeniczny Freon-14', 'C + 4F ➔ CF₄', 'Super stabilny gaz kriogeniczny. Unieruchamia i zamraża twardym lodem wszystkich wrogów na dużym obszarze.', ['C','F','F','F','F']);
        this.addParticle(proj.pos, '#22d3ee', 450, 120 * forms);
        this.state.enemies.forEach(other => {
          if (this.distance(proj.pos, other.pos) < 320) {
            other.hp -= 1000 * forms;
            other.status.frozenTimer += 7.0 * forms;
          }
        });
     }

     // naf: Na + F
     if ((a.Na || 0) >= 1 && (a.F || 0) >= 1) {
        const forms = Math.floor(Math.min(a.Na, a.F));
        a.Na -= forms; a.F -= forms;
        this.triggerReaction('naf', 'Fluorek Sodu', 'Na + F ➔ NaF', 'Zasadowa sól i trucizna biologiczna. Paraliżuje i silnie zatruwa mutanta raniąc go z czasem powracającym DoT.', ['Na','F']);
        this.addParticle(proj.pos, '#a3e635', 380, 70 * forms);
        this.state.enemies.forEach(other => {
          if (this.distance(proj.pos, other.pos) < 260) {
            other.hp -= 1200 * forms;
            other.status.dotTimer += 10.0 * forms;
            other.status.dotDamage += 150 * forms;
            other.status.frozenTimer += 2.0 * forms;
          }
        });
     }

     // alf3: Al + 3F
     if ((a.Al || 0) >= 1 && (a.F || 0) >= 3) {
        const forms = Math.floor(Math.min(a.Al, a.F/3));
        a.Al -= forms; a.F -= forms * 3;
        this.triggerReaction('alf3', 'Trójfluorek Glinu (Shrapnel)', 'Al + 3F ➔ AlF₃', 'Niezwykle gęste szkło fluorowe. Zadaje potężne obrażenia fizyczne, rozpadając się na 6 raniących wokół odłamków!', ['Al','F','F','F']);
        this.addParticle(proj.pos, '#f1f5f9', 400, 100 * forms);
        this.state.enemies.forEach(other => {
          if (this.distance(proj.pos, other.pos) < 280) {
            other.hp -= 2500 * forms;
          }
        });
        // SPARK REAL PROJECTILES! This is incredibly interactive and fun!
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          this.state.projectiles.push({
            id: Date.now() + Math.random(),
            pos: { x: proj.pos.x, y: proj.pos.y },
            vel: { x: Math.cos(angle) * 550, y: Math.sin(angle) * 550 },
            type: 'F' as any,
            atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, F: 1, Na: 0, Al: 0, Fe: 0 },
            radius: 5,
            damage: 300,
            life: 1.2
          });
        }
     }

     // fef3: Fe + 3F
     if ((a.Fe || 0) >= 1 && (a.F || 0) >= 3) {
        const forms = Math.floor(Math.min(a.Fe, a.F/3));
        a.Fe -= forms; a.F -= forms * 3;
        this.triggerReaction('fef3', 'Fluorek Żelaza(III)', 'Fe + 3F ➔ FeF₃', 'Metaliczny magnetyczny kryształ przyciągający grawitacyjnie pobliskich wrogów do epicentrum i raniący ich implozją.', ['Fe','F','F','F']);
        this.addParticle(proj.pos, '#f59e0b', 450, 110 * forms);
        
        // Dynamic pulling effect: pull all nearby enemies!
        this.state.enemies.forEach(other => {
          const dist = this.distance(proj.pos, other.pos);
          if (dist < 320) {
            const pullForce = (320 - dist) / 320;
            const dirX = (proj.pos.x - other.pos.x) / (dist || 1);
            const dirY = (proj.pos.y - other.pos.y) / (dist || 1);
            other.pos.x += dirX * 120 * pullForce;
            other.pos.y += dirY * 120 * pullForce;
            other.hp -= 2000 * forms;
            other.status.slowTimer += 4.0;
          }
        });
     }

     // thermite: 2Al + 2Fe + 3O
     if ((a.Al || 0) >= 2 && (a.Fe || 0) >= 2 && (a.O || 0) >= 3) {
        const forms = Math.floor(Math.min(a.Al/2, a.Fe/2, a.O/3));
        a.Al -= forms * 2; a.Fe -= forms * 2; a.O -= forms * 3;
        this.triggerReaction('thermite', 'Reakcja Termitowa', '2Al + 2Fe + 3O ➔ Termit', 'Niewyobrażalnie gorący wybuch o temperaturze 2500 °C! Gwałtowne utlenianie glinu spopiela pancerze i tkanki wokół.', ['Al','Al','Fe','Fe','O','O','O']);
        this.addParticle(proj.pos, '#f97316', 800, 300 * forms, 3); // Super bright orange-white shockwave
        this.state.screenShake = 30;
        this.state.enemies.forEach(other => {
          if (this.distance(proj.pos, other.pos) < 480) {
            other.hp -= 15000 * forms;
            other.status.dotTimer += 15.0 * forms;
            other.status.dotDamage += 400 * forms;
          }
        });
     }

     // sodium_water: 2Na + 2H + O
     if ((a.Na || 0) >= 2 && (a.H || 0) >= 2 && (a.O || 0) >= 1) {
         const forms = Math.floor(Math.min(a.Na/2, a.H/2, a.O));
         a.Na -= forms * 2; a.H -= forms * 2; a.O -= forms;
         this.triggerReaction('sodium_water', 'Eksplozja Sodu z Wodą', '2Na + 2H + O ➔ Eksplozja', 'Gwałtowany kontakt sodu z wodą wywołuje alkaliczny wybuch niszczący otoczenie żrącym wodorotlenkiem sodu.', ['Na','Na','H','H','O']);
         this.addParticle(proj.pos, '#38bdf8', 600, 200 * forms, 2); // sodium fire
         this.state.screenShake = 20;
         this.state.enemies.forEach(other => {
           if (this.distance(proj.pos, other.pos) < 380) {
             other.hp -= 8000 * forms;
             other.status.dotTimer += 10.0 * forms;
             other.status.dotDamage += 200 * forms;
             other.status.slowTimer += 6.0 * forms;
           }
         });
     }

     // neonium: Ne + H
     if ((a.Ne || 0) >= 1 && (a.H || 0) >= 1) {
         const forms = Math.floor(Math.min(a.Ne, a.H));
         a.Ne -= forms; a.H -= forms;
         this.triggerReaction('neonium', 'Superkwas Neoniowy (NeH⁺)', 'Ne + H ➔ NeH⁺', 'Niezwykle silny i ekstremalnie żrący superkwas, który natychmiast rozpuszcza pancerze organiczne i metalowe wrogów zadając im gigantyczne obrażenia.', ['Ne','H']);
         this.addParticle(proj.pos, '#f43f5e', 700, 150 * forms, 2.5); // glowing rose-pink neon flare
         this.state.screenShake = 10;
         this.state.enemies.forEach(other => {
           if (this.distance(proj.pos, other.pos) < 300) {
             other.hp -= 4200 * forms;
             other.status.dotTimer += 12.0 * forms;
             other.status.dotDamage += 350 * forms;
             other.status.slowTimer += 4.0 * forms;
           }
         });
     }

    let remainingAtoms = 0;
    for (const v of Object.values(a)) {
        if (typeof v === 'number') {
            remainingAtoms += v;
        }
    }
    
    if (remainingAtoms <= 0) {
        proj.life = 0; 
 
    } else {
        if ((a as any).H2O > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'H2O' as any;
        else if ((a as any).CH4 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'CH4' as any;
        else if ((a as any).NH3 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'NH3' as any;
        else if ((a as any).CO2 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'CO2' as any;
        else if ((a as any).NO2 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'NO2' as any;
        else if ((a as any).H2S > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'H2S' as any;
        else if ((a as any).SO2 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'SO2' as any;
        else if ((a as any).H2SO4 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'H2SO4' as any;
        else if ((a as any).SiO2 > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'SiO2' as any;
        else if ((a as any).SiC > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'SiC' as any;
        else if ((a as any).NaCl > 0) proj.type = 'NACL' as any;
        else if ((a as any).NaOH > 0) proj.type = 'NAOH' as any;
        else if ((a as any).NaHCO3 > 0) proj.type = 'NAHCO3' as any;
        else if ((a as any).Al2O3 > 0) proj.type = 'AL2O3' as any;
        else if ((a as any).AlCl3 > 0) proj.type = 'ALCL3' as any;
        else if ((a as any).HF > 0) proj.type = 'HF' as any;
        else if ((a as any).CF4 > 0) proj.type = 'CF4' as any;
        else if ((a as any).NaF > 0) proj.type = 'NaF' as any;
        else if ((a as any).AlF3 > 0) proj.type = 'AlF3' as any;
        else if ((a as any).FeF3 > 0) proj.type = 'FeF3' as any;
        else if ((a as any).Thermite > 0) proj.type = 'Thermite' as any;
        else if ((a as any).SodiumWater > 0) proj.type = 'SodiumWater' as any;
        else if ((a as any).NeH > 0) proj.type = 'NeH' as any;
        else if (a.H > 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'H';
        else if (a.O > 0 && a.H === 0 && a.C === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'O';
        else if (a.C > 0 && a.H === 0 && a.O === 0 && a.N === 0 && a.S === 0 && a.Si === 0) proj.type = 'C';
        else if (a.N > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.S === 0 && a.Si === 0) proj.type = 'N';
        else if (a.S > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.Si === 0) proj.type = 'S';
        else if (a.Si > 0 && a.H === 0 && a.O === 0 && a.C === 0 && a.N === 0 && a.S === 0) proj.type = 'Si';
        else if (a.F > 0) proj.type = 'F' as any;
        else if (a.Ne > 0) proj.type = 'Ne' as any;
        else if (a.Na > 0) proj.type = 'Na' as any;
        else if (a.Al > 0) proj.type = 'Al' as any;
        else if (a.Fe > 0) proj.type = 'Fe' as any;
        else proj.type = 'Molecule';
    }
  }

  public releaseOrbitingProjectiles() {
    this.state.projectiles.forEach(p => {
      if (p.isOrbiting) {
        p.isOrbiting = false;
        const angle = p.orbitAngle || Math.random() * Math.PI * 2;
        p.vel.x = Math.cos(angle) * 600;
        p.vel.y = Math.sin(angle) * 600;
        p.life = 3.0; // Fly for 3 seconds then dissolve
      }
    });
  }

  private updateCompanion(dt: number) {
      if (!this.state.companion) return;
      const p = this.state.player;
      
      const companionTypes: any = {
          'ginger_cat': { color: '#fb923c', element: 'C', damageMult: 1.0, fireRate: 0.6, bulletSpeed: 400 },
          'black_cat': { color: '#334155', element: 'H', damageMult: 0.8, fireRate: 0.4, bulletSpeed: 600 },
          'bohr_cat': { color: '#60a5fa', element: 'N', damageMult: 1.2, fireRate: 0.8, bulletSpeed: 300 },
          'curie_cat': { color: '#a78bfa', element: 'Ra', damageMult: 1.5, fireRate: 1.0, bulletSpeed: 350 },
          'schrodinger_cat': { color: '#fcd34d', element: 'S', damageMult: 2.0, fireRate: 1.5, bulletSpeed: 250 }
      };
      
      const compInfo = companionTypes[this.state.companion] || companionTypes['ginger_cat'];
      
      (this.state as any).companionFireTimer = ((this.state as any).companionFireTimer || 0) - dt;
      if ((this.state as any).companionFireTimer <= 0) {
          (this.state as any).companionFireTimer = compInfo.fireRate * 4.0;
          
          let nearest = null;
          let minDist = 600;
          for(const enemy of this.state.enemies) {
              const d = this.distance(p.pos, enemy.pos);
              if (d < minDist && enemy.hp > 0 && !['C3Wall', 'C6Wall', 'WoodWall'].includes(enemy.type)) {
                  minDist = d;
                  nearest = enemy;
              }
          }
          
          if (nearest) {
              const compX = p.pos.x + Math.cos(performance.now()/500)*40;
              const compY = p.pos.y + Math.sin(performance.now()/500)*40;
              const angle = Math.atan2(nearest.pos.y - compY, nearest.pos.x - compX);
              const atoms: any = { H:0, O:0, C:0, N:0, S:0, Si:0, Ra:0, Po:0 };
              atoms[compInfo.element] = 1;
              
              let nextId = Date.now() + Math.random();
              this.state.projectiles.push({
                  id: nextId,
                  pos: { x: compX, y: compY },
                  vel: { x: Math.cos(angle)*compInfo.bulletSpeed, y: Math.sin(angle)*compInfo.bulletSpeed },
                  type: compInfo.element as any,
                  atoms: atoms,
                  radius: 12,
                  damage: 50 * compInfo.damageMult * (1 + this.state.level * 0.8),
                  life: 2.0
              });
          }
      }
  }

  private updateProjectiles(dt: number) {
    // Cap total projectiles to 100 for high performance
    if (this.state.projectiles.length > 100) {
        this.state.projectiles.splice(0, this.state.projectiles.length - 100);
    }

    let projSpeedMod = 1.0;
    if (this.state.difficulty === 'kids') projSpeedMod = 0.25;
    if (this.state.difficulty === 'easy') projSpeedMod = 0.6;
    if (this.state.difficulty === 'hard') projSpeedMod = 1.2;

    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      let pSpeedX = proj.vel.x;
      let pSpeedY = proj.vel.y;
      
      if (proj.type === 'EnemyBullet') {
          pSpeedX *= projSpeedMod;
          pSpeedY *= projSpeedMod;
      }
      
      if (proj.isOrbiting) {
          if (proj.orbitAngle === undefined) proj.orbitAngle = Math.random() * Math.PI * 2;
          if (proj.orbitRadius === undefined) proj.orbitRadius = 60;
          proj.orbitAngle += 2.5 * dt;
          proj.pos.x = this.state.player.pos.x + Math.cos(proj.orbitAngle) * proj.orbitRadius;
          proj.pos.y = this.state.player.pos.y + Math.sin(proj.orbitAngle) * proj.orbitRadius;
          proj.vel.x = -Math.sin(proj.orbitAngle) * 300;
          proj.vel.y = Math.cos(proj.orbitAngle) * 300;
      } else {
          proj.pos.x += pSpeedX * dt;
          proj.pos.y += pSpeedY * dt;
          if (proj.type !== 'EnemyBullet') {
              proj.life -= dt;
          }
      }
      
      let destroyed = false;

      if (proj.type !== 'EnemyBullet') {
        if (proj.isRadioactive) {
            proj.auraTimer = (proj.auraTimer || 0) + dt;
            if (proj.auraTimer >= 0.15) {
                proj.auraTimer = 0;
                this.addParticle(proj.pos, '#22c55e', 5, 2); // radiant lime-green trail
                this.addParticle(proj.pos, '#a855f7', 2, 2); // radioactive purple aura
                
                this.state.enemies.forEach(enemy => {
                    if (this.distance(proj.pos, enemy.pos) < 150) {
                        enemy.hp -= proj.damage * 0.15; // 15% ticked radiation damage
                        enemy.status.dotTimer = Math.max(enemy.status.dotTimer, 3.5);
                        enemy.status.dotDamage = Math.max(enemy.status.dotDamage, Math.min(300, proj.damage * 0.1));
                    }
                });
            }
        }

        if (!proj.isOrbiting) {
            // Friction only for non-special molecules if we want, but wait, special molecules might want friction too?
            // Let's just apply to all player projectiles.
            proj.vel.x *= 1 - (2.0 * dt);
            proj.vel.y *= 1 - (2.0 * dt);
        }
        if (Math.hypot(proj.vel.x, proj.vel.y) < 10) {
           proj.vel.x = 0;
           proj.vel.y = 0;
        }

        // Combine with other player projectiles
        for(let j=0; j<this.state.projectiles.length; j++) {
           if (i === j) continue;
           const otherP = this.state.projectiles[j];
           if (otherP.type !== 'EnemyBullet' && otherP.life > 0 && proj.life > 0) {
               if (this.distance(proj.pos, otherP.pos) < proj.radius + otherP.radius) {
                   const t1 = proj.type?.toUpperCase() || '';
                   const t2 = otherP.type?.toUpperCase() || '';
                   if ((t1 === 'H2O' && (t2 === 'H' || t2 === 'O')) || (t2 === 'H2O' && (t1 === 'H' || t1 === 'O'))) {
                       const nx = proj.pos.x - otherP.pos.x;
                       const ny = proj.pos.y - otherP.pos.y;
                       const len = Math.hypot(nx, ny) || 1;
                       proj.vel.x += (nx/len)*200;
                       proj.vel.y += (ny/len)*200;
                       otherP.vel.x -= (nx/len)*200;
                       otherP.vel.y -= (ny/len)*200;
                       continue;
                   }

                   for (const [k, v] of Object.entries(proj.atoms)) {
                       if (v > 0) {
                           (otherP.atoms as any)[k] = ((otherP.atoms as any)[k] || 0) + v;
                       }
                   }
                   otherP.radius = Math.min(20, Math.max(otherP.radius, proj.radius) + 2);
                   otherP.type = 'Molecule';
                   if (proj.isOrbiting || otherP.isOrbiting) {
                       otherP.isOrbiting = true;
                       otherP.orbitRadius = otherP.orbitRadius || proj.orbitRadius || 60;
                       otherP.orbitAngle = otherP.orbitAngle || proj.orbitAngle || 0;
                   }
                   
                   otherP.vel.x = (otherP.vel.x + proj.vel.x) * 0.5;
                   otherP.vel.y = (otherP.vel.y + proj.vel.y) * 0.5;
                   
                   proj.life = 0;
                   destroyed = true;

                   this.checkProjectileReactions(otherP);
                   break;
               }
           }
        }

        // Hit enemies
        if (!destroyed) {
          for (const enemy of this.state.enemies) {
            if (this.distance(proj.pos, enemy.pos) < proj.radius + enemy.radius) {
               let dmg = proj.damage;
               if (proj.isOrbiting) dmg *= 5; // massive damage
               enemy.hp -= this.state.devInstaKill ? 9999999 : dmg;
               
               for (const [k, v] of Object.entries(proj.atoms)) {
                   if (v > 0) {
                       (enemy.atoms as any)[k] = ((enemy.atoms as any)[k] || 0) + v;
                   }
               }
               
               if (proj.isRadioactive) {
                   this.state.screenShake = Math.max(this.state.screenShake, 11);
                   this.addParticle(proj.pos, '#22c55e', 250, 20); // green fallout burst
                   this.addParticle(proj.pos, '#c084fc', 120, 10); // visual purple ionization
                   
                   this.state.enemies.forEach(other => {
                       if (this.distance(proj.pos, other.pos) < 200) {
                           const radiationDmg = proj.damage * 0.75;
                           other.hp -= radiationDmg;
                           other.status.dotTimer = Math.max(other.status.dotTimer, 6.0);
                           other.status.dotDamage = Math.max(other.status.dotDamage, Math.min(500, proj.damage * 0.15));
                       }
                   });
                   this.addLog("☢️ OPAD PROMIENIOTWÓRCZY!");
               } else {
                   this.addParticle(proj.pos, '#ffffff', 100, 3);
               }
               
               if (['C6Wall', 'Fe3CWall', 'Fe2O3Wall', 'C3Wall', 'WoodWall'].includes(enemy.type as string)) {
                   destroyed = false;
                   const normal = this.normalize({ x: proj.pos.x - enemy.pos.x, y: proj.pos.y - enemy.pos.y });
                   const dot = proj.vel.x * normal.x + proj.vel.y * normal.y;
                   proj.vel.x = (proj.vel.x - 2 * dot * normal.x) * 0.9;
                   proj.vel.y = (proj.vel.y - 2 * dot * normal.y) * 0.9;
                   proj.pos.x += normal.x * 5;
                   proj.pos.y += normal.y * 5;
                   // Deal damage but do not destroy the projectile
                   // Do not check checkReactions or do knockback
                   this.addParticle(proj.pos, '#ffffff', 100, 3);
                   break;
               }

               destroyed = true;

               let mass = 1.0;
               if (enemy.type === 'C6Wall') mass = 150.0;
               else if (enemy.type === 'Fe3CWall') mass = 80.0;
               else if (enemy.type === 'Fe2O3Wall') mass = 30.0;
               else if (enemy.type === 'C3Wall') mass = 15.0;
               else if (enemy.type === 'WoodWall') mass = 5.0;
               else if (['GiantTree', 'MutantPolimer', 'Durian', 'Celery', 'Hogweed', 'SnakeGourdHead'].includes(enemy.type as string)) mass = 50.0;
               else mass = 3.0;

               // Przesuwanie scian/wrogow (knockback) w zaleznosci od masy
               enemy.pos.x += (proj.vel.x * 0.02) / mass;
               enemy.pos.y += (proj.vel.y * 0.02) / mass;

               this.checkReactions(enemy);
               if (destroyed) break;
            }
          }
        }
      } else if (proj.type === 'EnemyBullet') {
        let hitWall = false;
        for (const w of this.state.enemies) {
            if (['C3Wall', 'C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(w.type as string)) {
                if (this.distance(proj.pos, w.pos) < proj.radius + w.radius) {
                    w.hp -= proj.damage;
                    w.atoms.H = 1; // Mark visual impact
                    destroyed = true;
                    hitWall = true;

                    let mass = 1.0;
                    if (w.type === 'C6Wall') mass = 150.0;
                    else if (w.type === 'Fe3CWall') mass = 80.0;
                    else if (w.type === 'Fe2O3Wall') mass = 30.0;
                    else if (w.type === 'C3Wall') mass = 15.0;
                    else if (w.type === 'WoodWall') mass = 5.0;
                    
                    w.pos.x += (proj.vel.x * 0.02) / mass;
                    w.pos.y += (proj.vel.y * 0.02) / mass;

                    if (w.type === 'C6Wall') {
                        this.addParticle(proj.pos, '#ffffff', 50, 2);
                    } else if (w.type === 'C3Wall') {
                        this.addParticle(proj.pos, '#555555', 50, 2);
                    } else if (w.type === 'Fe3CWall') {
                        this.addParticle(proj.pos, '#78716c', 50, 2);
                        // Bounce back smaller projectile
                        if (Math.random() < 0.5) {
                            let nextId = Date.now() + Math.random();
                            this.state.projectiles.push({
                                id: nextId, pos: { x: proj.pos.x, y: proj.pos.y },
                                vel: { x: -proj.vel.x, y: -proj.vel.y },
                                type: 'Fe' as any, atoms: { H:0,O:0,C:0,N:0,S:0,Si:0,Ra:0,Po:0,Cl:0,P:0,Fe:1 },
                                radius: 5, damage: proj.damage, life: 3.0
                            });
                        }
                    } else if (w.type === 'Fe2O3Wall') {
                        this.addParticle(proj.pos, '#ea580c', 50, 2);
                    }
                    break;
                }
            }
        }

        let takingDamage = !this.state.devGodMode && this.state.difficulty !== 'kids';

        const p = this.state.player;
        if (!hitWall && !p.isDashing && !(p.iFrameTimer && p.iFrameTimer > 0) && this.distance(proj.pos, p.pos) < proj.radius + p.radius) {
          const baseArmor = this.state.selectedCharacter === 'bohr_cat' ? 1 : 0;
          const armorMultiplier = 1 - ((this.state.armorLevel + baseArmor) * 0.1); // e.g. 1.0, 0.9, 0.8... Or 0.9, 0.8, 0.7 for Bohr
          let dmg = proj.damage * 2.5 * armorMultiplier; // Increased base damage 2.5x

          if (this.state.difficulty === 'easy') dmg *= 0.5;
          if (this.state.difficulty === 'hard') dmg *= 1.5;

          let didTakeRealDamage = false;

          if (this.state.activeShield > 0) {
             if (this.state.activeShield >= dmg) {
                 this.state.activeShield -= dmg;
             } else {
                 const remaining = dmg - this.state.activeShield;
                 this.state.activeShield = 0;
                 if (takingDamage) { 
                     p.hp -= remaining; 
                     didTakeRealDamage = true; 
                 }
             }
             this.addParticle(p.pos, '#00ffff', 100, 10);
          } else {
             if (takingDamage) { 
                 p.hp -= dmg; 
                 didTakeRealDamage = true; 
             }
             this.addParticle(p.pos, '#00ff00', 100, 10);
          }
          
          if (didTakeRealDamage) {
              p.iFrameTimer = 1.0;
          }
          
          this.state.screenShake = 5;
          destroyed = true;
          
          if (p.hp <= 0) {
            this.die();
            return;
          }
        }
      }

      // Walls
      const rx = Math.round(proj.pos.x / ROOM_WIDTH);
      const ry = Math.round(proj.pos.y / ROOM_HEIGHT);
      const rcx = rx * ROOM_WIDTH;
      const rcy = ry * ROOM_HEIGHT;
      const hw = ROOM_WIDTH / 2;
      const hh = ROOM_HEIGHT / 2;
      
      if (proj.type !== 'EnemyBullet') {
          if (proj.pos.x - proj.radius < rcx - hw + WALL_THICKNESS) { proj.pos.x = rcx - hw + WALL_THICKNESS + proj.radius; proj.vel.x *= -1; }
          if (proj.pos.x + proj.radius > rcx + hw - WALL_THICKNESS) { proj.pos.x = rcx + hw - WALL_THICKNESS - proj.radius; proj.vel.x *= -1; }
          if (proj.pos.y - proj.radius < rcy - hh + WALL_THICKNESS) { proj.pos.y = rcy - hh + WALL_THICKNESS + proj.radius; proj.vel.y *= -1; }
          if (proj.pos.y + proj.radius > rcy + hh - WALL_THICKNESS) { proj.pos.y = rcy + hh - WALL_THICKNESS - proj.radius; proj.vel.y *= -1; }
      } else {
        if (proj.pos.x < rcx - hw + WALL_THICKNESS || proj.pos.x > rcx + hw - WALL_THICKNESS ||
            proj.pos.y < rcy - hh + WALL_THICKNESS || proj.pos.y > rcy + hh - WALL_THICKNESS) {
            destroyed = true;
        }
      }

      if (destroyed || proj.life <= 0) {
        this.state.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    if (this.state.policeSpawning) {
        if (!this.state.policeSpawnTimer) this.state.policeSpawnTimer = 0;
        this.state.policeSpawnTimer += dt;
        if (this.state.policeSpawnTimer >= 5.0 && this.state.enemies.length < 20) {
            this.state.policeSpawnTimer = 0;
            const ROOM_WIDTH = 1400;
            const ROOM_HEIGHT = 1050;
            const spawnX = this.state.currentRoom.x * ROOM_WIDTH + (Math.random() > 0.5 ? 500 : -500);
            const spawnY = this.state.currentRoom.y * ROOM_HEIGHT + (Math.random() > 0.5 ? 400 : -400);
            let nextId = Math.max(0, ...this.state.enemies.map(e => e.id)) + 1;
            this.state.enemies.push({
               id: nextId, pos: { x: spawnX, y: spawnY },
               radius: 25, speed: 250, hp: 99999, maxHp: 99999,
               type: 'PoliceCat' as any, atoms: { H: 10, O: 10, C: 10, N: 10, S: 10, Si: 10, Ra: 0, Po: 0, Cl: 0, P: 0 },
               attackTimer: 0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
            });
            this.addLog("🚨 NIE OPŁACIŁEŚ PODATKÓW! OPÓR PRZECIW WŁADZY JEST... ŻAŁOSNY! 🚨");
            // We can add a portal particle effect here:
            this.addParticle({x: spawnX, y: spawnY}, '#0000ff', 200, 30, 2);
            this.addParticle({x: spawnX, y: spawnY}, '#ff0000', 200, 30, 2);
        }
    }

    const p = this.state.player;
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];

      if ((enemy as any).pressureTimer && (enemy as any).pressureTimer > 0) {
          (enemy as any).pressureTimer -= dt;
      }

      if (enemy.life !== undefined) {
          enemy.life -= dt;
          if (enemy.life <= 0) enemy.hp = 0;
      }

      // Handle Status Effects
      if (enemy.status.dotTimer > 0) {
         enemy.status.dotTimer -= dt;
         enemy.hp -= enemy.status.dotDamage * dt;
         if (Math.random() < 0.1) this.addParticle(enemy.pos, '#88ff88', 20, 1);
      }
      
      // Radioactive Aura (Ra and Po)
      const raCount = enemy.atoms.Ra || 0;
      const poCount = enemy.atoms.Po || 0;
      if (raCount > 0 || poCount > 0) {
          const dmg = (raCount * 80 + poCount * 150) * dt;
          enemy.hp -= dmg;
          
          if (Math.random() < 0.05 * (raCount + poCount)) {
              const color = Math.random() > 0.5 ? '#8b5cf6' : '#d946ef';
              this.addParticle(enemy.pos, color, 30, 2);
          }
          
          // Area of effect poison/damage to nearby enemies
          const auraRadius = 150 + (raCount + poCount) * 20;
          this.state.enemies.forEach(other => {
              if (other.id !== enemy.id && this.distance(enemy.pos, other.pos) < auraRadius) {
                  other.hp -= dmg * 0.5; // Spread damage
                  if (Math.random() < 0.01) {
                      this.addParticle(other.pos, '#8b5cf6', 20, 1);
                  }
              }
          });
      }

      const h2oStack = (enemy.atoms as any).H2O || 0;
      if (h2oStack > 0) {
          enemy.hp -= (h2oStack * 30) * dt; // 15 dmg/s per stack (since they have a lot of HP)
          if (Math.random() < 0.05 * h2oStack) this.addParticle(enemy.pos, '#44aaff', 15, 1);
      }
      if (enemy.status.slowTimer > 0) {
         enemy.status.slowTimer -= dt;
      }
      if (enemy.type === 'Celery') {
          enemy.status.frozenTimer = 0;
      }
      const isFrozen = enemy.status.frozenTimer > 0;
      if (isFrozen) {
         enemy.status.frozenTimer -= dt;
      }

      if (enemy.hp <= 0) {
        const isWall = ['C3Wall', 'C6Wall', 'WoodWall', 'Fe3CWall', 'Fe2O3Wall'].includes(enemy.type as string);

        let sc = 20;
        let drp = 5;
        let drpVal = 1;
        
        if (isWall) {
            sc = 0;
            drp = 0;
            drpVal = 0;
            enemy.atoms = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0, Na: 0, Al: 0 } as any;
        } else if (enemy.type === 'SnakeGourdHead' || enemy.type === 'Hogweed') { sc = 1000; drp = 40; drpVal = 5; }
        else if (enemy.type === 'SnakeGourdSegment' || enemy.type === 'HogweedChild') { sc = 150; drp = 5; drpVal = 2; }
        else if (enemy.type === 'Celery') { sc = 800; drp = 30; drpVal = 5; }
        else if (enemy.type === 'Broccoli') { sc = 50; drp = 8; }
        else if (enemy.type === 'Durian') { sc = 2000; drp = 50; drpVal = 8; }
        else if (enemy.type === 'GiantTree') { sc = 2500; drp = 60; drpVal = 8; }
        else if (enemy.type === 'MutantPolimer') { sc = 5000; drp = 100; drpVal = 15; }
        else if (enemy.type === 'Cactus') { sc = 150; drp = 10; }
        else if (enemy.type === 'Venus') { sc = 120; drp = 8; }
        else if (enemy.type === 'Mushroom') { sc = 30; drp = 5; }
        else if (enemy.type === 'Onion') { sc = 40; drp = 6; }

        if (enemy.isAnomaly) {
            sc *= 3;
            drpVal *= 2;
            drp = Math.floor(drp * 1.5) + 2;
        }
        
        drpVal *= Math.pow(1.5, Math.max(0, this.state.level - 1));

        // Adjust drop amount & coin values based on selected difficulty settings
        if (this.state.difficulty === 'kids') {
            drpVal = Math.ceil(drpVal * 1.50);
            drp = Math.ceil(drp * 1.4);
        } else if (this.state.difficulty === 'easy') {
            drpVal = Math.ceil(drpVal * 1.25);
            drp = Math.ceil(drp * 1.2);
        } else if (this.state.difficulty === 'hard') {
            drpVal = Math.ceil(drpVal * 1.60); // 60% increase in currency as high-risk reward!
            drp = Math.ceil(drp * 1.5);
        }

        this.state.score += sc;
        this.addParticle(enemy.pos, '#ff8800', 200, 6);
        
        const enType = enemy.isAnomaly ? `Anomalia ${enemy.type}` : enemy.type;
        this.state.dungeonKills[enType] = (this.state.dungeonKills[enType] || 0) + 1;
        
        let extraAtomsForBoss: Record<string, number> = {};
        if (enemy.type === 'Celery') extraAtomsForBoss = { O: 240, C: 70, N: 10, S: 5, P: 10, K: 65, Mg: 35, Ca: 30 };
        else if (enemy.type === 'SnakeGourdHead') extraAtomsForBoss = { H: 50, O: 70, C: 110, N: 20, S: 10, P: 25, K: 55, Mg: 15, Ca: 20 };
        else if (enemy.type === 'Hogweed') extraAtomsForBoss = { H: 100, O: 110, C: 160, N: 30, S: 30, Cl: 45, P: 30, K: 60, Mg: 30, Ca: 40 };
        else if (enemy.type === 'Durian') extraAtomsForBoss = { H: 40, O: 80, C: 140, N: 30, S: 170, Si: 30, Ra: 55, Po: 45, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
        else if (enemy.type === 'GiantTree') extraAtomsForBoss = { H: 240, O: 220, C: 360, N: 30, S: 20, Si: 40, P: 20, K: 80, Mg: 60, Ca: 70 };
        else if (enemy.type === 'MutantPolimer') extraAtomsForBoss = { H: 120, O: 200, C: 240, N: 130, S: 120, Si: 50, Ra: 30, Po: 20, Cl: 150, P: 140, K: 160, Mg: 130, Ca: 140 };

        for (const [atomType, amount] of Object.entries(extraAtomsForBoss)) {
            (enemy.atoms as any)[atomType] = ((enemy.atoms as any)[atomType] || 0) + amount;
        }
        
        let leftoverAtoms = Object.entries(enemy.atoms).filter(([_, count]) => count > 0);
        
        // Spawn unreacted atoms
        for (const [atomType, count] of leftoverAtoms) {
            let spawnCount = count;
            for (let k = 0; k < spawnCount; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 200 + Math.random() * 400;
                let newAtoms: Record<any, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0, K: 0, Mg: 0, Ca: 0 };
                
                const typeUp = atomType.toUpperCase();
                if (typeUp === 'H2O') { newAtoms.H = 2; newAtoms.O = 1; (newAtoms as any).H2O = 1; }
                else if (typeUp === 'CH4') { newAtoms.C = 1; newAtoms.H = 4; (newAtoms as any).CH4 = 1; }
                else if (typeUp === 'NH3') { newAtoms.N = 1; newAtoms.H = 3; (newAtoms as any).NH3 = 1; }
                else if (typeUp === 'CO2') { newAtoms.C = 1; newAtoms.O = 2; (newAtoms as any).CO2 = 1; }
                else if (typeUp === 'NO2') { newAtoms.N = 1; newAtoms.O = 2; (newAtoms as any).NO2 = 1; }
                else if (typeUp === 'H2S') { newAtoms.H = 2; newAtoms.S = 1; (newAtoms as any).H2S = 1; }
                else if (typeUp === 'SO2') { newAtoms.S = 1; newAtoms.O = 2; (newAtoms as any).SO2 = 1; }
                else if (typeUp === 'H2SO4') { newAtoms.H = 2; newAtoms.S = 1; newAtoms.O = 4; (newAtoms as any).H2SO4 = 1; }
                else if (typeUp === 'SIO2') { newAtoms.Si = 1; newAtoms.O = 2; (newAtoms as any).SiO2 = 1; }
                else if (typeUp === 'SIC') { newAtoms.Si = 1; newAtoms.C = 1; (newAtoms as any).SiC = 1; }
                else { newAtoms[atomType] = 1; }
                
                let r = 12;
                if (typeUp === 'H') r = 5;
                if (typeUp === 'O') r = 10;
                if (typeUp === 'C') r = 9;
                if (typeUp === 'N') r = 7;
                if (typeUp === 'S') r = 10;
                if (typeUp === 'SI') r = 12;

                this.state.projectiles.push({
                    id: nextId++,
                    pos: { x: enemy.pos.x + (Math.random()-0.5)*30, y: enemy.pos.y + (Math.random()-0.5)*30 },
                    vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
                    type: atomType as any,
                    atoms: newAtoms as any,
                    radius: r,
                    damage: 0,
                    life: 30
                });
            }
        }
        
        // Spawn regular electrons
        for(let k=0; k<drp; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 200 + Math.random() * 250;
            
            this.state.drops.push({
                id: nextId++,
                pos: { x: enemy.pos.x + (Math.random()-0.5)*30, y: enemy.pos.y + (Math.random()-0.5)*30 },
                vel: { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
                value: drpVal,
                life: 120,
                text: 'e⁻',
                color: '#fde047'
            });
        }

         // Boss always drops 1 proton! (Hard mode drops 2 protons!)
         if (['Celery', 'SnakeGourdHead', 'Hogweed', 'Durian', 'GiantTree', 'MutantPolimer'].includes(enemy.type)) {
             this.addLog("BOSS POKONANY! Pojawił się portal do następnego poziomu!");
             this.state.drops.push({
                 id: nextId++,
                 pos: { x: enemy.pos.x, y: enemy.pos.y },
                 vel: { x: 0, y: 0 },
                 value: 0,
                 life: 9999,
                 isPortal: true,
                 text: '🌀'
             });
             const numProtons = this.state.difficulty === 'hard' ? 2 : 1;
             for (let jp = 0; jp < numProtons; jp++) {
                 this.state.drops.push({
                    id: nextId++,
                    pos: { x: enemy.pos.x, y: enemy.pos.y },
                    vel: { x: (Math.random()-0.5)*200, y: (Math.random()-0.5)*200 },
                    value: 0,
                    isProton: true,
                    life: 120,
                    text: 'p+',
                    color: '#a855f7'
                 });
             }
         }

          // Atoms are now dynamically unlocked when the player enters the portal to the next level.
         
        this.state.enemies.splice(i, 1);
        continue;
      }

      if (isFrozen) continue;

      let difficultyMod = 1.0;
      if (this.state.difficulty === 'kids') difficultyMod = 0.75;
      if (this.state.difficulty === 'easy') difficultyMod = 0.9;
      if (this.state.difficulty === 'hard') difficultyMod = 1.25;
      
      const speedMod = enemy.status.slowTimer > 0 ? 0.5 : 1.0;
      const eSpeed = enemy.speed * speedMod * difficultyMod;

      const distTp = this.distance(enemy.pos, p.pos);
      let dir = this.normalize({ x: p.pos.x - enemy.pos.x, y: p.pos.y - enemy.pos.y });

      // Anomaly AI: Try to evade incoming projectiles and dash sideways occasionally
      if (enemy.isAnomaly) {
          enemy.anomalyDashTimer = (enemy.anomalyDashTimer || 0) - dt;
          
          if (enemy.anomalyDashTimer <= 0 && Math.random() < 0.05) {
              // Dash sideways (perpendicular to player direction)
              const side = Math.random() > 0.5 ? 1 : -1;
              enemy.anomalyDashDir = { x: -dir.y * side, y: dir.x * side };
              enemy.anomalyDashTimer = 2.0 + Math.random() * 2.0; // cooldown
              (enemy as any).anomalyDashActive = 0.2; // Dash duration
          }
          
          if (enemy.anomalyDashTimer > 0) {
              // We don't know exact start time easily, let's just make dash last when timer mod 1 is close to 0
              // Actually since min timer is 2.0, if it's > 1.8 we can assume it's dashing, but wait, the max was 2.0 to 4.0, 
              // meaning it dashes between 1.8-2.0 or 3.8-4.0 which is wrong.
              
              // Let's store a separate dash duration timer
              if ((enemy as any).anomalyDashActive > 0) {
                  (enemy as any).anomalyDashActive -= dt;
                  if (enemy.anomalyDashDir) {
                      dir = enemy.anomalyDashDir;
                      enemy.pos.x += dir.x * eSpeed * 5 * dt;
                      enemy.pos.y += dir.y * eSpeed * 5 * dt;
                      this.addParticle(enemy.pos, '#a855f7', 10, 0.5);
                  }
              } else {
              // Normal evade
              let evadeDir = { x: 0, y: 0 };
              this.state.projectiles.forEach(proj => {
                  if (proj.type !== 'EnemyBullet') {
                      const dx = enemy.pos.x - proj.pos.x;
                      const dy = enemy.pos.y - proj.pos.y;
                      const pDist = Math.hypot(dx, dy);
                      if (pDist < 200 && pDist > 0.1) {
                          evadeDir.x += (dx / pDist) * (200 - pDist) * 0.05;
                          evadeDir.y += (dy / pDist) * (200 - pDist) * 0.05;
                      }
                  }
              });
              dir.x += evadeDir.x;
              dir.y += evadeDir.y;
              dir = this.normalize(dir);
          }
          }
      }

      if (enemy.type === 'Broccoli') {
        enemy.pos.x += dir.x * eSpeed * dt;
        enemy.pos.y += dir.y * eSpeed * dt;
      } else if (enemy.type === 'Carrot') {
        if (distTp > 300) {
          enemy.pos.x += dir.x * eSpeed * dt;
          enemy.pos.y += dir.y * eSpeed * dt;
        } else if (distTp < 200) {
          enemy.pos.x -= dir.x * eSpeed * dt;
          enemy.pos.y -= dir.y * eSpeed * dt;
        }
      } else if (enemy.type === 'Tomato') {
        if (distTp > 250) {
          enemy.pos.x += dir.x * eSpeed * dt;
          enemy.pos.y += dir.y * eSpeed * dt;
        }
      } else if (enemy.type === 'Onion') {
        enemy.pos.x += dir.x * eSpeed * dt;
        enemy.pos.y += dir.y * eSpeed * dt;
      } else if (enemy.type === 'Cactus') {
        if (distTp > 200) {
           enemy.pos.x += dir.x * eSpeed * dt;
           enemy.pos.y += dir.y * eSpeed * dt;
        }
      } else if (enemy.type === 'Venus') {
        if (distTp > 80) {
           enemy.pos.x += dir.x * eSpeed * dt;
           enemy.pos.y += dir.y * eSpeed * dt;
        }
      } else if (enemy.type === 'Mushroom') {
        if (distTp > 400 || distTp < 150) {
           enemy.pos.x += dir.x * eSpeed * dt;
           enemy.pos.y += dir.y * eSpeed * dt;
        }
      } else if ((enemy.type as any) === 'PoliceCat') {
         const pSpeed = p.speed * 1.5;
         enemy.pos.x += dir.x * pSpeed * dt;
         enemy.pos.y += dir.y * pSpeed * dt;
      } else if (enemy.type === 'Celery' || enemy.type === 'Hogweed') { // BOSS
         enemy.pos.x += dir.x * eSpeed * dt;
         enemy.pos.y += dir.y * eSpeed * dt;
      } else if (enemy.type === 'HogweedChild') {
         enemy.pos.x += dir.x * eSpeed * dt;
         enemy.pos.y += dir.y * eSpeed * dt;
      } else if (enemy.type === 'Durian') {
         // Durian moves slowly towards player and occasionally dashes
         enemy.attackTimer -= (this.state.difficulty === 'kids' ? dt * 0.35 : (this.state.difficulty === 'easy' ? dt * 0.65 : dt));
         if (enemy.attackTimer <= 0) {
             enemy.attackTimer = 2.5; // High rate of attack
             
             // Shoots spread of toxic/radioactive seeds
             for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
                 this.state.projectiles.push({
                     id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a + Math.random())*250, y: Math.sin(a + Math.random())*250 },
                     type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 1, Si: 1, Ra: 1, Po: 0, Cl: 0, P: 0 }, radius: 6, damage: 10 * (1 + (this.state.level - 1) * 0.2), life: 100.0
                 });
             }
         }
         
         if (distTp > 80) {
             enemy.pos.x += dir.x * eSpeed * dt;
             enemy.pos.y += dir.y * eSpeed * dt;
         }
      } else if (enemy.type === 'GiantTree') {
         // Doesn't move. Spawns wood walls and sends roots.
         enemy.attackTimer -= (this.state.difficulty === 'kids' ? dt * 0.35 : (this.state.difficulty === 'easy' ? dt * 0.65 : dt));
         if (enemy.attackTimer <= 0) {
             enemy.attackTimer = 4.0;
             const actionCount = Math.floor(Math.random() * 3);
             if (actionCount === 0) {
                 // Spawns wood walls in a circle
                 for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
                     this.state.enemies.push({
                         id: Date.now() + Math.random(),
                         pos: { x: enemy.pos.x + Math.cos(a)*180, y: enemy.pos.y + Math.sin(a)*180 },
                         radius: 35, speed: 0, hp: 5000 * (this.state.level * 0.5), maxHp: 5000 * (this.state.level * 0.5),
                         type: 'WoodWall' as any, atoms: { H: 0, O: 0, C: 10, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 },
                         attackTimer: -999, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                         life: 15.0
                     });
                 }
             } else if (actionCount === 1) {
                 // Spawns roots that chase player
                 for(let i=0; i<3; i++) {
                     this.state.enemies.push({
                         id: Date.now() + Math.random(),
                         pos: { x: enemy.pos.x + (Math.random()-0.5)*100, y: enemy.pos.y + (Math.random()-0.5)*100 },
                         radius: 20, speed: 180, hp: 2000 * (this.state.level * 0.5), maxHp: 2000 * (this.state.level * 0.5),
                         type: 'Root' as any, atoms: { H: 5, O: 5, C: 5, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 },
                         attackTimer: -999, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 },
                     });
                 }
             } else {
                 // Shoots toxic sap
                 for(let a=0; a<Math.PI*2; a+=Math.PI/6) {
                     this.state.projectiles.push({
                         id: nextId++,
                         pos: { x: enemy.pos.x, y: enemy.pos.y },
                         vel: { x: Math.cos(a)*150, y: Math.sin(a)*150 },
                         radius: 12, life: 10, damage: 12 * (1 + (this.state.level - 1) * 0.2), type: 'EnemyBullet',
                         color: '#84cc16'
                     });
                 }
             }
         }
      } else if (enemy.type === 'MutantPolimer') {
          // Moves erratically and attacks rapidly
          enemy.pos.x += dir.x * eSpeed * dt;
          enemy.pos.y += dir.y * eSpeed * dt;
          
          enemy.attackTimer -= (this.state.difficulty === 'kids' ? dt * 0.35 : (this.state.difficulty === 'easy' ? dt * 0.65 : dt));
          if (enemy.attackTimer <= 0) {
              enemy.attackTimer = 1.0;
              const r = Math.random();
              if (r < 0.3) {
                  // Ring of huge bullets
                  for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
                      this.state.projectiles.push({
                          id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*300, y: Math.sin(a)*300 },
                          type: 'EnemyBullet', radius: 15, damage: 15 * (1 + (this.state.level - 1) * 0.2), life: 5, color: '#f43f5e'
                      });
                  }
              } else if (r < 0.6) {
                  // Erratic toxic spam
                  for(let i=0; i<8; i++) {
                      const ang = Math.random() * Math.PI * 2;
                      const spd = 100 + Math.random() * 200;
                      this.state.projectiles.push({
                          id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(ang)*spd, y: Math.sin(ang)*spd },
                          type: 'EnemyBullet', radius: 8, damage: 8 * (this.state.level * 0.2), life: 8, color: '#a855f7'
                      });
                  }
              }
          }
      } else if (enemy.type === 'Root') {
         enemy.pos.x += dir.x * eSpeed * dt;
         enemy.pos.y += dir.y * eSpeed * dt;
      } else if (enemy.type === 'SnakeGourdHead') {
         // Try to spiral tightly and encircle the player (Slither.io style)
         if (enemy.orbitRadius === undefined) enemy.orbitRadius = 500;
         
         // spiral inwards over time down to a small loop
         enemy.orbitRadius = Math.max(60, enemy.orbitRadius - 30 * dt);
         
         const angle = Math.atan2(enemy.pos.y - p.pos.y, enemy.pos.x - p.pos.x);
         const targetX = p.pos.x + Math.cos(angle + 1.2) * enemy.orbitRadius; // +1.2 radians to push it along the circle fast
         const targetY = p.pos.y + Math.sin(angle + 1.2) * enemy.orbitRadius;
         
         const mDir = this.normalize({x: targetX - enemy.pos.x, y: targetY - enemy.pos.y});
         enemy.pos.x += mDir.x * eSpeed * dt;
         enemy.pos.y += mDir.y * eSpeed * dt;
         
      } else if (enemy.type === 'SnakeGourdSegment') {
          // Follow leader
          if (enemy.leaderId !== undefined) {
              const leader = this.state.enemies.find(l => l.id === enemy.leaderId);
              if (leader) {
                  const lDist = this.distance(enemy.pos, leader.pos);
                  if (lDist > 45) {
                      const lDir = this.normalize({x: leader.pos.x - enemy.pos.x, y: leader.pos.y - enemy.pos.y});
                      enemy.pos.x += lDir.x * eSpeed * 1.5 * dt; // catch up
                      enemy.pos.y += lDir.y * eSpeed * 1.5 * dt;
                  }
              } else {
                  // leader is dead, become a new head
                  enemy.type = 'SnakeGourdHead';
                  enemy.leaderId = undefined; // decouple
              }
          } else {
              enemy.type = 'SnakeGourdHead';
          }
      }

      let takingDamage = !this.state.devGodMode && this.state.difficulty !== 'kids';

      // Contact damage for Hogweed (Poison)
      if (enemy.type === 'Hogweed' || enemy.type === 'HogweedChild') {
          if (distTp < enemy.radius + 15) {
              if (takingDamage && !p.isDashing) {
                  let poisonDmg = (enemy.type === 'Hogweed' ? 60 : 20) * dt;
                  if (this.state.difficulty === 'easy') poisonDmg *= 0.5;
                  if (this.state.difficulty === 'hard') poisonDmg *= 1.5;
                  p.hp -= poisonDmg; // high poison DPS
              }
              this.state.screenShake += 0.5;
              this.addParticle(p.pos, '#16a34a', 15, 5);
          }
      }

      enemy.attackTimer -= (this.state.difficulty === 'kids' ? dt * 0.35 : (this.state.difficulty === 'easy' ? dt * 0.65 : dt));
      if (enemy.attackTimer <= 0) {
        let shot = false;
        const radMult = enemy.isAnomaly ? 1.25 : 1.0;
        if (enemy.type === 'Broccoli') {
          if (distTp < 150) {
            enemy.attackTimer = 1.5;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/3) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*150, y: Math.sin(a)*150 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 5 * radMult, damage: 8 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if (enemy.type === 'Carrot') {
          if (distTp < 600) {
            enemy.attackTimer = 1.5;
            shot = true;
            const angleToP = Math.atan2(dir.y, dir.x);
            [-0.2, 0, 0.2].forEach(aOffset => {
              const a = angleToP + aOffset;
              this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*300, y: Math.sin(a)*300 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 4 * radMult, damage: 5 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            });
          }
        } else if (enemy.type === 'Tomato') {
          if (distTp < 400) {
            enemy.attackTimer = 2.0;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*200, y: Math.sin(a)*200 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 6 * radMult, damage: 8 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if (enemy.type === 'Onion') {
          if (distTp < 150) {
            enemy.attackTimer = 1.0;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/2) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a + Math.random())*150, y: Math.sin(a + Math.random())*150 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 4 * radMult, damage: 5 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if (enemy.type === 'Cactus') {
          if (distTp < 300) {
            enemy.attackTimer = 2.5;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/6) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*400, y: Math.sin(a)*400 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 3 * radMult, damage: 8 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if (enemy.type === 'Mushroom') {
          if (distTp < 500) {
            enemy.attackTimer = 3.0; // Slow attack
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/3) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*100, y: Math.sin(a)*100 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 10 * radMult, damage: 10 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if ((enemy.type as any) === 'PoliceCat') {
          if (distTp < 60) {
            enemy.attackTimer = 1.0;
            shot = true;
            let dmg = Math.ceil(p.maxHp * 0.1); // exactly 10% of maximum health
            if (this.state.difficulty === 'easy') dmg = Math.ceil(p.maxHp * 0.05);
            if (this.state.difficulty === 'hard') dmg = Math.ceil(p.maxHp * 0.15);
            if (takingDamage && !p.isDashing && !(p.iFrameTimer && p.iFrameTimer > 0)) {
                p.hp -= dmg;
                p.iFrameTimer = 1.0;
            }
            if (!p.isDashing) {
                this.addLog(`👮 Kot Policjant uderzył Cię bagietką za ${dmg} HP!`);
            }
            if (p.hp <= 0) {
                this.state.arrestedDeath = true;
                this.die();
                return;
            }
            this.state.screenShake = 15;
            this.addParticle(p.pos, '#ff0000', 150, 15);
          }
        } else if (enemy.type === 'Venus' || enemy.type === 'Root') {
          if (distTp < 100) {
            enemy.attackTimer = 1.0;
            shot = true;
            const baseArmor = this.state.selectedCharacter === 'bohr_cat' ? 1 : 0;
            const armorMultiplier = 1 - ((this.state.armorLevel + baseArmor) * 0.1);
            let biteDmg = (enemy.type === 'Root' ? 20 : 40) * (1 + (this.state.level - 1) * 0.2) * armorMultiplier;
            if (this.state.difficulty === 'easy') biteDmg *= 0.5;
            if (this.state.difficulty === 'hard') biteDmg *= 1.5;

            if (takingDamage && !p.isDashing && !(p.iFrameTimer && p.iFrameTimer > 0)) {
                p.hp -= biteDmg; // Direct bite damage
                p.iFrameTimer = 1.0;
            }
            if (p.hp <= 0) {
                this.die();
                return;
            }
            if (!p.isDashing) this.state.screenShake = 10;
            this.addParticle(p.pos, enemy.type === 'Root' ? '#78350f' : '#00ff00', 100, 20);
          }
        } else if (enemy.type === 'Celery') {
          if (distTp < 800) {
            enemy.attackTimer = 4.0;
            shot = true;
            const currentTomatoes = this.state.enemies.filter(e => e.type === 'Tomato').length;
            if (currentTomatoes < 8) {
                const spawnCount = Math.floor(Math.random() * 2) + 1; // 1 to 2
                for(let k=0; k<spawnCount; k++) {
                   const ang = Math.random() * Math.PI * 2;
                   const dist = 100 + Math.random() * 100;
                   const multiPCount = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
                   this.state.enemies.push({
                      id: nextId++, pos: { x: enemy.pos.x + Math.cos(ang) * dist, y: enemy.pos.y + Math.sin(ang) * dist },
                      radius: 20, speed: 120, hp: Math.floor(2700 * (1 + (this.state.level - 1) * 0.5) * (1 + multiPCount * 0.5)), maxHp: Math.floor(2700 * (1 + (this.state.level - 1) * 0.5) * (1 + multiPCount * 0.5)),
                      type: 'Tomato', atoms: { H: 0, O: 2, C: 2, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 },
                      attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
                   });
                   this.addParticle({ x: enemy.pos.x + Math.cos(ang) * dist, y: enemy.pos.y + Math.sin(ang) * dist }, '#00ff00', 50, 10);
                }
            }
            this.state.screenShake = 5;
          }
        } else if (enemy.type === 'SnakeGourdHead') {
          if (distTp < 800) {
            enemy.attackTimer = 1.5;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*250, y: Math.sin(a)*250 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 8 * radMult, damage: 8 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
          }
        } else if (enemy.type === 'SnakeGourdSegment') {
          if (distTp < 500 && Math.random() < 0.2) {
            enemy.attackTimer = 2.0;
            shot = true;
            const angleToP = Math.atan2(dir.y, dir.x);
            this.state.projectiles.push({
              id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(angleToP)*300, y: Math.sin(angleToP)*300 },
              type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 5 * radMult, damage: 6 * (1 + (this.state.level - 1) * 0.2), life: 120.0
            });
          } else {
            enemy.attackTimer = 1.0;
            shot = false; // keep checking
          }
        } else if (enemy.type === 'Hogweed') {
          if (distTp < 800) {
            enemy.attackTimer = 3.0;
            shot = true;
            for(let a=0; a<Math.PI*2; a+=Math.PI/6) {
               this.state.projectiles.push({
                 id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(a)*150, y: Math.sin(a)*150 },
                 type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 10 * radMult, damage: 12 * (1 + (this.state.level - 1) * 0.2), life: 120.0
               });
            }
            // Spawn Hogweed child
            const currentChildren = this.state.enemies.filter(e => e.type === 'HogweedChild').length;
            if (currentChildren < 4) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 100;
                const multiPCount = this.state.networkPlayers ? this.state.networkPlayers.length : 0;
                this.state.enemies.push({
                    id: nextId++, pos: { x: enemy.pos.x + Math.cos(ang) * dist, y: enemy.pos.y + Math.sin(ang) * dist },
                    radius: 30, speed: 80, hp: Math.floor(4000 * (1 + (this.state.level - 1) * 0.5) * (1 + multiPCount * 0.5)), maxHp: Math.floor(4000 * (1 + (this.state.level - 1) * 0.5) * (1 + multiPCount * 0.5)),
                    type: 'HogweedChild', atoms: { H: 2, O: 2, C: 4, N: 0, S: 2, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 },
                    attackTimer: 2.0, status: { frozenTimer: 0, slowTimer: 0, dotTimer: 0, dotDamage: 0 }
                });
                this.addParticle({ x: enemy.pos.x + Math.cos(ang) * dist, y: enemy.pos.y + Math.sin(ang) * dist }, '#16a34a', 50, 10);
            }
            this.state.screenShake = 10;
          }
        } else if (enemy.type === 'HogweedChild') {
          if (distTp < 400) {
            enemy.attackTimer = 1.5;
            shot = true;
            const angleToP = Math.atan2(dir.y, dir.x);
            this.state.projectiles.push({
              id: nextId++, pos: { x: enemy.pos.x, y: enemy.pos.y }, vel: { x: Math.cos(angleToP)*200, y: Math.sin(angleToP)*200 },
              type: 'EnemyBullet', atoms: { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }, radius: 6 * radMult, damage: 8 * (1 + (this.state.level - 1) * 0.2), life: 120.0
            });
          }
        }
        
        if (!shot && enemy.attackTimer < -1.0) {
          enemy.attackTimer = 0.5; // retry shortly
        }
      }

      for (const other of this.state.enemies) {
        if (other.id !== enemy.id) {
          const d = this.distance(enemy.pos, other.pos);
          const minD = enemy.radius + other.radius;
          if (d < minD && d > 0) {
            const sep = this.normalize({ x: enemy.pos.x - other.pos.x, y: enemy.pos.y - other.pos.y });
            enemy.pos.x += sep.x * 50 * dt;
            enemy.pos.y += sep.y * 50 * dt;
          }
        }
      }
      this.resolveWallCollisions(enemy);
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.life += dt;
      p.size = Math.max(0, p.size - dt * 5); 
      if (p.life >= p.maxLife) {
        this.state.particles.splice(i, 1);
      }
    }
  }
}
