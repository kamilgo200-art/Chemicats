import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/KONIEC GRY/,
'{tx("KONIEC GRY")}'
);

content = content.replace(
/Eksperyment Zakończony Niepowodzeniem/,
'{tx("Eksperyment Zakończony Niepowodzeniem")}'
);

content = content.replace(
/Wykorzystano limit wskrzeszeń \(2\/2\)/,
'{tx("Wykorzystano limit wskrzeszeń (2/2)")}'
);

content = content.replace(
/<span>Wskrześ za<\/span>/,
'<span>{tx("Wskrześ za")}</span>'
);

content = content.replace(
/<span>📺 Obejrzyj Reklamę<\/span>/,
'<span>{tx("📺 Obejrzyj Reklamę")}</span>'
);

content = content.replace(
/Zakończ Podejście \(Wróć do Menu\)/,
'{tx("Zakończ Podejście (Wróć do Menu)")}'
);

content = content.replace(
/Efekty wstrząsów ekranu/,
'{tx("Efekty wstrząsów ekranu")}'
);

content = content.replace(
/Zoom Kamery:/,
'{tx("Zoom Kamery:")}'
);

content = content.replace(
/Skala Interfejsu \(UI\):/,
'{tx("Skala Interfejsu (UI):")}'
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('patched UI strings');
