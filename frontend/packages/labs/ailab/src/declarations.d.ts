// Asset module types (`*.png`, `*.jpg`, `*.css`, …) come from `vite/client`,
// which is listed in `tsconfig.app.json`'s compiler `types`.

declare module 'react-chartjs-2' {
  export const Bar: import('react').ComponentType<{
    data: object;
    width?: number;
    height?: number;
    options?: object;
  }>;
  export const Scatter: import('react').ComponentType<{
    data: object;
    options?: object;
  }>;
}

declare module 'ml-knn' {
  export default class KNN {
    constructor(
      dataset: number[][],
      labels: (number | string)[],
      options?: {k?: number},
    );
    predict(dataset: number[][]): (number | string)[];
    toJSON(): object;
  }
}

// `ml-cart` ships no types. These are hand-written against 2.1.1, which is
// why package.json pins that exact version.
declare module 'ml-cart' {
  interface DecisionTreeOptions {
    gainFunction?: 'gini' | 'regression';
    splitFunction?: 'mean' | 'median';
    minNumSamples?: number;
    maxDepth?: number;
    gainThreshold?: number;
  }

  // `predict` rejects a flat array at runtime — "Data must be a 2D array with
  // at least one element" — so the type must not accept one.
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

declare module 'query-string' {
  export function parse(
    query: string,
  ): Record<string, string | string[] | null | undefined>;
  export function stringify(obj: Record<string, unknown>): string;
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
