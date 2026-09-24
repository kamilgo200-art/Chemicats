import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

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

content = content.replace(targetStr, `         return (\n         <>\n          {isBossPresent && (`);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
