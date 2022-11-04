// TODO: create lab-specific AppOptions types

export enum App {
  Applab = 'applab',
  Javalab = 'javalab'
}

// TODO: use generics to create app-specific AppOptions (e.g., AppOptions<App.Applab>)
export interface AppOptions {
  appType: App
  longInstructions: string
  startBlocks: string
}

export function createAppOptions(options: any): AppOptions {
  return {
    appType: options.levelGameName,
    longInstructions: options.level?.longInstructions,
    startBlocks: options.level?.startBlocks
  }
}
