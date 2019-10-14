import {PropTypes} from 'react';

// Describe the different body parts of the fish. The object
// is ordered by its render dependency (i.e., dorsalFin should be rendered
// before body).
export const FishBodyPart = Object.freeze({
  DORSAL_FIN: 0,
  TAIL: 1,
  BODY: 2,
  MOUTH: 3,
  EYE: 4,
  PECTORAL_FIN: 5
});

const fish = {
  // BODY KNN DATA: [height:width ratio]
  bodies: {
    body1: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [25, 25],
      eyeAnchor: [72, 17],
      mouthAnchor: [115, 30],
      pectoralFinAnchor: [40, 65],
      dorsalFinAnchor: [30, -20],
      tailAnchor: [-25, 20],
      knnData: [0.69],
      type: FishBodyPart.BODY
    },
    body2: {
      src: 'images/fish/body/Body_EyeShape.png',
      anchor: [40, 30],
      eyeAnchor: [90, 40],
      mouthAnchor: [125, 55],
      pectoralFinAnchor: [60, 89],
      dorsalFinAnchor: [35, 15],
      tailAnchor: [-25, 45],
      knnData: [0.50],
      type: FishBodyPart.BODY
    },
    body3: {
      src: 'images/fish/body/Body_Round.png',
      anchor: [40, 30],
      eyeAnchor: [60, 25],
      mouthAnchor: [95, 40],
      pectoralFinAnchor: [30, 75],
      dorsalFinAnchor: [17, -15],
      tailAnchor: [-25, 30],
      knnData: [1.00],
      type: FishBodyPart.BODY
    },
    body4: {
      src: 'images/fish/body/Body_RoundedSquare.png',
      anchor: [40, 30],
      eyeAnchor: [65, 26],
      mouthAnchor: [90, 61],
      pectoralFinAnchor: [23, 80],
      dorsalFinAnchor: [13, -19],
      tailAnchor: [-30, 50],
      knnData: [0.91],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [eye area, pupil:eye area ratio]
  eyes: {
    eye1: {
      src: 'images/fish/eyes/Eye.png',
      knnData: [955, 0.21],
      type: FishBodyPart.EYE
    },
    eye2: {
      src: 'images/fish/eyes/Eye_Round.png',
      knnData: [491, 0.36],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool), ratio of height:wifth]
  mouths: {
    mouth1: {
      src: 'images/fish/mouth/Mouth_RoundedHeart.png',
      knnData: [0, 1.31],
      type: FishBodyPart.MOUTH
    },
    mouth2: {
      src: 'images/fish/mouth/Mouth_CurvedCylinder.png',
      knnData: [0, 2.2],
      type: FishBodyPart.MOUTH
    },
    mouth3: {
      src: 'images/fish/mouth/Mouth_Heart.png',
      knnData: [0, 0.96],
      type: FishBodyPart.MOUTH
    },
    mouth4: {
      src: 'images/fish/mouth/Mouth_DuckLips.png',
      knnData: [0, 0.68],
      type: FishBodyPart.MOUTH
    }
    // TODO: fix shark mouth transform
    // mouth5: {
    //   src: 'images/fish/mouth/Mouth_Shark.png',
    //   knnData: [1,0.56],
    //   type: FishBodyPart.MOUTH
    // }
  },
  // SIDE FIN KNN DATA: [pointiness rank]
  sideFins: {
    sideFin1: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png',
      knnData: [1],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin2: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      knnData: [2],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin3: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      knnData: [4],
      type: FishBodyPart.PECTORAL_FIN
    },
    // This fin needs to be on the body as opposed to coming off the body so it will
    // need different anchor points on the body itself.
    sideFin4: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Bean.png',
      knnData: [0],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin5: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      knnData: [3],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin6: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      knnData: [5],
      type: FishBodyPart.PECTORAL_FIN
    }
  },
  // TOP FIN KNN DATA: [pointiness rank]
  topFins: {
    topFin1: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Oval.png',
      knnData: [0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin2: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [2],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin3: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [4],
      type: FishBodyPart.DORSAL_FIN
    },
    // This fin spans the whole body so can only be used with the corresponding side fin
    // topFin4: {
    //   src: 'images/fish/dorsalFin/Dorsal_Fin_Bean.png',
    //   knnData: [],
    //   type: FishBodyPart.DORSAL_FIN
    // },
    topFin5: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wave.png',
      knnData: [1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin6: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [3],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [sections, width]
  tails: {
    tail1: {
      src: 'images/fish/tailFin/Tail_Fin_Clamshell.png',
      knnData: [2, 36.85],
      type: FishBodyPart.TAIL
    },
    tail2: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png',
      knnData: [2, 29],
      type: FishBodyPart.TAIL
    },
    tail3: {
      src: 'images/fish/tailFin/Tail_Fin_Almond.png',
      knnData: [2, 43],
      type: FishBodyPart.TAIL
    },
    tail4: {
      src: 'images/fish/tailFin/Tail_Fin_Bean.png',
      knnData: [2, 38],
      type: FishBodyPart.TAIL
    },
    tail5: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedTriangle.png',
      knnData: [1, 29],
      type: FishBodyPart.TAIL
    },
    tail6: {
      src: 'images/fish/tailFin/Tail_Fin_Sharp.png',
      knnData: [2, 37],
      type: FishBodyPart.TAIL
    }
  },
  // COLOR PALETTE KNN DATA: [...bodyRgb, ...finRgb]
  colorPalettes: {
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      knnData: [126, 205, 202, 248, 192, 157]
    },
    palette2: {
      bodyRgb: [253, 192, 77],
      finRgb: [235, 120, 50],
      mouthRgb: [235, 120, 50],
      knnData: [253, 192, 77, 235, 120, 50]
    },
    palette3: {
      bodyRgb: [39, 116, 186],
      finRgb: [253, 217, 136],
      mouthRgb: [253, 217, 136],
      knnData: [39, 116, 186, 253, 217, 136]
    },
    palette4: {
      bodyRgb: [21, 52, 64],
      finRgb: [200, 220, 92],
      mouthRgb: [200, 220, 92],
      knnData: [21, 52, 64, 200, 220, 92]
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
