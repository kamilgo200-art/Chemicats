import fs from 'fs';
let content = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

content = content.replace(
/const minNetHeatPerSec = 6\.5; \/\/ Zwiększone przegrzewanie \(osiąga 100 znacznie szybciej\)/,
'const minNetHeatPerSec = 20.0; // Zwiększone przegrzewanie (osiąga 100 bardzo szybko, ok 5s ciągłego ognia max)'
);

fs.writeFileSync('src/game/GameEngine.ts', content);
console.log('patched');
