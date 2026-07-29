const fs = require('fs');

let canvas = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Replace items array
canvas = canvas.replace(/const items = \['ginger_cat', 'black_cat', 'bohr_cat'\];/g, "const items = ['ginger_cat', 'black_cat', 'bohr_cat', 'curie_cat'];");
canvas = canvas.replace(/const chars = \['ginger_cat', 'black_cat', 'bohr_cat'\];/g, "const chars = ['ginger_cat', 'black_cat', 'bohr_cat', 'curie_cat'];");

canvas = canvas.replace(/const isBohrLocked = actualChar === 'bohr_cat' && !st\.unlockedCharacters\.includes\('bohr_cat'\);/g, "const isBohrLocked = actualChar === 'bohr_cat' && !st.unlockedCharacters.includes('bohr_cat');\n                                     const isCurieLocked = actualChar === 'curie_cat' && !st.unlockedCharacters.includes('curie_cat');");
canvas = canvas.replace(/const isLocked = isBlackLocked \|\| isBohrLocked;/g, "const isLocked = isBlackLocked || isBohrLocked || isCurieLocked;");

canvas = canvas.replace(/} else if \(actualChar === 'bohr_cat'\) {/g, "} else if (actualChar === 'bohr_cat') {\n                                         name = isBohrLocked ? 'Miałs Bohr (Zablokowany)' : 'Miałs Bohr';\n                                     } else if (actualChar === 'curie_cat') {");
canvas = canvas.replace(/name = isBohrLocked \? 'Miałs Bohr \(Zablokowany\)' : 'Miałs Bohr';\n                                     } else if \(actualChar === 'curie_cat'\) {/g, "name = isBohrLocked ? 'Miałs Bohr (Zablokowany)' : 'Miałs Bohr';\n                                     } else if (actualChar === 'curie_cat') {\n                                         name = isCurieLocked ? 'Maria Purrie (Zablokowana)' : 'Maria Purrie Skłodowska';");

// Adjust unlocks
canvas = canvas.replace(/const isBohrLocked = st\.selectedCharacter === 'bohr_cat' && !st\.unlockedCharacters\.includes\('bohr_cat'\);/g, "const isBohrLocked = st.selectedCharacter === 'bohr_cat' && !st.unlockedCharacters.includes('bohr_cat');\n                                       const isCurieLocked = st.selectedCharacter === 'curie_cat' && !st.unlockedCharacters.includes('curie_cat');");

let curieUnlockCode = `} else if (isCurieLocked) {
                                           if (st.protons >= 10) {
                                               st.protons -= 10;
                                               st.unlockedCharacters.push('curie_cat');
                                               st.characterSelected = true;
                                               engineRef.current?.selectCharacter(st.selectedCharacter);
                                               engineRef.current?.saveGame();
                                           } else {
                                               setShakeChar('curie_cat');
                                               setTimeout(() => setShakeChar(''), 1000);
                                           }
                                       } else {`;
                                       
canvas = canvas.replace(/} else if \(isBohrLocked\) {([\s\S]*?)setTimeout\(\(\) => setShakeChar\(''\), 1000\);\n                                           }\n                                       } else {/g, "} else if (isBohrLocked) {$1setTimeout(() => setShakeChar(''), 1000);\n                                           }\n                                       " + curieUnlockCode);


// Curie drawing
let curieDrawingCode = `} else if (char === 'curie_cat') {
          // Maria Purrie Skłodowska: elegant vintage black dress with a subtle green radioactive glow
          ctx.fillStyle = '#1e293b'; // Vintage dark dress
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(-10, 5, 20, 18, 4);
          } else {
              ctx.rect(-10, 5, 20, 18);
          }
          ctx.fill();
          
          // Glowing radium vial in pocket
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(4, 14, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          
          // White collar piece
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(-5, 5);
          ctx.lineTo(0, 10);
          ctx.lineTo(5, 5);
          ctx.closePath();
          ctx.fill();
      } else {`;

canvas = canvas.replace(/} else {/g, curieDrawingCode);

let curieHeadCode = `} else if (char === 'curie_cat') {
          // Maria Purrie: Vintage styled hair, slightly green glowing eyes!
          ctx.save();
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐱', 0, -5);
          ctx.restore();

          // Vintage 19th century swept hair / bun
          ctx.fillStyle = '#171717'; // dark almost black hair
          ctx.beginPath();
          ctx.arc(0, -12, 6, 0, Math.PI * 2);
          ctx.arc(-5, -10, 5, 0, Math.PI * 2);
          ctx.arc(5, -10, 5, 0, Math.PI * 2);
          // Small bun on top
          ctx.arc(0, -16, 4, 0, Math.PI * 2);
          ctx.fill();

          // Glowing Radium green eyes
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(-5, -6, 2, 0, Math.PI * 2);
          ctx.arc(5, -6, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
      } else if (isBohrCat) {`;

canvas = canvas.replace(/} else if \(isBohrCat\) {/g, curieHeadCode);

fs.writeFileSync('src/components/GameCanvas.tsx', canvas, 'utf8');

let engine = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
engine = engine.replace(/selectedCharacter: 'ginger_cat' \| 'black_cat' \| 'bohr_cat'/g, "selectedCharacter: 'ginger_cat' | 'black_cat' | 'bohr_cat' | 'curie_cat'");

// When selecting Curie
let curieSelectCode = `if (char === 'curie_cat') {
          this.state.unlockedAtoms = ['Ra', 'Po'];
          this.state.selectedAtom = 'Ra';
      } else `;
engine = engine.replace(/if \(char === 'bohr_cat'\) {/g, curieSelectCode + "if (char === 'bohr_cat') {");

fs.writeFileSync('src/game/GameEngine.ts', engine, 'utf8');
console.log("Updated char arrays and selection logic");
