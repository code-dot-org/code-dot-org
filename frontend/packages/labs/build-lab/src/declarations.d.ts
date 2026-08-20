declare module 'ml-knn' {
  export default class KNN {
    constructor(dataset: number[][], labels: number[], options?: {k?: number});
    static load(model: object): KNN;
    predict(dataset: number[]): number | string;
    toJSON(): object;
  }
}
