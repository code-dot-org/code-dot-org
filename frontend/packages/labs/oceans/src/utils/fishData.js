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
  BODY: 2,
  EYE: 3,
  PECTORAL_FIN: 4,
  MOUTH: 5
});

const fish = {
  // BODY KNN DATA: [height:width ratio]
  bodies: {
    brushTip: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [100, 50],
      eyeAnchor: [17, 12],
      mouthAnchor: [20, 40],
      pectoralFinAnchor: [50, 77],
      dorsalFinAnchor: [23, -15],
      tailAnchor: [107, 41],
      knnData: [0.6],
      type: FishBodyPart.BODY
    },
    eel: {
      src: 'images/fish/body/Body_Eel.png',
      anchor: [100, 50],
      eyeAnchor: [17, 15],
      mouthAnchor: [15, 45],
      pectoralFinAnchor: [40, 77],
      dorsalFinAnchor: [53, -25],
      tailAnchor: [107, 67],
      knnData: [0],
      type: FishBodyPart.BODY
    },
    /*
    // This image needs to be fixed to get rid of the whitetspace
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
      src: 'images/fish/body/Body_Round.png',
      anchor: [100, 50],
      eyeAnchor: [10, 15],
      mouthAnchor: [8, 45],
      pectoralFinAnchor: [30, 85],
      dorsalFinAnchor: [20, -18],
      tailAnchor: [97, 50],
      knnData: [1.0],
      type: FishBodyPart.BODY
    },
    roundedSquare: {
      src: 'images/fish/body/Body_RoundedSquare.png',
      anchor: [100, 50],
      eyeAnchor: [15, 12],
      mouthAnchor: [15, 40],
      pectoralFinAnchor: [33, 80],
      dorsalFinAnchor: [33, -19],
      tailAnchor: [92, 47],
      knnData: [0.8],
      type: FishBodyPart.BODY
    },
    shark: {
      src: 'images/fish/body/Body_Shark.png',
      anchor: [80, 50],
      eyeAnchor: [18, 12],
      mouthAnchor: [25, 40],
      pectoralFinAnchor: [57, 78],
      dorsalFinAnchor: [33, -23],
      tailAnchor: [139, 19],
      knnData: [0.4],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [eye area, pupil:eye area ratio]
  eyes: {
    angry: {
      src: 'images/fish/eyes/Eyes_Angry.png',
      knnData: [1, 0.0],
      type: FishBodyPart.EYE
    },
    big: {
      src: 'images/fish/eyes/Eyes_Big.png',
      knnData: [1, 0.75],
      type: FishBodyPart.EYE
    },
    concentric: {
      src: 'images/fish/eyes/Eyes_Concentric.png',
      knnData: [1, 1.00],
      type: FishBodyPart.EYE
    },
    side: {
      src: 'images/fish/eyes/Eyes_Side.png',
      knnData: [1, 0.5],
      type: FishBodyPart.EYE
    },
    unibrow: {
      src: 'images/fish/eyes/Eyes_Unibrow.png',
      knnData: [1, 0.25],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool), ratio of height:wifth]
  mouths: {
    curvedCylinder: {
      src: 'images/fish/mouth/Mouth_CurvedCylinder.png',
      knnData: [0, 0.5],
      type: FishBodyPart.MOUTH
    },
    duckLips: {
      src: 'images/fish/mouth/Mouth_DuckLips.png',
      knnData: [0, 0.375],
      type: FishBodyPart.MOUTH
    },
    heart: {
      src: 'images/fish/mouth/Mouth_Heart.png',
      knnData: [0, 0.75],
      type: FishBodyPart.MOUTH
    },
    lips: {
      src: 'images/fish/mouth/Mouth_Lips.png',
      knnData: [0, 1.0],
      type: FishBodyPart.MOUTH
    },
    longMouth: {
      src: 'images/fish/mouth/Mouth_LongMouth.png',
      knnData: [0, 0.875],
      type: FishBodyPart.MOUTH
    },
    oval: {
      src: 'images/fish/mouth/Mouth_Oval.png',
      knnData: [0, 0.25],
      type: FishBodyPart.MOUTH
    },
    roundedHeart: {
      src: 'images/fish/mouth/Mouth_RoundedHeart.png',
      knnData: [0, 0.625],
      type: FishBodyPart.MOUTH
    },
    shark: {
      src: 'images/fish/mouth/Mouth_Shark.png',
      knnData: [1, 0.00],
      type: FishBodyPart.MOUTH
    },
    sharpTeeth: {
      src: 'images/fish/mouth/Mouth_SharpTeeth.png',
      knnData: [1, 0.125],
      type: FishBodyPart.MOUTH
    }
  },
  // SIDE FIN KNN DATA: [pointiness rank]
  sideFins: {
    almond: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [0.8],
      type: FishBodyPart.PECTORAL_FIN
    },
    drop: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [0.4],
      type: FishBodyPart.PECTORAL_FIN
    },
    roundTriangle: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [0.6],
      type: FishBodyPart.PECTORAL_FIN
    },
    sharp: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [1],
      type: FishBodyPart.PECTORAL_FIN
    },
    standard: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png',
      knnData: [0.2],
      type: FishBodyPart.PECTORAL_FIN
    }
  },
  // TOP FIN KNN DATA: [pointiness rank]
  topFins: {
    almond: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [1],
      type: FishBodyPart.DORSAL_FIN
    },/*
    anglerfish: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_anglerfish.png',
      knnData: [0.125],
      type: FishBodyPart.DORSAL_FIN
    },*/
    /*
    horns: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Horns.png',
      knnData: [0.625],
      type: FishBodyPart.DORSAL_FIN
    },
    */
    mohawk: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [0.5],
      type: FishBodyPart.DORSAL_FIN
    },
    oval: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Oval.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    shark: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [0.875],
      type: FishBodyPart.DORSAL_FIN
    },
    spikes: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Spikes.png',
      knnData: [0.75],
      type: FishBodyPart.DORSAL_FIN
    },/*
    topHat: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_TopHat.png',
      knnData: [0.25],
      type: FishBodyPart.DORSAL_FIN
    },*/
    wave: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wave.png',
      knnData: [0.375],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [sections, width]
  tails: {
    almond: {
      src: 'images/fish/tailFin/Tail_Fin_Almond.png',
      knnData: [1],
      type: FishBodyPart.TAIL
    },
    bean: {
      src: 'images/fish/tailFin/Tail_Fin_Bean.png',
      knnData: [0.64],
      type: FishBodyPart.TAIL
    },
    clamshell: {
      src: 'images/fish/tailFin/Tail_Fin_Clamshell.png',
      knnData: [0.56],
      type: FishBodyPart.TAIL
    },
    roundedHeart: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png',
      knnData: [0.97],
      type: FishBodyPart.TAIL
    },
    roundedTriangle: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedTriangle.png',
      knnData: [0],
      type: FishBodyPart.TAIL
    },
    sharp: {
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

export default fish;

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
