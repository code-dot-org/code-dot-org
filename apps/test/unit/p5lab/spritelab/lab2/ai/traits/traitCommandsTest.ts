import {
  ModelCard,
  readModelCard,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/modelCard';
import {
  createTraitCommands,
  TraitLibrary,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/traits/traitCommands';

const getPrediction = jest.fn();
jest.mock('@cdo/apps/lib/util/mlApi', () => ({
  commands: {
    getPrediction: (opts: {callback: (v: string) => void}) =>
      getPrediction(opts),
  },
}));

const plant: ModelCard = readModelCard('abc123def456', {
  name: 'Plant Health',
  selectedTrainer: 'knnClassify',
  label: {id: 'Health'},
  features: [
    {id: 'Leaf spots', values: ['none', 'few', 'many']},
    {id: 'Soil feel', values: ['dry', 'damp', 'wet']},
  ],
});

interface FakeSprite {
  removed?: boolean;
  traits?: {[key: string]: string | number};
  prediction?: string;
  getAnimationLabel: () => string;
}

function makeLibrary(
  sprites: FakeSprite[],
  options: {card?: ModelCard; costumeTraits?: {[name: string]: object}} = {}
) {
  const library = {
    getSpriteArray: () => sprites,
    animationTraits: options.costumeTraits || {},
    modelCard: 'card' in options ? options.card : plant,
  } as unknown as TraitLibrary;
  return {library, commands: createTraitCommands(library)};
}

function sprite(costume = 'basil'): FakeSprite {
  return {getAnimationLabel: () => costume};
}

beforeEach(() => {
  getPrediction.mockReset();
  getPrediction.mockReturnValue(Promise.resolve());
});

describe('setTraitOfSprite', () => {
  it('writes to every sprite the argument matched', () => {
    const a = sprite();
    const b = sprite();
    const {commands} = makeLibrary([a, b]);
    commands.setTraitOfSprite({costume: 'basil'}, 'Leafspots', 'many');
    expect(a.traits).toEqual({Leafspots: 'many'});
    expect(b.traits).toEqual({Leafspots: 'many'});
  });
});

describe('traitOfSprite', () => {
  const costumeTraits = {basil: {Leafspots: 'none'}};

  it('falls back to the costume', () => {
    const {commands} = makeLibrary([sprite()], {costumeTraits});
    expect(commands.traitOfSprite({costume: 'basil'}, 'Leafspots')).toBe(
      'none'
    );
  });

  it('prefers the sprite when it has its own value', () => {
    const s = sprite();
    s.traits = {Leafspots: 'many'};
    const {commands} = makeLibrary([s], {costumeTraits});
    expect(commands.traitOfSprite({costume: 'basil'}, 'Leafspots')).toBe(
      'many'
    );
  });

  it('answers with empty text rather than undefined', () => {
    const {commands} = makeLibrary([sprite()], {costumeTraits});
    expect(commands.traitOfSprite({costume: 'basil'}, 'Soilfeel')).toBe('');
  });
});

describe('predictForSprite', () => {
  const complete = {basil: {Leafspots: 'none', Soilfeel: 'damp'}};

  it('says so when the project chose no model', () => {
    const s = sprite();
    const {commands} = makeLibrary([s], {card: undefined});
    commands.predictForSprite({costume: 'basil'});
    expect(s.prediction).toBe('No model chosen');
    expect(getPrediction).not.toHaveBeenCalled();
  });

  it('refuses a trainer MLTrainers would answer with an error string', () => {
    const s = sprite();
    const tree = readModelCard('z', {
      name: 'Tree',
      selectedTrainer: 'decisionTree',
      features: [],
    });
    const {commands} = makeLibrary([s], {card: tree});
    commands.predictForSprite({costume: 'basil'});
    expect(s.prediction).toBe('Cannot run a decisionTree model yet');
    expect(getPrediction).not.toHaveBeenCalled();
  });

  it('names the missing features instead of predicting from part of them', () => {
    const s = sprite();
    const {commands} = makeLibrary([s], {
      costumeTraits: {basil: {Leafspots: 'none'}},
    });
    commands.predictForSprite({costume: 'basil'});
    expect(s.prediction).toBe('Missing: Soil feel');
    expect(getPrediction).not.toHaveBeenCalled();
  });

  it('sends the stripped keys and parks the answer on the sprite', () => {
    const s = sprite();
    const done = jest.fn();
    const {commands} = makeLibrary([s], {costumeTraits: complete});
    commands.predictForSprite({costume: 'basil'}, done);

    expect(getPrediction).toHaveBeenCalledTimes(1);
    const opts = getPrediction.mock.calls[0][0];
    expect(opts.modelId).toBe('abc123def456');
    expect(opts.testValues).toEqual({Leafspots: 'none', Soilfeel: 'damp'});

    opts.callback('Healthy');
    expect(s.prediction).toBe('Healthy');
    expect(commands.predictionOfSprite({costume: 'basil'})).toBe('Healthy');
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('drops an answer that lands after the sprite is gone', () => {
    const s = sprite();
    const done = jest.fn();
    const {commands} = makeLibrary([s], {costumeTraits: complete});
    commands.predictForSprite({costume: 'basil'}, done);

    s.removed = true;
    getPrediction.mock.calls[0][0].callback('Healthy');
    expect(s.prediction).toBeUndefined();
    expect(done).not.toHaveBeenCalled();
  });

  it('reports a failed request rather than leaving the callback hanging', async () => {
    const s = sprite();
    getPrediction.mockReturnValue(Promise.reject(new Error('network')));
    const {commands} = makeLibrary([s], {costumeTraits: complete});
    commands.predictForSprite({costume: 'basil'});
    await Promise.resolve();
    await Promise.resolve();
    expect(s.prediction).toBe('Prediction failed');
  });
});
