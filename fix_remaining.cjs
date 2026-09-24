const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const dict = {
    'Zakończ Podejście (': 'End Run (',
    'Oczekiwanie na graczy... (Zaloguj się w Ustawieniach do sieci LAN)': 'Waiting for players... (Log in via Settings to LAN)',
    'Zakończ Podejście (Wróć do Menu)': 'End Run (Return to Menu)',
    'Zakończ Podejście': 'End Run',
    '📊 GIEŁDA': '📊 STOCK MARKET',
    '⚙️ USTAWIENIA': '⚙️ SETTINGS'
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

// We know line 5335: Zakończ Podejście ({tx("Wróć do Menu")})
code = code.replace(/Zakończ Podejście \(\{tx\("Wróć do Menu"\)\}\)/g, '{tx("Zakończ Podejście")} ({tx("Wróć do Menu")})');
code = code.replace(/Oczekiwanie na graczy\.\.\. \(Zaloguj się w Ustawieniach do sieci LAN\)/g, '{tx("Oczekiwanie na graczy... (Zaloguj się w Ustawieniach do sieci LAN)")}');
code = code.replace(/>⚙️ \{tx\("USTAWIENIA"\)\}</g, '>{tx("⚙️ USTAWIENIA")}<');
code = code.replace(/>📊 GIEŁDA</g, '>{tx("📊 GIEŁDA")}<');
code = code.replace(/>📊 \{tx\("Statystyki"\)\} Wiązań</g, '>{tx("📊 Statystyki Wiązań")}<');

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed final strings');
