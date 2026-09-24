const fs = require('fs');

const dict = {
  'Zapisy Gry': 'Save Games',
  '(Obecny)': '(Current)',
  'Pusty slot': 'Empty slot',
  'Poziom: ': 'Level: ',
  'Wczytaj': 'Load',
  'Zapisz': 'Save',
  'Usuń': 'Delete',
  'Nowa Gra': 'New Game',
  'Dostępne atomy: ': 'Available atoms: ',
  'WYJŚCIE DO MENU GŁÓWNEGO': 'EXIT TO MAIN MENU',
  'Tablica Mendelejewa': 'Periodic Table',
  'Giełda': 'Stock Market',
  'Ustawienia': 'Settings',
  'Pobieram reklame z Polsatu... 📺': 'Loading ad from Polsat... 📺'
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Do replacements for new translations
code = code.replace(/>💾 Zapisy Gry</g, '>💾 {tx("Zapisy Gry")}<');
code = code.replace(/\(Obecny\)/g, '{tx("(Obecny)")}');
code = code.replace(/>Pusty slot</g, '>{tx("Pusty slot")}<');
code = code.replace(/Poziom: /g, '{tx("Poziom: ")}');
code = code.replace(/>Wczytaj</g, '>{tx("Wczytaj")}<');
code = code.replace(/>Zapisz</g, '>{tx("Zapisz")}<');
code = code.replace(/>Usuń</g, '>{tx("Usuń")}<');
code = code.replace(/>Nowa Gra</g, '>{tx("Nowa Gra")}<');
code = code.replace(/Dostępne atomy: /g, '{tx("Dostępne atomy: ")}');
code = code.replace(/> WYJŚCIE DO MENU GŁÓWNEGO</g, '> {tx("WYJŚCIE DO MENU GŁÓWNEGO")}<');
code = code.replace(/>⚛️ Tablica Mendelejewa</g, '>⚛️ {tx("Tablica Mendelejewa")}<');
code = code.replace(/>📈 Giełda</g, '>📈 {tx("Giełda")}<');
code = code.replace(/>⚙️ Ustawienia</g, '>⚙️ {tx("Ustawienia")}<');
code = code.replace(/'Pobieram reklame z Polsatu\.\.\. 📺'/g, 'tx("Pobieram reklame z Polsatu... 📺")');

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log("Processed");
