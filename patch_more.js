import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/>Możliwe Wiązania</,
'>{tx("Możliwe Wiązania")}<'
);

content = content.replace(
/Brak dostępnych wiązań dla tego pierwiastka w grze\.\.\. jeszcze\.</,
'{tx("Brak dostępnych wiązań dla tego pierwiastka w grze... jeszcze.")}<'
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
/>Wróć</,
'>{tx("Wróć")}<'
);

// fix the bad enDict entries that I made by mistake
content = content.replace(/"\{tx\("Budowa i Wiązania:"\)\}"/g, '"Budowa i Wiązania:"');
content = content.replace(/"\{tx\("Możliwe Wiązania"\)\}"/g, '"Możliwe Wiązania"');

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched');
