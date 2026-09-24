const fs = require('fs');
const https = require('https');

async function translateText(text) {
    if (!text || text.trim() === '') return text;
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pl&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const translated = parsed[0].map(x => x[0]).join('');
                    resolve(translated);
                } catch (e) {
                    resolve(text);
                }
            });
        }).on('error', () => resolve(text));
    });
}

async function run() {
    let content = fs.readFileSync('src/components/ReactionsDB.tsx', 'utf8');
    const dict = {};
    
    // Extract all strings that look like name: '...', desc: '...', funFact: '...', category: '...'
    const matches = [...content.matchAll(/(name|desc|funFact|category):\s*'([^']+)'/g)];
    
    console.log(`Found ${matches.length} strings to translate.`);
    
    for (const match of matches) {
        const text = match[2];
        if (!dict[text]) {
            console.log(`Translating: ${text}`);
            dict[text] = await translateText(text);
        }
    }
    
    let i18nContent = fs.readFileSync('src/i18n.ts', 'utf8');
    const end = i18nContent.lastIndexOf('}');
    
    let entries = [];
    for (const [k, v] of Object.entries(dict)) {
        entries.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    }
    
    const newI18n = i18nContent.substring(0, end) + ',\n' + entries.join(',\n') + '\n};\n';
    fs.writeFileSync('src/i18n.ts', newI18n);
    console.log("Translation complete!");
}

run();
