declare module 'pngjs' {
  export class PNG {
    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG): Buffer;
    };

    data: Buffer;
    height: number;
    width: number;

    constructor(options: {height: number; width: number});
  }
}
