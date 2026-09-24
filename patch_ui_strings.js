import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/Wybór Pierwiastka do Wizualizacji/,
'{tx("Wybór Pierwiastka do Wizualizacji")}'
);

content = content.replace(
/'TABLICA MENDELEJEWA'/,
'tx("TABLICA MENDELEJEWA")'
);

content = content.replace(
/Zamknij\n               <\/button>/g,
'{tx("Zamknij")}\n               </button>'
);

content = content.replace(
/Budowa i Wiązania:/,
'{tx("Budowa i Wiązania:")}'
);

content = content.replace(
/Możliwe Wiązania/,
'{tx("Możliwe Wiązania")}'
);

content = content.replace(
/'Zablokowane'/,
'tx("Zablokowane")'
);

content = content.replace(
/Brak dostępnych wiązań dla tego pierwiastka w grze\.\.\. jeszcze\./,
'{tx("Brak dostępnych wiązań dla tego pierwiastka w grze... jeszcze.")}'
);

content = content.replace(
/Szczegóły Wiązania/,
'{tx("Szczegóły Wiązania")}'
);

content = content.replace(
/Działanie \(Superbroń\):/,
'{tx("Działanie (Superbroń):")}'
);

content = content.replace(
/Ciekawostka IRL:/,
'{tx("Ciekawostka IRL:")}'
);

content = content.replace(
/Wróć<\/button>/,
'{tx("Wróć")}</button>'
);

content = content.replace(
/\(kliknij by zobaczyć\)/,
'{tx("(kliknij by zobaczyć)")}'
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched strings');
