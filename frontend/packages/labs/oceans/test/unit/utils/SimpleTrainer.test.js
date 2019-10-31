import SimpleTrainer from '../../../src/utils/SimpleTrainer';
import * as tf from '@tensorflow/tfjs';

describe('Simple Trainer tests', () => {
  test('SimpleTrainer predicts', async () => {
    const trainer = new SimpleTrainer();
    trainer.setTopK(3);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);

    const result = await trainer.predictFromTensor(tf.tensor([1, 1]));
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    trainer.dispose();
  });

  test('SimpleTrainer can be restored', async () => {
    const trainer = new SimpleTrainer();
    trainer.setTopK(3);
    await trainer.initializeClassifiersWithoutMobilenet();
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([1, 1]), 0);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);
    trainer.addExampleTensor(tf.tensor([-1, -1]), 1);

    const result = await trainer.predictFromTensor(tf.tensor([1, 1]));
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    const classifierDatasetString = trainer.getDatasetJSON();
    trainer.clearAll();

    const retrainedTrainer = new SimpleTrainer();
    retrainedTrainer.setTopK(3);
    await retrainedTrainer.initializeClassifiersWithoutMobilenet();
    const untrainedResult = await retrainedTrainer.predictFromTensor(tf.tensor([1, 1]));
    expect(untrainedResult.predictedClassId).toEqual(null);

    retrainedTrainer.loadDatasetJSON(classifierDatasetString);
    const retrainedResult = await retrainedTrainer.predictFromTensor(tf.tensor([1, 1]));
    expect(retrainedResult.predictedClassId).toEqual(0);
    expect(retrainedResult.confidencesByClassId[0]).toEqual(1);
  });
});
