import React from 'react';

export const REACTIONS_DB = [
    { id: 'o3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Ozone Shock', eq: '3O ➔ O₃', desc: 'Skoncentrowane wyładowanie ozonowe. Zamraża i niszczy.', atoms: ['O','O','O'], funFact: 'Ozon w stratosferze chroni nas przed promieniami UV, ale blisko ziemi jest toksycznym zanieczyszczeniem.' },
    { id: 'h2s', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Siarkowodór', eq: '2H + S ➔ H₂S', desc: 'Eksplozja toksycznego gazu. Poważnie zatruwa i spowalnia cel.', atoms: ['H','H','S'], funFact: 'Zabójczy gaz o słynnym zapachu zgniłych jaj. Jeśli przestajesz go czuć w jego otoczeniu, to znak, że uszkodził Ci już węch.' },
    { id: 'so2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Dwutlenek Siarki', eq: 'S + 2O ➔ SO₂', desc: 'Gęsty dym duszący i niemal całkowicie unieruchamiający wroga.', atoms: ['S','O','O'], funFact: 'Główny składnik zanieczyszczeń po spalaniu węgla, łączy się z wodą w powietrzu, tworząc kwaśne deszcze.' },
    { id: 'h2so4', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Siarkowy', eq: '2H + S + 4O ➔ H₂SO₄', desc: 'Ostateczny, potężny kwas rozpuszczający wszystko na duzym obszarze.', atoms: ['H','H','S','O','O','O','O'], funFact: 'Jeden z najważniejszych kwasów przemysłowych. Jest tak higroskopijny, że po polaniu nim cukru, kwas całkowicie go zwęgla w czarny słup.' },
    { id: 'h2so3', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Siarkawy', eq: '2H + S + 3O ➔ H₂SO₃', desc: 'Bardzo krótki, lecz gwałtowny rozkład. Silnie rani w czasie.', atoms: ['H','H','S','O','O','O'], funFact: 'Często jest używany potajemnie jako konserwant E220 do wina by zapobiec psuciu się, co może powodować ból głowy na drugi dzień!' },
    { id: 'licl', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Litu', eq: 'Li + Cl ➔ LiCl', desc: 'Mocna toksyna uszkadzająca neurony wroga, wywołująca amnezję (zapomina cel na chwile) i powolne rany.', atoms: ['Li','Cl'], funFact: 'Sole litu w psychiatrii bywają czasami z ostrożnością stosowane w chorobach dwubiegunowych jako lek.' },
    { id: 'lih', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Wodorek Litu', eq: 'Li + H ➔ LiH', desc: 'Rozpala cel białym płomieniem wysysając całą wodę z otoczenia wroga.', atoms: ['Li','H'], funFact: 'Niezwykle reaktywny proszek używany jako wysoko wydajne żródło wodoru i... jako pochłaniacz promieniowania neutronowego.' },
    { id: 'li2o', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Litu', eq: '2Li + O ➔ Li₂O', desc: 'Wybucha żrącym oparem korodującym każdy pancerz na rozległym obszarze.', atoms: ['Li','Li','O'], funFact: 'Tworzy się samoczynnie na powietrzu. Jest również używany do produkcji super wytrzymałego szkła!' },
    { id: 'beo', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Berylu', eq: 'Be + O ➔ BeO', desc: 'Tworzy ścieżkę bardzo twardych szpilek zadających obrażenia wszystkim, którzy po niej przejdą.', atoms: ['Be','O'], funFact: 'Jest bardzo twardy, doskonale przewodzi ciepło jak metal, ale będąc jednocześnie nietoksycznym w ceramice izolatorem elektrycznym.' },
    { id: 'becl2', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Berylu', eq: 'Be + 2Cl ➔ BeCl₂', desc: 'Ogromna chmura chemiczna rozpuszczająca rynsztunek i wywołująca spowolnienie dusznościowe.', atoms: ['Be','Cl','Cl'], funFact: 'Pary tego związku są śmiertelnie niebezpieczne wywołując przewlekłą chorobę berylozę!' },
    { id: 'beh2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Wodorek Berylu', eq: 'Be + 2H ➔ BeH₂', desc: 'Super-lekka, wybuchowa fala spopielająca wszystko przed Tobą z olbrzymią prędkością.', atoms: ['Be','H','H'], funFact: 'Trudny do uzyskania wysoce polimeryczny związek stanowiący potencjalne lekkie paliwo rakietowe.' },
    { id: 'c6', category: 'Pierwiastki i Alotropy', enCategory: 'Elements and Allotropes', name: 'Diament', eq: '6C ➔ C₆', desc: 'Najbardziej twarda sieć. Wielokrotnie pochłania zniszczenia, blokując ataki.', atoms: ['C','C','C','C','C','C'], funFact: 'Diamenty formują się w płaszczu Ziemi i są wulkanem wypychane na jej powierzchnię.' },
    { id: 'c3', category: 'Pierwiastki i Alotropy', enCategory: 'Elements and Allotropes', name: 'Grafit', eq: '3C ➔ C₃', desc: 'Kruche węglowe osłony, chronią i pochłaniają ograniczoną liczbę trafień.', atoms: ['C','C','C'], funFact: 'Grafit przewodzi prąd, chociaż to w pełni czysty niemetaliczny węgiel.' },
    { id: 'fe3c', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Stal (Cementyt)', eq: '3Fe + C ➔ Fe₃C', desc: 'Tworzy niezwykle mocną, metalową zaporę odbijającą ataki oraz raniącą wrogów przy kontakcie.', atoms: ['Fe','Fe','Fe','C'], funFact: 'Połączenie żelaza z węglem to stal. Czyste węgieliki żelaza (cementyt) nadają stali jej wielką twardość.' },
    { id: 'fe2o3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Rdza (Tlenek Żelaza)', eq: '2Fe + 3O ➔ Fe₂O₃', desc: 'Pomarańczowa chmura rdzy. Poważnie spowalnia i uszkadza biologiczne cele zakażeniem.', atoms: ['Fe','Fe','O','O','O'], funFact: 'Rdza to efekt utleniania żelaza. Proces ten wymaga obecności wody, by zachodzić szybko!' },
    { id: 'fes', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Piryt (Złoto Głupców)', eq: 'Fe + 2S ➔ FeS₂', desc: 'Strzał rozrzucający złote iskry, które uderzają wielokrotnie zadając duże obrażenia!', atoms: ['Fe','S','S'], funFact: 'Piryt to minerał tak bardzo przypominający w kopalniach złoto, że od wieków wykiwał niejednego poszukiwacza skarbów.' },
    { id: 'ch2o', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Pato-związek (Formaldehyd)', eq: 'C + H₂O ➔ CH₂O', desc: 'Dziwne patowiązanie węgla i wody tworzy trujący formaldehyd.', atoms: ['C','H','H','O'], funFact: 'Formaldehyd jest używany do balsamowania zwłok. I to on odpowiada w połączonym stężeniu za "zapach nowego samochodu".' },
    { id: 'hno3', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Azotowy', eq: 'H + N + 3O ➔ HNO₃', desc: 'Silny, żrący kwas azotowy niszczący pancerz wroga.', atoms: ['H','N','O','O','O'], funFact: 'Kwas azotowy barwi ludzką tkankę na żółto za sprawą reakcji ksantoproteinowej (tej samej która ujawnia białka w laboratoriach).' },
    { id: 'h2co3', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Węglowy', eq: '2H + C + 3O ➔ H₂CO₃', desc: 'Bąbelkujący, lekki kwas osłabia wroga i utrudnia ruchy.', atoms: ['H','H','C','O','O','O'], funFact: 'Ten bardzo słaby kwas tworzy się z CO2 rozpuszczonym w wodzie. Pijesz go za każdym razem, otwierając napój gazowany!' },
    { id: 'hcn', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Cyjanowodór', eq: 'H + C + N ➔ HCN', desc: 'Zabójcza trucizna. Omijając pancerz bezpośrednio uderza w układ nerwowy.', atoms: ['H','C','N'], funFact: 'Gaz pachnący gorzkimi migdałami – wysoce śmiercionośny, naturalnie uwalnia się ze zmiażdżonych pestek brzoskwiń, wiśni czy jabłek.' },
    { id: 'ch4', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Methane Blast', eq: 'C + 4H ➔ CH₄', desc: 'Wielka ognista eksplozja odrzucająca wrogów.', atoms: ['H','H','H','H','C'], funFact: 'Główny składnik gazu ziemnego. Bezbarwny i bezwonny gaz, którego najpotężniejszym biologicznym "producentem" w rzadkim śmiesznym wydaniu... są puszczające bąki krowy na łące.' },
    { id: 'nh3', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Ammonia Freeze', eq: 'N + 3H ➔ NH₃', desc: 'Gwałtowne pchnięcie cieplne zamrażające wrogów na kość.', atoms: ['H','H','H','N'], funFact: 'Amoniak bardzo intensywnie drażni nos i oczy. Jest do dziś używany powszechnie w przemysłowych i laboratoryjnych chłodziarkach z racji potężnego pochłaniania ciepła parowania.' },
    { id: 'h2o', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Woda (Gnicie)', eq: '2H + O ➔ H₂O', desc: 'H₂O kumuluje się w organizmie, powodując stopniowe gnicie flory wroga po trafieniu.', atoms: ['H','H','O'], funFact: 'Zwana monotlenkiem diwodoru. Istnieje na Ziemi w 3 postaciach i co zabawne w kosmosie stanowi prawdopodobnie jeden z najbardziej pożądanych związków budulcowych na nowo poznanej planecie.' },
    { id: 'co2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Acid Cloud', eq: 'C + 2O ➔ CO₂', desc: 'Toksyczna i zżerająca wrogów chmura kwasu.', atoms: ['C','O','O'], funFact: 'To gaz cieplarniany - chociaż drzewa go pochłaniają jako pożywienie to jego gwałtowny nadmiar odczuwasz go w zadyszce, by podać sygnał mózgowi "oddychaj".' },
    { id: 'no2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Toxic Gas', eq: 'N + 2O ➔ NO₂', desc: 'Gaz duszący wrogów i spowalniający ich ruchy.', atoms: ['N','O','O'], funFact: 'Silnie toksyczny gaz odpowiadajacy za charakterystyczne brązowawe zabarwienie nad dużymi miastami w upalne dnie na skutek wytwarzanego przez auta smogu fotochemicznego.' },
    { id: 'sio2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Krzemionka (Szkło)', eq: 'Si + 2O ➔ SiO₂', desc: 'Tworzy trwałą, ale kruchą barierę, zwalniającą wrogów na ogromnym obszarze.', atoms: ['Si','O','O'], funFact: 'To dosłownie piasek! Podgrzany do wysokiej temperatury tworzy przezroczyste ładne szkło.' },
    { id: 'sic', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Węglik Krzemu', eq: 'Si + C ➔ SiC', desc: 'Tworzy strefę o absurdalnej twardości. Zadaje spore obrażenia i zatrzymuje (zamraża) wrogów na długo.', atoms: ['Si','C'], funFact: 'Nazywany karborundem, kryształy wyglądają bardzo bajecznie. Są twarde niemal tak jak diament i stosowane w taśmach szlifierskich oraz autach sportowych.' },
    { id: 'ncl3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Trójchlorek Azotu', eq: 'N + 3Cl ➔ NCl₃', desc: 'Wielka strefowa eksplozja przy najmniejszym dotyku!', atoms: ['N','Cl','Cl','Cl'], funFact: 'Ta substancja w rzeczywistości tak samo uwielbia wybuchać. Kiedy połączyły się rury od basenu podchlorynu sodu oraz związków amoniaku, często powstawał ulatniający się drażniący dym NCl₃ i basenowy smród chloru w jednym.' },
    { id: 'pcl5', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Pentachlorek Fosforu', eq: 'P + 5Cl ➔ PCl₅', desc: 'Rozprysk potężnej toksyny kwasowej.', atoms: ['P','Cl','Cl','Cl','Cl','Cl'], funFact: 'PCl₅ to ciało stałe, które potrafi na powietrzu sublimować bez uwalniania się do fazy ciekłej bezpośrednio tworząc białe żrące pary.' },
    { id: 'p4', category: 'Pierwiastki i Alotropy', enCategory: 'Elements and Allotropes', name: 'Biały Fosfor (Zapalający)', eq: '4P ➔ P₄', desc: 'Obszarowa eksplozja zapalająca wszystko dookoła.', atoms: ['P','P','P','P'], funFact: 'Fosfor biały w kontakcie z tlenem z powietrza od razu zaczyna płonąć sam z siebie jaskrawym pożarem, stąd był używany w broni wojskowej, obecnie mocno ograniczonej przez konwencje ze względu na zadawanie fatalnych ran poparzeniowych i silnej toksyczności.' },
    { id: 'ph3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Fosforowodór', eq: 'P + 3H ➔ PH₃', desc: 'Eksplozja toksycznego gazu.', atoms: ['P','H','H','H'], funFact: 'Silnie trujący gaz pachnący jako "martwa ryba" lub "psujący się czosnek", służy do zabijania kretów, używany również w procesie modyfikacji złączy tranzystorów oraz produkcji kryształów fosfidu indow.' },
    { id: 'h3po4', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Fosforowy', eq: '3H + P + 4O ➔ H₃PO₄', desc: 'Eksplozja ortofosforowa zatrzymująca wrogów!', atoms: ['H','P','O','O','O','O'], funFact: 'Znajdziesz go na przykład jako popularny dodatek obniżający pH do Coca-Coli. A mimo faktu bycia kwasem nie oparzy cie boleśnie i ma właściwości zwalczające rdzę.' },
    { id: 'cl2', category: 'Pierwiastki i Alotropy', enCategory: 'Elements and Allotropes', name: 'Chlor (Gaz)', eq: '2Cl ➔ Cl₂', desc: 'Toksyczna chmura zielonego gazu.', atoms: ['Cl','Cl'], funFact: 'Zastosowany jako pierwszy śmiercionośny gaz bojowy podczas I WŚ. Na codzien niszczy on bakterie w pitnej wodzie oraz dodawany jest w oczyszczalniach chlorując rury.' },
    { id: 'hcl', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Solny', eq: 'H + Cl ➔ HCl', desc: 'Gwałtowny wyrzut kwasu solnego o potężnej sile żrącej!', atoms: ['H','Cl'], funFact: 'Kwas solny produkują specjalne gruczołki błony żołądka człowieka. Ten sam HCl jaki rozpuszcza niemal kazde metale, ulatwia trawienie protein u wszystkich ludzi ze stęzeniem do pH 1.5.' },
    { id: 'rao', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Radu (RaO)', eq: 'Ra + O ➔ RaO', desc: 'Radioaktywny bąbel! Niszczy pobliskich wrogów od wewnątrz promieniowaniem fioletowym.', atoms: ['Ra','O'], funFact: 'Z racji faktu że sam tlenek radu to związek niezwykle rzadki sztucznie wytworzony ma on postać i wagę żwireku. Świeci w nocy lekko fioletowo w zależności jak jest wyprodukowany (ale nie zielony!).' },
    { id: 'poh2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Wodorek Polonu (PoH₂)', eq: 'Po + 2H ➔ PoH₂', desc: 'Niewidzialnie śmiercionośny opar, zadający gigantyczne obrażenia wszystkim w okolicy!', atoms: ['Po','H','H'], funFact: 'Jest silnie lotnym trującym radioaktywnym gazem powiązanym bardzo podobnym z wodą(jak H2O-H2Po H2S itd..).  Ma o wiele gorsze zapachu od zgniłych jaj - chociaż zanim to sprawdzisz zginiesz!' },
    { id: 'porac', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Krytyczny Rozpad', eq: 'Po + Ra + C ➔ BUM!', desc: 'Bąbel promieniowania! Reakcja łańcuchowa wyniszcza obszar!', atoms: ['Po','Ra','C'], funFact: 'Czysta autorsko fantazjna grawitacyjna reakcja. Sam proces złączenia ich blisny na atomowej odległosci zaowocowalo by powistaiemm brudnej bomby - tak szybkajak bys pomrugał.' },
    { id: 'rac2', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Węglik Radu (RaC₂)', eq: 'Ra + 2C ➔ RaC₂', desc: 'Maksymalnie ciężki siewca promieniowania unieruchamiający cel na długi czas.', atoms: ['Ra','C','C'], funFact: 'Tarcze promieniotwórczo gęstego węgla. Gdy polon zabija od razu komorki- po 1 g węgliku radu będziesz miał gorące halucynacje z krwotokami z nosa. Rad był mitem po jego odkrycu, ze nawet polecano pasty do zębw by "swiecily" z ich pomoca (z tragicznymi konwsekswnecjami!).' },
    { id: 'poo2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Dwutlenek Polonu (PoO₂)', eq: 'Po + 2O ➔ PoO₂', desc: 'Chmura radioaktywnego tlenu wyniszcza otoczenie potężnymi falami gorąca!', atoms: ['Po','O','O'], funFact: 'Jeżeli widzisz jak "wytwarza się ciepło", nie dotykaj tego! Polon wydziela go tak sporo- mała żółtawa tabletka Po02 rozgrzeje się na biurku do czerwoności topiąc plastik pod własnym ciepłem na skraj i połączac sie z węglem.' },
    { id: 'rah2', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Wodorek Radu (RaH₂)', eq: 'Ra + 2H ➔ RaH₂', desc: 'Wybuchowy radioaktywny gaz, pożerający twarde tkanki wroga.', atoms: ['Ra','H','H'], funFact: 'Związek jest reaktywnym materiałem na wodorze. Jako jedyna reakcja - sam Rad tak bardzo przypomina Wapń, że ludzki organizm gromadzi te promieniowanie z pomyłką wrzucajac go w skład budulcowy i pożerając wapń- kości od środka!.' },
    { id: 'bh3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Boran', eq: 'B + 3H ➔ BH₃', desc: 'Toksyczny gaz wnikający w przeciwników, wywołujący spowolnienie i podpalający pancerze.', atoms: ['B','H','H','H'], funFact: 'Boran jest niezwykle niestabilny i zwykle występuje podwójnie jako: dwuboran.' },
    { id: 'b2o3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Boru', eq: '2B + 3O ➔ B₂O₃', desc: 'Szeroka fala rozgrzanego szkła zadająca duże obrażenia kontaktowe.', atoms: ['B','B','O','O','O'], funFact: 'Główny składnik szkła borokrzemianowego (pyreks), odpornego na duże zmiany temperatur.' },
    { id: 'bcl3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Boru', eq: 'B + 3Cl ➔ BCl₃', desc: 'Żrący zielonkawy dym mocno paraliżujący i spowalniający cel.', atoms: ['B','Cl','Cl','Cl'], funFact: 'Dymi gęsto na powietrzu, reagując gwałtownie z wilgocią tworząc mgłę zabójczego kwasu.' },
    { id: 'bn', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Azotek Boru', eq: 'B + N ➔ BN', desc: 'Superszybka, ostra struktura. Wiele małych latających odłamków tnących hordy.', atoms: ['B','N'], funFact: 'Może tworzyć struktury krystaliczne niemal identyczne z diamentem – to jeden z najtwardszych znanych materiałów na ziemi!' },
    { id: 'c6h12o6', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Fruktoza', eq: '6C + 12H + 6O ➔ C₆H₁₂O₆', desc: 'Wielki cukrowy impuls potężnie opóźniający i oblepiający wrogów w ogromnym promieniu.', atoms: ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O','O'], funFact: 'Fruktoza to cukier występujący naturalnie w owocach i miodzie. Jest słodsza niż glukoza, stąd chętnie używana w syropie!' },
    { id: 'cellulose', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Celuloza', eq: '6C + 10H + 5O (n) ➔ (C₆H₁₀O₅)n', desc: 'Ogromny splątany korzeń! Więzi wrogów po potężnym uderzeniu.', atoms: ['C','C','C','C','C','C','H','H','H','H','H','H','H','H','H','H','O','O','O','O','O'], funFact: 'Główny składnik sztywnych ścian komórkowych roślin. My - w odróżnieniu od krów - nie potrafimy jej w ogóle strawić, pełni rolę "błonnika"!' },
    { id: 'kno3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Saletra Potasowa', eq: 'K + N + 3O ➔ KNO₃', desc: 'Składnik prochu. Wywołuje ogromny obszarowy wybuch!', atoms: ['K','N','O','O','O'], funFact: 'Stosowana jako ważny nawóz roślinny i główny historyczny składnik prochu czarnego.' },
    { id: 'caco3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Węglan Wapnia', eq: 'Ca + C + 3O ➔ CaCO₃', desc: 'Skalista biała chmura miażdżąca pancerze wrogów.', atoms: ['Ca','C','O','O','O'], funFact: 'Z niego budują się skorupki jajek, rafy koralowe i kreda. Rośliny wykorzystują Ca jako składnik budulcowy ścian.' },
    { id: 'chlorophyll', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Chlorofil A', eq: '55C + 72H + 4N + 5O + Mg ➔ Chlorofil', desc: 'Reakcja fotosyntezy! Wielka wiązka czystego światła pochłaniająca energię wrogów.', atoms: ['Mg','N','N','N','N','O','C','C','C','H','H','H'], funFact: 'Serce każdej rośliny na Ziemi! Zawiera jon mążnezu złapany w pułapkę pierścienia z atomów azotu - identycznie jak żelazo w naszej krwi!' },
    { id: 'ethanol', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'C₂H₅OH (Etanol)', eq: '2C + 6H + O ➔ C₂H₅OH', desc: 'Upijająca mgła powodująca losowe ruchy i obrażenia!', atoms: ['C','C','H','H','H','H','H','H','O'], funFact: 'Popularny alkohol spożywczy, otrzymywany z fermentacji fruktozy!' },
    { id: 'vinegar', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'CH₃COOH (Kwas Octowy)', eq: '2C + 4H + 2O ➔ CH₃COOH', desc: 'Kwaśny zapach oszałamiający wroga i pożerający warstwy pancerza.', atoms: ['C','C','H','H','H','H','O','O'], funFact: 'Otrzymywany z fermentacji octowej etanolu. Podstawa sosów vinaigrette.' },
    { id: 'combustion', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Gwałtowne Utlenianie Etanolu', eq: 'C₂H₅OH + 3O₂ ➔ 2CO₂ + 3H₂O', desc: 'Potężna reaktywna eksploazja, która wszystko utlenia w ułamku sekundy, anihilując całe zastępy.', atoms: ['C','C','H','H','H','H','H','H','O','O','O','O','O','O','O'], funFact: 'Alkohol jest doskonałym paliwem. Utlenia się do CO2 wyzwalając ogromne ilości szaleńczo niszczycielskiej energii cieplnej.' },
    { id: 'mgcl2', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Magnezu', eq: 'Mg + 2Cl ➔ MgCl₂', desc: 'Rozpryskująca się sól krystaliczna spowalniająca wrogów.', atoms: ['Mg','Cl','Cl'], funFact: 'Niezwykle dobrze rozpuszcza się w wodzie. Znany ze swych właściwości jako dodatek do zimowych soli drogowych pomagających zwalczać lód w niskich temp.' },
    { id: 'cacl2', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Wapnia', eq: 'Ca + 2Cl ➔ CaCl₂', desc: 'Potężny środek suszący! Wysysa wilgoć z organizmów.', atoms: ['Ca','Cl','Cl'], funFact: 'To silny desykant. Używa się go w osuszaczach powietrza, bo potrafi wyssać wilgoć bezpośrednio z powietrza, zamieniając się w ciecz!' },
    { id: 'mgo', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Magnezu', eq: 'Mg + O ➔ MgO', desc: 'Oślepiająco jasny błysk spalającego się magnezu!', atoms: ['Mg','O'], funFact: 'Spalający się magnez generuje niezwykle jasne białe światło, niegdyś używane jako flesz w pierwszych aparatach fotograficznych.' },
    { id: 'cao', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Tlenek Wapnia (Wapno Palone)', eq: 'Ca + O ➔ CaO', desc: 'Chmura wapna palonego żrąca biologiczne pancerze.', atoms: ['Ca','O'], funFact: 'Wapno palone zmieszane z wodą tworzy "wapno gaszone" - reakcja ta wydziela ogromną ilość ciepła i służy między innymi do produkcji zapraw budowlanych.' },
    { id: 'caoh2', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Wodorotlenek Wapnia', eq: 'Ca + 2O + 2H ➔ Ca(OH)₂', desc: 'Silnie zasadowa reakcja gaszenia wapna (lasowanie)!', atoms: ['Ca','O','O','H','H'], funFact: 'Zawiesina tego związku, zwana "mlekiem wapiennym", jest bardzo popularna i służyła kiedyś powszechnie do bielenia ścian i chronienia drzew przed mrozem.' },
    { id: 'kcl', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Chlorek Potasu', eq: 'K + Cl ➔ KCl', desc: 'Rozerwanie solne, dezorientujące wrogów szarpnięciem.', atoms: ['K','Cl'], funFact: 'Używany jest czasami jako popularny rolniczy nawóz sztuczny będący cennym źródłem makroelementów dla roślin, jednak niska higroskopijność sprawia ze podaje sie go w ziemie w czystej postaci.' },
    { id: 'koh', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Wodorotlenek Potasu (Kaustyczny)', eq: 'K + O + H ➔ KOH', desc: 'Absolutnie żrący strzał topiący pancerze.', atoms: ['K','O','H'], funFact: 'To jedna z najsilniejszych zasad! Używa się jej do rąbania tłuszczu np. w produkcji miękkich szarych mydeł.' },
    { id: 'p2o5', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Pięciotlenek Fosforu', eq: '2P + 5O ➔ P₂O₅', desc: 'Wybuchowy desykant! Całkowicie wysusza i dezintegruje wrogów na obszarze.', atoms: ['P','P','O','O','O','O','O'], funFact: 'Jedna z nielicznych substancji tak bardzo chłonących wodę, że potrafi nawet wyrwać ją sztucznie (chemicznie) odwodniając twarde i nierozerwalne kwasy np HNO3!' },
    { id: 'sicl4', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Tetrachlorek Krzemu', eq: 'Si + 4Cl ➔ SiCl₄', desc: 'Duszący dym tetrachlorku krzemu ograniczający poruszanie się.', atoms: ['Si','Cl','Cl','Cl','Cl'], funFact: 'Reaguje niezwykle gwałtownie z wilgotnym powietrzem wyrzucając przy tym w efekcie natychmiast kwas solny gęstniejąc na deszczu!' }
,
    { id: 'nacl', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'NaCl (Chlorek Sodu)', eq: 'Na + Cl ➔ NaCl', desc: 'Ogromny, trzeszczący ładunek soli wywołujący wysuszenie i podrażnienie roślin!', atoms: ['Na','Cl'], funFact: 'Sól kuchenna od stuleci była używana jako środek konserwujący, waluta oraz broń na obślizgłe ślimaki!' },
    { id: 'naoh', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'NaOH (Wodorotlenek Sodu)', eq: 'Na + O + H ➔ NaOH', desc: 'Silnie kaustyczna para sodowa pożerająca całą materię biologiczną.', atoms: ['Na','O','H'], funFact: 'Główny składnik preparatów typu kret do rur. Rozpuszcza niemal wszystko, co zatyka odpływy.' },
    { id: 'nahco3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'NaHCO₃ (Soda Oczyszczona)', eq: 'Na + H + C + 3O ➔ NaHCO₃', desc: 'Gazująca i wibrująca chmura spowalniająca wrogów i uszkadzająca biologiczne tkanki!', atoms: ['Na','H','C','O','O','O'], funFact: 'Bardzo dobrze na zakwaszenie i czyszczenie! Kiedy dodasz do niej ocet, zaczyna silnie się pienić - efekt wulkanu!' },
    { id: 'al2o3', category: 'Tlenki i Wodorki', enCategory: 'Oxides and Hydrides', name: 'Al₂O₃ (Korund)', eq: '2Al + 3O ➔ Al₂O₃', desc: 'Masywny potężny kryształ niszczący wroga masą. Ultrawysoka twardość zamrażająca cel!', atoms: ['Al','Al','O','O','O'], funFact: 'Jeden z najtwardszych tlenków. Jeśli ma śladowe zanieczyszczenia chromem, staje się oszałamiającym Rubinem!' },
    { id: 'alcl3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'AlCl₃ (Chlorek Glinu)', eq: 'Al + 3Cl ➔ AlCl₃', desc: 'Kwasowa chmura gęstniejąca na przeciwnikach przed tobą, drażniąca bez przerwy.', atoms: ['Al','Cl','Cl','Cl'], funFact: 'Był i jest silnym antyperspirantem w kulkach i dezodorantach. Posiada właściwość miejscowego zamykania porów skóry pod pachami.' },
    { id: 'hf', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Kwas Fluorowodorowy (HF)', eq: 'H + F ➔ HF', desc: 'Smaruje silnie żrący kwas korozyjny, rozpuszczający pancerze krzemowe i zadający ogromne rany.', atoms: ['H','F'], funFact: 'Kwas ten jest tak reaktywny, że trawi szkło i krzemionkę. Musi być przechowywany w plastikowych butelkach!' },
    { id: 'cf4', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Kriogeniczny Freon-14', eq: 'C + 4F ➔ CF₄', desc: 'Super stabilny gaz kriogeniczny. Unieruchamia i zamraża twardym lodem wszystkich wrogów na dużym obszarze.', atoms: ['C','F','F','F','F'], funFact: 'Tetrafluorometan wrze w temperaturze -128°C i jest jednym z najbardziej stabilnych organicznych związków ze skrajnie silnym efektem cieplarnianym.' },
    { id: 'naf', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Fluorek Sodu', eq: 'Na + F ➔ NaF', desc: 'Zasadowa sól i trucizna biologiczna. Paraliżuje i silnie zatruwa mutanta raniąc go z czasem powracającym DoT.', atoms: ['Na','F'], funFact: 'W bardzo małych dawkach zapobiega próchnicy i bywa dodawany do past do zębów, ale w dużych stężeniach to silny insektycyd i trucizna!' },
    { id: 'alf3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Trójfluorek Glinu (Shrapnel)', eq: 'Al + 3F ➔ AlF₃', desc: 'Niezwykle gęste szkło fluorowe. Zadaje potężne obrażenia fizyczne, rozpadając się na 6 raniących wokół odłamków!', atoms: ['Al','F','F','F'], funFact: 'Używany głównie przy otrzymywaniu metalicznego glinu w hutnictwie do obniżania temperatury topnienia tlenku glinu.' },
    { id: 'fef3', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Fluorek Żelaza(III)', eq: 'Fe + 3F ➔ FeF₃', desc: 'Metaliczny magnetyczny kryształ przyciągający grawitacyjnie pobliskich wrogów do epicentrum i raniący ich implozją.', atoms: ['Fe','F','F','F'], funFact: 'Związek wykazuje specyficzny antyferromagnetyzm w temperaturze pokojowej i jest silnym katalizatorem reakcji organicznych.' },
    { id: 'thermite', category: 'Skomplikowane i Organiczne', enCategory: 'Complex and Organic', name: 'Reakcja Termitowa', eq: '2Al + 2Fe + 3O ➔ Termit', desc: 'Niewyobrażalnie gorący wybuch o temperaturze 2500 °C! Gwałtowne utlenianie glinu spopiela pancerze i tkanki wokół.', atoms: ['Al','Al','Fe','Fe','O','O','O'], funFact: 'Termit po rozpaleniu potrafi przepalić stal i beton bez użycia dodatkowego tlenu – pali się pod wodą i piaskiem!' },
    { id: 'sodium_water', category: 'Sole i Minerały', enCategory: 'Salts and Minerals', name: 'Eksplozja Sodu z Wodą', eq: '2Na + 2H + O ➔ Eksplozja', desc: 'Gwałtowny kontakt sodu z wodą wywołuje alkaliczny wybuch niszczący otoczenie żrącym wodorotlenkiem sodu.', atoms: ['Na','Na','H','H','O'], funFact: 'Czysty sód wrzucony do wody topi się od naporu ciepła w błyszczącą kulkę, gwałlowo uwalnia wodór i widowiskowo eksploduje!' },
    { id: 'neonium', category: 'Kwasy i Zasady', enCategory: 'Acids and Bases', name: 'Superkwas Neoniowy (NeH⁺)', eq: 'Ne + H ➔ NeH⁺', desc: 'Niezwykle silny i ekstremalnie żrący superkwas, który natychmiast rozpuszcza pancerze organiczne i metalowe wrogów zadając im gigantyczne obrażenia.', atoms: ['Ne','H'], funFact: 'Jon neonowy NeH⁺ jest jednym z najsilniejszych znanych superkwasów we wszechświecie. W stanie gazowym może protonować praktycznie każdą znaną substancję!' }
    , { id: 'ccl4', name: 'Tetrachlorometan', eq: 'C + 4Cl ➔ CCl₄', desc: 'Potężny wybuch kwasowy zamrażający wszystko dookoła.', atoms: ['C','Cl','Cl','Cl','Cl'], category: 'Halogenki', enCategory: 'Halides' }
    , { id: 'c6_from_c3', name: 'Diament z Grafitu', eq: '3C + Grafit ➔ C₆', desc: 'Kolejne warstwy węgla sprasowały grafit w lity diament.', atoms: ['C','C','C','C','C','C'], category: 'Struktury Węglowe', enCategory: 'Carbon Structures' }
    , { id: 'c6_under_pressure', name: 'Diament z Ciśnienia', eq: 'C₃ + Siła ➔ C₆', desc: 'Fizyczna siła sprasowała struktury grafitu w niezniszczalny diament!', atoms: ['C','C','C','C','C','C'], category: 'Struktury Węglowe', enCategory: 'Carbon Structures' }
    , { id: 'shock_ncl3', name: 'Detonacja NCl₃', eq: 'NCl₃ + Wstrząs ➔ Wybuch', desc: 'Trójchlorek azotu zdetonował samorzutnie pod wpływem naprężenia mechanicznego!', atoms: ['N','Cl','Cl','Cl'], category: 'Zjawiska Kinetyczne', enCategory: 'Kinetic Phenomena' }
    , { id: 'shock_p4', name: 'Zapłon Fosu P₄', eq: 'P₄ + Tarcie ➔ Wybuch', desc: 'Biały fosfor uległ zapaleniu pod wpływem tarcia kinetycznego i ciśnienia!', atoms: ['P','P','P','P'], category: 'Zjawiska Kinetyczne', enCategory: 'Kinetic Phenomena' }
    , { id: 'shock_sodium_water', name: 'Wybuch Sód-Woda', eq: '2Na + H₂O + Wstrząs ➔ Wybuch', desc: 'Gwałtowne pęknięcie pęcherzyków zmusiło sód do agresywnej reakcji!', atoms: ['Na','Na','H','H','O'], category: 'Zjawiska Kinetyczne', enCategory: 'Kinetic Phenomena' }
];

export const MoleculeGraphic = ({ atoms, size = "md" }: { atoms: string[], size?: "sm" | "md" | "lg" }) => {
    // Determine central atom (least frequency)
    const counts: Record<string, number> = {};
    atoms.forEach(a => counts[a] = (counts[a] || 0) + 1);
    
    let centralAtom: string | null = null;
    let orbitingAtoms: string[] = [];
    
    // Find an atom that appears exactly once, to act as center. 
    // Prioritize C, Si, S, P, N, O
    const priorities = ['C', 'Si', 'P', 'S', 'N', 'O', 'Cl', 'Ra', 'Po', 'H'];
    const candidates = Object.keys(counts).filter(k => counts[k] === 1);
    if (candidates.length > 0) {
        centralAtom = candidates.sort((a, b) => priorities.indexOf(a) - priorities.indexOf(b))[0];
    }
    
    // Fallback if no single atom (like C6, Cl2)
    if (!centralAtom && atoms.length > 0) {
        // no central atom, all orbit
        orbitingAtoms = [...atoms];
    } else if (centralAtom) {
        orbitingAtoms = [...atoms];
        orbitingAtoms.splice(orbitingAtoms.indexOf(centralAtom), 1);
    }
    
    // If it's a known diatomic, display side-by-side
    const isDiatomic = atoms.length === 2;

    const renderAtom = (atom: string, idx: string, xpx: number, ypx: number) => {
        let color = 'bg-blue-500';
        if (atom === 'O') color = 'bg-red-500';
        else if (atom === 'C') color = 'bg-slate-700';
        else if (atom === 'N') color = 'bg-purple-500';
        else if (atom === 'S') color = 'bg-yellow-500 text-black';
        else if (atom === 'Cl') color = 'bg-emerald-500';
        else if (atom === 'P') color = 'bg-orange-500';
        else if (atom === 'Si') color = 'bg-stone-500';
        else if (atom === 'Ra') color = 'bg-fuchsia-500';
        else if (atom === 'Po') color = 'bg-rose-600';
        else if (atom === 'H') color = 'bg-slate-200 text-black';
        else if (atom === 'Fe') color = 'bg-orange-850 border border-orange-500 font-serif text-amber-200';
        else if (atom === 'F') color = 'bg-lime-400 text-slate-950 font-sans font-black shadow-[0_0_12px_rgba(163,230,53,0.8)] border border-lime-300';
        else if (atom === 'Na') color = 'bg-blue-300 text-slate-900 border border-blue-500 font-bold';
        else if (atom === 'Al') color = 'bg-slate-300 text-slate-900 border-2 border-slate-100 font-bold';
        else if (atom === '?') color = 'bg-slate-800 text-white';
        
        const dotSize = size === 'sm' ? 'w-5 h-5 text-[9px]' : size === 'lg' ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-sm';
        const offset = size === 'sm' ? 10 : size === 'lg' ? 24 : 16;
        
        let displayAtom = atom;
        if (atom === 'He') {
            color = 'bg-cyan-400 text-slate-900 border-white relative font-black shadow-[0_0_15px_rgba(34,211,238,0.8)]';
        }
        if (atom === 'Ne') {
            color = 'bg-red-500 text-white border-red-300 relative font-black shadow-[0_0_15px_rgba(239,68,68,0.9)]';
        }
        
        return (
            <div key={idx} className={`absolute ${dotSize} ${color} rounded-full border border-white/30 flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10 transition-transform hover:scale-110 cursor-default`} 
                 style={{ left: `calc(50% + ${xpx}px - ${offset}px)`, top: `calc(50% + ${ypx}px - ${offset}px)` }}>
                {displayAtom}
            </div>
        );
    };

    const lines: React.ReactNode[] = [];
    const mainRadius = size === 'sm' ? 14 : size === 'lg' ? 42 : 28;

    const drawBond = (fx: number, fy: number, tx: number, ty: number, key: string) => {
        const dx = tx - fx;
        const dy = ty - fy;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return (
            <div key={`bond-${key}`} className="absolute bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)] origin-left"
                 style={{
                     width: `${length}px`,
                     height: size === 'sm' ? '2px' : '4px',
                     left: `calc(50% + ${fx}px)`,
                     top: `calc(50% + ${fy}px - ${size === 'sm' ? 1 : 2}px)`,
                     transform: `rotate(${angle}deg)`
                 }}
            />
        );
    };

    const renderedAtoms: React.ReactNode[] = [];

    if (isDiatomic && !centralAtom) {
        // Render 2 side by side
        renderedAtoms.push(renderAtom(orbitingAtoms[0], 'a0', -mainRadius, 0));
        renderedAtoms.push(renderAtom(orbitingAtoms[1], 'a1', mainRadius, 0));
        lines.push(drawBond(-mainRadius, 0, mainRadius, 0, 'b0'));
    } else {
        if (centralAtom) {
            renderedAtoms.push(renderAtom(centralAtom, 'center', 0, 0));
        }

        orbitingAtoms.forEach((atom, idx, arr) => {
            let angle = (idx / arr.length) * Math.PI * 2 - Math.PI / 2; // start top

            // Smart geometries
            if (centralAtom) {
                if (arr.length === 2 && ['O', 'S', 'Po'].includes(centralAtom)) {
                    // Bent geometry (e.g. H2O)
                    angle = idx === 0 ? Math.PI * 0.2 : Math.PI * 0.8;
                } else if (arr.length === 2 && ['C', 'Si', 'Ra'].includes(centralAtom)) {
                    // Linear geometry (e.g. CO2)
                    angle = idx === 0 ? 0 : Math.PI;
                } else if (arr.length === 3 && ['N', 'P'].includes(centralAtom)) {
                    // Trigonal pyramidal (visualized spreading downwards)
                    angle = idx === 0 ? Math.PI * 0.3 : (idx === 1 ? Math.PI * 0.7 : Math.PI * -0.5);
                } else if (arr.length === 3 && ['C'].includes(centralAtom)) {
                    // Trigonal planar (like Formaldehyde)
                    angle = idx === 0 ? Math.PI * -0.5 : (idx === 1 ? Math.PI * 0.16 : Math.PI * 0.84);
                } else if (arr.length === 4) {
                    // Tetrahedral projection
                    angle = idx * Math.PI / 2;
                }
            }

            const x = Math.cos(angle) * mainRadius;
            const y = Math.sin(angle) * mainRadius;

            renderedAtoms.push(renderAtom(atom, `orb-${idx}`, x, y));
            
            if (centralAtom) {
                // draw bond from center to satellite
                lines.push(drawBond(0, 0, x, y, `bond-${idx}`));
            } else {
                // Polygon ring
                const nextAngle = ((idx + 1) % arr.length / arr.length) * Math.PI * 2 - Math.PI / 2;
                const nx = Math.cos(nextAngle) * mainRadius;
                const ny = Math.sin(nextAngle) * mainRadius;
                lines.push(drawBond(x, y, nx, ny, `bond-ring-${idx}`));
            }
        });
    }

    return (
        <div className={`relative flex items-center justify-center ${size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-40 h-40' : 'w-24 h-24'}`}>
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/10 animate-[spin_40s_linear_infinite]" />
            {lines}
            {renderedAtoms}
        </div>
    );
}
