import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Replace the enDict definition with a larger one
content = content.replace(
/      const enDict: Record<string, string> = {[\s\S]*?      \};/,
`      const enDict: Record<string, string> = {
        "WYBIERZ ZAPIS / NOWA GRA": "SELECT SAVE / NEW GAME",
        "USTAWIENIA": "SETTINGS",
        "Sterowanie PC:": "PC Controls:",
        "WASD, Mysz. Spacja/Shift - Dash. Wybór broni/atomu: scroll / 1-9. Z,X,C - Potki. Q - Tryb broni.": "WASD, Mouse. Space/Shift - Dash. Weapon/atom: scroll / 1-9. Z,X,C - Potions. Q - Weapon mode.",
        "Instrukcje & Reakcje": "Instructions & Reactions",
        "Możesz grać na telefonie instalując stronę jako aplikację (PWA) przez menu Chrome!": "You can play on mobile by installing the site as an app (PWA) via Chrome menu!",
        "Poziom Trudności": "Difficulty Level",
        "Dla Dzieci": "For Kids",
        "Łatwiejszy": "Easy",
        "Normalny": "Normal",
        "Trudny": "Hard",
        "Język / Language": "Language / Język",
        "Włączony": "Enabled",
        "Wyłączony": "Disabled",
        "Autopomijanie Zwycięstwa": "Auto Skip Victory",
        "Zapisy Gry": "Save Games",
        "Sklep": "Shop",
        "Gameplay": "Gameplay",
        "TRYB WIELOOSOBOWY": "MULTIPLAYER (CO-OP)",
        "Budowa Atomu": "Atom Structure",
        "Kombat Log:": "Combat Log:",
        "Efekty wstrząsów ekranu": "Screen Shake Effects",
        "Skala Interfejsu (UI):": "UI Scale:",
        "Zoom Kamery:": "Camera Zoom:",
        "KONIEC GRY": "GAME OVER",
        "Eksperyment Zakończony Niepowodzeniem": "Experiment Failed",
        "Wskrześ za": "Revive for",
        "📺 Obejrzyj Reklamę": "📺 Watch Ad",
        "Zakończ Podejście (Wróć do Menu)": "End Run (Return to Menu)",
        "Wykorzystano limit wskrzeszeń (2/2)": "Revive limit reached (2/2)",
        "WARSZTAT": "WORKSHOP",
        "Trwałe ulepszenia sprzętu. Płacisz Protonami (p⁺).": "Permanent gear upgrades. Costs Protons (p⁺).",
        "Pancerz Skafandra": "Suit Armor",
        "Chłodzenie Broni": "Weapon Cooling",
        "ULEPSZ": "UPGRADE",
        "MAX POZIOM": "MAX LEVEL",
        "Giełda": "Stock Market",
        "Statystyki": "Statistics",
        "Księga Wiązań": "Bond Book",
        "Tablica Mendelejewa": "Periodic Table",
        "SKANOWANIE...": "SCANNING...",
        "ZDOBYTO PROTON!": "PROTON AQUIRED!",
        "OSTATECZNE ZWYCIĘSTWO!": "ULTIMATE VICTORY!",
        "Kontynuuj": "Continue"
      };`
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched tx');
