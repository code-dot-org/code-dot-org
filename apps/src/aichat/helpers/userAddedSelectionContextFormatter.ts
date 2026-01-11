import {UserAddedSelectionContextItem} from '@cdo/apps/aichat/types';

// Formats the user added selection context for inclusion in the prompt
// sent to the AI model. We include the context as part of the user's message,
// so the prompt is in first person.
export const formatUserAddedSelectionContextForPrompt = (
  userAddedSelectionContext: UserAddedSelectionContextItem[] | undefined
) => {
  if (!userAddedSelectionContext || userAddedSelectionContext.length === 0) {
    return undefined;
  }
  let promptString = 'I am asking about this part of my current code\n\n';
  promptString += userAddedSelectionContext
    .map(context => {
      if (context.lineReference) {
        const lineString =
          context.lineReference.start === context.lineReference.end
            ? `line ${context.lineReference.start}`
            : `lines ${context.lineReference.start} - ${context.lineReference.end}`;
        return `snippet of file ${context.filename}, ${lineString}\nContents of snippet:\n\`\`\`${context.sourceCode}\`\`\``;
      } else {
        return `entirety of file ${context.filename}\nContents of file:\n\`\`\`${context.sourceCode}\`\`\``;
      }
    })
    .join('\n\n');
  return promptString;
};
