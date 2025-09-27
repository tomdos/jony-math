export interface WordProblemDefinition {
  id: string
  text: string
  a: number
  b: number
  op: '+' | '-'
  result: number
}

export const wordProblemBank: WordProblemDefinition[] = [
  {
    id: 'vylet-kvety-1',
    text:
      'Během školního výletu třída na louce našla 8 žlutých květů a u potoka 7 modrých – kolik květů nasbírala celkem?',
    a: 8,
    b: 7,
    op: '+',
    result: 15,
  },
  {
    id: 'dvorek-kuratka-1',
    text:
      'Na dvorku pobíhalo 9 kuřátek a z kurníku vyběhla ještě 4. Kolik kuřátek je teď na dvorku?',
    a: 9,
    b: 4,
    op: '+',
    result: 13,
  },
  {
    id: 'lavice-pastelky-1',
    text:
      'Na lavici leželo 15 pastelek, 6 se odkutálelo pod stůl. Kolik pastelek zůstalo na lavici?',
    a: 15,
    b: 6,
    op: '-',
    result: 9,
  },
  {
    id: 'trida-prihlaseni-1',
    text:
      'Během hodiny se přihlásilo 7 žáků a po přestávce se přidali další 3. Kolik žáků se přihlásilo celkem?',
    a: 7,
    b: 3,
    op: '+',
    result: 10,
  },
  {
    id: 'knihovna-knihy-1',
    text:
      'V knihovně bylo vystaveno 18 knížek, paní knihovnice 5 půjčila žákům. Kolik knížek zůstalo vystavených?',
    a: 18,
    b: 5,
    op: '-',
    result: 13,
  },
  {
    id: 'zahrada-sazenice-1',
    text:
      'Na školní zahradě druháci zasadili 6 sazenic rajčat a třeťáci přinesli ještě 6 sazenic paprik. Kolik sazenic je zasazeno dohromady?',
    a: 6,
    b: 6,
    op: '+',
    result: 12,
  },
  {
    id: 'hriste-micky-1',
    text:
      'Na hřišti měly děti 10 míčků a 4 se zakutálely za branku. Kolik míčků dětem zůstalo?',
    a: 10,
    b: 4,
    op: '-',
    result: 6,
  },
  {
    id: 'trida-kredy-1',
    text:
      'U tabule leželo 8 kříd a pan učitel přinesl z kabinetu další 5. Kolik kříd je u tabule?',
    a: 8,
    b: 5,
    op: '+',
    result: 13,
  },
  {
    id: 'piknik-jablka-1',
    text:
      'Na pikniku jsme měli v košíku 12 jablek, 7 jsme rozdali kamarádům. Kolik jablek v košíku zůstalo?',
    a: 12,
    b: 7,
    op: '-',
    result: 5,
  },
  {
    id: 'skrin-sesity-1',
    text:
      'Ve skříni byly 3 sešity a na stůl jsme přidali další 2. Kolik sešitů je připraveno celkem?',
    a: 3,
    b: 2,
    op: '+',
    result: 5,
  },
  {
    id: 'akvarium-rybky-1',
    text:
      'V akváriu plavalo 14 rybiček a 9 se schovalo za rostliny. Kolik rybiček je vidět?',
    a: 14,
    b: 9,
    op: '-',
    result: 5,
  },
  {
    id: 'druzstvo-odznaky-1',
    text:
      'Družstvo získalo 11 odznaků a během soutěže vyhrálo další 4. Kolik odznaků má družstvo dohromady?',
    a: 11,
    b: 4,
    op: '+',
    result: 15,
  },
  {
    id: 'vytvarka-ctvrtky-1',
    text:
      'Na výtvarce jsme vystřihli 16 čtvrtek a 7 jsme použili na koláž. Kolik čtvrtek zůstalo nevyužitých?',
    a: 16,
    b: 7,
    op: '-',
    result: 9,
  },
  {
    id: 'policka-hrnky-1',
    text:
      'Na poličce stály 5 hrnků a z myčky jsme přidali další 5. Kolik hrnků stojí na poličce teď?',
    a: 5,
    b: 5,
    op: '+',
    result: 10,
  },
  {
    id: 'park-deti-1',
    text:
      'V parku sedělo 17 dětí, 8 z nich odešlo domů. Kolik dětí v parku zůstalo?',
    a: 17,
    b: 8,
    op: '-',
    result: 9,
  },
  {
    id: 'cteni-kapitoly-1',
    text:
      'Za první týden jsme přečetli 9 kapitol a o víkendu další 6. Kolik kapitol jsme přečetli celkem?',
    a: 9,
    b: 6,
    op: '+',
    result: 15,
  },
  {
    id: 'bedynka-kostky-1',
    text:
      'V bedýnce bylo 13 kostek, 4 jsme použili na stavbu. Kolik kostek v bedýnce zbývá?',
    a: 13,
    b: 4,
    op: '-',
    result: 9,
  },
  {
    id: 'soutez-body-1',
    text:
      'V matematické soutěži tým nasbíral 7 bodů dopoledne a 8 bodů odpoledne. Kolik bodů získal dohromady?',
    a: 7,
    b: 8,
    op: '+',
    result: 15,
  },
  {
    id: 'terasa-kvetinace-1',
    text:
      'Na terase stály 20 květináčů, 6 jsme přenesli do bytu. Kolik květináčů zůstalo na terase?',
    a: 20,
    b: 6,
    op: '-',
    result: 14,
  },
  {
    id: 'batoh-susenky-1',
    text:
      'V batohu byly 4 sušenky a maminka přidala další 3 před výletem. Kolik sušenek je v batohu?',
    a: 4,
    b: 3,
    op: '+',
    result: 7,
  },
  {
    id: 'trh-pomerance-1',
    text:
      'Na trhu leželo 6 pomerančů a prodavač přinesl z bedny dalších 5. Kolik pomerančů je na pultu?',
    a: 6,
    b: 5,
    op: '+',
    result: 11,
  },
  {
    id: 'skola-gumy-1',
    text:
      'Ve třídě bylo 12 gum, 3 si spolužáci půjčili. Kolik gum zůstalo v krabičce?',
    a: 12,
    b: 3,
    op: '-',
    result: 9,
  },
  {
    id: 'kino-listky-1',
    text:
      'Na představení bylo připraveno 18 lístků, 7 se rozdalo. Kolik lístků zbývá?',
    a: 18,
    b: 7,
    op: '-',
    result: 11,
  },
  {
    id: 'pole-brambory-1',
    text:
      'Na poli jsme naplnili 9 košíků brambor a soused přivezl dalších 6. Kolik košíků je celkem?',
    a: 9,
    b: 6,
    op: '+',
    result: 15,
  },
  {
    id: 'les-sisky-1',
    text:
      'V lese děti nasbíraly 5 šišek a u potoka přidaly ještě 8. Kolik šišek mají dohromady?',
    a: 5,
    b: 8,
    op: '+',
    result: 13,
  },
  {
    id: 'nabrzezi-lodi-1',
    text:
      'U nábřeží stálo 19 lodí, 8 odplulo. Kolik lodí zůstalo u nábřeží?',
    a: 19,
    b: 8,
    op: '-',
    result: 11,
  },
  {
    id: 'herna-karty-1',
    text:
      'V herně leželo 16 karet, 9 jsme si vzali do hry. Kolik karet na stole zůstalo?',
    a: 16,
    b: 9,
    op: '-',
    result: 7,
  },
  {
    id: 'stanice-kola-1',
    text:
      'U stanice bylo zaparkováno 7 kol a přijelo dalších 9. Kolik kol stojí u stanice?',
    a: 7,
    b: 9,
    op: '+',
    result: 16,
  },
  {
    id: 'piskoviste-hradbicky-1',
    text:
      'Na pískovišti jsme postavili 10 hradbiček, 2 se zhroutily. Kolik hradbiček stojí?',
    a: 10,
    b: 2,
    op: '-',
    result: 8,
  },
  {
    id: 'park-lavicky-1',
    text:
      'V parku byly obsazené 4 lavičky a po chvíli se obsadily další 4. Kolik laviček je obsazeno?',
    a: 4,
    b: 4,
    op: '+',
    result: 8,
  },
  {
    id: 'cukrarna-kolace-1',
    text:
      'V cukrárně bylo na tácu 15 koláčů, 5 se prodalo. Kolik koláčů zůstalo na tácu?',
    a: 15,
    b: 5,
    op: '-',
    result: 10,
  },
  {
    id: 'dvur-kameny-1',
    text:
      'Na dvoře jsme nasbírali 3 kameny a u branky dalších 6. Kolik kamenů máme?',
    a: 3,
    b: 6,
    op: '+',
    result: 9,
  },
  {
    id: 'sklep-krabice-1',
    text:
      'Ve sklepě bylo 20 krabic, 6 jsme vynesli. Kolik krabic ve sklepě zůstalo?',
    a: 20,
    b: 6,
    op: '-',
    result: 14,
  },
  {
    id: 'ulice-auta-1',
    text:
      'V ulici stálo 13 aut, 4 odjela. Kolik aut v ulici zůstalo?',
    a: 13,
    b: 4,
    op: '-',
    result: 9,
  },
  {
    id: 'hlediste-mista-1',
    text:
      'V hledišti bylo volných 8 míst a pořadatelé uvolnili dalších 7. Kolik míst je volných?',
    a: 8,
    b: 7,
    op: '+',
    result: 15,
  },
  {
    id: 'kolejiste-vlacky-1',
    text:
      'Na kolejišti jezdilo 11 vláčků a 3 se odpojily do depa. Kolik vláčků jezdí dál?',
    a: 11,
    b: 3,
    op: '-',
    result: 8,
  },
  {
    id: 'galerie-obraz-1',
    text:
      'V galerii viselo 6 obrazů a umělec přidal ještě 3. Kolik obrazů je vystaveno?',
    a: 6,
    b: 3,
    op: '+',
    result: 9,
  },
  {
    id: 'kuchyn-talire-1',
    text:
      'Na lince leželo 9 talířů, 2 jsme dali na stůl. Kolik talířů zůstává na lince?',
    a: 9,
    b: 2,
    op: '-',
    result: 7,
  },
  {
    id: 'louka-motylci-1',
    text:
      'Nad loukou poletovalo 5 motýlků a přiletělo dalších 5. Kolik motýlků vidíme?',
    a: 5,
    b: 5,
    op: '+',
    result: 10,
  },
  {
    id: 'dilna-kladiva-1',
    text:
      'V dílně bylo 12 kladívek, 6 jsme půjčili. Kolik kladívek v dílně zbývá?',
    a: 12,
    b: 6,
    op: '-',
    result: 6,
  },
  {
    id: 'album-fotky-1',
    text:
      'Do alba jsme vložili 7 fotek a později dalších 6. Kolik fotek je v albu?',
    a: 7,
    b: 6,
    op: '+',
    result: 13,
  },
  {
    id: 'kino-popcorn-1',
    text:
      'Před filmem bylo připraveno 4 kelímky popcornu a prodavač nasypal dalších 7. Kolik kelímků je připraveno?',
    a: 4,
    b: 7,
    op: '+',
    result: 11,
  },
  {
    id: 'stadion-goly-1',
    text:
      'Tým dal v první půli 6 gólů a v druhé 8. Kolik gólů dal celkem?',
    a: 6,
    b: 8,
    op: '+',
    result: 14,
  },
  {
    id: 'zoo-vstupenky-1',
    text:
      'U pokladny leželo 18 vstupenek, 9 si děti koupily. Kolik vstupenek zůstalo?',
    a: 18,
    b: 9,
    op: '-',
    result: 9,
  },
  {
    id: 'trida-namalovane-1',
    text:
      'Na nástěnce viselo 9 namalovaných obrázků a přibylo dalších 5. Kolik obrázků visí nyní?',
    a: 9,
    b: 5,
    op: '+',
    result: 14,
  },
  {
    id: 'workshop-figurky-1',
    text:
      'Na stolku bylo 14 figurek, 5 jsme použili na hru. Kolik figurek na stolku zbývá?',
    a: 14,
    b: 5,
    op: '-',
    result: 9,
  },
  {
    id: 'skola-zvonecky-1',
    text:
      'Na poličce cinkaly 2 zvonečky a školník přinesl další 7. Kolik zvonečků je na poličce?',
    a: 2,
    b: 7,
    op: '+',
    result: 9,
  },
  {
    id: 'most-chodci-1',
    text:
      'Po mostě šlo 17 chodců, 6 se vrátilo. Kolik chodců po mostě pokračuje?',
    a: 17,
    b: 6,
    op: '-',
    result: 11,
  },
  {
    id: 'skrin-kabaty-1',
    text:
      'Ve skříni viselo 8 kabátů, 3 jsme odnesli do čistírny. Kolik kabátů ve skříni zůstalo?',
    a: 8,
    b: 3,
    op: '-',
    result: 5,
  },
  {
    id: 'hory-kameny-1',
    text:
      'Na stezce jsme posbírali 6 hladkých kamenů a u potoka dalších 6. Kolik kamenů máme?',
    a: 6,
    b: 6,
    op: '+',
    result: 12,
  },
  {
    id: 'kostky-veze-1',
    text:
      'Na koberci stálo 8 věží z kostek a přistavěli jsme dalších 9. Kolik věží je na koberci?',
    a: 8,
    b: 9,
    op: '+',
    result: 17,
  },
  {
    id: 'prodejna-tuzky-1',
    text:
      'V prodejně bylo 10 tužek v kelímku, 4 si zákazníci koupili. Kolik tužek v kelímku zůstalo?',
    a: 10,
    b: 4,
    op: '-',
    result: 6,
  },
  {
    id: 'pole-jahody-1',
    text:
      'Na záhonku dozrálo 7 jahod a odpoledne dalších 5. Kolik jahod jsme natrhali celkem?',
    a: 7,
    b: 5,
    op: '+',
    result: 12,
  },
  {
    id: 'tabor-baterky-1',
    text:
      'Na táboře bylo 13 baterek, 7 jsme rozdali do stanů. Kolik baterek zůstalo u vedoucího?',
    a: 13,
    b: 7,
    op: '-',
    result: 6,
  },
  {
    id: 'letiste-kufry-1',
    text:
      'Na pásu jelo 19 kufrů, 5 si lidé sundali. Kolik kufrů na pásu zůstává?',
    a: 19,
    b: 5,
    op: '-',
    result: 14,
  },
  {
    id: 'divadlo-programy-1',
    text:
      'V divadle leželo 9 programů a dorazily další 4. Kolik programů je k dispozici?',
    a: 9,
    b: 4,
    op: '+',
    result: 13,
  },
  {
    id: 'druzina-knihy-1',
    text:
      'V družině bylo 16 knih na polici, 8 si děti půjčily. Kolik knih na polici zbývá?',
    a: 16,
    b: 8,
    op: '-',
    result: 8,
  },
  {
    id: 'kviz-otazky-1',
    text:
      'V kvízu padlo 5 otázek dopoledne a 9 odpoledne. Kolik otázek zaznělo celkem?',
    a: 5,
    b: 9,
    op: '+',
    result: 14,
  },
  {
    id: 'sklenice-kulicky-1',
    text:
      'Ve sklenici byly 4 kuličky a z podlahy jsme přihodili dalších 6. Kolik kuliček je ve sklenici?',
    a: 4,
    b: 6,
    op: '+',
    result: 10,
  },
  {
    id: 'sklad-zidle-1',
    text:
      'Ve skladu bylo 18 židlí, 4 se odvezly do sálu. Kolik židlí ve skladu zůstalo?',
    a: 18,
    b: 4,
    op: '-',
    result: 14,
  },
  {
    id: 'kemp-stany-1',
    text:
      'Na louce stálo 6 stanů a večer postavili další 7. Kolik stanů stojí na louce?',
    a: 6,
    b: 7,
    op: '+',
    result: 13,
  },
  {
    id: 'jarmark-kolace-1',
    text:
      'Na jarmarku bylo na stole 8 koláčů a pekařka přinesla dalších 5. Kolik koláčů je na stole?',
    a: 8,
    b: 5,
    op: '+',
    result: 13,
  },
  {
    id: 'les-hriby-1',
    text:
      'V košíku bylo 12 hub, 5 jsme darovali babičce. Kolik hub v košíku zůstalo?',
    a: 12,
    b: 5,
    op: '-',
    result: 7,
  },
  {
    id: 'obchod-balonky-1',
    text:
      'V obchodě viselo 7 balónků a prodavač nafoukl dalších 8. Kolik balónků teď visí?',
    a: 7,
    b: 8,
    op: '+',
    result: 15,
  },
  {
    id: 'skolka-omalovanky-1',
    text:
      'Ve školce bylo 11 omalovánek, 6 si děti vybarvily. Kolik omalovánek zůstává?',
    a: 11,
    b: 6,
    op: '-',
    result: 5,
  },
  {
    id: 'muzeum-listky-1',
    text:
      'V muzeu připravili 3 lístky pro skupinu a přidali dalších 5. Kolik lístků mají připravených?',
    a: 3,
    b: 5,
    op: '+',
    result: 8,
  },
  {
    id: 'knihkupectvi-zalozky-1',
    text:
      'V knihkupectví rozdávali 9 záložek a přišla krabička s dalšími 2. Kolik záložek je k rozdání?',
    a: 9,
    b: 2,
    op: '+',
    result: 11,
  },
  {
    id: 'plaz-lopatky-1',
    text:
      'Na pláži bylo 8 lopatek, 5 si děti odnesly k vodě. Kolik lopatek zůstalo u ručníků?',
    a: 8,
    b: 5,
    op: '-',
    result: 3,
  },
  {
    id: 'garaz-kola-1',
    text:
      'V garáži stála 5 kol a soused přivezl dalších 7. Kolik kol teď v garáži stojí?',
    a: 5,
    b: 7,
    op: '+',
    result: 12,
  },
  {
    id: 'perniky-plechy-1',
    text:
      'Na stole bylo 14 perníků, 6 jsme schovali do krabičky. Kolik perníků zůstalo na stole?',
    a: 14,
    b: 6,
    op: '-',
    result: 8,
  },
]
