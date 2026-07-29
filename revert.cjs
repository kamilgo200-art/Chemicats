const fs = require('fs');
let canvas = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// I will undo the Curie changes and only inject them at the right spots.
// But wait, since I did `canvas = canvas.replace(/} else {/g, curieDrawingCode);`, EVERY `} else {` was replaced!
// Let me change ALL of them back to `} else {`.
let originalCurieDrawingCode = `} else if (char === 'curie_cat') {
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
canvas = canvas.split(originalCurieDrawingCode).join('} else {');

let originalCurieHeadCode = `} else if (char === 'curie_cat') {
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
canvas = canvas.split(originalCurieHeadCode).join('} else if (isBohrCat) {');

fs.writeFileSync('src/components/GameCanvas.tsx', canvas, 'utf8');

let engine = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
let curieSelectCode = `if (char === 'curie_cat') {
          this.state.unlockedAtoms = ['Ra', 'Po'];
          this.state.selectedAtom = 'Ra';
      } else `;
engine = engine.split(curieSelectCode).join('');
fs.writeFileSync('src/game/GameEngine.ts', engine, 'utf8');

console.log('reverted');
