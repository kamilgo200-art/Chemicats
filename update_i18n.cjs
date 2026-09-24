const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const dict = {
    '🏠 Do Menu': '🏠 To Menu',
    '📊 Statystyki': '📊 Statistics',
    '⚙️ Ustawienia': '⚙️ Settings',
    '📈 Giełda': '📈 Stock Market',
    '📖 Księga Wiązań': '📖 Bond Book',
    '⚛️ Tablica Mendelejewa': '⚛️ Periodic Table',
    'Wróć do Menu': 'Return to Menu',
    'Zakończ Podejście (Wróć do Menu)': 'End Run (Return to Menu)',
    'PRZESUŃ BY WYBRAĆ': 'SWIPE TO SELECT',
    '📊 GIEŁDA': '📊 STOCK MARKET',
    '⚙️ USTAWIENIA': '⚙️ SETTINGS'
};

for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}

fs.writeFileSync('src/i18n.ts', i18n);
console.log('Updated i18n!');
