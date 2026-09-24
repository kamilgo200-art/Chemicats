import fs from 'fs';
let content = fs.readFileSync('src/components/ReactionsDB.tsx', 'utf8');

// I will just append them before the closing bracket of the array.
// First, find the end of the array.
const insertPos = content.lastIndexOf('];');
const toInsert = `
    , { id: 'ccl4', name: 'Tetrachlorometan', eq: 'C + 4Cl ➔ CCl₄', desc: 'Potężny wybuch kwasowy zamrażający wszystko dookoła.', atoms: ['C','Cl','Cl','Cl','Cl'], category: 'Halogenki' }
    , { id: 'c6_from_c3', name: 'Diament z Grafitu', eq: '3C + Grafit ➔ C₆', desc: 'Kolejne warstwy węgla sprasowały grafit w lity diament.', atoms: ['C','C','C','C','C','C'], category: 'Struktury Węglowe' }
    , { id: 'c6_under_pressure', name: 'Diament z Ciśnienia', eq: 'C₃ + Siła ➔ C₆', desc: 'Fizyczna siła sprasowała struktury grafitu w niezniszczalny diament!', atoms: ['C','C','C','C','C','C'], category: 'Struktury Węglowe' }
    , { id: 'shock_ncl3', name: 'Detonacja NCl₃', eq: 'NCl₃ + Wstrząs ➔ Wybuch', desc: 'Trójchlorek azotu zdetonował samorzutnie pod wpływem naprężenia mechanicznego!', atoms: ['N','Cl','Cl','Cl'], category: 'Zjawiska Kinetyczne' }
    , { id: 'shock_p4', name: 'Zapłon Fosu P₄', eq: 'P₄ + Tarcie ➔ Wybuch', desc: 'Biały fosfor uległ zapaleniu pod wpływem tarcia kinetycznego i ciśnienia!', atoms: ['P','P','P','P'], category: 'Zjawiska Kinetyczne' }
    , { id: 'shock_sodium_water', name: 'Wybuch Sód-Woda', eq: '2Na + H₂O + Wstrząs ➔ Wybuch', desc: 'Gwałtowne pęknięcie pęcherzyków zmusiło sód do agresywnej reakcji!', atoms: ['Na','Na','H','H','O'], category: 'Zjawiska Kinetyczne' }
`;
const newContent = content.slice(0, insertPos) + toInsert + content.slice(insertPos);
fs.writeFileSync('src/components/ReactionsDB.tsx', newContent);
console.log('patched');
