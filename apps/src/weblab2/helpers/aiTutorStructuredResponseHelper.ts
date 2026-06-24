import {validateFileName, getFileNameWithNumberSuffix} from '@codebridge/utils';

import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {
  ANSWER_JSON_SCHEMA_PROPERTY_ORDERING,
  ANSWER_JSON_SCHEMA_REQUIRED,
  AiTutorModelCodeFile,
  CODE_ITEM_SCHEMA,
  EXAMPLE_PROPERTY,
  EXPLANATION_PROPERTY,
  GOAL_PROPERTY,
  NEXT_STEPS_PROPERTY,
  QUESTIONS_PROPERTY,
  VIDEO_URL_PROPERTY,
} from '@cdo/apps/aiTutor/helpers/aiTutorResponseHelpers';
import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {
  getFileExtension,
  getNextFileId,
} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
import {AI_TUTOR_ANSWER_TYPES} from '@cdo/apps/weblab2/types';

const getAnswerJsonSchema = (): JsonObjectSchema => {
  return {
    type: 'object',
    properties: {
      answerType: {
        type: 'string',
        enum: [...AI_TUTOR_ANSWER_TYPES],
      },
      goal: GOAL_PROPERTY,
      assumptions: {
        type: 'string',
        description:
          'Explicit design choices you made from the wireframe. Format as bullets.',
      },
      code: {
        type: 'array',
        items: CODE_ITEM_SCHEMA,
        description:
          '`text`, `html`, `css`, `js` or `json` fences. Limit to one language (text, html, css, js, or json) across the entire list. ' +
          'The list can be empty. Code should be formatted with appropriate newlines and indentation. ' +
          'When providing modifications to a file in the student code, provide the entire contents of the file. ' +
          'Code should be formatted with appropriate newlines and indentation.',
      },
      explanation: EXPLANATION_PROPERTY,
      nextSteps: NEXT_STEPS_PROPERTY,
      questions: QUESTIONS_PROPERTY,
      pseudocode: {
        type: 'string',
        description:
          'Pseudocode in plain English only (no JS). Wrap the pseudocode in a markdown fenced code block with language tag `text` so newlines and indentation are preserved. Use markdown outside the block only if needed.',
      },
      example: EXAMPLE_PROPERTY,
      videoUrl: VIDEO_URL_PROPERTY,
    },
    // We return answerType and goal but do not show them to the student.
    // These are used to help guide the AI's response.
    required: ANSWER_JSON_SCHEMA_REQUIRED,
    propertyOrdering: ANSWER_JSON_SCHEMA_PROPERTY_ORDERING,
    additionalProperties: false,
  };
};

// This list is used to determine if the AI Tutor response should trigger the accept-reject flow
// for which we format the model response with formatAcceptRejectResponse. Otherwise, we format
// the model response with formatCopyPasteResponse.
export const acceptRejectAnswerTypes = [
  'buildHTML',
  'buildCSS',
  'buildJavaScript',
  'buildJSON',
];

const acceptRejectCodeFileTypes = ['html', 'css', 'js', 'json'];

/**
 * Validates that all files have file types that are supported in the accept-reject flow.
 * Returns true if all files are of supported types, false otherwise.
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

type AiTutorCodeFile = {
  name: string;
  contents: string;
};

type AcceptRejectFormattedResponse = {
  explanation: string;
  code: AiTutorCodeFile[];
  answerType: string;
};

type AiTutorAcceptRejectResponse = {
  explanation?: string;
  videoUrl?: string;
  code: AiTutorModelCodeFile[];
  answerType: string;
};

const formatSection = (title: string, content?: string): string => {
  return content ? `**${title}**\n\n${content}\n\n` : '';
};

// This is used when the AI Tutor response's answerType is 'buildHTML', 'buildCSS',
// 'buildJavaScript', or 'buildJSON'.
export const formatAcceptRejectResponse = (
  response: AiTutorAcceptRejectResponse
): AcceptRejectFormattedResponse => {
  const explanation =
    formatSection('Explanation', response.explanation) +
    (response.videoUrl ? `\n[Watch this video](${response.videoUrl})\n` : '');
  return {
    explanation,
    code: response.code.map(codeFile => ({
      name: codeFile.filename,
      contents: codeFile.sourceCode,
    })),
    answerType: response.answerType,
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
    const firstHtmlFile = aiTutorVersionFiles.find(
      f => getFileExtension(f.name) === 'html'
    );
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
