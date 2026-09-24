const fs = require('fs');

const dict = {
  'PRZEJDŹ NA NIŻSZE PIĘTRO (E)': 'GO TO LOWER FLOOR (E)',
  'WIELOKROTNE ZAGROŻENIE': 'MULTIPLE THREAT',
  'Pokój ': 'Room ',
  'Punkty Życia (HP)': 'Health Points (HP)',
  "💸 Wpłacono 'darowiznę' dla Policji. (5000 e⁻)": "💸 'Donation' paid to the Police. (5000 e⁻)",
  '❌ Masz za mało elektronów na łapówkę! (Wymagane 5000 e⁻)': '❌ Not enough electrons for a bribe! (5000 e⁻ required)',
  'DAJ ŁAPÓWKĘ (5000 e⁻)': 'GIVE BRIBE (5000 e⁻)',
  'Scrolluj lub przesuń palcem po bębenku, Kliknij w bębenek by wybrać': 'Scroll or swipe on the drum, Click to select',
  'Miałs Bohr (Odblokuj: 3 Protony)': 'Miauls Bohr (Unlock: 3 Protons)',
  'Miałs Bohr': 'Miauls Bohr',
  'Miauria Purrie (Odblokuj: 10 Protonów)': 'Miauria Purrie (Unlock: 10 Protons)',
  'Miauria Purrie Miałkowska': 'Miauria Purrie Miaulkowska',
  '1 Proton (Kup by odblokować)': '1 Proton (Buy to unlock)',
  '3 Protony (Kup by odblokować)': '3 Protons (Buy to unlock)',
  'PRZESUŃ BY WYBRAĆ': 'SWIPE TO SELECT',
  'ZMIEŃ BROŃ': 'CHANGE WEAPON',
  'OSTRZEŻENIE: BOSS': 'WARNING: BOSS',
  'Nowy pierwiastek odkryty': 'New element discovered',
  'Nowe wiązanie': 'New bond',
  'Odblokowano nowy pierwiastek': 'New element unlocked',
  'Giełda Atomowa': 'Atomic Stock Market',
  'SZCZEGÓŁY WIĄZANIA': 'BOND DETAILS',
  '📖 Księga Wiązań': '📖 Bond Book'
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
    // Avoid blindly replacing short strings in the wrong context, use precise methods
    if (pl === 'Miałs Bohr') {
        code = code.split("'Miałs Bohr'").join("tx('Miałs Bohr')");
    } else if (pl === 'Miauria Purrie Miałkowska') {
        code = code.split("'Miauria Purrie Miałkowska'").join("tx('Miauria Purrie Miałkowska')");
    } else if (pl.includes('Odblokuj')) {
        code = code.split("'" + pl + "'").join("tx('" + pl + "')");
    } else if (pl.includes('darowiznę') || pl.includes('łapówkę')) {
        code = code.split('"' + pl + '"').join('tx("' + pl + '")');
    } else {
        code = code.split('>' + pl + '<').join('>{tx("' + pl + '")}<');
        code = code.split('>' + pl).join('>{tx("' + pl + '")}');
        code = code.split(pl + '<').join('{tx("' + pl + '")}<');
        code = code.split('"' + pl + '"').join('tx("' + pl + '")');
        code = code.split("'" + pl + "'").join('tx("' + pl + '")');
    }
}

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Processed translation pass');
