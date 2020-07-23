// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs';
import * as handposeCore from '@tensorflow-models/handpose';

let model = null;

/**
 * Export a set of native code functions that student code can execute via the
 * interpreter.
 * Must be mixed in to the app's command list (see applab/commands.js)
 */
export const commands = {
  async initLiveCamera(opts) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({video: true})
        .then(function(stream) {
          const element = document.querySelector('#' + opts.elementId);
          element.srcObject = stream;
          element.autoplay = true;
          opts.callback();
        })
        .catch(function(error) {
          console.log('Something went wrong!');
        });
    }
  },

  async initMLModel(opts) {
    model = await handposeCore.load({detectionConfidence: 0.1});
    opts.callback();
  },

  async doSomeML(opts) {
    const predictions = await model.estimateHands(
      document.querySelector('#' + opts.elementId)
    );

    if (predictions.length > 0) {
      opts.callback({
        confidence: predictions[0].handInViewConfidence,
        thumbX: predictions[0].annotations.thumb[0][0],
        boxX: predictions[0].boundingBox.topLeft[0]
      });

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

      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;

        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];
          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
        }
      }
    } else {
      console.log('predictions length 0');
      opts.callback(null);
    }

    // Start next prediction almost immediately.  Use setTimeout to avoid a
    // recursive call.
    setTimeout(() => {
      Applab.executeCmd(null, 'doSomeML', opts);
    }, 0);
  }
};
