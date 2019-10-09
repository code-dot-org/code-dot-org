import {PropTypes} from 'react';

const fish = {
  // BODY KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  bodies: {
    body1: {
      src: '/images/fish/body_1.png',
      anchor: [84, 84],
      eyeAnchor: [20, 5],
      mouthAnchor: [23, 15],
      sideFinAnchor: [0, 20],
      topFinAnchor: [6, -10],
      tailAnchor: [-12, 0],
      knnData: [32, 32, 0]
    },
    body2: {
      src: '/images/fish/body_2.png',
      anchor: [84, 84],
      eyeAnchor: [32, 5],
      mouthAnchor: [37, 15],
      sideFinAnchor: [10, 18],
      topFinAnchor: [15, -10],
      tailAnchor: [-10, -2],
      knnData: [48, 27, 0]
    }
  },
  // EYE KNN DATA: [width (in pixels), height (in pixels)]
  eyes: {
    eye1: {src: '/images/fish/eye_1.png', knnData: [7, 7]},
    eye2: {src: '/images/fish/eye_2.png', knnData: [9, 8]}
  },
  // MOUTH KNN DATA: [hasTeeth (0/1 bool)]
  mouths: {
    mouth1: {src: '/images/fish/mouth_1.png', knnData: [1]},
    mouth2: {src: '/images/fish/mouth_2.png', knnData: [0]}
  },
  // SIDE FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  sideFins: {
    sideFin1: {src: '/images/fish/side_fin_1.png', knnData: [17, 18, 0]},
    sideFin2: {src: '/images/fish/side_fin_2.png', knnData: [12, 13, 1]}
  },
  // TOP FIN KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  topFins: {
    topFin1: {src: '/images/fish/top_fin_1.png', knnData: [16, 15, 0]},
    topFin2: {src: '/images/fish/top_fin_2.png', knnData: [20, 26, 1]}
  },
  // TAIL KNN DATA: [width (in pixels), height (in pixels), isPointy (0/1 bool)]
  tails: {
    tail1: {src: '/images/fish/tail_1.png', knnData: [14, 30, 0]},
    tail2: {src: '/images/fish/tail_2.png', knnData: [14, 28, 1]}
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
