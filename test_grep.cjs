const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
const index = code.indexOf('className="absolute transition-all duration-75 cursor-pointer"');
console.log(code.substring(index - 500, index + 500));
