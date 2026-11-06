// `ml-cart` ships no types. These are hand-written against 2.1.1, which is why
// apps/package.json pins that exact version rather than a range.
declare module 'ml-cart' {
  interface DecisionTreeOptions {
    gainFunction?: 'gini' | 'regression';
    splitFunction?: 'mean';
    minNumSamples?: number;
    maxDepth?: number;
    gainThreshold?: number;
  }

  // `predict` throws on a flat array for classification trees. Regression
  // trees accept one but return a prediction per feature, so both are 2D only.
  export class DecisionTreeClassifier {
    constructor(options?: DecisionTreeOptions);
    train(dataset: number[][], labels: number[]): void;
    predict(dataset: number[][]): number[];
    toJSON(): object;
    static load(model: object): DecisionTreeClassifier;
  }

  export class DecisionTreeRegression {
    constructor(options?: DecisionTreeOptions);
    train(dataset: number[][], labels: number[]): void;
    predict(dataset: number[][]): number[];
    toJSON(): object;
    static load(model: object): DecisionTreeRegression;
  }
}

declare module 'ml-knn' {
  export default class KNN {
    constructor(
      dataset: number[][],
      labels: (number | string)[],
      options?: {k?: number}
    );
    predict(dataset: number[][]): (number | string)[];
    toJSON(): object;
  }
}

declare module 'messageformat' {
  export default class MessageFormat {
    constructor(locale: string);
    compile(message: string | Record<string, unknown>): Record<string, unknown>;
  }
}

interface Window {
  ga?: (...args: unknown[]) => void;
}
