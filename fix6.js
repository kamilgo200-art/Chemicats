import fs from 'fs';
let lines = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8').split('\n');

const canvasLineIdx = lines.findIndex(l => l.includes('<canvas ref={canvasRef}'));

const wrapperStart = `      <div style={{ zoom: engineRef.current?.state.uiScale || 1.0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>`;

lines.splice(canvasLineIdx + 1, 0, wrapperStart);

const catbotLineIdx = lines.findIndex(l => l.includes('<CatbotEngine onExit={() => setIsCatbotEngineRunning(false)} />'));

const wrapperEnd = `        </div>
      </div>`;

lines.splice(catbotLineIdx + 2, 0, wrapperEnd);

fs.writeFileSync('src/components/GameCanvas.tsx', lines.join('\n'));
console.log('injected');
