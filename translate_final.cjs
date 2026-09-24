const fs = require('fs');

const dict = {
  'Poziom ': 'Level ',
  'Energia (Stamina)': 'Energy (Stamina)',
  'Przegrzanie Lufy': 'Barrel Heat',
  '☰ OPCJE': '☰ OPTIONS',
  '🛒 Lab (Sklep)': '🛒 Lab (Shop)',
  '📊 Statystyki': '📊 Statistics',
  '📊 Statystyki Wiązań': '📊 Bond Statistics',
  'Statystyki Zabitych': 'Kill Statistics',
  'MAX POZIOM': 'MAX LEVEL',
  'Zmniejsza otrzymywane obrażenia. Max 40% redukcji na poziomie 3.': 'Reduces damage taken. Max 40% reduction at level 3.',
  'Zmniejsza otrzymywane obrażenia. Max 30% redukcji na poziomie 3.': 'Reduces damage taken. Max 30% reduction at level 3.',
  '500 e⁻ x Wynajęty Poziom': '500 e⁻ x Rented Level',
  'Dungeon Poziom ': 'Dungeon Level ',
  ' Oczyszczony!': ' Cleared!',
  'Gratulacje! Przetrwałeś wszystkie 6 poziomów! Czas zacząć od nowa, by bić kolejne rekordy!': 'Congratulations! You survived all 6 levels! Time to start over and beat your records!',
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
for (const [pl, en] of Object.entries(dict)) {
    // Standard replacements
    code = code.split('>' + pl + '<').join('>{tx("' + pl + '")}<');
    code = code.split('>' + pl).join('>{tx("' + pl + '")}');
    code = code.split(pl + '<').join('{tx("' + pl + '")}<');
    code = code.split("'" + pl + "'").join('tx("' + pl + '")');
}

// Special case for Poziom {level} since it's mixed with variables
code = code.replace(/>Poziom \{/g, '>{tx("Poziom ")}{');
code = code.replace(/>Dungeon Poziom \{/g, '>{tx("Dungeon Poziom ")}{');
code = code.replace(/\Oczyszczony!</g, '{tx(" Oczyszczony!")}<');
code = code.replace(/Max \{engineRef\.current!\.state\.selectedCharacter === 'bohr_cat' \? '40' : '30'\}\% redukcji na poziomie 3\./g, '{engineRef.current!.state.selectedCharacter === "bohr_cat" ? tx("Zmniejsza otrzymywane obrażenia. Max 40% redukcji na poziomie 3.") : tx("Zmniejsza otrzymywane obrażenia. Max 30% redukcji na poziomie 3.")}');

// Clean up double tx
code = code.replace(/tx\(tx\(\"(.*?)\"\)\)/g, 'tx(\"$1\")');
code = code.replace(/tx\(tx\(\'(.*?)\'\)\)/g, 'tx(\'$1\')');

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Final UI replacement pass completed');
