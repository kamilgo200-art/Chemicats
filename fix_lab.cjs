const fs = require('fs');

const dict = {
    '🛒 Lab (Sklep)': '🛒 Lab (Shop)',
    'Gratulacje! Przetrwałeś wszystkie 6 poziomów! Czas zacząć od nowa, by bić kolejne rekordy!': 'Congratulations! You survived all 6 levels! Time to start over and beat your records!',
    'Zmniejsza otrzymywane obrażenia. Max 40% redukcji na poziomie 3.': 'Reduces damage taken. Max 40% reduction at level 3.',
    'Zmniejsza otrzymywane obrażenia. Max 30% redukcji na poziomie 3.': 'Reduces damage taken. Max 30% reduction at level 3.',
    'Poziom 1 (Seler)': 'Level 1 (Celery)',
    'Poziom 2 (Tykwa)': 'Level 2 (Gourd)',
    'Poziom 2 (Barszcz)': 'Level 2 (Hogweed)',
    'Poziom 3 (Durian)': 'Level 3 (Durian)'
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
code = code.replace(/🛒 Lab \(Sklep\)/g, '{tx("🛒 Lab (Sklep)")}');
code = code.replace(/Gratulacje! Przetrwałeś wszystkie 6 poziomów! Czas zacząć od nowa, by bić kolejne rekordy!/g, '{tx("Gratulacje! Przetrwałeś wszystkie 6 poziomów! Czas zacząć od nowa, by bić kolejne rekordy!")}');
code = code.replace(/Poziom 1 \(Seler\)/g, 'tx("Poziom 1 (Seler)")');
code = code.replace(/Poziom 2 \(Tykwa\)/g, 'tx("Poziom 2 (Tykwa)")');
code = code.replace(/Poziom 2 \(Barszcz\)/g, 'tx("Poziom 2 (Barszcz)")');
code = code.replace(/Poziom 3 \(Durian\)/g, 'tx("Poziom 3 (Durian)")');
fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed Lab');
