const fs = require('fs');

const categories = {
  'Kwasy i Zasady': ['h2so4', 'h2so3', 'hno3', 'h2co3', 'hcn', 'caoh2', 'koh', 'h3po4', 'hcl'],
  'Tlenki i Wodorki': ['h2o', 'co2', 'no2', 'o3', 'h2s', 'so2', 'lih', 'li2o', 'beo', 'beh2', 'fe2o3', 'rao', 'poh2', 'poo2', 'rah2', 'bh3', 'b2o3', 'mgo', 'cao', 'p2o5', 'sio2', 'ph3'],
  'Sole i Minerały': ['licl', 'becl2', 'fes', 'ncl3', 'pcl5', 'sicl4', 'kno3', 'caco3', 'mgcl2', 'cacl2', 'kcl', 'bcl3', 'sic', 'bn', 'fe3c', 'rac2', 'porac'],
  'Skomplikowane i Organiczne': ['ch4', 'nh3', 'ch2o', 'c6h12o6', 'cellulose', 'chlorophyll', 'ethanol', 'vinegar', 'combustion'],
  'Pierwiastki i Alotropy': ['c6', 'c3', 'p4', 'cl2']
};

function getCat(id) {
  for (const [cat, ids] of Object.entries(categories)) {
    if (ids.includes(id)) return cat;
  }
  return 'Inne';
}

let code = fs.readFileSync('src/components/ReactionsDB.tsx', 'utf8');

code = code.replace(/(\{ id: '([^']+)', name: '([^']+)', eq: '([^']+)', desc: '([^']+)', atoms: (\[[^\]]+\]), funFact: ('[^']+') \})/g, (match, p1, id, p3, p4, p5, p6, p7) => {
    let cat = getCat(id);
    return `{ id: '${id}', category: '${cat}', name: '${p3}', eq: '${p4}', desc: '${p5}', atoms: ${p6}, funFact: ${p7} }`;
});

fs.writeFileSync('src/components/ReactionsDB.tsx', code);
