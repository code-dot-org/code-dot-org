export enum App {
  Applab = 'applab',
  Javalab = 'javalab'
}

// TODO: use generics to create app-specific AppOptions (e.g., AppOptions<App.Applab>)
export interface AppOptions {
  appType: App
  channel: string
  longInstructions: string
  startBlocks: string
}

export const defaultAppOptions: AppOptions = {
  appType: App.Applab,
  channel: '',
  longInstructions: '',
  startBlocks: ''
}

export function createAppOptions(options: any): AppOptions {
  return {
    ...defaultAppOptions,
    appType: options.levelGameName,
    channel: options.channel,
    longInstructions: options.level?.longInstructions,
    startBlocks: options.level?.startBlocks
  }
}
