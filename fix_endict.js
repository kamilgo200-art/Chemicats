import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
/        "\{tx\("Efekty wstrząsów ekranu"\)\}"/g,
'        "Efekty wstrząsów ekranu"'
);

content = content.replace(
/        "\{tx\("Skala Interfejsu \\\(UI\\\):"\)\}"/g,
'        "Skala Interfejsu (UI):"'
);

content = content.replace(
/        "\{tx\("Zoom Kamery:"\)\}"/g,
'        "Zoom Kamery:"'
);

content = content.replace(
/        "\{tx\("KONIEC GRY"\)\}"/g,
'        "KONIEC GRY"'
);

content = content.replace(
/        "\{tx\("Eksperyment Zakończony Niepowodzeniem"\)\}"/g,
'        "Eksperyment Zakończony Niepowodzeniem"'
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('fixed enDict');
