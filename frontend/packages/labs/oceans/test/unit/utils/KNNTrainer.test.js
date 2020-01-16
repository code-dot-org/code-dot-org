/**
 *  @jest-environment node
 */

import KNNTrainer from '@ml/utils/KNNTrainer';
import * as tf from '@tensorflow/tfjs';

describe('Simple Trainer tests', () => {
  test('KNNTrainer predicts', async () => {
    const trainer = new KNNTrainer();
    trainer.setTopK(3);

    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);

    const result = await trainer.predict(tf.tensor([1, 1]));
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    trainer.dispose();
  });

  test('KNNTrainer can be restored', async () => {
    const trainer = new KNNTrainer();
    trainer.setTopK(3);

    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([1, 1]), 0);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);
    trainer.addTrainingExample(tf.tensor([-1, -1]), 1);

    const result = await trainer.predict(tf.tensor([1, 1]));
    expect(result.predictedClassId).toEqual(0);
    expect(result.confidencesByClassId[0]).toEqual(1);

    const classifierDatasetString = trainer.getDatasetJSON();
    trainer.clearAll();

    const retrainedTrainer = new KNNTrainer();
    retrainedTrainer.setTopK(3);
    const untrainedResult = await retrainedTrainer.predict(tf.tensor([1, 1]));
    expect(untrainedResult.predictedClassId).toEqual(null);

    retrainedTrainer.loadDatasetJSON(classifierDatasetString);
    const retrainedResult = await retrainedTrainer.predict(tf.tensor([1, 1]));
    expect(retrainedResult.predictedClassId).toEqual(0);
    expect(retrainedResult.confidencesByClassId[0]).toEqual(1);
  });
});
