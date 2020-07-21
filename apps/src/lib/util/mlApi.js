// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs';
import * as handposeCore from '@tensorflow-models/handpose';

/**
 * Export a set of native code functions that student code can execute via the
 * interpreter.
 * Must be mixed in to the app's command list (see applab/commands.js)
 */
export const commands = {
  async doSomeDifferentML(opts) {
    console.log('do some different ML');
  },

  async doSomeML(opts) {
    let model = await handposeCore.load();

    const predictions = await model.estimateHands(
      document.querySelector('#' + opts.elementId)
    );

    if (predictions.length > 0) {
      /*
      `predictions` is an array of objects describing each detected hand, for example:
      [
        {
          handInViewConfidence: 1, // The probability of a hand being present.
          boundingBox: { // The bounding box surrounding the hand.
            topLeft: [162.91, -17.42],
            bottomRight: [548.56, 368.23],
          },
          landmarks: [ // The 3D coordinates of each hand landmark.
            [472.52, 298.59, 0.00],
            [412.80, 315.64, -6.18],
            ...
          ],
          annotations: { // Semantic groupings of the `landmarks` coordinates.
            thumb: [
              [412.80, 315.64, -6.18]
              [350.02, 298.38, -7.14],
              ...
            ],
            ...
          }
        }
      ]
      */

      opts.callback(predictions);

      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;

        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];
          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
        }
      }
    }
  }
};
