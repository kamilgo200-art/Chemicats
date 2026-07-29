const fs = require('fs');
let code = fs.readFileSync('src/game/GameEngine.ts', 'utf8');

// The replacement logic to add atoms back for Bosses in spawnEnemiesForRoom
const replaceBlock = `         if (bossType === 'Celery') {
             bossName = 'Sal su moner';
             bossDesc = 'Potężny Seler, wchłaniacz tlenu.';
             bossHp = 35000;
             bossSpeed = 60;
             bossRadius = 35;
             bossAtoms = { H: 0, O: 200, C: 50, N: 10, S: 5, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 10, K: 50, Mg: 20, Ca: 30 };
         } else if (bossType === 'SnakeGourdHead') {
             bossName = 'Tykwa węzowa z 4 oczami';
             bossDesc = 'Długa i niebezpieczna, osaczy Cię z każdej strony!';
             bossHp = 40000;
             bossSpeed = 160; 
             bossRadius = 45;
             bossAtoms = { H: 50, O: 50, C: 80, N: 20, S: 10, Si: 0, Ra: 0, Po: 0, Cl: 0, P: 15, K: 40, Mg: 15, Ca: 20 };
         } else if (bossType === 'Hogweed') {
             bossName = 'Barszcz Sosnowskiego';
             bossDesc = 'Toksyczny i rozrastający się... Uważaj na żrący dotyk!';
             bossHp = 60000;
             bossSpeed = 40;
             bossRadius = 60;
             bossAtoms = { H: 100, O: 80, C: 120, N: 30, S: 20, Si: 0, Ra: 0, Po: 0, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
         } else if (bossType === 'Durian') {
             bossName = 'Radioaktywny Durian';
             bossDesc = 'Król owoców... Miotający sterylnymi kolcami i zatruwający otoczenie radem!';
             bossHp = 80000;
             bossSpeed = 70;
             bossRadius = 75;
             bossAtoms = { H: 40, O: 80, C: 100, N: 30, S: 150, Si: 20, Ra: 40, Po: 30, Cl: 30, P: 20, K: 60, Mg: 30, Ca: 40 };
         } else if (bossType === 'GiantTree') {
             bossName = 'Pradawny Dąb';
             bossDesc = 'Monumentalne drzewo o gęstych korzeniach. Strzeż się barier drewnianych!';
             bossHp = 120000;
             bossSpeed = 0;
             bossRadius = 90;
             bossAtoms = { H: 200, O: 180, C: 320, N: 30, S: 20, Si: 40, Ra: 0, Po: 0, Cl: 0, P: 20, K: 80, Mg: 50, Ca: 60 };
         } else if (bossType === 'MutantPolimer') {
             bossName = 'Zmutowany Hiper-Polimer';
             bossDesc = 'Błąd natury. Niestabilna mutacja wszechrzeczy, chaos i destrukcja!';
             bossHp = 250000;
             bossSpeed = 200;
             bossRadius = 120;
             bossAtoms = { H: 100, O: 180, C: 220, N: 130, S: 120, Si: 50, Ra: 20, Po: 20, Cl: 130, P: 120, K: 160, Mg: 130, Ca: 140 };
         }`;

code = code.replace(/         if \(bossType === 'Celery'\) \{[\s\S]*?         \} else if \(bossType === 'MutantPolimer'\) \{[\s\S]*?         \}/, replaceBlock);

fs.writeFileSync('src/game/GameEngine.ts', code);
console.log('Fixed spawnEnemiesForRoom atoms');
