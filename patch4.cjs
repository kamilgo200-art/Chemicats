const fs = require('fs');
const content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStartStr = `      {/* PORTAL INTERACT PROMPT */}`;
const targetEndStr = `      {isCatbotEngineRunning && (
          <CatbotEngine onExit={() => setIsCatbotEngineRunning(false)} />
      )}
    </div>`;

const wrapperStart = `      <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`,
          height: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`,
          transform: \`scale(\${engineRef.current?.state.uiScale || 1.0})\`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          zIndex: 40
      }}>
      {/* PORTAL INTERACT PROMPT */}`;

const wrapperEnd = `      {isCatbotEngineRunning && (
          <CatbotEngine onExit={() => setIsCatbotEngineRunning(false)} />
      )}
      </div>
    </div>`;

let patched = content.replace(targetStartStr, wrapperStart);
patched = patched.replace(targetEndStr, wrapperEnd);

fs.writeFileSync('src/components/GameCanvas.tsx', patched);
console.log('patched4');
