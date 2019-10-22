import {PropTypes} from 'react';

const normalizeColorComponent = colorcomp => {
  return colorcomp / 255;
};

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
    brushTip: {
      index: 0,
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [100, 50],
      eyeAnchor: [17, 12],
      mouthAnchor: [20, 40],
      pectoralFinBackAnchor: [30, 67],
      pectoralFinFrontAnchor: [55, 72],
      dorsalFinAnchor: [23, -15],
      tailAnchor: [107, 41],
      knnData: [1.46, 7001],
      type: FishBodyPart.BODY
    },
    eel: {
      index: 1,
      src: 'images/fish/body/Body_Eel.png',
      anchor: [100, 50],
      eyeAnchor: [17, 15],
      mouthAnchor: [15, 45],
      pectoralFinBackAnchor: [25, 67],
      pectoralFinFrontAnchor: [50, 70],
      dorsalFinAnchor: [53, -25],
      tailAnchor: [107, 67],
      knnData: [1.46, 4368],
      type: FishBodyPart.BODY
    },
    /*
    // This image needs to be fixed to get rid of the whitespace
    eyeShape: {
      src: 'images/fish/body/Body_EyeShape.png',
      anchor: [100, 50],
      eyeAnchor: [17, 15],
      mouthAnchor: [15, 45],
      pectoralFinAnchor: [40, 77],
      dorsalFinAnchor: [53, -25],
      tailAnchor: [107, 40],
      knnData: [0.2],
      type: FishBodyPart.BODY
    },*/
    round: {
      index: 2,
      src: 'images/fish/body/Body_Round.png',
      anchor: [100, 50],
      eyeAnchor: [10, 15],
      mouthAnchor: [8, 45],
      pectoralFinBackAnchor: [25, 85],
      pectoralFinFrontAnchor: [45, 82],
      dorsalFinAnchor: [20, -18],
      tailAnchor: [97, 50],
      knnData: [1, 7867],
      type: FishBodyPart.BODY
    },
    roundedSquare: {
      index: 3,
      src: 'images/fish/body/Body_RoundedSquare.png',
      anchor: [100, 50],
      eyeAnchor: [15, 12],
      mouthAnchor: [15, 40],
      pectoralFinBackAnchor: [30, 80],
      pectoralFinFrontAnchor: [50, 75],
      dorsalFinAnchor: [33, -19],
      tailAnchor: [92, 47],
      knnData: [1.09, 7823],
      type: FishBodyPart.BODY
    },
    shark: {
      index: 4,
      src: 'images/fish/body/Body_Shark.png',
      anchor: [80, 50],
      eyeAnchor: [18, 12],
      mouthAnchor: [25, 40],
      pectoralFinBackAnchor: [52, 73],
      pectoralFinFrontAnchor: [77, 68],
      dorsalFinAnchor: [33, -23],
      tailAnchor: [139, 19],
      knnData: [1.98, 8935],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [eye area, pupil:eye area ratio]
  eyes: {
    angry: {
      index: 0,
      src: 'images/fish/eyes/Eyes_Angry.png',
      knnData: [1, 0.0],
      type: FishBodyPart.EYE
    },
    big: {
      index: 1,
      src: 'images/fish/eyes/Eyes_Big.png',
      knnData: [1, 0.75],
      type: FishBodyPart.EYE
    },
    concentric: {
      index: 2,
      src: 'images/fish/eyes/Eyes_Concentric.png',
      knnData: [1, 1.0],
      type: FishBodyPart.EYE
    },
    side: {
      index: 3,
      src: 'images/fish/eyes/Eyes_Side.png',
      knnData: [1, 0.5],
      type: FishBodyPart.EYE
    },
    unibrow: {
      index: 4,
      src: 'images/fish/eyes/Eyes_Unibrow.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool), ratio of height:wifth]
  mouths: {
    curvedCylinder: {
      index: 0,
      src: 'images/fish/mouth/Mouth_CurvedCylinder.png',
      knnData: [0, 0.5],
      type: FishBodyPart.MOUTH
    },
    duckLips: {
      index: 1,
      src: 'images/fish/mouth/Mouth_DuckLips.png',
      knnData: [0, 0.375],
      type: FishBodyPart.MOUTH
    },
    heart: {
      index: 2,
      src: 'images/fish/mouth/Mouth_Heart.png',
      knnData: [0, 0.75],
      type: FishBodyPart.MOUTH
    },
    lips: {
      index: 3,
      src: 'images/fish/mouth/Mouth_Lips.png',
      knnData: [0, 1.0],
      type: FishBodyPart.MOUTH
    },
    longMouth: {
      index: 4,
      src: 'images/fish/mouth/Mouth_LongMouth.png',
      knnData: [0, 0.875],
      type: FishBodyPart.MOUTH
    },
    oval: {
      index: 5,
      src: 'images/fish/mouth/Mouth_Oval.png',
      knnData: [0, 0.25],
      type: FishBodyPart.MOUTH
    },
    roundedHeart: {
      index: 6,
      src: 'images/fish/mouth/Mouth_RoundedHeart.png',
      knnData: [0, 0.625],
      type: FishBodyPart.MOUTH
    },
    shark: {
      index: 7,
      src: 'images/fish/mouth/Mouth_Shark.png',
      knnData: [1, 0.0],
      type: FishBodyPart.MOUTH
    },
    sharpTeeth: {
      index: 8,
      src: 'images/fish/mouth/Mouth_SharpTeeth.png',
      knnData: [1, 0.125],
      type: FishBodyPart.MOUTH
    }
  },
  // SIDE FIN KNN DATA: [pointiness rank]
  pectoralFinsFront: {
    almond: {
      index: 0,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [0.8],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    drop: {
      index: 1,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [0.4],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    roundTriangle: {
      index: 2,
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [0.6],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    sharp: {
      index: 3,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [1],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    },
    standard: {
      index: 4,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png',
      knnData: [0.2],
      type: FishBodyPart.PECTORAL_FIN_FRONT
    }
  },
  pectoralFinsBack: {
    almond: {
      index: 0,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [0.8],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    drop: {
      index: 1,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [0.4],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    roundTriangle: {
      index: 2,
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [0.6],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    sharp: {
      index: 3,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [1],
      type: FishBodyPart.PECTORAL_FIN_BACK
    },
    standard: {
      index: 4,
      src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png',
      knnData: [0.2],
      type: FishBodyPart.PECTORAL_FIN_BACK
    }
  },

  // TOP FIN KNN DATA: [pointiness rank]
  topFins: {
    almond: {
      index: 0,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [1],
      type: FishBodyPart.DORSAL_FIN
    } /*
    anglerfish: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_anglerfish.png',
      knnData: [0.125],
      type: FishBodyPart.DORSAL_FIN
    },*/,
    /*
    horns: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Horns.png',
      knnData: [0.625],
      type: FishBodyPart.DORSAL_FIN
    },
    */
    mohawk: {
      index: 1,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [0.5],
      type: FishBodyPart.DORSAL_FIN
    },
    oval: {
      index: 2,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Oval.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    shark: {
      index: 3,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [0.875],
      type: FishBodyPart.DORSAL_FIN
    },
    spikes: {
      index: 4,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Spikes.png',
      knnData: [0.75],
      type: FishBodyPart.DORSAL_FIN
    } /*
    topHat: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_TopHat.png',
      knnData: [0.25],
      type: FishBodyPart.DORSAL_FIN
    },*/,
    wave: {
      index: 5,
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wave.png',
      knnData: [0.375],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [sections, width]
  tails: {
    almond: {
      index: 0,
      src: 'images/fish/tailFin/Tail_Fin_Almond.png',
      knnData: [1],
      type: FishBodyPart.TAIL
    },
    bean: {
      index: 1,
      src: 'images/fish/tailFin/Tail_Fin_Bean.png',
      knnData: [0.64],
      type: FishBodyPart.TAIL
    },
    clamshell: {
      index: 2,
      src: 'images/fish/tailFin/Tail_Fin_Clamshell.png',
      knnData: [0.56],
      type: FishBodyPart.TAIL
    },
    roundedHeart: {
      index: 3,
      src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png',
      knnData: [0.97],
      type: FishBodyPart.TAIL
    },
    roundedTriangle: {
      index: 4,
      src: 'images/fish/tailFin/Tail_Fin_RoundedTriangle.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    sharp: {
      index: 5,
      src: 'images/fish/tailFin/Tail_Fin_Sharp.png',
      knnData: [0.57],
      type: FishBodyPart.TAIL
    }
  },
  // COLOR PALETTE KNN DATA: [...bodyRgb, ...finRgb]
  colorPalettes: {
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      knnData: [
        normalizeColorComponent(126),
        normalizeColorComponent(205),
        normalizeColorComponent(202),
        normalizeColorComponent(248),
        normalizeColorComponent(192),
        normalizeColorComponent(157)
      ]
    },
    palette2: {
      bodyRgb: [253, 192, 77],
      finRgb: [235, 120, 50],
      mouthRgb: [235, 120, 50],
      knnData: [
        normalizeColorComponent(253),
        normalizeColorComponent(192),
        normalizeColorComponent(77),
        normalizeColorComponent(235),
        normalizeColorComponent(120),
        normalizeColorComponent(50)
      ]
    },
    palette3: {
      bodyRgb: [39, 116, 186],
      finRgb: [253, 217, 136],
      mouthRgb: [253, 217, 136],
      knnData: [
        normalizeColorComponent(39),
        normalizeColorComponent(116),
        normalizeColorComponent(186),
        normalizeColorComponent(253),
        normalizeColorComponent(217),
        normalizeColorComponent(136)
      ]
    },
    palette4: {
      bodyRgb: [21, 52, 64],
      finRgb: [200, 220, 92],
      mouthRgb: [200, 220, 92],
      knnData: [
        normalizeColorComponent(21),
        normalizeColorComponent(52),
        normalizeColorComponent(64),
        normalizeColorComponent(200),
        normalizeColorComponent(220),
        normalizeColorComponent(92)
      ]
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
