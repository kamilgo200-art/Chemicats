import fs from 'fs';
let content = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

// Remove the global wrapper from patch4
content = content.replace(/      <div style={{[\s\S]*?zIndex: 40\n      }}>\n      \{\/\* PORTAL INTERACT PROMPT \*\/\}/, '      {/* PORTAL INTERACT PROMPT */}');
content = content.replace(/      \{\/\* INVOICE MINIGAME \*\/\}([\s\S]*?)      <\/div>\n    <\/div>/, '      {/* INVOICE MINIGAME */}$1    </div>');

// Remove the HUD wrapper from patch2
content = content.replace(/         const uiScale = engineRef\.current\.state\.uiScale \|\| 1\.0;\n         return \(\n         <div style={{[\s\S]*?position: 'relative' }}>\n          \{isBossPresent && \(/, '         return (\n         <>\n          {isBossPresent && (');
content = content.replace(/         \)\}\n         <\/div>\n         <\/div>\n        \);\n      \}\)\(\)\}/, '         )}\n         </>\n        );\n      })()}');

fs.writeFileSync('src/components/GameCanvas.tsx', content);
console.log('Fixed syntax errors');
