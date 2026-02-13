PalliCalc – PRD & Technical Updates (Batch 2)

1. Bug Fixes & Adjustments

1.1 UI Label Correction (12-hour Interval)

Issue: When selecting a 12-hour dosing frequency, the labels currently display "Morning" and "Noon".

Correction: Change the second label to "Evening" (e.g., Morning / Evening).

1.2 Fentanyl Patch Algorithm

Issue: The calculator currently suggests incorrect single patch sizes.

Requirement: The system must calculate the target dose using combinations of standard available patch sizes.

Available Sizes: 12, 25, 50, 75, 100 mcg/hr.

Logic: The output should combine these sizes to achieve the target dose (e.g., for a 150mcg requirement, suggest "1x 100mcg + 1x 50mcg").

1.3 Cross-Tolerance Slider Range

Requirement: Increase the maximum range of the Dose Reduction Slider.

New Max: 70% (previously capped lower).

2. New Feature: Medication Selection by Brand Name

2.1 Search & Select Logic

Users must be able to select drugs by Active Ingredient OR Brand Name.

UI Implementation: When a user searches or browses, the Brand Names should appear subtitled under the Active Ingredient, or be searchable directly.

2.2 Brand Name Mappings (Hungary Market)

The following mappings must be added to the drug database:

Oxycodone:

OxyContin (retard filmtabletta)

Codoxy (retard tabletta)

Codoxy Rapid

Reltebon (retard tabletta)

Oxycodone Sandoz (kemény kapszula & tabletta)

Oxycodone Vitabalans

Oxycodone + Naloxone:

Targin (retard tabletta)

Oxynal (retard tabletta)

Oxynador

Oxikodon-HCL/Naloxon-HCL Neuraxpharm

Fentanyl Transdermal (TDT):

Durogesic, Dolforin, Matrifen, Fentanyl Sandoz, Fentanyl-ratiopharm

Fentanyl Oral/Mucosal:

Effentora (buccal), Abstral (sublingual), Actiq (lozenge)

Fentanyl Injection:

Fentanyl-Richter, Fentanyl Kalceks, Fentanyl Sandoz

3. Patient Parameter Updates (BMI & Gender)

3.1 UI Reordering

Top of Form: Move BMI (new) input to the very top.

Middle: Opioid Selection.

Bottom: Move GFR input to after the opioid selection/conversion section.

3.2 BMI Logic & Warnings

Input Options: < 19 | 19-26 | > 26

Case A: BMI < 19 (Underweight)

Warning: "Caution: Lower tolerance and higher toxicity risk."

Clinical Rationale:

Low fat stores prevent lipophilic opioid accumulation (Fentanyl, Methadone).

Faster onset but potentially higher plasma concentrations (small volume of distribution).

Malnutrition may reduce hepatic metabolism.

Result: Risk of respiratory depression is higher.

Case B: BMI > 26 (Overweight/Obese)

Warning: "Dosing based on total body weight may lead to overdose. Base reduction on Ideal Body Weight (IBW)."

Clinical Rationale:

Increased volume of distribution for lipophilic drugs.

Longer half-life due to depot effect in fat tissue (delayed elimination).

Sleep apnea and respiratory risks are higher.

3.3 Gender Logic

Input Options: Male | Female

Case: Female

Warning: "Dose requirements may fluctuate daily due to hormonal cycle (premenopause). Oral administration is recommended for flexibility."

Clinical Rationale: Estrogen/progesterone fluctuations affect the endogenous opioid system and mu-receptor availability.

4. Advanced GFR Logic

4.1 Safety Constraints (Slider Locks)

The dose reduction slider must enforce minimum safety reductions based on GFR:

GFR 10–30 ml/min: Slider cannot be set lower than 25% reduction.

GFR < 10 ml/min: Slider cannot be set lower than 50% reduction.

4.2 GFR-Specific Drug Warnings (Dynamic Text)

When low GFR is detected, display drug-specific advice based on the Target Opioid selected:

Morphine / Codeine: "AVOID. Active metabolites accumulate (neurotoxicity/sedation)."

Oxycodone / Hydromorphone: "USE CAUTION. Reduce dose and frequency. Monitor closely."

Fentanyl: "PREFERRED. Safest choice in renal failure (no active metabolites)."

4.3 General Low GFR Warning (<10)

Text: "GFR < 10: Suggest 50% dose reduction and slow titration."


original suggestions:
árom változtatandót találtam,  és néháyn apró változtatást kérek még: 1 hiba: Az adagolási gyakoriságnál a 12 órát válsztom akkor reggel és dél jelenik meg! A délit változtasd estére !  2. hiba : átszámításnál, ha fentanyl TDTt választok, akkor a javsolt  tapasz nem jó! 100-75-50-25-12 mkrgrammos tapaszok vannak, ezekből rakja össze a gép a javasolt adagot! 3. A %-os dózis csökkentésnél a kurzor mehessen 70%-ig!

További kéréseim: 
Gyógyszer választás
A gyógszertári neve és a hatóanyag neve is legyen választható! (erről beszéljünk szóban!)
Akár úgy, hogy a hatóanyag neve alatt megjelnnek a gyógyszertári nevek pl: oxicodon 
OxyContin (retard filmtabletta)
Codoxy (retard tabletta)
Cosoxy Rapid 
Reltebon (retard tabletta)
Oxycodone Sandoz (kemény kapszula
Oxycodone Sandoz (tabletta)
Oxycodone Vitabalans

(Oxikodon + Naloxon)
Targin (retard tabletta)
Oxynal (retard tabletta)
Oxynador
Oxikodon-HCL/Naloxon-HCL Neuraxpharm 

Fentanyl: 
TDT: Durogesic,,Dolforin,Matrifen,Fentanyl Sandoz,Fentanyl-ratiopharm
Tabletta: Effentora (buccalis),  Abstral (nyelv alá), Actiq (szopogató tabl)
Injectio Fentanyl-Richter/ Fentanyl Kalceks / Fentanyl Sandoz
Ha van más ötleted örömmel veszem!

BMI
A beteg adatoknál legyen BMI is:
Elején legyen, a GFR helyén a BMI; a GFRt tedd az opioid választás után!
  BMI  három választható <18; , BMI 19-26;  BMI 26<

< BMI 19 
Figyeljen a dozírozásra, mert kisebb lehet a tolerancia és magasabb toxicitási kockázat!
Miért?
Kevesebb zsírszövet-raktár: Az alacsony BMI-vel rendelkező személyeknél kevesebb a zsírszövet, ami azt jelenti, hogy a lipofil opioidok (pl. fentanil, metadon) nem tudnak nagy mennyiségben felhalmozódni.
Gyorsabb hatáskezdet, de gyorsabb kiürülés: Mivel kevesebb a zsírszövet, amely "felfogná" a gyógyszert, a hatóanyag nagyobb koncentrációban maradhat a vérplazmában, ami gyorsabb, intenzívebb hatást eredményezhet, de a gyógyszer kiürülése is gyorsabb lehet.
Fokozott túladagolási kockázat: A sovány betegek az opioidokra gyakran érzékenyebbek, mivel kisebb a eloszlási térfogatuk, így azonos adag mellett magasabb plazmakoncentráció alakulhat ki, ami fokozott légzésdepresszió-kockázatot jelent.
Malnutrició hatása: Alacsony BMI esetén a gyakran fennálló alultápláltság csökkentheti a gyógyszerek metabolizmusát (anyagcseréjét) a májban, ami szintén a szervezetben maradó (raktározódó) hatóanyag mennyiségét növelheti. 
Összefoglalva: Alacsony BMI esetén az opioidok kevésbé raktározódnak a zsírszövetben, ami paradox módon kisebb toleranciát és magasabb toxicitási kockázatot eredményezhet, mert a hatóanyag a keringésben marad a zsírszöveti raktározás helyett.

BMI 26<
A csökkentés nélküli opioid rotációval történő adagolás könnyen túladagoláshoz vezethet! Azt ajánluk, hogy az adagolás  csökkentésének meghatározásához előszőr az beteg számára ideális testtömeg és a jelenlegi testömeg százaléskos arányát vegye alapul!
Miért?
Megnövekedett eloszlási térfogat: Az elhízott betegeknél a zsírszövet nagyobb aránya miatt a lipofil opioidok (pl. fentanil, szufentanil, metadon) eloszlási térfogata nő.
Hosszabb felezési idő (depóhatás miatt): A zsírszövetben felhalmozódott szer lassabban szabadul fel, ami meghosszabbítja a gyógyszer szervezetben való tartózkodási idejét (eliminációs felezési idő). Ez a "raktározás" miatt az elhízott betegek lassabban tisztulnak a szertől, és fennáll a kockázata a kábítószer késleltetett hatásának vagy felhalmozódásának.
Fokozott légzésdepresszió kockázat: Az elhízottaknál gyakori alvási apnoé és a légzőrendszeri változások miatt a raktározott, majd fokozatosan felszabaduló opioidok nagyobb kockázatot jelentenek a légzés leállására.
Adagolási kihívások: Mivel a zsírszövet nem metabolizálja a gyógyszert a sovány testtömeghez hasonlóan, a teljes testsúlyra (TBW) történő adagolás könnyen túladagoláshoz vezethet. 
Összesfoglalva: a magas BMI a lipofil opioidok esetében késleltetett eliminációt és fokozott zsírszöveti raktározást okoz, ami szükségessé teszi a fokozott figyelmet az esetleges túladagolás megelőzése érdekében.

Neme
Férfi/ Nő 
Ha a nőt választja, jelezze: A kiszámot dózis változtatandó lehet akrá naponta is ha premenopausában van a beteg! Ezért oralis gyógyszer adagolás ajánlott!

Miért?
Az ösztrogén és a progeszteron szintjének változása befolyásolja az endogén opioid rendszer aktivitását. A ciklus bizonyos szakaszaiban a nők szervezetében kevésbé aktív a mu-opioid rendszer, ami csökkenti a külsőleg bevitt morfium hatékonyságát. A nőkben gyakran magasabb plazmakoncentráció alakul, ki az eltérő eloszlási térfogat miatt,  valamint az agyi mu-opioid receptorok (MOR) száma és elérhetősége is változhat a reproduktív korban lévő nőkben.


GFR
GFR<30
 súlyos mellékhatásokhoz, például légzésdepresszióhoz, szedációhoz vagy neurotoxicitáshoz (myoclonus, hallucinációk) vezethet. 

GFR <10 
Legalább 50%-kal javasolt csökkenteni a dózist! Figyeljen a dozírozásra: lassú dózisemelés javasolt!


Az alacsony (<30) GFR esetén a rotálandó opioid szerint jelenjeln meg az a felirat amelyik oda vonatkozik:

Kerülendő vagy óvatosan alkalmazandó !
Morfin és Kodein: Kerülendő, mivel aktív metabolitjaik (pl. morfin-6-glükuronid) felhalmozódnak.
Oxikodon és Hidromorfon: GFR <30 ml/min esetén óvatosan, csökkentett dózisban és ritkított gyakorisággal használhatók, szoros monitorozás mellett. 
Biztonságosabb alternatívát is jelezze:
 Mivel nincs aktív metabolitja, a fentanil a választandó szer veseelégtelenségben.

Dóziscsökkentésnél, ha a GFR 10-30  ml/min CrCl esetén 25%-kal, <10 ml/min esetén 50%-kal javasolt csökkenteni a dózist, ne engedje lejebb a kurzort!


Jó munkát!
A