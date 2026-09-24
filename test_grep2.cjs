const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');
const index = code.indexOf('const items = [\'ginger_cat\', \'black_cat\', \'bohr_cat\', \'curie_cat\', \'mendelejew\'];');
console.log(code.substring(index - 200, index + 3000));
