import {PropTypes} from 'react';

const fish = {
  // BODY KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  bodies: {
    body1: {
      src: 'images/fish/body/Body_BrushTip.png',
      anchor: [50, 50],
      eyeAnchor: [67, 17],
      mouthAnchor: [111, 41],
      sideFinAnchor: [36, 63],
      topFinAnchor: [14, -20],
      tailAnchor: [0, 41],
      knnData: [32, 32, 0]
    },
    body2: {
      src: 'images/fish/body/Body_EyeShape.png',
      anchor: [40, 30],
      eyeAnchor: [92, 56],
      mouthAnchor: [127, 70],
      sideFinAnchor: [48, 89],
      topFinAnchor: [29, 17],
      tailAnchor: [0, 70],
      knnData: [48, 27, 0]
    },
    body3: {
      src: 'images/fish/body/Body_Round.png',
      anchor: [40, 30],
      eyeAnchor: [60, 25],
      mouthAnchor: [95, 50],
      sideFinAnchor: [18, 89],
      topFinAnchor: [12, -15],
      tailAnchor: [0, 50],
      knnData: [48, 27, 0]
    }
  },
  // EYE KNN DATA: [width (in pixels), height (in pixels)]
  eyes: {
    //eye1: {src: 'images/fish/eyes/Eye.png', knnData: [7, 7]},
    eye2: {src: 'images/fish/eyes/Eye_Round.png', knnData: [9, 8]}
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool)]
  mouths: {
    mouth1: {src: 'images/fish/mouth/Mouth_RoundedHeart.png', transform: [0,-8.5], knnData: [1]},
    mouth2: {src: 'images/fish/mouth/Mouth_CurvedCylinder.png', transform: [0,-16.5], knnData: [0]},
    mouth3: {src: 'images/fish/mouth/Mouth_Heart.png', transform: [-8,-12], knnData: [0]},
    mouth4: {src: 'images/fish/mouth/Mouth_DuckLips.png', transform: [-6, -9], knnData: [0]}
  },
  // SIDE FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  sideFins: {
    sideFin1: {src: 'images/fish/pectoralFin/Pectoral_Fin_Standard.png', knnData: [17, 18, 0]},
    sideFin2: {src: 'images/fish/pectoralFin/Pectoral_Fin_Drop.png', knnData: [12, 13, 1]}
  },
  // TOP FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  topFins: {
    topFin1: {src: 'images/fish/dorsalFin/Dorsal_Fin_Oval.png', knnData: [16, 15, 0]},
    topFin2: {src: 'images/fish/dorsalFin/Dorsal_Fin_Mohawk.png', knnData: [20, 26, 1]}
  },
  // TAIL KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  tails: {
    tail1: {src: 'images/fish/tailFin/Tail_Fin_Clamshell.png', transform: [-21, -24], knnData: [14, 30, 0]},
    tail2: {src: 'images/fish/tailFin/Tail_Fin_RoundedHeart.png', transform: [-29,-28], knnData: [14, 28, 1]}
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

export const fishShape = PropTypes.shape({
  body: bodyShape.isRequired,
  eye: bodyPartShape.isRequired,
  mouth: bodyPartShape.isRequired,
  sideFin: bodyPartShape.isRequired,
  topFin: bodyPartShape.isRequired,
  tail: bodyPartShape.isRequired,
  canvasId: PropTypes.string.isRequired
});
