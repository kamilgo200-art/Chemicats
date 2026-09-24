import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

content = content.replace(/         \)\}\n         <\/div>\n         <\/div>\n        \);\n      \}\)\(\)\}/, '         )}\n         </>\n        );\n      })()}');

fs.writeFileSync('src/components/GameCanvas.tsx', content);
