const SimpleTrainer = require('../../src/utils/SimpleTrainer');

describe('Simple Trainer tests', () => {
  test('SimpleTrainer predicts', async () => {
    const trainer = new SimpleTrainer();
    trainer.setTopK(3);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([-1, -1], 1);
    trainer.addExampleData([-1, -1], 1);
    trainer.addExampleData([-1, -1], 1);

    const result = await trainer.predictFromData([1, 1]);
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    trainer.dispose();
  });

  test('SimpleTrainer can be restored', async () => {
    const trainer = new SimpleTrainer();
    trainer.setTopK(3);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([1, 1], 0);
    trainer.addExampleData([-1, -1], 1);
    trainer.addExampleData([-1, -1], 1);
    trainer.addExampleData([-1, -1], 1);

    const result = await trainer.predictFromData([1, 1]);
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    const classifierDatasetString = trainer.getDatasetJSON();
    trainer.clearAll();

    const retrained_trainer = new SimpleTrainer();
    retrained_trainer.setTopK(3);
    await retrained_trainer.initializeClassifiersWithoutMobilenet();
    const untrained_result = await retrained_trainer.predictFromData([1, 1]);
    expect(untrained_result.predictedClassId).toEqual(null);

    retrained_trainer.loadDatasetJSON(classifierDatasetString);
    const retrained_result = await retrained_trainer.predictFromData([1, 1]);
    expect(retrained_result.predictedClassId).toEqual(0);
    expect(retrained_result.confidencesByClassId[0]).toEqual(1);
  });
});
