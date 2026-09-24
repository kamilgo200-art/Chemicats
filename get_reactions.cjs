require('ts-node').register({ transpileOnly: true });
const { REACTIONS_DB } = require('./src/components/ReactionsDB.tsx');
const fs = require('fs');
fs.writeFileSync('reactions_pl.json', JSON.stringify(REACTIONS_DB, null, 2));
