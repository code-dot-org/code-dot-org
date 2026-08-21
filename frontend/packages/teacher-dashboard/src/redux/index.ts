export * as teacherSectionsActions from './teacherSectionsSlice';
export {default as teacherSectionsSlice} from './teacherSectionsSlice';

// Selectors over the sections slice. Exported so a lab can ask which section a
// teacher is looking at — the AI tutor's access rules need its
// `aiChatAccessLevel` (see `@code-dot-org/aitutor` specs/PLAN.md §11.1).
export * from './teacherSectionsReduxSelectors';
