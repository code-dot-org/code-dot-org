import BuildLabEngine from '@cdo/apps/buildlab/BuildLabEngine';

function makeEngine() {
  return new BuildLabEngine({
    assets: [
      {
        assetType: 'animation',
        frames: ['frame-1', 'frame-2', 'frame-3'],
        id: 'loading-animation',
        name: 'Loading',
        style: 'wave',
      },
      {
        assetType: 'animation',
        frames: ['walk-1', 'walk-2'],
        id: 'walking-animation',
        name: 'Walking',
        style: 'wave',
      },
    ],
    initialState: {
      elements: [
        {
          data: {color: 'purple', height: '12'},
          id: 'flower',
          kind: 'sprite',
          label: 'Flower',
          screenId: 'screen1',
          x: 10,
          y: 10,
        },
        {
          id: 'scientist',
          kind: 'sprite',
          label: 'Scientist',
          screenId: 'screen1',
          x: 100,
          y: 100,
        },
        {
          id: 'result',
          kind: 'label',
          label: 'Waiting',
          screenId: 'screen1',
          x: 20,
          y: 200,
        },
        {
          className: 'planet',
          data: {mass: '1.2', radius: '0.9'},
          id: 'planet1',
          kind: 'sprite',
          label: 'Planet 1',
          screenId: 'screen1',
          x: 130,
          y: 100,
        },
        {
          className: 'planet',
          data: {mass: '8.4', radius: '2.1'},
          id: 'planet2',
          kind: 'sprite',
          label: 'Planet 2',
          screenId: 'screen1',
          x: 300,
          y: 300,
        },
      ],
      variables: {},
      screenId: 'screen1',
    },
    screens: [{id: 'screen1', isDefault: true, name: 'Screen 1'}],
  });
}

describe('BuildLabEngine sprite data', () => {
  it('stores data on sprites and can show it in an element', () => {
    const engine = makeEngine();

    engine.setSpriteData('flower', 'leafCount', '4');
    engine.setSpriteData('flower', 'constructor', 'ignored');
    engine.setTextFromSpriteData('result', 'flower', 'leafCount');

    expect(engine.getSpriteData('flower', 'leafCount')).toBe('4');
    expect(engine.getSpriteData('flower', 'constructor')).toBe('');
    expect(
      engine.getState().elements.find(element => element.id === 'result').label
    ).toBe('4');
  });

  it('snapshots source data and runs predictor handlers on completion', () => {
    const engine = makeEngine();
    engine.onPredictionReady('scientist', () =>
      engine.setTextFromSpriteData('result', 'scientist', 'prediction')
    );

    engine.predictSprite('scientist', 'model123456', 'flower');
    engine.setSpriteData('flower', 'height', '99');
    const [request] = engine.takePendingPredictions();

    expect(request.kind).toBe('sprite');
    expect(request.featureValues).toEqual({color: 'purple', height: '12'});
    expect(engine.getSpriteData('scientist', 'predictionStatus')).toBe(
      'pending'
    );

    const completedState = engine.completePrediction(request, 'iris');
    const scientist = completedState.elements.find(
      element => element.id === 'scientist'
    );
    const result = completedState.elements.find(
      element => element.id === 'result'
    );
    expect(scientist.data).toMatchObject({
      prediction: 'iris',
      predictionError: '',
      predictionStatus: 'ready',
    });
    expect(result.label).toBe('iris');
  });

  it('ignores an older result for the same predictor', () => {
    const engine = makeEngine();

    engine.predictSprite('scientist', 'model123456', 'flower');
    engine.predictSprite('scientist', 'model123456', 'flower');
    const [olderRequest, latestRequest] = engine.takePendingPredictions();

    engine.completePrediction(olderRequest, 'old result');
    expect(engine.getSpriteData('scientist', 'prediction')).toBe('');

    engine.completePrediction(latestRequest, 'latest result');
    expect(engine.getSpriteData('scientist', 'prediction')).toBe(
      'latest result'
    );
  });

  it('records prediction failures on the predictor sprite', () => {
    const engine = makeEngine();
    engine.onPredictionFailed('scientist', () =>
      engine.setTextFromSpriteData('result', 'scientist', 'predictionError')
    );
    engine.predictSprite('scientist', 'model123456', 'flower');
    const [request] = engine.takePendingPredictions();

    const failedState = engine.failPrediction(request, 'Missing height');
    const scientist = failedState.elements.find(
      element => element.id === 'scientist'
    );
    expect(scientist.data).toMatchObject({
      predictionError: 'Missing height',
      predictionStatus: 'failed',
    });
    expect(
      failedState.elements.find(element => element.id === 'result').label
    ).toBe('Missing height');
  });

  it('uses the touched member of a class as the prediction data source', () => {
    const engine = makeEngine();
    engine.onTouch('scientist', 'class:planet', () =>
      engine.predictSprite('scientist', 'model123456', 'class:planet')
    );

    engine.moveWithArrowKeys(new Set());
    const [request] = engine.takePendingPredictions();

    expect(request).toMatchObject({
      featureValues: {mass: '1.2', radius: '0.9'},
      kind: 'sprite',
      sourceSpriteId: 'planet1',
    });
  });

  it('rejects a class data source outside a matching touch event', () => {
    const engine = makeEngine();

    engine.predictSprite('scientist', 'model123456', 'class:planet');

    expect(engine.takePendingPredictions()).toHaveLength(0);
    expect(engine.getSpriteData('scientist', 'predictionStatus')).toBe(
      'failed'
    );
  });

  it('plays, advances, and stops a sprite animation', () => {
    const engine = makeEngine();

    engine.playAnimation('scientist', 'loading-animation');
    expect(engine.getState().animations.scientist).toMatchObject({
      assetId: 'loading-animation',
      frameIndex: 0,
      playing: true,
    });

    engine.advanceAnimations(1000);
    const advancedState = engine.advanceAnimations(1126);
    expect(advancedState.animations.scientist.frameIndex).toBe(1);

    engine.stopAnimation('scientist');
    expect(engine.getState().animations.scientist).toMatchObject({
      frameIndex: 1,
      playing: false,
    });
  });

  it('plays an animation until all AI text requests finish', () => {
    const engine = makeEngine();
    engine.animateWhileGenerating('scientist', 'loading-animation');

    engine.generateText('First prompt', 'result');
    engine.generateText('Latest prompt', 'result');
    const [firstRequest, latestRequest] = engine.takePendingGenerations();
    expect(engine.getState().animations.scientist.playing).toBe(true);

    engine.completeGeneration(firstRequest, 'old response');
    expect(engine.getState().animations.scientist.playing).toBe(true);

    const completedState = engine.completeGeneration(
      latestRequest,
      'latest response'
    );
    expect(completedState.animations.scientist).toBeUndefined();
    expect(
      completedState.elements.find(element => element.id === 'result').label
    ).toBe('latest response');
  });

  it('restores a sprite animation after AI generation finishes', () => {
    const engine = makeEngine();
    engine.playAnimation('scientist', 'walking-animation');
    engine.animateWhileGenerating('scientist', 'loading-animation');

    engine.generateText('Prompt', 'result');
    const [request] = engine.takePendingGenerations();
    expect(engine.getState().animations.scientist.assetId).toBe(
      'loading-animation'
    );

    const completedState = engine.completeGeneration(request, 'Response');
    expect(completedState.animations.scientist).toMatchObject({
      assetId: 'walking-animation',
      playing: true,
    });
  });
});
