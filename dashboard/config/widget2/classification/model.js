/**
 * The review prediction model.
 */

const PRIOR_YES = 0.5;

const FEATURES = [
  { id: "mood", name: "Was in a good mood", pYes: 0.7, pNo: 0.4 },
  {
    id: "flavor",
    name: "Ordered their favorite flavor",
    pYes: 0.75,
    pNo: 0.45,
  },
  { id: "service", name: "Got friendly service", pYes: 0.72, pNo: 0.38 },
  { id: "wait", name: "Waited in a long line", pYes: 0.3, pNo: 0.6 },
  { id: "scoop", name: "Received the wrong order", pYes: 0.05, pNo: 0.9 },
];

export function getFeatureDefinitions() {
  return FEATURES.map((f) => ({ ...f }));
}

export function createClassifier() {
  return {
    predict(values) {
      let logYes = Math.log(PRIOR_YES);
      let logNo = Math.log(1 - PRIOR_YES);
      for (const f of FEATURES) {
        const on = values.get(f.id) ?? false;
        logYes += Math.log(on ? f.pYes : 1 - f.pYes);
        logNo += Math.log(on ? f.pNo : 1 - f.pNo);
      }
      const m = Math.max(logYes, logNo);
      const eYes = Math.exp(logYes - m);
      const eNo = Math.exp(logNo - m);
      return eYes / (eYes + eNo);
    },
  };
}
