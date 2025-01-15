// This store is used to mimic the API only. It is not used in the final version of the project.
// it gets the number of shelves and what is inside the boxes from the api and sets the scene accordingly

export const stores = {
  store1: {
    storeName: "Çerkezköy Depo - 1",
    shelvesY: 3,
    shelvesZ: 12,
    shelvesXPerRow: [16, 24, 24, 24, 14, 24, 24, 24, 14, 24, 24, 16],
    boxData: [
      { boxNumber: [0, 0, 0], content: 'GOLDEN KUVERTÜR BİTTER PARA (9101-C)' },
      { boxNumber: [1, 0, 0], content: 'IREKS ARTISANO H' },
      { boxNumber: [3, 0, 0], content: 'BAVYERA PURPUR MIX 25KG' },
      { boxNumber: [4, 0, 0], content: 'MELLA KUVERTÜR SÜTLÜ PARA - ALT211' },
      { boxNumber: [0, 1, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [1, 1, 0], content: 'BUĞDAY UNU PASTACILIK OVA 25 KG' },
      { boxNumber: [2, 1, 0], content: 'SIMALTEX 15KG' },
      { boxNumber: [3, 1, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [4, 1, 0], content: '40X30X30 EKMEKÇİLİK BASKISIZ' },
      { boxNumber: [5, 1, 0], content: '45X30X27 NUMUNE KOLİSİ' },
      { boxNumber: [0, 2, 0], content: 'MELLA MUFFIN RUHR KONSANTRE 25KG H' },
      { boxNumber: [1, 2, 0], content: 'PARRLA MIRROR SOS-BİTTER' },
      { boxNumber: [2, 2, 0], content: '32*32*15 KABARTMA TOZU BA' },
      { boxNumber: [3, 2, 0], content: 'PARRLA MIRROR SOS-YABANMERSİNİ' },
      { boxNumber: [4, 2, 0], content: 'PARRLA MIRROR SOS-BİTTER' },
      { boxNumber: [5, 2, 0], content: 'VORM. WINDMOOS' },
      { boxNumber: [0, 0, 1], content: 'PARRLA MIRROR SOS-KIZIL' },
      { boxNumber: [1, 0, 1], content: 'BUĞDAY KEPEĞİ' },
      { boxNumber: [2, 0, 1], content: 'ŞOK ÖRGÜ PEYNİRİ 250 GR x 8 ADET' },
      { boxNumber: [3, 0, 1], content: 'TARABYA 75 GR PEYNİR TOST DİLİMLİ&TELLİ PEYNİR x12 ADET' },
    ],
  },
  store2: {
    storeName: "Çerkezköy Z + 2 GÖZ",
    shelvesY: 3,
    shelvesZ: 8,
    shelvesXPerRow: [18, 18, 18, 18, 18, 18, 18, 18],
    boxData: [
      { boxNumber: [0, 0, 0], content: 'GOLDEN KUVERTÜR BİTTER PARA (9101-C)' },
      { boxNumber: [1, 0, 0], content: 'IREKS ARTISANO H' },
      { boxNumber: [2, 0, 0], content: 'BAVYERA PURPUR MIX 25KG' },
      { boxNumber: [5, 0, 0], content: 'MELLA KUVERTÜR SÜTLÜ PARA - ALT211' },
      { boxNumber: [0, 1, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [1, 1, 0], content: 'BUĞDAY UNU PASTACILIK OVA 25 KG' },
      { boxNumber: [2, 1, 0], content: 'SIMALTEX 15KG' },
      { boxNumber: [3, 1, 0], content: 'SPONGE CAKE MIX GF' },
      { boxNumber: [4, 1, 0], content: '40X30X30 EKMEKÇİLİK BASKISIZ' },
    ],
  },
}

// Ensure apiData is updated when dimensions or gaps are changed
export const updateApiData = (key, value) => {
  apiData[key] = value
}