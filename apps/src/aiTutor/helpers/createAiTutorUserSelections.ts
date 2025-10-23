import {
  DisplayNameToUserAddedSelectionItem,
  UserAddedSelections,
} from '@cdo/apps/aichat/types';

export const createAiTutorUserSelections = (
  displayNameToSelectionItem: DisplayNameToUserAddedSelectionItem
): UserAddedSelections | undefined => {
  if (Object.values(displayNameToSelectionItem).length > 0) {
    const userSelectionString =
      displayNameToSelectionItem &&
      Object.values(displayNameToSelectionItem).length > 0
        ? Object.values(displayNameToSelectionItem)
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
            .join('\n\n')
        : undefined;

    if (userSelectionString) {
      return {
        items: Object.values(displayNameToSelectionItem),
        messageText: `Focus on this part of the current code:\n\n${userSelectionString}`,
      };
    }

    return undefined;
  }
};
