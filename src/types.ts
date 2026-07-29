export interface Vector2 {
  x: number;
  y: number;
}

export type AtomType = 'H' | 'He' | 'Li' | 'Be' | 'B' | 'O' | 'C' | 'N' | 'S' | 'Si' | 'Ra' | 'Po' | 'Cl' | 'P' | 'Mg' | 'K' | 'Ca' | 'F' | 'Na' | 'Al' | 'Fe' | 'Ne';

export interface Player {
  pos: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  selectedAtom: AtomType;
  selectedReaction: string;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  dashDir: Vector2;
  facing: 1 | -1;
  aimAngle: number;
  isDead?: boolean;
  deadTimer?: number;
  iFrameTimer?: number;
  invincibilityTimer?: number;
  konamiUsedInRun?: boolean;
}

export interface Projectile {
  id: number;
  pos: Vector2;
  vel: Vector2;
  radius: number;
  type: AtomType | 'EnemyBullet' | 'Molecule';
  atoms?: Record<string, number>;
  damage: number;
  life: number;
  targetId?: number; // for homing (ozone)
  orbitAngle?: number;
  orbitRadius?: number;
  isOrbiting?: boolean;
  color?: string;
  hitCooldowns?: Record<number, number>;
  isIsotope?: boolean;
  isotopeMassNum?: number;
  isRadioactive?: boolean;
  baseAtomSymbol?: string;
  auraTimer?: number;
}

export interface Enemy {
  id: number;
  pos: Vector2;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: 'Broccoli' | 'Carrot' | 'Eggplant' | 'Tomato' | 'Onion' | 'Cactus' | 'Mushroom' | 'Venus' | 'Celery' | 'SnakeGourdHead' | 'SnakeGourdSegment' | 'Hogweed' | 'HogweedChild' | 'Durian' | 'GiantTree' | 'Patozwiazek' | 'WoodWall' | 'Root' | 'C3Wall' | 'C6Wall' | 'Fe3CWall' | 'Fe2O3Wall' | 'PoliceCat' | 'MutantPolimer';
  atoms: Record<string, number>;
  attackTimer: number;
  life?: number; // Only for walls/temporary
  orbitRadius?: number; // For snake/certain enemies
  status: {
    frozenTimer: number;
    slowTimer: number;
    dotTimer: number;
    dotDamage: number;
    stunTimer?: number;
  };
  isAnomaly?: boolean;
  anomalyDashTimer?: number;
  anomalyDashDir?: Vector2;
  leaderId?: number;
  segmentIndex?: number;
}

export interface Particle {
  id: number;
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface RoomInfo {
  gridX: number;
  gridY: number;
  doors: { North: boolean; South: boolean; East: boolean; West: boolean };
  cleared: boolean;
  visited: boolean;
  isBoss: boolean;
  isMercenary?: boolean;
  enemyCount: number;
}

export interface CharacterUpgradeState {
  maxHpLevel: number;
  regenLevel: number;
  speedLevel: number;
  gunLevel: number;
  armorLevel: number;
  heatLevel: number;
  hasSuperWeapon: boolean;
}

export interface MarketAsset {
  id: string;
  name: string;
  desc: string;
  history: number[];
  currentPrice: number;
  shares: number;
  meanReturn: number;
  minReturn: number;
  maxReturn: number;
}

export interface GameMarket {
  assets: MarketAsset[];
  trend: 'bull' | 'bear' | 'neutral';
  trendTimer: number;
  inflationMultiplier: number;
}

export interface Invoice {
  id: string;
  name: string;
  writeOffAmount: number;
  submitted: boolean;
  cost: number;
}

export interface TaxEntry {
  id: string;
  incomeAmount: number;
  taxAmount: number;
  roomsSinceTaxOwed: number;
  paid: boolean;
  description: string;
}

export interface GameState {
  networkPlayers?: any[];
  isHost?: boolean;
  showingLobby: boolean;
  market: GameMarket;
  marketTimer: number;
  showingMarket: boolean;
  player: Player;
  projectiles: Projectile[];
  enemies: Enemy[];
  particles: Particle[];
  rooms: RoomInfo[];
  currentRoom: { x: number; y: number };
  keys: Record<string, boolean>;
  mouse: Vector2;
  isMouseDown: boolean;
  joystickMove: Vector2;
  joystickAim: Vector2;
  isJoystickShooting: boolean;
  autoAim: boolean;
  score: number;
  companion: string | null;
  state: 'menu' | 'playing' | 'gameover' | 'victory' | 'character_select' | 'victory_screen' | 'proton_tutorial';
  camera: Vector2;
  cameraZoom: number;
  screenShake: number;
  log: string[]; // Combat log / reaction log
  showCombatLog: boolean;
  level: number;
  unlockedAtoms: string[];
  unlockedReactions: string[];
  isLobby: boolean;
  reactionDiscovery: { active: boolean, equation: string, name: string, description: string, atoms: string[] } | null;
  marketDiscovery: { active: boolean, title: string, content: string } | null;
  showingRecipeBook: boolean;
  showingOptions: boolean;
  showingStats: boolean;
  showingSaves: boolean;
  electrons: number;
  savingsBalance: number;
  bondsBalance: number;
  bondsRoomsLeft: number;
  protons: number;
  unlockedCharacters: string[];
  characterSelected: boolean;
  showProtonTutorial: boolean;
  dungeonKills: Record<string, number>;
  unpaidTax: number;
  roomsSinceTaxOwed: number;
  policeSpawning: boolean;
  policeSpawnTimer?: number;
  invoices: Invoice[];
  taxEntries: TaxEntry[];
  investmentRoomCounter?: number;
  arrestedDeath?: boolean;
  showingShop: boolean;
  showingWorkshop: boolean;
  showingMercenary: boolean;
  showingAlchemy: boolean;
  alchemyUnlocked: boolean;
  lobbyElectrons: number;
  neutrons: number;
  betaDecayVaultNeutrons?: number;
  betaDecayLastTimestamp?: number;
  unlockedAlchemyAtoms: string[];
  baseAtoms: string[];
  showingBossIntro?: boolean;
  bossIntroTimer?: number;
  bossIntroName?: string;
  bossIntroDesc?: string;
  staminaPotionPurchases: number;
  healPotionPurchases: number;
  shieldPotionPurchases: number;
  unlockedMolecules: string[];
  drops: { id: number, pos: Vector2, vel: Vector2, value: number, life: number, text?: string, color?: string, isProton?: boolean, isAtom?: boolean, isPortal?: boolean }[];
  shopTab: 'weapons' | 'potions' | 'stats';
  heat: number;
  overheated: boolean;
  nearPortal: boolean;
  nearPortalIsLobby: boolean;
  maxHpLevel: number;
  regenLevel: number;
  speedLevel: number;
  gunLevel: number;
  armorLevel: number;
  heatLevel: number;
  potions: { heal: number, shield: number, stamina: number };
  hasSuperWeapon: boolean;
  equippedWeapon: 'normal' | 'super' | 'shotgun' | 'orbit';
  activeShield: number;
  activeStaminaRegen: number;
  pickupRadiusBonus: number;
  devGodMode: boolean;
  devInstaKill: boolean;
  devPaused: boolean;
  selectedCharacter: string;
  difficulty: 'kids' | 'easy' | 'normal' | 'hard';
  language: 'pl' | 'en';
  autoNextLevel: boolean;
  disableScreenShake: boolean;
  stats: {
    reactionsCount: Record<string, number>;
    reactionDamage: Record<string, number>;
    totalDamage: number;
  };
  charUpgrades: Record<string, CharacterUpgradeState>;
}
