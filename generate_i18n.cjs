const fs = require('fs');

const elementsMap = {
    'Wodór': 'Hydrogen', 'Hel': 'Helium', 'Lit': 'Lithium', 'Beryl': 'Beryllium',
    'Bor': 'Boron', 'Węgiel': 'Carbon', 'Azot': 'Nitrogen', 'Tlen': 'Oxygen',
    'Fluor': 'Fluorine', 'Neon': 'Neon', 'Sód': 'Sodium', 'Magnez': 'Magnesium',
    'Glin': 'Aluminum', 'Krzem': 'Silicon', 'Fosfor': 'Phosphorus', 'Siarka': 'Sulfur',
    'Chlor': 'Chlorine', 'Argon': 'Argon', 'Potas': 'Potassium', 'Wapń': 'Calcium',
    'Skand': 'Scandium', 'Tytan': 'Titanium', 'Wanad': 'Vanadium', 'Chrom': 'Chromium',
    'Mangan': 'Manganese', 'Żelazo': 'Iron', 'Kobalt': 'Cobalt', 'Nikiel': 'Nickel',
    'Miedź': 'Copper', 'Cynk': 'Zinc', 'Gal': 'Gallium', 'German': 'Germanium',
    'Arsen': 'Arsenic', 'Selen': 'Selenium', 'Brom': 'Bromine', 'Krypton': 'Krypton',
    'Rubid': 'Rubidium', 'Stront': 'Strontium', 'Itr': 'Yttrium', 'Cyrkon': 'Zirconium',
    'Niob': 'Niobium', 'Molibden': 'Molybdenum', 'Technet': 'Technetium', 'Ruten': 'Ruthenium',
    'Rod': 'Rhodium', 'Pallad': 'Palladium', 'Srebro': 'Silver', 'Kadm': 'Cadmium',
    'Ind': 'Indium', 'Cyna': 'Tin', 'Antymon': 'Antimony', 'Tellur': 'Tellurium',
    'Jod': 'Iodine', 'Ksenon': 'Xenon', 'Cez': 'Cesium', 'Bar': 'Barium',
    'Lantan': 'Lanthanum', 'Cer': 'Cerium', 'Prazeodym': 'Praseodymium', 'Neodym': 'Neodymium',
    'Promet': 'Promethium', 'Samar': 'Samarium', 'Europ': 'Europium', 'Gadolin': 'Gadolinium',
    'Terb': 'Terbium', 'Dysproz': 'Dysprosium', 'Holm': 'Holmium', 'Erb': 'Erbium',
    'Tul': 'Thulium', 'Iterb': 'Ytterbium', 'Lutet': 'Lutetium', 'Hafn': 'Hafnium',
    'Tantal': 'Tantalum', 'Wolfram': 'Tungsten', 'Ren': 'Rhenium', 'Osm': 'Osmium',
    'Iryd': 'Iridium', 'Platyna': 'Platinum', 'Złoto': 'Gold', 'Rtęć': 'Mercury',
    'Tal': 'Thallium', 'Ołów': 'Lead', 'Bizmut': 'Bismuth', 'Polon': 'Polonium',
    'Astat': 'Astatine', 'Radon': 'Radon', 'Frans': 'Francium', 'Rad': 'Radium',
    'Aktyn': 'Actinium', 'Tor': 'Thorium', 'Protaktyn': 'Protactinium', 'Uran': 'Uranium',
    'Neptun': 'Neptunium', 'Pluton': 'Plutonium', 'Ameryk': 'Americium', 'Kiur': 'Curium',
    'Berkel': 'Berkelium', 'Kaliforn': 'Californium', 'Ainsztajn': 'Einsteinium', 'Ferm': 'Fermium',
    'Mendelew': 'Mendelevium', 'Nobel': 'Nobelium', 'Lorens': 'Lawrencium', 'Rutherford': 'Rutherfordium',
    'Dubn': 'Dubnium', 'Seaborg': 'Seaborgium', 'Bohr': 'Bohrium', 'Has': 'Hassium',
    'Meitner': 'Meitnerium', 'Darmsztadt': 'Darmstadtium', 'Roentgen': 'Roentgenium', 'Kopernik': 'Copernicium',
    'Nihon': 'Nihonium', 'Flerow': 'Flerovium', 'Moskow': 'Moscovium', 'Liwermor': 'Livermorium',
    'Tenes': 'Tennessine', 'Oganeson': 'Oganesson'
};

const periodicTablePath = './src/components/PeriodicTable.tsx';
let ptContent = fs.readFileSync(periodicTablePath, 'utf8');

for (const [pl, en] of Object.entries(elementsMap)) {
    ptContent = ptContent.replace(`name: '${pl}'`, `name: '${pl}', enName: '${en}'`);
}

fs.writeFileSync(periodicTablePath, ptContent);
console.log("Updated PeriodicTable.tsx");
