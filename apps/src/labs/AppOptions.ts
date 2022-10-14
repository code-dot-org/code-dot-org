// TODO: create lab-specific AppOptions types

export type AppOptions = {
  appType: string
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