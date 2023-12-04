import CdoFieldDanceAi from './ai/cdoFieldDanceAi';

// Track global objects that need to be shared between different
// components (typically between React/Redux and Blockly).

let aiFieldRef: CdoFieldDanceAi | null = null;

export default {
  setCurrentDanceAiModalField: (field: CdoFieldDanceAi | null) => {
    aiFieldRef = field;
  },
  getCurrentDanceAiModalField: () => {
    return aiFieldRef;
  },
};
