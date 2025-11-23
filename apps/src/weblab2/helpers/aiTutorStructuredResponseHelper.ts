import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

const getAnswerJsonSchema = (): JsonObjectSchema => {
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

export const copyCodeJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchema(),
  },
  required: ['answer'],
  additionalProperties: false,
};

export const acceptRejectJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    code: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          language: {type: 'string'},
          sourceCode: {type: 'string'},
          filename: {type: 'string'},
        },
        required: ['language', 'sourceCode', 'filename'],
        additionalProperties: false,
      },
    },
    explanation: {type: 'string'},
  },
  required: ['code', 'explanation'],
  additionalProperties: false,
};

// Parsed json comes in as 'any', but it follows the structure defined in getAnswerJsonSchema().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatExplanationResponse = (response: any): string => {
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
  name: string;
  contents: string;
};

type AcceptRejectFormattedResponse = {
  explanation: string;
  code: AiTutorCodeFile[];
};

// Parsed json comes in as 'any', but it follows the structure defined in acceptRejectJsonSchema.
export const formatAcceptRejectResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): AcceptRejectFormattedResponse => {
  return {
    explanation: response.explanation || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: response.code.map((codeFile: any) => ({
      name: codeFile.filename,
      contents: codeFile.sourceCode,
    })),
  };
};

export const getMergedAiTutorCodeWithSource = (
  code: AiTutorCodeFile[],
  source: MultiFileSource,
  aiTutorVersionFiles: ProjectFile[]
): MultiFileSource => {
  // Helper function to get folder depth (distance from root)
  const getFolderDepth = (folderId: string): number => {
    if (folderId === '0') return 0; // Root folder
    const folder = source.folders[folderId];
    if (!folder) return 0;
    return 1 + getFolderDepth(folder.parentId);
  };

  // Create a deep copy of the source to modify
  const updatedSource: MultiFileSource = {
    ...source,
    files: {...source.files},
    folders: {...source.folders},
    openFiles: source.openFiles ? [...source.openFiles] : undefined,
  };

  // For each AI code file, find and replace the matching file if there is a matching file.
  code.forEach((aiFile: AiTutorCodeFile) => {
    // First check active file is the same as the AI code file.
    const activeFile = getActiveFileForSource(source);
    console.log('activeFile', activeFile);
    console.log('aiFile', aiFile);
    if (activeFile?.name === aiFile.name) {
      // Active file is the same as the AI code file - replace it.
      updatedSource.files[activeFile.id] = {
        ...activeFile,
        contents: aiFile.contents,
      };
      return;
    }
    // Find all files with matching name
    const matchingFiles = Object.values(updatedSource.files).filter(
      file => file.name === aiFile.name
    );

    if (matchingFiles.length === 0) {
      // No matching file found, add a new file to updatedSource.
      const newFileId = getNextFileId(Object.values(updatedSource.files));
      updatedSource.files[newFileId] = {
        id: newFileId,
        name: aiFile.name,
        contents: aiFile.contents,
        folderId: DEFAULT_FOLDER_ID,
        language: aiFile.name.split('.').pop() || '',
        isAiTutorVersion: true,
      };
      aiTutorVersionFiles.push(updatedSource.files[newFileId]);
      return;
    }

    // Find the file closest to root (smallest folder depth)
    const closestFile = matchingFiles.reduce((closest, current) => {
      const closestDepth = getFolderDepth(closest.folderId);
      const currentDepth = getFolderDepth(current.folderId);
      return currentDepth < closestDepth ? current : closest;
    });
    const aiTutorVersionFile: ProjectFile = {
      ...closestFile,
      contents: aiFile.contents,
      isAiTutorVersion: true,
    };
    updatedSource.files[closestFile.id] = aiTutorVersionFile;
    aiTutorVersionFiles.push(aiTutorVersionFile);
  });
  return updatedSource;
};
