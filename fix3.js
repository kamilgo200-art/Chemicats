import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(/      \}\)\n      <\/div>\n    <\/div>\n  \);\n\};\n\nexport default GameCanvas;/, '      )}\n    </div>\n  );\n};\n\nexport default GameCanvas;');

fs.writeFileSync('src/components/GameCanvas.tsx', content);
