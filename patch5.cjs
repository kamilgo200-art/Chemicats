const fs = require('fs');
const content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `         const uiScale = engineRef.current.state.uiScale || 1.0;
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
          {isBossPresent && (`;

const rep1 = `         return (
         <>
          {isBossPresent && (`;

const endTarget = `         )}
         </div>
         </div>
        );
      })()}`;

const rep2 = `         )}
         </>
        );
      })()}`;

let patched = content.replace(targetStr, rep1);
patched = patched.replace(endTarget, rep2);

fs.writeFileSync('src/components/GameCanvas.tsx', patched);
console.log('patched5');
