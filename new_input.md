Összegyűjtöttünk néhány észrevételt és fejlesztési javaslatot az opioid kalkulátor működésével kapcsolatban. Ezek részben technikai pontosítások, részben pedig olyan klinikai szempontok, amelyek segíthetik a biztonságosabb és egyértelműbb használatot. 
1. Adagolás és gyakoriság megjelenítése 
•	Jelenjen meg a javasolt adagolási gyakoriság is a kalkuláció eredményében. 
•	A rendszer jelezze, ha túl gyakori vagy túl ritka adagolási intervallum kerül beállításra. 
•	Ha túl gyakori adagolást állítunk be (pl. 4 óránként), de az adott dózis mellett ez nem kivitelezhető, a kalkulátor ne csak az első néhány beadási eseményre számoljon dózist, hanem egyértelmű figyelmeztetést adjon, hogy ilyen gyakori adagolással a kalkuláció nem megoldható. 
2. Vesefunkcióhoz kapcsolódó megjelenítés 
•	GFR <10 ml/min esetén jelenleg egyszerre jelenik meg mindkét dóziscsökkentési javaslat. Célszerű lenne, ha ilyenkor csak a szigorúbb dóziscsökkentési ajánlás jelenne meg. 
3. Retard és azonnali felszívódású készítmények kezelése 
•	A kalkulátor külön kezelje a normál és a retard felszívódású készítményeket. Például jelenleg az 50 mg-os tramadol készítményt nem ismeri fel, illetve nem figyelmeztet, ha retard 100 mg-os tramadolt 8 óránként állítunk be. 
•	Érdemes lenne jelölni azt is, hogy mely készítmények alkalmasak sürgősségi fájdalomcsillapításra, illetve melyek bázisterápia beállítására. 
4. Specifikus készítményekkel kapcsolatos pontosítások 
•	MST Continus: az alkalmazási előírás alapján iv. → per os váltásnál általában 100% az emelés; ezt a kalkulátor külön kezelhetné retard készítményként. 
•	Oxycodone: az 5 mg-os hatáserősség nincs forgalomban, a kalkulátor néha hibaüzenetet is ad erre vonatkozóan, de mégis számol 15 mg-os dózissal. 
•	Oxycodone Sandoz és Vitabalans: már nem elérhetőek. 
•	Oxikodon/naloxon kombináció: jó lenne egyértelműen feltüntetni, hogy a kalkuláció az oxikodon komponensre vagy az összhatóanyagra vonatkozik. 
•	Az oxikodon és az oxikodon/naloxon napi maximális dózisa jelenleg nem szerepel a rendszerben. 
•	Oxikodon/naloxon kombinációból jelenleg csak az Oxynador készítmény érhető el. 
5. Hatóanyag- és készítményszintű módosítások 
•	A hidromorfon készítmények már nincsenek forgalomban; a hatóanyag maradhatna, de a gyári neveket érdemes lenne eltávolítani. 
•	Kerüljön be a tapentadol hatóanyag (gyári készítmény nélkül), 0,4 konverziós faktorral, mivel több környező országban elérhető. 
•	A metadon esetében érdemes lenne hibaüzenettel jelezni, hogy az online kalkulátorokkal nem biztonságos a váltás. Metadonról történő váltást jelenleg nem enged, viszont metadonra engedne átváltani, de van megjegyzés: csak 10 mg OME értéknél lehet váltani. Viszont 10 mg-os OME-nél 0 mg metadont ad meg céldózisként. 
6. Maximális dózisokra vonatkozó figyelmeztetések 
•	A kalkulátor jelezze az egyszeri maximális dózis túllépését is, ne csak a napi maximumot. 
•	Dihidrokodein: egyszeri max. dózis (120 mg) figyelmeztetés. 
•	Tramadol: egyszeri max. dózis (200 mg) figyelmeztetés. 
•	Kodein: a napi max. dózis (240 mg) jelenjen meg. 
7. Fentanil kezelése 
•	Fentanilról történő váltásnál a dózis mikrogrammban legyen megadható, ne milligrammban. 
•	A fentanil tapaszra váltás jelenleg csak OME alapján történik, ugyanakkor az alkalmazási előírás táblázatos sávokat tartalmaz a napi orális morfin dózisa alapján, és külön ajánlás van stabil és instabil betegek esetére. Érdemes lenne ezt a táblázatos logikát implementálni a kalkulátorba, hogy ne jelenjenek meg túl bonyolult tapasz-kombinációk. 
•	„Fentanil Sandoz (injectio) (oldatos injekció)” megnevezésnél az „(injectio)” felirat törlése szükséges. 
8. Kodein kombinációk 
Jelenleg két paracetamollal kombinált készítmény van: 
•	PARCODIN 500 mg / 30 mg tabletta – tartós termékhiány 
•	TALVOSILEN FORTE 500 mg / 30 mg kemény kapszula – elérhető 
9. Tablettaosztás figyelembevétele 
•	Jó lenne figyelembe venni a felezhető és nem felezhető tablettákat, hogy a kalkulált dózis reálisan kivitelezhető legyen. 
10. Alacsony dózisok kezelése 
•	Alacsony dózisú morfinról (pl. 10 mg) tramadolra történő váltásnál a kalkulátor jelenleg 0 mg-ra vált, miközben 25 mg-os hatáserősség elérhető. 
11. Felhasználói figyelmeztetések 
•	A kalkulátorban a BMI, nem és vesefunkció bevitele jelenleg nem minden esetben befolyásolja a számított dózist. Erre célszerű lenne külön figyelmeztetést tenni, mert megtévesztő lehet a felhasználó számára. 
•	Érdemes lenne minden kalkuláció mellett hangsúlyozni, hogy az adott gyógyszer alkalmazási előírását minden esetben át kell tekinteni, mert bizonyos váltások (pl. morfin–oxikodon) ennél összetettebb klinikai megítélést igényelhetnek. 
12. Dóziscsökkentési csúszka magyarázata 
A csúszkához megjegyzésként javasolt feltüntetni: 
„Válasszon dózist az ‘automatikus dóziscsökkentési tartomány’ alsó határához közelebb (25% csökkentés) vagy a felső határához közelebb (50% csökkentés) annak klinikai megítélése alapján, hogy az mennyire alkalmazható az adott opioid kezelés vagy beteg sajátos jellemzőire. 
A csökkentés felső határához (50%) közelebbi dózist válasszon, ha: 
•	a beteg viszonylag nagy dózisú jelenlegi opioid kezelést kap, 
•	ázsiai származású, vagy 
•	idős, illetve orvosilag kritikus állapotú. 
A csökkentés alsó határához (25%) közelebbi dózist válasszon, ha: 
•	a beteg nem rendelkezik ezekkel a jellemzőkkel, vagy 
•	ugyanazon gyógyszerrel történik az átállás, csak más szisztémás adagolási útra (pl. per os → iv.).” 

Forrás: UpToDate  
https://www.uptodate.com/contents/image?imageKey=ID%2F59062 
13. Egyéb technikai javaslatok 
•	Mértékegységek harmonizációja (különösen fentanil esetében). 
•	Forrásmegjelölések feltüntetése a kalkulátorban. 
