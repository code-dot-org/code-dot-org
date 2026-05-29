import {AichatContext} from './types';

export default class AichatContextManager {
  private static instance: AichatContextManager;

  aichatContext?: AichatContext;

  private static getInstance(): AichatContextManager {
    if (!AichatContextManager.instance) {
      AichatContextManager.instance = new AichatContextManager();
    }
    return AichatContextManager.instance;
  }

  public static setContext(context: AichatContext) {
    this.getInstance().aichatContext = context;
  }

  public static getContext(): AichatContext {
    const instance = this.getInstance();
    if (!instance.aichatContext) {
      throw new Error(
        'Called AichatContextManager.getContext(), but never called setContext() first.'
      );
    }
    return instance.aichatContext;
  }
}
