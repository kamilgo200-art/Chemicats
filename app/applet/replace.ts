import * as fs from 'fs';

let file = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
file = file.replace(/atoms: \{ ?H: ?(\d+), O: ?(\d+), C: ?(\d+), N: ?(\d+), S: ?(\d+), Si: ?(\d+), Ra: ?(\d+), Po: ?(\d+) ?\}/g, 'atoms: { H: $1, O: $2, C: $3, N: $4, S: $5, Si: $6, Ra: $7, Po: $8, Cl: 0, P: 0 }');
file = file.replace(/bossAtoms = \{ H: (\d+), O: (\d+), C: (\d+), N: (\d+), S: (\d+), Si: (\d+), Ra: (\d+), Po: (\d+) \}/g, 'bossAtoms = { H: $1, O: $2, C: $3, N: $4, S: $5, Si: $6, Ra: $7, Po: $8, Cl: 0, P: 0 }');
file = file.replace(/initAtoms = \{ H: (\d+), O: (\d+), C: (\d+), N: (\d+), S: (\d+), Si: (\d+), Ra: (\d+), Po: (\d+) \}/g, 'initAtoms = { H: $1, O: $2, C: $3, N: $4, S: $5, Si: $6, Ra: $7, Po: $8, Cl: 0, P: 0 }');
file = file.replace(/newAtoms: Record<any, number> = \{ H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0 \}/g, 'newAtoms: Record<any, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }');
file = file.replace(/newAtoms: Record<AtomType, number> = \{ H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0 \}/g, 'newAtoms: Record<AtomType, number> = { H: 0, O: 0, C: 0, N: 0, S: 0, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 0 }');

fs.writeFileSync('src/game/GameEngine.ts', file);
console.log('Done GameEngine.ts');
