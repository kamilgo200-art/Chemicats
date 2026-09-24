const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">`;
const replaceStr = `<div className={\`grid grid-cols-1 gap-6 \${engineRef.current!.state.unlockedCharacters.includes('mendelejew') ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'}\`}>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('src/components/GameCanvas.tsx', code);
    console.log("FIXED GRID");
} else {
    console.log("NOT FOUND");
}
