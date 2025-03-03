// This store is used to mimic the API only. It is not used in the final version of the project.
// it gets the number of shelves and what is inside the boxes from the api and sets the scene accordingly

export const stores = {
  store1: {
    storeName: "Çerkezköy - 1",
    archetype: "back-to-back",
    shelvesY: 3,
    shelvesZ: 12,
    shelvesXPerRow: [16, 24, 24, 24, 14, 24, 24, 24, 14, 24, 24, 16],
    boxData: [
      { boxNumber: [0, 0, 0], content: 'GOLDEN KUVERTÜR BİTTER PARA ' },
      { boxNumber: [1, 0, 0], content: 'IREKS ARTISANO' },
      { boxNumber: [3, 0, 0], content: 'BAVYERA PURPUR MIX 25KG' },
      { boxNumber: [4, 0, 0], content: 'MELLA KUVERTÜR SÜTLÜ PARA' },
      { boxNumber: [5, 0, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [6, 0, 0], content: 'BUĞDAY UNU PASTACILIK OVA 25 KG' },
      { boxNumber: [7, 0, 0], content: 'SIMALTEX 15KG' },
      { boxNumber: [8, 0, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [9, 0, 0], content: '40X30X30 EKMEKÇİLİK BASKISIZ' },
      { boxNumber: [10, 0, 0], content: '45X30X27 NUMUNE KOLİSİ' },
      { boxNumber: [11, 0, 0], content: 'MELLA MUFFIN RUHR KONSANTRE 25KG H' },
      { boxNumber: [12, 0, 0], content: 'PARRLA MIRROR SOS-BİTTER' },
      { boxNumber: [13, 0, 0], content: '32*32*15 KABARTMA TOZU' },
      { boxNumber: [14, 0, 0], content: 'PARRLA MIRROR SOS-YABANMERSİNİ' },
      { boxNumber: [15, 0, 0], content: 'PARRLA MIRROR SOS-BİTTER' },
      { boxNumber: [1, 1, 0], content: 'VORM. WINDMOOS' },
      { boxNumber: [2, 1, 0], content: 'PARRLA MIRROR SOS-KIZIL' },
      { boxNumber: [3, 1, 0], content: 'BUĞDAY KEPEĞİ' },
      { boxNumber: [4, 1, 0], content: 'ŞOK ÖRGÜ PEYNİRİ 250 GR x 8 ADET' },
      { boxNumber: [5, 1, 0], content: 'TARABYA 75 GR PEYNİR TOST DİLİMLİ&TELLİ PEYNİR x12 ADET' },
      { boxNumber: [0, 1, 0], content: 'KAKAOLU PASTA KREMASI 1KG' },
      { boxNumber: [1, 1, 0], content: 'VANİLYALI PASTA KREMASI 1KG' },
      { boxNumber: [2, 1, 0], content: 'ÇİLEK SOSU 2KG' },
      { boxNumber: [3, 1, 0], content: 'KARAMEL SOSU 2KG' },
      { boxNumber: [4, 1, 0], content: 'FISTIK EZMESİ 1KG' },
      { boxNumber: [5, 1, 0], content: 'BADEM EZMESİ 1KG' },
      { boxNumber: [6, 1, 0], content: 'FINDIK KREMASI 1KG' },
      { boxNumber: [7, 1, 0], content: 'KAKAOLU FINDIK KREMASI 1KG' },
      { boxNumber: [8, 1, 0], content: 'ÇİKOLATALI PASTA KREMASI 1KG' },
      { boxNumber: [9, 1, 0], content: 'YAĞLI SÜT TOZU' },
      { boxNumber: [10, 1, 0], content: 'MELLA MUFFIN RUHR KONSANTRE 25KG' },
      { boxNumber: [11, 1, 0], content: '45X30X27 NUMUNE KOLİSİ' },
      { boxNumber: [12, 1, 0], content: 'SIMALTEX 15KG' },
      { boxNumber: [13, 1, 0], content: 'FISTIK EZMESİ 1KG' },
      { boxNumber: [14, 1, 0], content: 'BADEM EZMESİ 1KG' },
      { boxNumber: [15, 1, 0], content: 'FINDIK KREMASI 1KG' },
    ],
    loadingAreas: {
      frontLeft: {
        position: "frontLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5, // distance from the edge
        isMalKabul: false,
        boxes: [
          { boxNumber: [0, 0, 0], content: 'UN 20KG' },
          { boxNumber: [1, 0, 0], content: 'ŞEKER 1KG' },
          { boxNumber: [2, 0, 0], content: 'TUZ 10KG' },
        ]
      },
      frontRight: {
        position: "frontRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
        boxes: [
          { boxNumber: [0, 0, 0], content: 'KAKAO 1KG' },
          { boxNumber: [1, 0, 0], content: 'FINDIK 1KG' },
        ]
      },
      backLeft: {
        position: "backLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: false,
        boxes: [
          { boxNumber: [0, 0, 0], content: 'YAĞ 20L' },
          { boxNumber: [1, 0, 0], content: 'SÜT TOZU' },
        ]
      },
      backRight: {
        position: "backRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
        boxes: [
          { boxNumber: [0, 0, 0], content: 'MISIR NİŞASTASI' },
          { boxNumber: [1, 0, 0], content: 'REÇEL 500G' },
          // Add more items as needed
        ]
      }
    },
  },
  store2: {
    storeName: "Çerkezköy - 2",
    archetype: "back-to-back",
    shelvesY: 3,
    shelvesZ: 8,
    shelvesXPerRow: [18, 18, 18, 18, 18, 18, 18, 18],
    boxData: [
    ],
    loadingAreas: {
      frontLeft: {
        position: "frontLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5, // distance from the edge
        isMalKabul: false,
      },
      frontRight: {
        position: "frontRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
      },
      backLeft: {
        position: "backLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: false,
      },
      backRight: {
        position: "backRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
      }
    },
  },
  store3: {
    storeName: "Ferrero Demo",
    archetype: "drive",
    shelvesY: 5,
    shelvesZ: 12,
    shelvesXPerRow: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    boxData: [
    ],
    loadingAreas: {
      frontRight: {
        position: "frontRight",
        boxesX: 4,
        boxesY: 1,
        boxesZ: 3,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 2, 
        isMalKabul: true,
        boxes: [
        ]
      }
    }
  }
}

// Ensure apiData is updated when dimensions or gaps are changed
export const updateApiData = (key, value) => {
  apiData[key] = value
}