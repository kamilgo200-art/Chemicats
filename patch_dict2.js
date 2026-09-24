import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/      const enDict: Record<string, string> = {/,
`      const enDict: Record<string, string> = {
        "Wybór Pierwiastka do Wizualizacji": "Element Selection for Visualization",
        "TABLICA MENDELEJEWA": "PERIODIC TABLE",
        "Zamknij": "Close",
        "Budowa i Wiązania:": "Structure and Bonds:",
        "Możliwe Wiązania": "Possible Bonds",
        "Zablokowane": "Locked",
        "Brak dostępnych wiązań dla tego pierwiastka w grze... jeszcze.": "No available bonds for this element in the game... yet.",
        "Szczegóły Wiązania": "Bond Details",
        "Działanie (Superbroń):": "Effect (Superweapon):",
        "Ciekawostka IRL:": "IRL Fun Fact:",
        "Wróć": "Back",
        "Budowa Atomu": "Atom Structure",
        "(kliknij by zobaczyć)": "(click to view)",`
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched dict');
