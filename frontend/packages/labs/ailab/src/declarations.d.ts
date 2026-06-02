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
