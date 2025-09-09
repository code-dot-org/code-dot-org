export default {
  left: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background:
      'linear-gradient(to right, rgba(0, 147, 164, 1) 0%, rgba(0, 147, 164, 0) 20px)',
  },
  right: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background:
      'linear-gradient(to right, rgba(0, 147, 164, 0) calc(100% - 20px), rgba(0, 147, 164, 1) 100%)',
  },
};
