import {PropTypes} from 'react';

// Describe the different body parts of the fish. The object
// is ordered by its render dependency (i.e., dorsalFin should be rendered
// before body).
export const FishBodyPart = Object.freeze({
  DORSAL_FIN: 0,
  TAIL: 1,
  BODY: 2,
  EYE: 3,
  MOUTH: 4,
  PECTORAL_FIN: 5
});

const fish = {
  // BODY KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  bodies: {
    body1: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [25, 25],
      eyeAnchor: [72, 17],
      mouthAnchor: [115, 30],
      pectoralFinAnchor: [40, 65],
      dorsalFinAnchor: [30, -20],
      tailAnchor: [-25, 20],
      knnData: [32, 32, 0],
      type: FishBodyPart.BODY
    },
    body2: {
      src: 'images/fish/body/Body_EyeShape.png',
      anchor: [40, 30],
      eyeAnchor: [92, 56],
      mouthAnchor: [127, 70],
      pectoralFinAnchor: [48, 89],
      dorsalFinAnchor: [29, 17],
      tailAnchor: [0, 70],
      knnData: [48, 27, 0],
      type: FishBodyPart.BODY
    },
    body3: {
      src: 'images/fish/body/Body_Round.png',
      anchor: [40, 30],
      eyeAnchor: [60, 25],
      mouthAnchor: [95, 50],
      pectoralFinAnchor: [18, 89],
      dorsalFinAnchor: [12, -15],
      tailAnchor: [0, 50],
      knnData: [48, 27, 0],
      type: FishBodyPart.BODY
    },
    body4: {
      src: 'images/fish/body/Body_RoundedSquare.png',
      anchor: [40, 30],
      eyeAnchor: [65, 26],
      mouthAnchor: [95, 61],
      pectoralFinAnchor: [23, 80],
      dorsalFinAnchor: [13, -19],
      tailAnchor: [-3, 50],
      knnData: [48, 27, 0],
      type: FishBodyPart.BODY
    }
  },
  // EYE KNN DATA: [width (in pixels), height (in pixels)]
  eyes: {
    // I'm having trouble with anchor points that work for both eyes
    //eye1: {src: 'images/fish/eyes/Eye.png', knnData: [7, 7], type: FishBodyPart.EYE},
    eye2: {
      src: 'images/fish/eyes/Eye_Round.png',
      knnData: [9, 8],
      type: FishBodyPart.EYE
    }
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool)]
  mouths: {
    mouth1: {
      src: 'images/fish/mouth/Mouth_RoundedHeart.png',
      transform: [0, -8.5],
      knnData: [1],
      type: FishBodyPart.MOUTH
    },
    mouth2: {
      src: 'images/fish/mouth/Mouth_CurvedCylinder.png',
      transform: [0, -16.5],
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth3: {
      src: 'images/fish/mouth/Mouth_Heart.png',
      transform: [-8, -12],
      knnData: [0],
      type: FishBodyPart.MOUTH
    },
    mouth4: {
      src: 'images/fish/mouth/Mouth_DuckLips.png',
      transform: [-6, -9],
      knnData: [0],
      type: FishBodyPart.MOUTH
    }
    // The shark mouth is inset so we need to set anchor points for this
    //mouth5: {src: 'images/fish/mouth/Mouth_Shark.png', transform: [-6, -9], knnData: [0]}
  },
  // SIDE FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  sideFins: {
    sideFin1: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png',
      transform: [0, 0],
      knnData: [17, 18, 0],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin2: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png',
      transform: [0, 0],
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin3: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Almond.png',
      transform: [0, 3],
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN
    },
    // This fin needs to be on the body as opposed to coming off the body so it will
    // need different anchor points on the body itself.
    //sideFin4: {src: 'images/fish/pectoralFin/Pectoral_Fin_Bean.png', transform: [0,0], knnData: [12, 13, 1], type: FishBodyPart.PECTORAL_FIN},
    sideFin5: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_RoundTriangle.png',
      transform: [0, 0],
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN
    },
    sideFin6: {
      src: 'images/fish/pectoralFin/Pectoral_Fin_Sharp.png',
      transform: [0, 0],
      knnData: [12, 13, 1],
      type: FishBodyPart.PECTORAL_FIN
    }
  },
  // TOP FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  topFins: {
    topFin1: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Oval.png',
      knnData: [16, 15, 0],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin2: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin3: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Almond.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    // This fin spans the whole body so can only be used with the corresponding side fin
    //topFin4: {src: 'images/fish/dorsalFin/Dorsal_Fin_Bean.png', knnData: [20, 26, 1], type: FishBodyPart.DORSAL_FIN},
    topFin5: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Wave.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    },
    topFin6: {
      src: 'images/fish/dorsalFin/Dorsal_Fin_Shark.png',
      knnData: [20, 26, 1],
      type: FishBodyPart.DORSAL_FIN
    }
  },
  // TAIL KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  tails: {
    tail1: {
      src: 'images/fish/tailFin/Tail_Fin_Clamshell.png',
      transform: [-21, -24],
      knnData: [14, 30, 0],
      type: FishBodyPart.TAIL
    },
    tail2: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png',
      transform: [-29, -28],
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail3: {
      src: 'images/fish/tailFin/Tail_Fin_Almond.png',
      transform: [-37, -25],
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail4: {
      src: 'images/fish/tailFin/Tail_Fin_Bean.png',
      transform: [-31, -32.5],
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail5: {
      src: 'images/fish/tailFin/Tail_Fin_RoundedTriangle.png',
      transform: [-24, -13.9],
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    },
    tail6: {
      src: 'images/fish/tailFin/Tail_Fin_Sharp.png',
      transform: [-24, -38],
      knnData: [14, 28, 1],
      type: FishBodyPart.TAIL
    }
  },
  colorPalettes: {
    palette1: {
      bodyRgb: [126, 205, 202],
      finRgb: [248, 192, 157],
      mouthRgb: [221, 148, 193],
      bodyColor: '#7ECDCA',
      finColor: '#F8C09D',
      mouthColor: '#DD94C1',
      knnData: [234, 103, 108, 20, 52, 65]
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
