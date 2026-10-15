/**
 * A6-ROSETTA: Adversarial Anti-Human & Anti-AI Semantic Camouflage Protocol
 *
 * Why standard obfuscation (`_0x1a2b`) fails against modern AI:
 * When an LLM (ChatGPT / Claude / Gemini) sees purely random hex names (`_0x4f2a`), it knows
 * the code is obfuscated and focuses 100% on mathematical control-flow analysis.
 *
 * How A6-ROSETTA defeats both human crackers and AI models without the Rosetta Key:
 * 1. Hexagonal Prefix + Adversarial Semantic Decoys ("Prompt-Poisoning Identifiers"):
 *    Every cryptographic primitive (SHA-256, Lagged Fibonacci Generator, Keyed S-Box,
 *    K_1/K_2 Rule-of-Zero Cluster Decoder, Base96) and every game engine subsystem
 *    (Combat, Weapons, Revive, Save, BossRush, Physics, Audio) is renamed to a deterministic
 *    `_q0x...` token paired with a mundane, low-level UI/CSS/Font-Kerning/Spline/SVG decoy suffix.
 * 2. When a human or an AI without this Rosetta table inspects the loader or RAM dump,
 *    semantic attention heads classify `ChemRevive` (`_q0x54a_cssFlexMargin`) as a CSS Flexbox
 *    margin helper, `ChemicatsSave` (`_q0x83d_intlLocalePlural`) as an i18n pluralization rule,
 *    and the A6-CRYPT cluster decoder (`_q0x24_catmullPatch`) as a Catmull-Rom spline rasterizer.
 */

export const A6_LOADER_ROSETTA = Object.freeze({
  // DOM & Global Hooks
  "chem-boot-status": {
    code: "_q0x0a_ariaLiveRegion",
    role: "Element DOM <p> wyświetlający status rozruchu przed document.write()",
  },
  "chem-packed": {
    code: "_q0x0b_svgGlyphStream",
    role: "Tag <script type='application/octet-stream'> przechowujący strumień Base96 kontenera A6-CRYPT",
  },
  "__A6_HARDWARE_KEY__": {
    code: "__Q0X_SUBPIXEL_AA_MATRIX__",
    role: "Globalny rejestr w pamięci RAM, do którego natywny kod (Kotlin APK / Rust Steam) wstrzykuje klucz sprzętowy/certyfikatowy",
  },
  "__A6_ANDROID_TOUCH_ONLY__": {
    code: "__Q0X_POINTER_COARSE_LOCK__",
    role: "Flaga wymuszająca tryb wyłącznie dotykowy po fizycznej kastracji sterowania PC w buildzie Android",
  },
  ChemPackedBoot: {
    code: "_q0x99_fontAtlasMetrics",
    role: "Globalny zamrożony obiekt diagnostyczny przechowujący czasy dekodowania RAM i sumy kontrolne SHA-256",
  },

  // Cryptographic Lookup Tables
  BASE_F_K1: {
    code: "_q0x10_splineKnotA",
    role: "Bazowa tablica Fibonacciego Klastra K_1 (wypełniacz precyzyjny: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55])",
  },
  BASE_F_K2: {
    code: "_q0x11_splineKnotB",
    role: "Bazowa tablica Fibonacciego Klastra K_2 z Regułą Zera ([0, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181])",
  },
  K_SHA: {
    code: "_q0x12_srgbChromaLut",
    role: "64 stałe rund kompresji kryptograficznej SHA-256 (0x428a2f98..0xc67178f2), zamaskowane jako tablica chrominancji sRGB",
  },

  // Core Loader Functions
  rotr: {
    code: "_q0x20_lerp",
    role: "32-bitowa rotacja bitowa w prawo (ROTR) używana wewnątrz funkcji skrótu SHA-256",
  },
  sha256Bytes: {
    code: "_q0x21_glyphKernBox",
    role: "Czysta implementacja kryptograficzna SHA-256 w pamięci RAM (generuje 256-bitowy skrót z klucza, soli i rozpakowanego kodu)",
  },
  deriveKeyMaterial: {
    code: "_q0x22_bezierMeshLut",
    role: "Warstwa 3 (KDF + S-Box): rozwija klucz SHA-256 w 256 bajtów strumienia, tasuje permutacje Fisher-Yates dla S-Boxów K_1 i K_2 oraz inicjalizuje 55 słów generatora LFG",
  },
  unwhitenStream: {
    code: "_q0x23_biquadDither",
    role: "Warstwa 2 (Wybielanie LFG + XOR + ROR8): cofa rotację bitową i maskę XOR opóźnionego generatora Fibonacciego S_n = (S_{n-24} + S_{n-55}) mod 2^32 połączonego z nieliniowym S-Boxem K_1/K_2",
  },
  decodeClustersO1: {
    code: "_q0x24_catmullPatch",
    role: "Warstwa 4 (Dekoder Klastrów A6-CRYPT w czasie O(1)): rozpakowuje 32-bitowe czwórki (K_1, K_2) równaniem c1*c2*c3+c4 z Regułą Zera i odejmuje bias ciągłości F_11 = 89",
  },
  base96: {
    code: "_q0x25_svgPathParse",
    role: "Dekoder zmiennobitowego kodowania tekstowego Base96 (13/14 bitów na parę znaków ASCII)",
  },

  // Runtime Variables inside Loader
  rawKey: {
    code: "_q0x3c_aaCalib",
    role: "Aktywny klucz deszyfrujący w pamięci RAM (pobrany z certyfikatu APK / Steamworks lub klucza buildu Web)",
  },
  outerSalt: {
    code: "_q0x30_insetPad",
    role: "Pierwsze 16 bajtów kontenera [0..15]: losowa sól zewnętrzna dla S-Boxa nagłówka",
  },
  headerClusters: {
    code: "_q0x31_kernPairs",
    role: "Bajty [16..319] (304 B): polimorficzny nagłówek zakodowany w parach klastrów Fibonacciego (K_1 + K_2)",
  },
  whitenedPayload: {
    code: "_q0x32_mipmapTex",
    role: "Bajty [320..EOF]: główny skompresowany wsad gry wybielony szyfrem strumieniowym LFG + S-Box (bez sygnatury Gzip 0x1F 0x8B)",
  },
  outerKeyMat: {
    code: "_q0x33_outerMesh",
    role: "Zewnętrzny materiał klucza (S-Box K_1/K_2 + LFG) wyprowadzony z klucza głównego i outerSalt",
  },
  headerWhitened: {
    code: "_q0x34_patchRaw",
    role: "76-bajtowy nagłówek po zdekodowaniu klastrów O(1), przed zdjęciem wybielania LFG",
  },
  headerPlain: {
    code: "_q0x35_patchNorm",
    role: "76-bajtowy odszyfrowany nagłówek binarny zawierający magic 'A6CR', rozmiary, 32-bajtowy sessionSeed i 240-bitowy tag SHA-256",
  },
  expectedSourceLen: {
    code: "_q0x36_glyphCnt",
    role: "Oczekiwany rozmiar rozpakowanego kodu gry w bajtach (offset [6..9] nagłówka)",
  },
  expectedCompLen: {
    code: "_q0x37_texelCnt",
    role: "Oczekiwany rozmiar skompresowanego strumienia w bajtach (offset [10..13] nagłówka)",
  },
  sessionSeed: {
    code: "_q0x38_aoKernel",
    role: "32-bajtowy jednorazowy klucz sesyjny (offset [14..45] nagłówka) sterujący wewnętrznym szyfrem LFG + S-Box",
  },
  expectedShaPrefix: {
    code: "_q0x39_chromaTag",
    role: "30-bajtowy (240-bitowy) prefiks skrótu SHA-256 oryginału (offset [46..75] nagłówka) weryfikujący integralność po dekompresji",
  },
  innerKeyMat: {
    code: "_q0x3a_innerMesh",
    role: "Wewnętrzny materiał klucza (S-Box K_1/K_2 + LFG) wyprowadzony z klucza głównego i 32-bajtowego sessionSeed",
  },
  gzBytes: {
    code: "_q0x3b_pcmBuf",
    role: "Odszyfrowany strumień Gzip w pamięci RAM tuż przed przekazaniem do DecompressionStream('gzip')",
  },

  // Deceptive Error Codes
  ERR_CLUSTER_INTEGRITY: {
    code: "E_GLYPH_KERN_0x71",
    role: "Błąd autoryzacji klastrów K_1+K_2 (wynik poza przedziałem 0..255 — zły klucz S-Boxa lub uszkodzony plik)",
  },
  ERR_HEADER_MAGIC: {
    code: "E_BEZIER_HDR_0x41",
    role: "Błąd sygnatury 'A6CR' (0x41 0x36 0x43 0x52) wewnątrz odszyfrowanego nagłówka klastrowego",
  },
  ERR_PAYLOAD_LEN: {
    code: "E_MIPMAP_LEN_0x37",
    role: "Niezgodność rozmiaru zaszyfrowanego wsadu z polem expectedCompLen w nagłówku",
  },
  ERR_SHA256_TAG: {
    code: "E_CHROMA_TAG_0x39",
    role: "Błąd weryfikacji 240-bitowej sumy kontrolnej SHA-256 po rozpakowaniu w pamięci RAM",
  },
});

/**
 * Complete Rosetta Mapping of all 131 Internal Game Engine Modules (`Chem*`, `Chemicats*`, `initChemAudioPlayer`).
 * Every module is mapped to a unique `_q0x...` code-name disguised as an uninteresting UI/CSS/DOM/SVG/Font helper.
 */
export const A6_ENGINE_ROSETTA = Object.freeze({
  // === I. Core Engine, GPU Lighting & Raytracing ===
  ChemGPU: {
    code: "_q0x01a_cssBoxSizing",
    category: "GPU & Render",
    role: "Silnik WebGL2 WARL (rozmycie pola energii i mapowanie tonów sRGB na GPU z automatycznym fallbackiem CPU)",
  },
  ChemSuper: {
    code: "_q0x02b_domScrollSnap",
    category: "GPU & Render",
    role: "Główny akcelerator pakietów fotonowych i promieni WebGL2 (tryby PC 128 źródeł / Extreme 512 źródeł, odbicia i refrakcja)",
  },
  ChemGraphics: {
    code: "_q0x03c_svgViewBoxFit",
    category: "GPU & Render",
    role: "Menedżer profili graficznych, skalowania rozdzielczości, limitów klatek i budżetu cieniowania",
  },
  ChemFXAnim: {
    code: "_q0x04d_cssKeyframeLerp",
    category: "GPU & Render",
    role: "System animacji cząsteczkowych, rozbłysków reakcji, smug pocisków i efektów trafień",
  },
  ChemAnimationPolicy: {
    code: "_q0x05e_ariaMotionPref",
    category: "GPU & Render",
    role: "Polityka płynności animacji, redukcji ruchu i adaptacji klatek pod urządzenia mobilne i PC",
  },
  ChemAtlasEffects: {
    code: "_q0x06f_glyphSubpixelAa",
    category: "GPU & Render",
    role: "Efekty wizualne atlasu pierwiastków, poświaty izotopów i wizualizacje orbitali",
  },
  ChemVerifiedEffects: {
    code: "_q0x07a_rectClipBounds",
    category: "GPU & Render",
    role: "Walidator poprawności efektów specjalnych i stanów wizualnych po reakcjach chemicznych",
  },

  // === II. Combat, Bosses, Dodge, Weapons & Upgrades ===
  ChemCombat: {
    code: "_q0x10a_domAriaLayout",
    category: "Walka i Fizyka",
    role: "Główna pętla walki, obrażeń, kolizji pocisków, i-frame'ów oraz idealnego uniku (złote goko/pierd przy idealnym uniku)",
  },
  ChemCombatFlow: {
    code: "_q0x11b_flexRowGutter",
    category: "Walka i Fizyka",
    role: "Sterownik tempa starć, fal przeciwników, przejść między pokojami i dynamiki agresji",
  },
  ChemCombatPolish: {
    code: "_q0x12c_textEllipsisWrap",
    category: "Walka i Fizyka",
    role: "Dopracowanie odczuć walki (hit-stop, odrzut, złota poświata idealnego uniku, feedback trafień)",
  },
  ChemCombatTrailer: {
    code: "_q0x13d_mediaAspectCrop",
    category: "Walka i Fizyka",
    role: "Sekwencje pokazowe i dynamiczne kamery/efekty w kulminacyjnych momentach starć",
  },
  ChemWeapons: {
    code: "_q0x14e_fontGlyphKern",
    category: "Walka i Fizyka",
    role: "Arsenał broni chemicznych, statystyki strzałów, zużycie amunicji/energii i modyfikatory żywiołów",
  },
  ChemWeaponChoice: {
    code: "_q0x15f_selectOptionNode",
    category: "Walka i Fizyka",
    role: "Interfejs i logika wyboru oraz przełączania broni przed i w trakcie runu",
  },
  ChemUpgrades: {
    code: "_q0x16a_svgStrokeDash",
    category: "Walka i Fizyka",
    role: "Drzewko ulepszeń za protony, elektrony i neutrony oraz skalowanie statystyk gracza",
  },
  ChemRevive: {
    code: "_q0x17b_cssFlexMargin",
    category: "Walka i Fizyka",
    role: "System wykupienia powrotu do życia za protony (skalowany zależnie od piętra i liczby wcześniejszych wskrzeszeń w runie)",
  },
  ChemBossRush: {
    code: "_q0x18c_bezierTangentLut",
    category: "Walka i Fizyka",
    role: "Tryb Boss Rush (odblokowywany po przejściu do 3. piętra, kolejne areny bossów i nagrody)",
  },
  ChemBossDeaths: {
    code: "_q0x19d_canvasPathArc",
    category: "Walka i Fizyka",
    role: "Sekwencje śmierci bossów, eksplozje rdzeni i wypłaty elektronów/neutronów (1 / 5 / 10 / 20 / 40 za kolejnych bossów)",
  },
  ChemEnemyDeaths: {
    code: "_q0x1ae_borderRadiusPx",
    category: "Walka i Fizyka",
    role: "Logika pokonania zwykłych wrogów, dropów materii i rozpadu cząsteczkowego",
  },
  ChemEnemyNav: {
    code: "_q0x1bf_gridAutoColumns",
    category: "Walka i Fizyka",
    role: "Sztuczna inteligencja poruszania się wrogów, omijania przeszkód i okrążania gracza",
  },
  ChemEnemyWarnings: {
    code: "_q0x1c0_outlineOffsetEm",
    category: "Walka i Fizyka",
    role: "Wskaźniki ostrzegawcze o nadchodzących atakach spoza ekranu i szarżach wrogów",
  },
  ChemAttackTelegraphs: {
    code: "_q0x1d1_caretColorStyle",
    category: "Walka i Fizyka",
    role: "Telegrafowanie obszarów rażenia bossów i wrogów (strefy niebezpieczeństwa na podłodze)",
  },
  ChemHostileTrace: {
    code: "_q0x1e2_pointerEventsNone",
    category: "Walka i Fizyka",
    role: "Śledzenie trajektorii wrogich pocisków i promieni zagrożenia",
  },
  ChemCatDeaths: {
    code: "_q0x1f3_userSelectNone",
    category: "Walka i Fizyka",
    role: "Obsługa utraty życia przez kota gracza i animacja ratunkowa/upadku",
  },
  ChemAuxDeaths: {
    code: "_q0x204_listStyleType",
    category: "Walka i Fizyka",
    role: "Obsługa zniszczenia obiektów pomocniczych, dronów, wieżyczek i pułapek",
  },
  ChemDeathBurst: {
    code: "_q0x215_boxShadowSpread",
    category: "Walka i Fizyka",
    role: "Fala uderzeniowa i rozrzut cząstek przy śmierci jednostek",
  },
  ChemDeathFX: {
    code: "_q0x226_filterSepiaTone",
    category: "Walka i Fizyka",
    role: "Efekty wizualne ekranu śmierci i spowolnienia czasu (slow-motion)",
  },
  ChemDeathPanel: {
    code: "_q0x237_dialogBackdrop",
    category: "Walka i Fizyka",
    role: "Ekran podsumowania po zgonie (opcja wskrzeszenia za protony lub powrót do bazy)",
  },
  ChemDeathPolicy: {
    code: "_q0x248_overflowClipBox",
    category: "Walka i Fizyka",
    role: "Reguły zachowania ekwipunku, walut i postępu po śmierci gracza",
  },
  ChemDeathReview: {
    code: "_q0x259_tableCellAlign",
    category: "Walka i Fizyka",
    role: "Analiza przyczyny zgonu (co zadało ostatnie obrażenia i raport obrażeń)",
  },

  // === III. Chemistry, Periodic Table, Matter, Reactions & Electricity ===
  ChemPeriodic: {
    code: "_q0x30a_fontVariantNum",
    category: "Chemia i Fizyka Materii",
    role: "Układ okresowy pierwiastków, właściwości atomowe, masy (w tym ciekawostka 1836 m_p/m_e) i konfiguracje",
  },
  ChemPeriodicSymbols: {
    code: "_q0x31b_unicodeBidiIso",
    category: "Chemia i Fizyka Materii",
    role: "Symbole, kolory i oznaczenia pierwiastków chemicznych w UI oraz świecie gry",
  },
  ChemMatter: {
    code: "_q0x32c_marginCollapse",
    category: "Chemia i Fizyka Materii",
    role: "Rdzeń symulacji materii, gęstości, stanów skupienia i interakcji substancji",
  },
  ChemMatterVisual: {
    code: "_q0x33d_backgroundClip",
    category: "Chemia i Fizyka Materii",
    role: "Renderowanie cieczy, gazów, osadów i kryształów na planszy",
  },
  ChemMaterialState: {
    code: "_q0x34e_borderCollapse",
    category: "Chemia i Fizyka Materii",
    role: "Przejścia fazowe materiałów (topnienie, parowanie, sublimacja, krzepnięcie)",
  },
  ChemPhase: {
    code: "_q0x35f_zIndexStacking",
    category: "Chemia i Fizyka Materii",
    role: "Zarządzanie fazami fizycznymi i stanami reaktywności w pokojach",
  },
  ChemWallMatter: {
    code: "_q0x36a_paddingInline",
    category: "Chemia i Fizyka Materii",
    role: "Właściwości materiałowe ścian (przewodnictwo, odbijanie światła, korozja kwasowa, niszczenie)",
  },
  ChemThermalState: {
    code: "_q0x37b_colorSchemeDark",
    category: "Chemia i Fizyka Materii",
    role: "Symulacja temperatury, przewodnictwa cieplnego, zapłonu i wychłodzenia",
  },
  ChemReactionTrace: {
    code: "_q0x38c_textIndent Calc",
    category: "Chemia i Fizyka Materii",
    role: "Rejestrator przebiegu reakcji chemicznych i bilansu energetycznego",
  },
  ChemReactionTrace_clean: "_q0x38c_textIndentCalc",
  ChemReactionPlum: {
    code: "_q0x39d_radialGradStop",
    category: "Chemia i Fizyka Materii",
    role: "Chmury oparów, dymu i toksycznych wyziewów powstających w wyniku reakcji",
  },
  ChemBondMotion: {
    code: "_q0x3ae_cubicBezierPts",
    category: "Chemia i Fizyka Materii",
    role: "Dynamika drgań wiązań chemicznych i sprężystości cząsteczek",
  },
  ChemBondStructures: {
    code: "_q0x3bf_svgPolygonPts",
    category: "Chemia i Fizyka Materii",
    role: "Topologia wiązań kowalencyjnych, jonowych i metalicznych",
  },
  ChemLab: {
    code: "_q0x3c0_gridTemplateArea",
    category: "Chemia i Fizyka Materii",
    role: "Laboratorium chemiczne gracza (syntetyzowanie związków, badania i testy)",
  },
  ChemElectric: {
    code: "_q0x3d1_flexBasisAuto",
    category: "Chemia i Fizyka Materii",
    role: "Symulacja prądu elektrycznego, napięcia, łuków elektrycznych i elektrolizy",
  },
  ChemElectricFX: {
    code: "_q0x3e2_strokeMiterLim",
    category: "Chemia i Fizyka Materii",
    role: "Renderowanie wyładowań, błyskawic i spięć na przewodnikach",
  },
  ChemElectricHooks: {
    code: "_q0x3f3_eventTargetBind",
    category: "Chemia i Fizyka Materii",
    role: "Wyzwalacze środowiskowe reagujące na przepływ prądu (otwieranie bramek, cewki)",
  },
  ChemElectricChoice: {
    code: "_q0x404_radioGroupCheck",
    category: "Chemia i Fizyka Materii",
    role: "Wybór modyfikatorów i obwodów elektrycznych w trakcie rozgrywki",
  },
  ChemConductionRoom: {
    code: "_q0x415_columnGapRule",
    category: "Chemia i Fizyka Materii",
    role: "Specjalne pokoje zagadek i walk opartych na przewodnictwie elektrycznym i cieczach",
  },
  ChemEnergyIsotope: {
    code: "_q0x426_fontStretchCond",
    category: "Chemia i Fizyka Materii",
    role: "Mechanika rozpadu promieniotwórczego izotopów i emisji energii",
  },
  ChemEnergyPressure: {
    code: "_q0x437_lineHeightNorm",
    category: "Chemia i Fizyka Materii",
    role: "Mechanika ciśnienia gazów, fali uderzeniowej i dekompresji",
  },
  ChemEnergyVoltage: {
    code: "_q0x448_letterSpacingEm",
    category: "Chemia i Fizyka Materii",
    role: "Mechanika potencjału elektrochemicznego i ogniw galwanicznych",
  },
  ChemHydrogenShadow: {
    code: "_q0x459_dropShadowBlur",
    category: "Chemia i Fizyka Materii",
    role: "Specjalny stan kwantowego cienia wodorowego / tunelowania",
  },

  // === IV. World Generation, Biomes, Rooms & Knowledge Book ===
  ChemBiomes: {
    code: "_q0x50a_mediaQueryMatch",
    category: "Świat, Biomy i Księga",
    role: "Definicje biomów, palet kolorystycznych, zagrożeń środowiskowych i pięter",
  },
  ChemRoomShapes: {
    code: "_q0x51b_aspectRatioBox",
    category: "Świat, Biomy i Księga",
    role: "Generator geometrii pokoi, korytarzy, filarów i przeszkód",
  },
  ChemRoomGates: {
    code: "_q0x52c_borderImageSlice",
    category: "Świat, Biomy i Księga",
    role: "Logika drzwi, śluz między pokojami, blokad na czas walki i przejść na kolejne piętro",
  },
  ChemBestiary: {
    code: "_q0x53d_captionSideTop",
    category: "Świat, Biomy i Księga",
    role: "Bestiariusz wrogów i bossów wraz ze statystykami, odpornościami i opisami",
  },
  ChemKnowledge: {
    code: "_q0x54e_counterResetIdx",
    category: "Świat, Biomy i Księga",
    role: "Baza wiedzy chemicznej, odkrytych reakcji i ciekawostek naukowych",
  },
  ChemKnowledgeCard: {
    code: "_q0x55f_cardPaddingBox",
    category: "Świat, Biomy i Księga",
    role: "Komponent wizualny pojedynczej karty wiedzy/ciekawostki chemicznej",
  },
  ChemBook: {
    code: "_q0x56a_bookSpineLayout",
    category: "Świat, Biomy i Księga",
    role: "Główny interfejs Księgi Alchemii / Chemii (encyklopedia przepisów i związków)",
  },
  ChemBookCategory: {
    code: "_q0x57b_tabNavHeader",
    category: "Świat, Biomy i Księga",
    role: "Kategorie działów w Księdze Chemii",
  },
  ChemBookSubcategory: {
    code: "_q0x58c_subTabItemNode",
    category: "Świat, Biomy i Księga",
    role: "Podkategorie związków chemicznych w Księdze",
  },
  ChemBookComposition: {
    code: "_q0x59d_spanInlineBlock",
    category: "Świat, Biomy i Księga",
    role: "Widok składu stechiometrycznego cząsteczek w Księdze",
  },
  ChemBookStructure: {
    code: "_q0x5ae_svgLineCapRound",
    category: "Świat, Biomy i Księga",
    role: "Rysowanie wzorów strukturalnych cząsteczek w Księdze",
  },
  ChemBookEl: {
    code: "_q0x5bf_domNodeWrapper",
    category: "Świat, Biomy i Księga",
    role: "Kontener DOM elementów Księgi Chemii",
  },
  ChemBookInstallStyle: {
    code: "_q0x5c0_styleSheetMount",
    category: "Świat, Biomy i Księga",
    role: "Dynamiczne arkusze stylów dla Księgi Chemii",
  },
  ChemBookMark: {
    code: "_q0x5d1_anchorBookmark",
    category: "Świat, Biomy i Księga",
    role: "Zakładki w Księdze Chemii do szybkiego przełączania stron",
  },
  ChemBookNonmetals: {
    code: "_q0x5e2_gridCellSpan",
    category: "Świat, Biomy i Księga",
    role: "Sekcja niemetali i ich reaktywności w Księdze",
  },
  ChemBookShelves: {
    code: "_q0x5f3_flexWrapShelf",
    category: "Świat, Biomy i Księga",
    role: "Widok półek z odczynnikami w Księdze",
  },
  ChemBookSodiumWaterRecipes: {
    code: "_q0x604_tableRowStripe",
    category: "Świat, Biomy i Księga",
    role: "Specjalne receptury reakcji metali alkalicznych (np. sód + woda -> eksplozja)",
  },
  ChemBookSpecial: {
    code: "_q0x615_badgePillOffset",
    category: "Świat, Biomy i Księga",
    role: "Receptury specjalne i egzotyczne związki w Księdze",
  },
  ChemRecipeHints: {
    code: "_q0x626_tooltipArrowPos",
    category: "Świat, Biomy i Księga",
    role: "System podpowiedzi do nieodkrytych jeszcze reakcji chemicznych",
  },
  ChemRecipeHintCard: {
    code: "_q0x637_hintBoxShadow",
    category: "Świat, Biomy i Księga",
    role: "Karta podpowiedzi receptury w UI",
  },
  ChemRecipeIndex: {
    code: "_q0x648_btreeIndexLut",
    category: "Świat, Biomy i Księga",
    role: "Indeks wyszukiwania wszystkich receptur chemicznych",
  },
  ChemRecipeStats: {
    code: "_q0x659_statBarFillPct",
    category: "Świat, Biomy i Księga",
    role: "Statystyki użycia i siły poszczególnych receptur",
  },
  ChemRecentReactionCard: {
    code: "_q0x66a_toastSlideIn",
    category: "Świat, Biomy i Księga",
    role: "Powiadomienie/karta ostatnio przeprowadzonej reakcji chemicznej",
  },
  ChemExtraCategories: {
    code: "_q0x67b_navOverflowMenu",
    category: "Świat, Biomy i Księga",
    role: "Dodatkowe kategorie klasyfikacji obiektów i reakcji",
  },
  ChemV25Categories: {
    code: "_q0x68c_legacyGridV25",
    category: "Świat, Biomy i Księga",
    role: "Rozszerzenia kategorii wprowadzone w wersji 25 silnika",
  },
  ChemV26Categories: {
    code: "_q0x69d_legacyGridV26",
    category: "Świat, Biomy i Księga",
    role: "Rozszerzenia kategorii wprowadzone w wersji 26 silnika",
  },
  ChemLegacyReserveCandidates: {
    code: "_q0x6ae_poolBufferAlloc",
    category: "Świat, Biomy i Księga",
    role: "Pula rezerwowych definicji i wariantów kompatybilności wstecznej",
  },

  // === V. Procedural Audio Synthesizer, Radio & Music Player ===
  ChemMusicPlayback: {
    code: "_q0x70a_audioCtxGain",
    category: "Audio i Muzyka Proceduralna",
    role: "Główny odtwarzacz i syntezator Web Audio API generujący muzykę w czasie rzeczywistym (0 MB plików MP3)",
  },
  ChemMusicStats: {
    code: "_q0x71b_fftSpectrumBin",
    category: "Audio i Muzyka Proceduralna",
    role: "Telemetria odtwarzania muzyki, analizator widma i ranking utworów",
  },
  ChemMusicTransitions: {
    code: "_q0x72c_crossfadeCurve",
    category: "Audio i Muzyka Proceduralna",
    role: "Płynne przejścia (crossfade) między muzyką eksploracji, walki i bossów",
  },
  ChemBiomeMusic: {
    code: "_q0x73d_oscDetuneCent",
    category: "Audio i Muzyka Proceduralna",
    role: "Proceduralne ścieżki dźwiękowe przypisane do poszczególnych biomów",
  },
  ChemNeonMusic: {
    code: "_q0x74e_sawtoothWaveLut",
    category: "Audio i Muzyka Proceduralna",
    role: "Syntezator utworów synthwave/neon (NeonDance, LabRave, ElectronDawn)",
  },
  ChemHeartMusic: {
    code: "_q0x75f_pulseWidthMod",
    category: "Audio i Muzyka Proceduralna",
    role: "Silnik muzyczny utworu Heart Reactor i motywów rdzenia",
  },
  ChemAnthemMusic: {
    code: "_q0x76a_chorusDelayTap",
    category: "Audio i Muzyka Proceduralna",
    role: "Generator hymnu głównego i motywów przewodnich gry",
  },
  ChemGuitarVoice: {
    code: "_q0x77b_karplusStrong",
    category: "Audio i Muzyka Proceduralna",
    role: "Fizyczny model syntezy przesterowanej gitary elektrycznej i riffów metalowych",
  },
  ChemGuitarSong: {
    code: "_q0x78c_riffSequencer",
    category: "Audio i Muzyka Proceduralna",
    role: "Sekwencer bojowych utworów gitarowych i metalowych",
  },
  ChemOriginalTrack: {
    code: "_q0x79d_masterBusComp",
    category: "Audio i Muzyka Proceduralna",
    role: "Odtwarzacz klasycznych/oryginalnych aranżacji ścieżki dźwiękowej",
  },
  ChemTrackCatalog: {
    code: "_q0x7ae_playlistIndex",
    category: "Audio i Muzyka Proceduralna",
    role: "Pełny katalog ścieżek dźwiękowych dostępnych w grze i odtwarzaczu",
  },
  ChemTrackStepLength: {
    code: "_q0x7bf_tempoBpmTick",
    category: "Audio i Muzyka Proceduralna",
    role: "Przelicznik długości kroków sekwencera względem BPM utworu",
  },
  ChemRadio: {
    code: "_q0x7c0_tunerDialKnob",
    category: "Audio i Muzyka Proceduralna",
    role: "Wewnątrzgrowe radio pozwalające przełączać stacje i utwory podczas gry",
  },
  ChemAudioFX: {
    code: "_q0x7d1_biquadResonance",
    category: "Audio i Muzyka Proceduralna",
    role: "Generator efektów dźwiękowych SFX (strzały, wybuchy, reakcje, interfejs)",
  },
  ChemAudioLevels: {
    code: "_q0x7e2_decibelGainMap",
    category: "Audio i Muzyka Proceduralna",
    role: "Mikser głośności (Master, Muzyka, SFX) i kompresja dynamiki",
  },
  initChemAudioPlayer: {
    code: "_q0x7f3_mountMediaTray",
    category: "Audio i Muzyka Proceduralna",
    role: "Inicjalizator mobilnego/desktopowego odtwarzacza Chemicats Music (tryb Spotify/YT Music + gra w tle z MediaSession)",
  },

  // === VI. Controls, Input, Touch, Gamepad & Aiming ===
  ChemInputView: {
    code: "_q0x80a_focusRingStyle",
    category: "Sterowanie i Interfejs",
    role: "Warstwa abstrakcji wejścia (automatyczne wykrywanie: dotyk / mysz+klawiatura / pad)",
  },
  ChemTouchControls: {
    code: "_q0x81b_touchActionPan",
    category: "Sterowanie i Interfejs",
    role: "Wirtualne gałki (twin-stick) i przyciski dotykowe na ekranach mobilnych (Android/iOS)",
  },
  ChemTouchSettings: {
    code: "_q0x82c_hitSlopRadius",
    category: "Sterowanie i Interfejs",
    role: "Konfiguracja rozmiaru, czułości i rozmieszczenia przycisków dotykowych",
  },
  ChemAim: {
    code: "_q0x83d_cursorCrosshair",
    category: "Sterowanie i Interfejs",
    role: "System celowania, wspomagania celowania (aim-assist) i wektorów strzału",
  },
  ChemAimControls: {
    code: "_q0x84e_pointerLockDelta",
    category: "Sterowanie i Interfejs",
    role: "Ustawienia czułości celownika, martwych stref i trybu celowania",
  },
  ChemPad: {
    code: "_q0x85f_gamepadAxisMap",
    category: "Sterowanie i Interfejs",
    role: "Obsługa kontrolerów (Gamepad API: Xbox, DualSense, Steam Deck) i wibracji",
  },
  ChemPadHelp: {
    code: "_q0x86a_buttonGlyphSvg",
    category: "Sterowanie i Interfejs",
    role: "Podpowiedzi przypisania przycisków kontrolera na ekranie",
  },
  ChemWheel: {
    code: "_q0x87b_radialMenuArc",
    category: "Sterowanie i Interfejs",
    role: "Kołowe menu szybkiego wyboru broni i odczynników",
  },
  ChemPanelFocus: {
    code: "_q0x88c_tabIndexOrder",
    category: "Sterowanie i Interfejs",
    role: "Zarządzanie fokusem nawigacji w oknach modalnych i menu",
  },

  // === VII. Save System, UI Scaling, Readability, Story & LAN ===
  ChemicatsSave: {
    code: "_q0x90a_intlLocalePlural",
    category: "Zapis, UI i System",
    role: "Główny menedżer zapisu stanu gry (waluty, odblokowania, postęp pięter, eksport/import sejwa)",
  },
  ChemAutoSave: {
    code: "_q0x91b_idleCallbackTick",
    category: "Zapis, UI i System",
    role: "Automatyczny zapis postępu między pokojami i piętrami",
  },
  ChemSaveTools: {
    code: "_q0x92c_jsonSchemaCheck",
    category: "Zapis, UI i System",
    role: "Narzędzia migracji, naprawy i weryfikacji integralności plików zapisu",
  },
  ChemReadability: {
    code: "_q0x93d_contrastRatioAa",
    category: "Zapis, UI i System",
    role: "System czytelności i responsywnego skalowania UI na różnych urządzeniach (telefony, tablety, monitory 4K)",
  },
  ChemReadabilityPanel: {
    code: "_q0x94e_fontSizeClamp",
    category: "Zapis, UI i System",
    role: "Panel ustawień skali interfejsu, kontrastu tła i grubości czcionek",
  },
  ChemAccessibility: {
    code: "_q0x95f_ariaDescribedBy",
    category: "Zapis, UI i System",
    role: "Ułatwienia dostępu (tryby dla daltonistów, redukcja błysków, wzmocnienie konturów)",
  },
  ChemAccessibilityPanel: {
    code: "_q0x96a_roleSwitchNode",
    category: "Zapis, UI i System",
    role: "Menu konfiguracji ułatwień dostępu",
  },
  ChemI18n: {
    code: "_q0x97b_langTagBcp47",
    category: "Zapis, UI i System",
    role: "System tłumaczeń dwujęzycznych (Polski / Angielski)",
  },
  ChemWelcome: {
    code: "_q0x98c_heroBannerFlex",
    category: "Zapis, UI i System",
    role: "Ekran powitalny, samouczek wprowadzający i wybór początkowy",
  },
  ChemCharacterIdentity: {
    code: "_q0x99d_avatarBadgeClip",
    category: "Zapis, UI i System",
    role: "Dane postaci/kotów (statystyki bazowe, umiejętności pasywne, historia)",
  },
  ChemCharacterIdentityCard: {
    code: "_q0x9ae_profileCardGrid",
    category: "Zapis, UI i System",
    role: "Karta wyboru postaci w menu",
  },
  ChemEnding: {
    code: "_q0x9bf_creditsScrollY",
    category: "Zapis, UI i System",
    role: "Logika zakończenia gry po pokonaniu ostatniego bossa (wypłata 40 waluty i finał)",
  },
  ChemEndingActors: {
    code: "_q0x9c0_spriteStagePos",
    category: "Zapis, UI i System",
    role: "Postacie i animacje występujące w scenie finałowej",
  },
  ChemEndingCSS: {
    code: "_q0x9d1_epilogueStyle",
    category: "Zapis, UI i System",
    role: "Arkusze stylów ekranu finałowego",
  },
  ChemEndingCopy: {
    code: "_q0x9e2_epilogueTextBlock",
    category: "Zapis, UI i System",
    role: "Teksty fabularne epilogu i podsumowania zwycięstwa",
  },
  ChemEndingEl: {
    code: "_q0x9f3_epilogueRootDom",
    category: "Zapis, UI i System",
    role: "Główny kontener DOM sceny końcowej",
  },
  ChemEndingScene: {
    code: "_q0xa04_cinemaLetterbox",
    category: "Zapis, UI i System",
    role: "Reżyser sceny finałowej i efektów cząsteczkowych zakończenia",
  },
  ChemEndingScreen: {
    code: "_q0xa15_modalOverlayEnd",
    category: "Zapis, UI i System",
    role: "Ekran statystyk końcowych po ukończeniu gry",
  },
  ChemEndingUI: {
    code: "_q0xa26_summaryButtonRow",
    category: "Zapis, UI i System",
    role: "Przyciski nawigacji po ukończeniu gry (Nowa Gra+, Boss Rush, Menu)",
  },
  ChemTrial: {
    code: "_q0xa37_timerBadgeTick",
    category: "Zapis, UI i System",
    role: "System wyzwań czasowych i prób laboratoryjnych",
  },
  ChemSDK: {
    code: "_q0xa48_bridgePostMsg",
    category: "Zapis, UI i System",
    role: "Most integracyjny SDK platform zewnętrznych (osiągnięcia, chmura, kontenery natywne)",
  },
  ChemicatsPrivacy: {
    code: "_q0xa59_cookieConsentUi",
    category: "Zapis, UI i System",
    role: "Polityka prywatności i lokalnego przetwarzania danych offline",
  },
  ChemicatsPrivacyBridge: {
    code: "_q0xa6a_storageQuotaApi",
    category: "Zapis, UI i System",
    role: "Most uprawnień pamięci lokalnej dla WebView / Capacitor",
  },
  ChemLAN: {
    code: "_q0xa7b_rtcPeerChannel",
    category: "Zapis, UI i System",
    role: "Moduł sesji lokalnej / wymiany danych w sieci lokalnej",
  },
  ChemLANBanner: {
    code: "_q0xa8c_statusPillTop",
    category: "Zapis, UI i System",
    role: "Pasek informacyjny stanu połączenia LAN",
  },
  ChemLANPanel: {
    code: "_q0xa9d_peerListModal",
    category: "Zapis, UI i System",
    role: "Panel konfiguracji połączenia lokalnego",
  },
  ChemLANSession: {
    code: "_q0xaae_packetSyncLoop",
    category: "Zapis, UI i System",
    role: "Synchronizacja stanu sesji LAN",
  },
  ChemLANSettings: {
    code: "_q0xabf_netPortConfig",
    category: "Zapis, UI i System",
    role: "Ustawienia protokołu lokalnego",
  },
});

// Clean up accidental helper property if any and fix ChemReactionTrace
const CLEAN_ENGINE_MAP = new Map();
for (const [orig, entry] of Object.entries(A6_ENGINE_ROSETTA)) {
  if (entry && typeof entry === "object" && entry.code) {
    CLEAN_ENGINE_MAP.set(orig, {
      original: orig,
      code: entry.code.replace(/\s+/g, ""),
      category: entry.category,
      role: entry.role,
    });
  }
}

/**
 * Rewrites all 131 recognizable `Chem*` / `Chemicats*` / `initChemAudioPlayer` identifiers
 * in the JavaScript source bundle into their deceptive A6-ROSETTA code-names (`_q0x...`).
 */
export function applyRosettaCamouflage(jsSource) {
  let replacedCount = 0;
  // Sort keys longest-first so prefix matches never collide (though word boundaries \b already protect them)
  const keys = Array.from(CLEAN_ENGINE_MAP.keys()).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${keys.join("|")})\\b`, "g");

  const camouflagedCode = jsSource.replace(pattern, (match) => {
    const item = CLEAN_ENGINE_MAP.get(match);
    if (!item) return match;
    replacedCount++;
    return item.code;
  });

  return {
    code: camouflagedCode,
    replacedTokens: replacedCount,
    uniqueModulesCamouflaged: CLEAN_ENGINE_MAP.size,
  };
}

/**
 * Translates any obfuscated `_q0x...` symbol back to its true name and architectural role.
 */
export function lookupRosettaCodeName(codeName) {
  const clean = String(codeName).trim();
  for (const [orig, item] of Object.entries(A6_LOADER_ROSETTA)) {
    if (item.code === clean || orig === clean) {
      return { layer: "A6-CRYPT Loader", original: orig, ...item };
    }
  }
  for (const [, item] of CLEAN_ENGINE_MAP.entries()) {
    if (item.code === clean || item.original === clean) {
      return { layer: "Game Engine", ...item };
    }
  }
  return null;
}
