// Progress for a preview on the level edit page: it starts empty, and
// nothing a levelbuilder does in the preview is saved.

import {EMPTY_PROGRESS, Progress} from './model';
import {AiMetrics, ProgressStore} from './progressStore';

class PreviewProgressStore extends ProgressStore {
  async load(): Promise<Progress> {
    return EMPTY_PROGRESS;
  }

  async loadAiMetrics(): Promise<AiMetrics> {
    return {accepted: 0, rejected: 0};
  }

  async saveStep(): Promise<void> {}

  async saveInstructions(): Promise<void> {}

  async saveValidation(): Promise<void> {}
}

export const previewProgressStore = new PreviewProgressStore();
