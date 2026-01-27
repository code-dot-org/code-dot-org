import {validateFileName, getFileNameWithNumberSuffix} from '@codebridge/utils';

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
            sourceCode: {
              type: 'string',
            },
            filename: {type: 'string'},
          },
          required: ['sourceCode', 'filename'],
          additionalProperties: false,
        },
        description:
          '`html`, `css`, or `js` fences. Limit to one language (html, css, or js) across the entire list. ' +
          'The list can be empty. Code should be formatted with appropriate newlines and indentation. ' +
          'When providing modifications to a file in the student code, provide the entire contents of the file. ' +
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

// This list is used to determine if the AI Tutor response should trigger the accept-reject flow
// for which we format the model response with formatAcceptRejectResponse. Otherwise, we format
// the model response with formatCopyPasteResponse.
export const acceptRejectAnswerTypes = [
  'Build HTML',
  'Build CSS',
  'Build JavaScript',
];

const acceptRejectCodeFileTypes = ['html', 'css', 'js'];

/**
 * Validates that all files have file types that are supported in the accept-reject flow.
 * Returns true if all files are html, css, or js files.
 */
export const isAcceptRejectCodeFileTypes = (
  files: Array<{name: string}>
): boolean => {
  let isValid = true;
  files.forEach(file => {
    const fileType = file.name.split('.').pop();
    if (fileType && !acceptRejectCodeFileTypes.includes(fileType)) {
      isValid = false;
    }
  });
  return isValid;
};

export const aiTutorResponseJsonSchema: JsonObjectSchema = {
  type: 'object',
  properties: {
    answer: getAnswerJsonSchema(),
  },
  required: ['answer'],
  additionalProperties: false,
};

/**
 * Helper function to format a section with a title and optional content.
 * Returns an empty string if content is not provided.
 */
const formatSection = (title: string, content?: string): string => {
  return content ? `**${title}**\n\n${content}\n\n` : '';
};

// This is used when the AI Tutor response's tutorMode is not 'Build HTML', 'Build CSS', nor 'Build JavaScript'.
// Parsed json comes in as 'any', but it follows the structure defined in getAnswerJsonSchemaAcceptReject().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatCopyPasteResponse = (response: any): string => {
  let formattedResponse = '';
  formattedResponse += formatSection('Assumptions', response.assumptions);

  if (response.code && response.code.length > 0) {
    formattedResponse += `**Code**\n\n`;
    // Parsed json comes in as 'any'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.code.forEach((code: any) => {
      formattedResponse += `\`${code.filename}\`\n\`\`\`\n${code.sourceCode}\n\`\`\`\n\n`;
    });
  }

  formattedResponse += formatSection('Explanation', response.explanation);
  formattedResponse += formatSection('Next Steps', response.nextSteps);
  formattedResponse += formatSection('Questions', response.questions);

  return formattedResponse;
};

type AiTutorCodeFile = {
  name: string;
  contents: string;
};

type AcceptRejectFormattedResponse = {
  explanation: string;
  code: AiTutorCodeFile[];
  answerType: string;
};

// This is used when the AI Tutor response's tutorMode is 'Build HTML', 'Build CSS', or 'Build JavaScript'.
// Parsed json comes in as 'any', but it follows the structure defined in acceptRejectJsonSchema.
export const formatAcceptRejectResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): AcceptRejectFormattedResponse => {
  return {
    explanation: formatSection('Explanation', response.explanation),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: response.code.map((codeFile: any) => ({
      name: codeFile.filename,
      contents: codeFile.sourceCode,
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
    // First check active file is the same as the AI code file.
    const activeFile = getActiveFileForSource(source);
    if (activeFile?.name === aiFile.name) {
      // Active file is the same as the AI code file - replace it.
      const aiTutorVersionFile: ProjectFile = {
        ...updatedSource.files[activeFile.id],
        contents: aiFile.contents,
        isAiTutorVersionUpdated: true,
      };
      aiTutorVersionFiles.push(aiTutorVersionFile);
      updatedSource.files[activeFile.id] = aiTutorVersionFile;
      return;
    }
    // Find all files with matching name, if any.
    const matchingFiles = Object.values(updatedSource.files).filter(
      f => f.name === aiFile.name
    );
    if (matchingFiles.length === 1) {
      // One matching file found, replace it.
      updatedSource.files[matchingFiles[0].id] = {
        ...matchingFiles[0],
        contents: aiFile.contents,
        isAiTutorVersionUpdated: true,
      };
      aiTutorVersionFiles.push(updatedSource.files[matchingFiles[0].id]);
      return;
    } else {
      // No matching files found OR multiple matching files found.
      // For both of these cases, add a new file to updatedSource in the root folder to avoid overwriting the wrong file.
      const newFileId = getNextFileId(Object.values(updatedSource.files));
      if (matchingFiles.length > 0) {
        // Validate the file name of the AI code file.
        let validateFileNameError;
        do {
          const validateFileNameError = validateFileName({
            fileName: aiFile.name,
            folderId: DEFAULT_FOLDER_ID,
            projectFiles: updatedSource.files,
            isStartMode: false,
            validationFile: undefined,
          });
          if (validateFileNameError) {
            aiFile.name = getFileNameWithNumberSuffix(aiFile.name);
          }
        } while (validateFileNameError);
      }
      const aiTutorVersionFile: ProjectFile = {
        id: newFileId,
        name: aiFile.name,
        contents: aiFile.contents,
        folderId: DEFAULT_FOLDER_ID,
        language: aiFile.name.split('.').pop() || '',
        isAiTutorVersionCreated: true,
      };
      updatedSource.files[newFileId] = aiTutorVersionFile;
      aiTutorVersionFiles.push(aiTutorVersionFile);
      return;
    }
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
