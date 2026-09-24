const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const dict = {
    'Podejdź, aby wejść': 'Approach to enter',
    '(Kliknij w środku aby wejść)': '(Click inside to enter)',
    'ZWIĄZEK': 'COMPOUND',
    'DAJ ŁAPÓWKĘ (5000 e⁻)': 'GIVE BRIBE (5000 e⁻)',
    'ZMIEŃ BROŃ': 'CHANGE WEAPON',
    'Wyłącz Trzęsienie Ekranu': 'Disable Screen Shake',
    'Wejdź na Giełdę': 'Enter Stock Market',
    '📈 Konto Oszczędnościowe (+3%)': '📈 Savings Account (+3%)',
    'Odsetki 3% naliczają się po każdym cyklu (4 pokoje). Wpłacaj i wypłacaj kiedy chcesz!': '3% interest applied after each cycle (4 rooms). Deposit and withdraw anytime!',
    'Wpłać:': 'Deposit:',
    'Wypłać:': 'Withdraw:',
    'Odsetki 7% procentu składanego na cykl (4 pokoje). Środki blokowane na 2 cykle (8 pokoi), po czym automatycznie wypłacane z zyskiem!': '7% compound interest per cycle (4 rooms). Funds locked for 2 cycles (8 rooms), then automatically paid out with profit!',
    'Pozostałe cykle: ': 'Remaining cycles: ',
    'Kup obligację jednorazowo:': 'Buy a one-time bond:',
    'Wpłać 500': 'Deposit 500',
    'Wpłać 2K': 'Deposit 2K',
    'WPŁAĆ MAX': 'DEPOSIT MAX',
    'WPŁAĆ': 'DEPOSIT',
    'WYPŁAĆ': 'WITHDRAW'
};

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
for (const [pl, en] of Object.entries(dict)) {
    if (!i18n.includes('"' + pl + '":')) {
        i18n = i18n.replace('export const EN_DICT: Record<string, string> = {', 'export const EN_DICT: Record<string, string> = {\n  "' + pl + '": ' + JSON.stringify(en) + ',');
    }
}
fs.writeFileSync('src/i18n.ts', i18n);

for (const pl of Object.keys(dict)) {
    // For React elements text
    code = code.split('>' + pl + '<').join('>{tx("' + pl + '")}<');
    code = code.split('>' + pl).join('>{tx("' + pl + '")}');
    code = code.split(pl + '<').join('{tx("' + pl + '")}<');
    
    // For JS strings (e.g. ctx.fillText)
    code = code.split("'" + pl + "'").join('tx("' + pl + '")');
    code = code.split('"' + pl + '"').join('tx("' + pl + '")');
}

// Special case for remaining cycle display
code = code.replace(/>Pozostałe cykle: /g, '>{tx("Pozostałe cykle: ")}');

fs.writeFileSync('src/components/GameCanvas.tsx', code);
console.log('Fixed additional remaining translations!');
