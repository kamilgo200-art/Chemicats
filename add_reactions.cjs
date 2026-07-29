const fs = require('fs');
let code = fs.readFileSync('src/components/ReactionsDB.tsx', 'utf8');
const newReactions = `,
    { id: 'nacl', category: 'Sole i Minerały', name: 'NaCl (Chlorek Sodu)', eq: 'Na + Cl ➔ NaCl', desc: 'Ogromny, trzeszczący ładunek soli wywołujący wysuszenie i podrażnienie roślin!', atoms: ['Na','Cl'], funFact: 'Sól kuchenna od stuleci była używana jako środek konserwujący, waluta oraz broń na obślizgłe ślimaki!' },
    { id: 'naoh', category: 'Kwasy i Zasady', name: 'NaOH (Wodorotlenek Sodu)', eq: 'Na + O + H ➔ NaOH', desc: 'Silnie kaustyczna para sodowa pożerająca całą materię biologiczną.', atoms: ['Na','O','H'], funFact: 'Główny składnik preparatów typu kret do rur. Rozpuszcza niemal wszystko, co zatyka odpływy.' },
    { id: 'nahco3', category: 'Sole i Minerały', name: 'NaHCO₃ (Soda Oczyszczona)', eq: 'Na + H + C + 3O ➔ NaHCO₃', desc: 'Gazująca i wibrująca chmura spowalniająca wrogów i uszkadzająca biologiczne tkanki!', atoms: ['Na','H','C','O','O','O'], funFact: 'Bardzo dobrze na zakwaszenie i czyszczenie! Kiedy dodasz do niej ocet, zaczyna silnie się pienić - efekt wulkanu!' },
    { id: 'al2o3', category: 'Tlenki i Wodorki', name: 'Al₂O₃ (Korund)', eq: '2Al + 3O ➔ Al₂O₃', desc: 'Masywny potężny kryształ niszczący wroga masą. Ultrawysoka twardość zamrażająca cel!', atoms: ['Al','Al','O','O','O'], funFact: 'Jeden z najtwardszych tlenków. Jeśli ma śladowe zanieczyszczenia chromem, staje się oszałamiającym Rubinem!' },
    { id: 'alcl3', category: 'Sole i Minerały', name: 'AlCl₃ (Chlorek Glinu)', eq: 'Al + 3Cl ➔ AlCl₃', desc: 'Kwasowa chmura gęstniejąca na przeciwnikach przed tobą, drażniąca bez przerwy.', atoms: ['Al','Cl','Cl','Cl'], funFact: 'Był i jest silnym antyperspirantem w kulkach i dezodorantach. Posiada właściwość miejscowego zamykania porów skóry pod pachami.' }
];`;
code = code.replace(/\];\s*export const MoleculeGraphic/, newReactions + '\n\nexport const MoleculeGraphic');
fs.writeFileSync('src/components/ReactionsDB.tsx', code);
