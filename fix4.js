import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /         const uiScale = engineRef\.current\.state\.uiScale \|\| 1\.0;\n         return \(\n         <div style=\{\{[\s\S]*?\}\}>\n         <div style=\{\{ pointerEvents: 'none', width: '100%', height: '100%', position: 'relative' \}\}>\n          \{isBossPresent && \(/;

content = content.replace(regex, '         return (\n         <>\n          {isBossPresent && (');

fs.writeFileSync('src/components/GameCanvas.tsx', content);
