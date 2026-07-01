const emptyPlane = Array(100).fill('');
const grassPlane = Array(100).fill('grass');

export const CraftLabFixtures = {
  defaultLevel: {
    playerStartPosition: [3, 4],
    playerStartDirection: 1,
    playerName: 'Alex',
    isAgentLevel: false,
    gridDimensions: [10, 10],
    earlyLoadAssetPacks: ['allAssetsMinusPlayer', 'playerAlex'],
    earlyLoadNiceToHaveAssetPacks: [] as string[],
    assetPacks: {
      beforeLoad: ['allAssetsMinusPlayer', 'playerAlex'],
      afterLoad: [],
    },
    groundPlane: grassPlane,
    groundDecorationPlane: emptyPlane,
    actionPlane: emptyPlane,
    fluffPlane: emptyPlane,
    verificationFunction: () => false,
    failureCheckFunction: () => false,
    timeoutResult: () => false,
    levelVerificationTimeout: -1,
  },
};
