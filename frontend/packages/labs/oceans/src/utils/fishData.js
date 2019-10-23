import {PropTypes} from 'react';

// Describe the different body parts of the fish. The object
// is ordered by its render dependency (i.e., dorsalFin should be rendered
// before body).
export const FishBodyPart = Object.freeze({
  DORSAL_FIN: 0,
  TAIL: 1,
  PECTORAL_FIN_BACK: 2,
  BODY: 3,
  PECTORAL_FIN_FRONT: 4,
  MOUTH: 5,
  EYE: 6
});

const fishComponents = {
  // BODY KNN DATA: [height:width ratio]
  bodies: {
    fish6: {
      index: 0,
      src: 'images/fish/body/Body_Fish6.png',
      anchor: [100, 50],
      eyeAnchor: [17, 12],
      mouthAnchor: [20, 40],
      pectoralFinBackAnchor: [30, 67],
      pectoralFinFrontAnchor: [55, 72],
      dorsalFinAnchor: [23, -15],
      tailAnchor: [107, 41],
      knnData: [1.46, 7117],
      type: FishBodyPart.BODY
    },
    fish3: {
      index: 1,
      src: 'images/fish/body/Body_Fish3.png',
      anchor: [100, 50],
      eyeAnchor: [17, 10],
      mouthAnchor: [18, 40],
      pectoralFinBackAnchor: [38, 47],
      pectoralFinFrontAnchor: [68, 52],
      dorsalFinAnchor: [53, -25],
      tailAnchor: [120, 38],
      knnData: [0.2],
      type: FishBodyPart.BODY
    },
    fish1: {
      index: 2,
      src: 'images/fish/body/Body_Fish1.png',
      anchor: [100, 50],
      eyeAnchor: [10, 15],
      mouthAnchor: [8, 45],
      pectoralFinBackAnchor: [25, 85],
      pectoralFinFrontAnchor: [45, 82],
      dorsalFinAnchor: [20, -18],
      tailAnchor: [97, 50],
      knnData: [1, 8004],
      type: FishBodyPart.BODY
    },
    fish2: {
      index: 3,
      src: 'images/fish/body/Body_Fish2.png',
      anchor: [100, 50],
      eyeAnchor: [15, 11],
      mouthAnchor: [12, 41],
      pectoralFinBackAnchor: [30, 80],
      pectoralFinFrontAnchor: [50, 75],
      dorsalFinAnchor: [33, -19],
      tailAnchor: [92, 47],
      knnData: [1.09, 7914],
      type: FishBodyPart.BODY
    },
    fish4: {
      index: 4,
      src: 'images/fish/body/Body_Fish4.png',
      anchor: [80, 50],
      eyeAnchor: [18, 12],
      mouthAnchor: [25, 40],
      pectoralFinBackAnchor: [52, 73],
      pectoralFinFrontAnchor: [77, 68],
      dorsalFinAnchor: [33, -23],
      tailAnchor: [139, 19],
      knnData: [1.98, 9064],
      type: FishBodyPart.BODY
    },
    wide1: {
      index: 5,
      src: 'images/fish/body/Body_Wide1.png',
      anchor: [80, 20],
      eyeAnchor: [17, 17],
      mouthAnchor: [15, 58],
      pectoralFinBackAnchor: [35, 140],
      pectoralFinFrontAnchor: [55, 146],
      dorsalFinAnchor: [40, -23],
      tailAnchor: [157, 81],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    fish5: {
      index: 6,
      src: 'images/fish/body/Body_Fish5.png',
      anchor: [100, 30],
      eyeAnchor: [20, 17],
      mouthAnchor: [10, 57],
      pectoralFinBackAnchor: [30, 118],
      pectoralFinFrontAnchor: [55, 115],
      dorsalFinAnchor: [30, -18],
      tailAnchor: [125, 68],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    wide2: {
      index: 7,
      src: 'images/fish/body/Body_Wide2.png',
      anchor: [80, 20],
      eyeAnchor: [20, 27],
      mouthAnchor: [20, 63],
      pectoralFinBackAnchor: [23, 113],
      pectoralFinFrontAnchor: [100, 110],
      dorsalFinAnchor: [60, -23],
      tailAnchor: [154, 81],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    square1: {
      index: 8,
      src: 'images/fish/body/Body_Square1.png',
      anchor: [80, 40],
      eyeAnchor: [9, 17],
      mouthAnchor: [9, 53],
      pectoralFinBackAnchor: [17, 70],
      pectoralFinFrontAnchor: [64, 80],
      dorsalFinAnchor: [25, -23],
      tailAnchor: [97, 45],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    square2: {
      index: 9,
      src: 'images/fish/body/Body_Square2.png',
      anchor: [80, 40],
      eyeAnchor: [10, 20],
      mouthAnchor: [10, 63],
      pectoralFinBackAnchor: [13, 93],
      pectoralFinFrontAnchor: [65, 90],
      dorsalFinAnchor: [27, -23],
      tailAnchor: [93, 59],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    spikey1: {
      index: 10,
      src: 'images/fish/body/Body_Spikey1.png',
      anchor: [80, 40],
      eyeAnchor: [19, 27],
      mouthAnchor: [19, 59],
      pectoralFinBackAnchor: [23, 120],
      pectoralFinFrontAnchor: [82, 110],
      dorsalFinAnchor: [53, -23],
      tailAnchor: [125, 74],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    spikey2: {
      index: 11,
      src: 'images/fish/body/Body_Spikey2.png',
      anchor: [80, 40],
      eyeAnchor: [21, 21],
      mouthAnchor: [16, 80],
      pectoralFinBackAnchor: [22, 119],
      pectoralFinFrontAnchor: [67, 126],
      dorsalFinAnchor: [43, -20],
      tailAnchor: [125, 64],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    sharp1: {
      index: 12,
      src: 'images/fish/body/Body_Sharp1.png',
      anchor: [80, 40],
      eyeAnchor: [30, 40],
      mouthAnchor: [30, 70],
      pectoralFinBackAnchor: [80, 98],
      pectoralFinFrontAnchor: [108, 98],
      dorsalFinAnchor: [76, -13],
      tailAnchor: [144, 56],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    sharp2: {
      index: 13,
      src: 'images/fish/body/Body_Sharp2.png',
      anchor: [80, 40],
      eyeAnchor: [21, 11],
      mouthAnchor: [26, 50],
      pectoralFinBackAnchor: [35, 55],
      pectoralFinFrontAnchor: [77, 66],
      dorsalFinAnchor: [43, -20],
      tailAnchor: [144, 56],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    round1: {
      index: 14,
      src: 'images/fish/body/Body_Round1.png',
      anchor: [80, 40],
      eyeAnchor: [16, 10],
      mouthAnchor: [8, 70],
      pectoralFinBackAnchor: [16, 98],
      pectoralFinFrontAnchor: [80, 98],
      dorsalFinAnchor: [41, -13],
      tailAnchor: [118, 62],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    round2: {
      index: 15,
      src: 'images/fish/body/Body_Round2.png',
      anchor: [80, 40],
      eyeAnchor: [3, 11],
      mouthAnchor: [5, 40],
      pectoralFinBackAnchor: [11, 62],
      pectoralFinFrontAnchor: [58, 58],
      dorsalFinAnchor: [25, -20],
      tailAnchor: [74, 39],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    narrow1: {
      index: 16,
      src: 'images/fish/body/Body_Narrow1.png',
      anchor: [80, 40],
      eyeAnchor: [3, 20],
      mouthAnchor: [-3, 60],
      pectoralFinBackAnchor: [6, 98],
      pectoralFinFrontAnchor: [48, 98],
      dorsalFinAnchor: [22, -13],
      tailAnchor: [62, 62],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    narrow2: {
      index: 17,
      src: 'images/fish/body/Body_Narrow2.png',
      anchor: [80, 40],
      eyeAnchor: [20, 3],
      mouthAnchor: [20, 28],
      pectoralFinBackAnchor: [62, 34],
      pectoralFinFrontAnchor: [100, 30],
      dorsalFinAnchor: [76, -20],
      tailAnchor: [154, 19],
      knnData: [1.0],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [eye area, pupil:eye area ratio]
  eyes: {
    narrow1: {
      index: 0,
      src: 'images/fish/eyes/Eyes_Narrow1.png',
      knnData: [1, 0.0],
      type: FishBodyPart.EYE
    },
    narrow2: {
      index: 1,
      src: 'images/fish/eyes/Eyes_Narrow2.png',
      knnData: [1, 0.75],
      type: FishBodyPart.EYE
    },
    round1: {
      index: 2,
      src: 'images/fish/eyes/Eyes_Round1.png',
      knnData: [1, 1.0],
      type: FishBodyPart.EYE
    },
    round2: {
      index: 3,
      src: 'images/fish/eyes/Eyes_Round2.png',
      knnData: [1, 0.5],
      type: FishBodyPart.EYE
    },
    sharp1: {
      index: 4,
      src: 'images/fish/eyes/Eyes_Sharp1.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    sharp2: {
      index: 5,
      src: 'images/fish/eyes/Eyes_Sharp2.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    spikey1: {
      index: 6,
      src: 'images/fish/eyes/Eyes_Spikey1.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    spikey2: {
      index: 7,
      src: 'images/fish/eyes/Eyes_Spikey2.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    square1: {
      index: 8,
      src: 'images/fish/eyes/Eyes_Square1.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    square2: {
      index: 9,
      src: 'images/fish/eyes/Eyes_Square2.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    wide1: {
      index: 10,
      src: 'images/fish/eyes/Eyes_Wide1.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    },
    wide2: {
      index: 11,
      src: 'images/fish/eyes/Eyes_Wide2.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool), ratio of height:wifth]
  mouths: {
    fish2: {
      index: 1,
      src: 'images/fish/mouth/Mouth_Fish2.png',
      knnData: [0, 0.375],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    fish3: {
      index: 2,
      src: 'images/fish/mouth/Mouth_Fish3.png',
      knnData: [0, 0.75],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    fish5: {
      index: 4,
      src: 'images/fish/mouth/Mouth_Fish5.png',
      knnData: [0, 0.875],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    fish6: {
      index: 5,
      src: 'images/fish/mouth/Mouth_Fish6.png',
      knnData: [0, 0.25],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    narrow1: {
      index: 6,
      src: 'images/fish/mouth/Mouth_Narrow1.png',
      knnData: [0, 0.625],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    narrow2: {
      index: 7,
      src: 'images/fish/mouth/Mouth_Narrow2.png',
      knnData: [0, 0.625],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    round1: {
      index: 8,
      src: 'images/fish/mouth/Mouth_Round1.png',
      knnData: [1, 0.0],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    round2: {
      index: 9,
      src: 'images/fish/mouth/Mouth_Round2.png',
      knnData: [1, 0.0],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    sharp1: {
      index: 10,
      src: 'images/fish/mouth/Mouth_Sharp1.png',
      knnData: [1, 0.125],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    sharp2: {
      index: 11,
      src: 'images/fish/mouth/Mouth_Sharp2.png',
      knnData: [1, 0.125],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    spikey1: {
      index: 12,
      src: 'images/fish/mouth/Mouth_Spikey1.png',
      knnData: [0, 0.625],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    spikey2: {
      index: 13,
      src: 'images/fish/mouth/Mouth_Spikey2.png',
      knnData: [0, 0.625],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    square1: {
      index: 14,
      src: 'images/fish/mouth/Mouth_Square1.png',
      knnData: [1, 0.0],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    square2: {
      index: 15,
      src: 'images/fish/mouth/Mouth_Square2.png',
      knnData: [1, 0.0],
      tinted: false,
      type: FishBodyPart.MOUTH
    },
    wide1: {
      index: 16,
      src: 'images/fish/mouth/Mouth_Wide1.png',
      knnData: [1, 0.125],
      tinted: true,
      type: FishBodyPart.MOUTH
    },
    wide2: {
      index: 17,
      src: 'images/fish/mouth/Mouth_Wide2.png',
      knnData: [1, 0.125],
      tinted: true,
      type: FishBodyPart.MOUTH
    }
  },
  // SIDE FIN KNN DATA: [pointiness rank]
  pectoralFinsFront: {
    fish2: {
      index: 11,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    fish4: {
      index: 13,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish4.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    fish6: {
      index: 15,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish6.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    narrow1: {
      index: 16,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Narrow1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    narrow2: {
      index: 17,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Narrow2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    round2: {
      index: 19,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Round2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sharp1: {
      index: 20,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    spikey1: {
      index: 22,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Spikey1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    square2: {
      index: 25,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Square2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    wide1: {
      index: 26,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Wide1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    }
  },
  pectoralFinsBack: {
    fish2: {
      index: 11,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    fish4: {
      index: 13,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish4.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    fish6: {
      index: 15,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Fish6.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    narrow1: {
      index: 16,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Narrow1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    narrow2: {
      index: 17,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Narrow2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    round2: {
      index: 19,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Round2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sharp1: {
      index: 20,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    spikey1: {
      index: 22,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Spikey1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    square2: {
      index: 25,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Square2.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    wide1: {
      index: 26,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Wide1.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN_BACK
    }
  },

  // TOP FIN KNN DATA: [pointiness rank]
  topFins: {
    fish1: {
      index: 0,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Fish1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    fish2: {
      index: 1,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Fish2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    fish3: {
      index: 2,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Fish3.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    fish4: {
      index: 3,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Fish4.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    fish6: {
      index: 5,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Fish6.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    narrow1: {
      index: 6,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Narrow1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    narrow2: {
      index: 7,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Narrow2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    round1: {
      index: 8,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Round1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    round2: {
      index: 9,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Round2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    sharp1: {
      index: 10,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Sharp1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    sharp2: {
      index: 11,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Sharp2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    spikey1: {
      index: 12,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Spikey1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    spikey2: {
      index: 13,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Spikey2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    square1: {
      index: 14,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Square1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    square2: {
      index: 15,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Square2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    wide1: {
      index: 16,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wide1.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    wide2: {
      index: 17,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wide2.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [sections, width]
  tails: {
    fish1: {
      index: 0,
      src: 'images/fish/tailFin/Tail_Fin_Fish1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    fish2: {
      index: 1,
      src: 'images/fish/tailFin/Tail_Fin_Fish2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    fish3: {
      index: 2,
      src: 'images/fish/tailFin/Tail_Fin_Fish3.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    fish4: {
      index: 3,
      src: 'images/fish/tailFin/Tail_Fin_Fish4.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    fish5: {
      index: 4,
      src: 'images/fish/tailFin/Tail_Fin_Fish5.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    fish6: {
      index: 5,
      src: 'images/fish/tailFin/Tail_Fin_Fish6.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    narrow1: {
      index: 6,
      src: 'images/fish/tailFin/Tail_Fin_Narrow1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    narrow2: {
      index: 7,
      src: 'images/fish/tailFin/Tail_Fin_Narrow2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    round1: {
      index: 8,
      src: 'images/fish/tailFin/Tail_Fin_Round1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    round2: {
      index: 9,
      src: 'images/fish/tailFin/Tail_Fin_Round2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    sharp1: {
      index: 10,
      src: 'images/fish/tailFin/Tail_Fin_Sharp1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    sharp2: {
      index: 11,
      src: 'images/fish/tailFin/Tail_Fin_Sharp2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    spikey1: {
      index: 12,
      src: 'images/fish/tailFin/Tail_Fin_Spikey1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    spikey2: {
      index: 13,
      src: 'images/fish/tailFin/Tail_Fin_Spikey2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    square1: {
      index: 14,
      src: 'images/fish/tailFin/Tail_Fin_Square1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    square2: {
      index: 15,
      src: 'images/fish/tailFin/Tail_Fin_Square2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    wide1: {
      index: 16,
      src: 'images/fish/tailFin/Tail_Fin_Wide1.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    wide2: {
      index: 17,
      src: 'images/fish/tailFin/Tail_Fin_Wide2.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    }
  },
  // COLOR PALETTE KNN DATA: [...bodyRgb, ...finRgb]
  colorPalettes: {
    // Blue, peach, pink
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      knnData: [126, 205, 202]
    },
    // orange
    palette2: {
      bodyRgb: [253, 192, 77],
      finRgb: [235, 120, 50],
      mouthRgb: [235, 120, 50],
      knnData: [253, 192, 77]
    },
    // red
    palette3: {
      bodyRgb: [164, 3, 31],
      finRgb: [253, 217, 136],
      mouthRgb: [253, 217, 136],
      knnData: [164, 3, 31]
    },
    // green
    palette4: {
      bodyRgb: [72, 139, 73],
      finRgb: [200, 220, 92],
      mouthRgb: [200, 220, 92],
      knnData: [72, 139, 73]
    }
  }
};

const generateKnnData = () => {
  Object.keys(fishComponents).forEach(key => {
    const knnDataLength = Object.values(fishComponents[key])[0].knnData.length;
    const minArray = new Array(knnDataLength);
    minArray.fill(Number.POSITIVE_INFINITY);
    const maxArray = new Array(knnDataLength);
    maxArray.fill(Number.NEGATIVE_INFINITY);
    Object.values(fishComponents[key]).forEach(component => {
      for (var i = 0; i < component.knnData.length; ++i) {
        if (component.knnData[i] < minArray[i]) {
          minArray[i] = component.knnData[i];
        }
        if (component.knnData[i] > maxArray[i]) {
          maxArray[i] = component.knnData[i];
        }
      }
    });
    Object.values(fishComponents[key]).forEach(component => {
      for (var i = 0; i < component.knnData.length; ++i) {
        if (maxArray[i] === minArray[i]) {
          component.knnData[i] = 0;
        } else {
          component.knnData[i] =
            (component.knnData[i] - minArray[i]) / (maxArray[i] - minArray[i]);
        }
      }
    });
  });
  return fishComponents;
};

export const fishData = generateKnnData();

export const bodyShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  anchor: PropTypes.array.isRequired,
  eyeAnchor: PropTypes.array.isRequired,
  mouthAnchor: PropTypes.array.isRequired,
  sideFinAnchor: PropTypes.array.isRequired,
  topFinAnchor: PropTypes.array.isRequired,
  tailAnchor: PropTypes.array.isRequired,
  knnData: PropTypes.array.isRequired
});

export const bodyPartShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  knnData: PropTypes.array.isRequired
});

export const colorPaletteShape = PropTypes.shape({
  bodyColor: PropTypes.string.isRequired,
  finColor: PropTypes.string.isRequired,
  mouthColor: PropTypes.string.isRequired,
  knnData: PropTypes.array.isRequired
});

export const fishShape = PropTypes.shape({
  body: bodyShape.isRequired,
  eye: bodyPartShape.isRequired,
  mouth: bodyPartShape.isRequired,
  sideFin: bodyPartShape.isRequired,
  topFin: bodyPartShape.isRequired,
  tail: bodyPartShape.isRequired,
  colorPalette: colorPaletteShape.isRequired,
  canvasId: PropTypes.string.isRequired
});
