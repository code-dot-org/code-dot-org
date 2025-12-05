import {validateFileName, getFileNameWithNumberSuffix} from '@codebridge/utils';

import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

const getAnswerJsonSchemaCopyPaste = (): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      tutorMode: {
        type: 'string',
        enum: [
          'Build HTML',
          'Build CSS',
          'Build JavaScript',
          'Ask',
          'Hint',
          'Debug',
          'Explain Code',
          'Example',
          'Pseudocode',
          'Documentation',
          'Test Case',
          'Refusal JavaScript Snippet',
          'Refusal',
        ],
      },
      goal: {
        type: 'string',
        description: 'What we are achieving this turn, limit to 1 line of text',
      },
      assumptions: {
        type: 'string',
        description:
          'Explicit design choices you made from the wireframe. Format as bullets.',
      },
      code: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            language: {type: 'string'},
            sourceCode: {
              type: 'string',
            },
            filename: {type: 'string'},
          },
          required: ['language', 'sourceCode', 'filename'],
          additionalProperties: false,
        },
        description:
          '`html`, `css`, or `js` fences. Limit to one language (html, css, or js) across the entire list. When providing modifications to student code, provide the entire contents of the file. The list can be empty. Code should be formatted with appropriate newlines and indentation. The student will need to copy and paste this code into their project.',
      },
      explanation: {
        type: 'string',
        description:
          "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
      },
      nextSteps: {
        type: 'string',
        description:
          '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
      },
      questions: {
        type: 'string',
        description:
          'short list to confirm ambiguous details. Format as markdown bullets.',
      },
    },
    // We return tutorMode and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ['tutorMode', 'nextSteps', 'code', 'explanation', 'goal'],
    propertyOrdering: [
      'tutorMode',
      'goal',
      'assumptions',
      'code',
      'explanation',
      'nextSteps',
      'questions',
    ],
    additionalProperties: false,
  };
};

const getAnswerJsonSchemaAcceptReject = (): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      tutorMode: {
        type: 'string',
        enum: [
          'Build HTML',
          'Build CSS',
          'Build JavaScript',
          'Ask',
          'Hint',
          'Debug',
          'Explain Code',
          'Example',
          'Pseudocode',
          'Documentation',
          'Test Case',
          'Refusal JavaScript Snippet',
          'Refusal',
        ],
      },
      goal: {
        type: 'string',
        description: 'What we are achieving this turn, limit to 1 line of text',
      },
      assumptions: {
        type: 'string',
        description:
          'Explicit design choices you made from the wireframe. Format as bullets.',
      },
      code: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            language: {type: 'string'},
            sourceCode: {
              type: 'string',
            },
            name: {type: 'string'},
            id: {type: 'string'},
            folderId: {type: 'string'},
          },
          required: ['language', 'sourceCode', 'name', 'id', 'folderId'],
          additionalProperties: false,
        },
        description:
          '`html`, `css`, or `js` fences. Limit to one language (html, css, or js) across the entire list. ' +
          'The list can be empty. Code should be formatted with appropriate newlines and indentation. ' +
          'When providing modifications to a file in the student code, provide the entire contents of the file and include the file id and folderId of the file being updated. ' +
          'For example, if a current student\'s file name is "demo.html", the file id is "2", and the folderId is "1", and the contents of the file has been updated, ' +
          'then return the file name as "demo.html", file id as "2", and folderId "1", but the entire updated contents of the modified file. ' +
          'The student source is a MultiFileSource type with `{folders: Record<FolderId, ProjectFolder>; files: Record<FileId, ProjectFile>; openFiles?: FileId[];}' +
          'Each file has type ProjectFile with the following properties: ' +
          '{id: FileId (a stringified number); name: string; language: string; contents: string; active?: boolean; folderId: stringified number; type?: ProjectFileType; url?: string; flagged?: boolean; isAiTutorVersionUpdated?: boolean;isAiTutorVersionCreated?: boolean;}' +
          'If the file is a new file that is generated by the AI and NOT currently in the student code, then the id is "new", and the folderId is "0".The list can be empty. ' +
          'Code should be formatted with appropriate newlines and indentation.',
      },
      explanation: {
        type: 'string',
        description:
          "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
      },
      nextSteps: {
        type: 'string',
        description:
          '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
      },
      questions: {
        type: 'string',
        description:
          'short list to confirm ambiguous details. Format as markdown bullets.',
      },
    },
    // We return tutorMode and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ['tutorMode', 'nextSteps', 'code', 'explanation', 'goal'],
    propertyOrdering: [
      'tutorMode',
      'goal',
      'assumptions',
      'code',
      'explanation',
      'nextSteps',
      'questions',
    ],
    additionalProperties: false,
  };
};

export const copyCodeJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchemaCopyPaste(),
  },
  required: ['answer'],
  additionalProperties: false,
};

export const acceptRejectJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchemaAcceptReject(),
  },
  required: ['answer'],
  additionalProperties: false,
};

// Parsed json comes in as 'any', but it follows the structure defined in getAnswerJsonSchema().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCopyPasteResponse = (response: any): string => {
  let formattedResponse = '';
  if (response.assumptions) {
    formattedResponse += `**Assumptions**\n\n${response.assumptions}\n\n`;
  }
  if (response.code && response.code.length > 0) {
    formattedResponse += `**Code**\n\n`;
    // Parsed json comes in as 'any'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.code.forEach((code: any) => {
      formattedResponse += `\`${code.filename}\`\n\`\`\`\n${code.sourceCode}\n\`\`\`\n\n`;
    });
  }
  if (response.explanation) {
    formattedResponse += `**Explanation**\n\n${response.explanation}\n\n`;
  }
  if (response.nextSteps) {
    formattedResponse += `**Next Steps**\n\n${response.nextSteps}\n\n`;
  }
  if (response.questions) {
    formattedResponse += `**Questions**\n\n${response.questions}\n\n`;
  }
  return formattedResponse;
};

type AiTutorCodeFile = {
  id: string;
  folderId: string;
  name: string;
  contents: string;
};

type AcceptRejectFormattedResponse = {
  explanation: string;
  code: AiTutorCodeFile[];
  answerType: string;
};

// Parsed json comes in as 'any', but it follows the structure defined in acceptRejectJsonSchema.
export const formatAcceptRejectResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): AcceptRejectFormattedResponse => {
  let formattedExplanation = '';
  if (response.explanation) {
    formattedExplanation += `**Explanation**\n\n${response.explanation}\n\n`;
  }
  if (response.nextSteps) {
    formattedExplanation += `**Next Steps**\n\n${response.nextSteps}\n\n`;
  }
  if (response.questions) {
    formattedExplanation += `**Questions**\n\n${response.questions}\n\n`;
  }
  return {
    explanation: formattedExplanation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: response.code.map((codeFile: any) => ({
      name: codeFile.name,
      contents: codeFile.sourceCode,
      id: codeFile.id,
      folderId: codeFile.folderId,
    })),
    answerType: response.tutorMode,
  };
};

export const getMergedAiTutorCodeWithSource = (
  code: AiTutorCodeFile[],
  source: MultiFileSource,
  aiTutorVersionFiles: ProjectFile[]
): MultiFileSource => {
  // Create copy of the source.
  const updatedSource: MultiFileSource = {
    ...source,
    files: {},
    folders: {...source.folders},
    openFiles: [...(source.openFiles || [])],
  };
  // Set all files as inactive by creating new file objects.
  Object.keys(source.files).forEach(fileId => {
    updatedSource.files[fileId] = {
      ...source.files[fileId],
      active: false,
    };
  });

  // For each AI code file, find and replace the updated file if the file already exists in student code.
  // If the AI code file is a new file, add it to updatedSource.
  code.forEach((aiFile: AiTutorCodeFile) => {
    let fileId;
    // File id is 'new' so we are creating a new file.
    if (aiFile.id === 'new') {
      fileId = getNextFileId(Object.values(updatedSource.files));
      let validateFileNameError;
      do {
        validateFileNameError = validateFileName({
          fileName: aiFile.name,
          folderId: aiFile.folderId,
          projectFiles: updatedSource.files,
          isStartMode: false,
          validationFile: undefined,
        });
        if (validateFileNameError) {
          aiFile.name = getFileNameWithNumberSuffix(aiFile.name);
        }
      } while (validateFileNameError);
    } else {
      // File id is not 'new' so we are updating an existing file.
      fileId = aiFile.id;
      // We need to validate the file name of the AI code file with the given file id.
      // If the file name of the AI code file is the same as the file name in the student code,
      // then we use the same file id.
      if (updatedSource.files[aiFile.id]?.name === aiFile.name) {
        fileId = aiFile.id;
      } else {
        // If the file name is different, then we need to create a new file with a different id.
        fileId = getNextFileId(Object.values(updatedSource.files));
        // Validate the file name of the AI code file.
        const validateFileNameError = validateFileName({
          fileName: aiFile.name,
          folderId: aiFile.folderId,
          projectFiles: updatedSource.files,
          isStartMode: false,
          validationFile: undefined,
        });
        if (validateFileNameError) {
          // TODO: Log error via analytics.
          // If the file name is invalid (e.g. duplicate), place in root folder, if not already in root folder.
          // Then validate name and if still invalid, add numeric suffix to the file name until valid.
          if (aiFile.folderId !== DEFAULT_FOLDER_ID) {
            aiFile.folderId = DEFAULT_FOLDER_ID;
          } else {
            aiFile.name = getFileNameWithNumberSuffix(aiFile.name);
          }
          let validateFileNameError;
          do {
            validateFileNameError = validateFileName({
              fileName: aiFile.name,
              folderId: aiFile.folderId,
              projectFiles: updatedSource.files,
              isStartMode: false,
              validationFile: undefined,
            });
            if (validateFileNameError) {
              aiFile.name = getFileNameWithNumberSuffix(aiFile.name);
            }
          } while (validateFileNameError);
        }
      }
    }

    const aiTutorVersionFile: ProjectFile = {
      id: fileId,
      name: aiFile.name,
      folderId: aiFile.folderId,
      language: aiFile.name.split('.').pop() || '',
      contents: aiFile.contents,
      isAiTutorVersionUpdated: aiFile.id === 'new' ? false : true,
      isAiTutorVersionCreated: aiFile.id === 'new' ? true : false,
    };
    updatedSource.files[aiTutorVersionFile.id] = aiTutorVersionFile;
    aiTutorVersionFiles.push(aiTutorVersionFile);
  });

  // Sort AI-updated files by name alphabetically.
  aiTutorVersionFiles.sort((a, b) => a.name.localeCompare(b.name));

  // Update openFiles to prioritize AI files: active file first, then other AI files, then existing.
  if (aiTutorVersionFiles.length > 0) {
    const firstHtmlFile = aiTutorVersionFiles.find(f => f.language === 'html');
    const fileToActivate = firstHtmlFile || aiTutorVersionFiles[0];

    updatedSource.files[fileToActivate.id] = {
      ...updatedSource.files[fileToActivate.id],
      active: true,
    };

    const aiFileIds = aiTutorVersionFiles.map(f => f.id);
    const aiFileIdSet = new Set(aiFileIds);
    const existingOpenFilesFiltered = (updatedSource.openFiles || []).filter(
      id => !aiFileIdSet.has(id)
    );

    const otherAiFileIds = aiFileIds.filter(id => id !== fileToActivate.id);
    updatedSource.openFiles = [
      fileToActivate.id,
      ...otherAiFileIds,
      ...existingOpenFilesFiltered,
    ];
  }

  return updatedSource;
};
