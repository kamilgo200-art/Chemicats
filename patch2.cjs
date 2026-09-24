const fs = require('fs');
const content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `         return (
         <>`;
const uiScaleWrapper = `         const uiScale = engineRef.current.state.uiScale || 1.0;
         return (
         <div style={{
             position: 'absolute',
             top: 0,
             left: 0,
             width: \`\${100 / uiScale}%\`,
             height: \`\${100 / uiScale}%\`,
             transform: \`scale(\${uiScale})\`,
             transformOrigin: 'top left',
             pointerEvents: 'none',
             zIndex: 40
         }}>
         <div style={{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' }}>
`;

let patched = content.replace(targetStr, uiScaleWrapper);

// We need to close these two divs at the end of the IIFE.
// Let's find the end of the IIFE.
const endStr = `         </>
      )})()}
      
      {/* INVOICE MINIGAME */}`;

const endWrapper = `         </div>
         </div>
      )})()}
      
      {/* INVOICE MINIGAME */}`;

patched = patched.replace(endStr, endWrapper);

fs.writeFileSync('src/components/GameCanvas.tsx', patched);
console.log('patched2');
