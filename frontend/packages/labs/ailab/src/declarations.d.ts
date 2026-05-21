declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '@public/*.png' {
  const src: string;
  export default src;
}

declare module '@public/*.jpg' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

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

declare module 'react-papaparse' {
  export const CSVReader: import('react').ComponentType<{
    onFileLoaded?: (data: Record<string, string>[], fileInfo: object) => void;
    onError?: (error: Error) => void;
    parserOptions?: object;
    cssClass?: string;
    label?: string;
  }>;
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
