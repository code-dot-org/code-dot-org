// The instructions renderer on its own, without the panel around it. Shared by
// the Instructions tab and the bubble preview, and now by anything else that
// has to show a level's `longInstructions` and have it read the same — the
// progression map's detail pane is the first (world lab, specs/PROGRESSION_UI).
export {default as MainInstructionsContent} from './MainInstructionsContent';
export type {MainInstructionsContentProps} from './MainInstructionsContent';
export {default as PredictQuestion} from './PredictQuestion';
export {default as PredictQuestionRunPrompt} from './PredictQuestionRunPrompt';
export {default as PredictResetButton} from './PredictResetButton';
export {default as PredictSolution} from './PredictSolution';
export {default as PredictSummary} from './PredictSummary';
export {default as ValidationButton} from './ValidationButton';
export {default as ValidationResults} from './ValidationResults';
export {default as ValidationStatusIcon} from './ValidationStatusIcon';
export * from './Instructions';
