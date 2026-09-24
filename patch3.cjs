const fs = require('fs');
let code = fs.readFileSync('src/components/GameCanvas.tsx', 'utf8');

const regex = /return \(\s*<>\s*<button\s*disabled={!canAfford}\s*return \(\s*<>\s*<button\s*disabled={!canAfford}/gs;

code = code.replace(regex, `return (
                    <>
                        <button 
                            disabled={!canAfford}`);

fs.writeFileSync('src/components/GameCanvas.tsx', code);
