import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// 1. Zmiana gunModifier (wolniejsze strzelanie)
content = content.replace(
/      let gunModifier = 1\.0;\n      if \(this\.state\.gunLevel === 1\) gunModifier = 0\.8;\n      if \(this\.state\.gunLevel === 2\) gunModifier = 0\.65;\n      if \(this\.state\.gunLevel === 3\) gunModifier = 0\.5;\n      if \(this\.state\.gunLevel === 4\) gunModifier = 0\.35;\n      if \(this\.state\.gunLevel === 5\) gunModifier = 0\.25;\n      if \(this\.state\.gunLevel === 6\) gunModifier = 0\.15;\n      if \(this\.state\.gunLevel >= 7\) gunModifier = 0\.08;/,
`      let gunModifier = 1.15; // Zmniejszona podstawowa szybkość strzelania (wyższy mnożnik)
      if (this.state.gunLevel === 1) gunModifier = 1.0;
      if (this.state.gunLevel === 2) gunModifier = 0.85;
      if (this.state.gunLevel === 3) gunModifier = 0.70;
      if (this.state.gunLevel === 4) gunModifier = 0.55;
      if (this.state.gunLevel === 5) gunModifier = 0.40;
      if (this.state.gunLevel === 6) gunModifier = 0.30;
      if (this.state.gunLevel >= 7) gunModifier = 0.20;`
);

// 2. Zmiana przegrzewania (szybsze przegrzewanie)
content = content.replace(
/      const heatGainMultiplier = 1 - \(this\.state\.heatLevel \* 0\.15\); \/\/ max 1 - 0\.45 = 0\.55/,
`      const heatGainMultiplier = 1 - (this.state.heatLevel * 0.1); // max 1 - 0.3 = 0.7 (mniej pomaga, więc szybciej się przegrzewa)`
);

content = content.replace(
/      const minNetHeatPerSec = 1\.5; \/\/ ≈ 66 seconds to reach 100/,
`      const minNetHeatPerSec = 6.5; // Zwiększone przegrzewanie (osiąga 100 znacznie szybciej)`
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');
