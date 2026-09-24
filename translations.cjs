const fs = require('fs');

const path = './src/components/ReactionsDB.tsx';
let content = fs.readFileSync(path, 'utf8');

// The language model will generate translation rules.
// Since the exact Polish string might have quotes, we can match the keys and append enKeys.
const dict = {
  // Categories
  "Pierwiastki i Alotropy": "Elements and Allotropes",
  "Sole i Minerały": "Salts and Minerals",
  "Tlenki i Wodorki": "Oxides and Hydrides",
  "Skomplikowane i Organiczne": "Complex and Organic",
  "Kwasy i Zasady": "Acids and Bases",
  "Halogenki": "Halides",
  "Struktury Węglowe": "Carbon Structures",
  "Zjawiska Kinetyczne": "Kinetic Phenomena",
};

// Translate categories
for (const [pl, en] of Object.entries(dict)) {
  content = content.replace(new RegExp(`category: '${pl}'`, 'g'), `category: '${pl}', enCategory: '${en}'`);
}

// Translate names
const nameRegex = /name: '([^']+)'/g;
let match;
while ((match = nameRegex.exec(content)) !== null) {
  const pl = match[1];
  // Simple heuristic for names if we don't map all of them
}

fs.writeFileSync(path, content);
console.log("Categories translated");
