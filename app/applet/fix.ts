import * as fs from 'fs';
let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
file = file.replace(/other\.status\.slowTimer \+= 10\.0 \* forms;\n\s*\}/, 'other.status.slowTimer += 10.0 * forms;\n          }\n        });');
fs.writeFileSync('src/game/GameEngine.ts', file);
console.log('Fixed!');
