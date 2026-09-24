import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(
  "zoom: engineRef.current?.state.uiScale || 1.0, position: 'absolute', top: 0, left: 0, width: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`, height: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`, pointerEvents: 'none'",
  "transform: \`scale(\${engineRef.current?.state.uiScale || 1.0})\`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, width: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`, height: \`\${100 / (engineRef.current?.state.uiScale || 1.0)}%\`, pointerEvents: 'none'"
);

fs.writeFileSync('src/components/GameCanvas.tsx', content);
