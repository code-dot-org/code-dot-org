import {validateFileName, getFileNameWithNumberSuffix} from '@codebridge/utils';

import {JsonObjectSchema} from '@cdo/apps/aichat/types';
import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {
  getFileExtension,
  getNextFileId,
} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

// Shared JSON schema property definitions for lab AI Tutor answer schemas.
// Lab-specific properties (answerType enum, assumptions description, code
// description, pseudocode description) remain in each lab's helper.

export const GOAL_PROPERTY = {
  type: 'string' as const,
  description: 'What we are achieving this turn, limit to 1 line of text',
};

export const EXPLANATION_PROPERTY = {
  type: 'string' as const,
  description:
    "1 paragraph or less explanation of the code or plain-text answer to the student's question. Use markdown.",
};

export const NEXT_STEPS_PROPERTY = {
  type: 'string' as const,
  description:
    '1-2 concrete action(s) for student to achieve goal. Format as markdown bullets',
};

export const QUESTIONS_PROPERTY = {
  type: 'string' as const,
  description:
    'short list to confirm ambiguous details. Format as markdown bullets.',
};

export const EXAMPLE_PROPERTY = {
  type: 'string' as const,
  description:
    "1-2 concrete example(s) of the code or plain-text answer(s) to the student's question. Use markdown.",
};

export const VIDEO_URL_PROPERTY = {
  type: 'string' as const,
  description:
    'Optional. URL of a single tutorial video to share with the student, copied exactly from the available videos list. Omit if no video is relevant.',
};

export const CODE_ITEM_SCHEMA: JsonObjectSchema = {
  type: 'object',
  properties: {
    sourceCode: {type: 'string'},
    filename: {type: 'string'},
  },
  required: ['sourceCode', 'filename'],
  additionalProperties: false,
};

export const ANSWER_JSON_SCHEMA_REQUIRED: string[] = [
  'answerType',
  'nextSteps',
  'code',
  'explanation',
  'goal',
];

export const ANSWER_JSON_SCHEMA_PROPERTY_ORDERING: string[] = [
  'answerType',
  'goal',
  'assumptions',
  'code',
  'explanation',
  'pseudocode',
  'example',
  'nextSteps',
  'questions',
  'videoUrl',
];

export type AiTutorModelCodeFile = {
  filename: string;
  sourceCode: string;
};

export type AiTutorCopyPasteResponse = {
  assumptions?: string;
  code?: AiTutorModelCodeFile[];
  explanation?: string;
  pseudocode?: string;
  example?: string;
  nextSteps?: string;
  questions?: string;
  videoUrl?: string;
};

const formatSection = (title: string, content?: string): string => {
  return content ? `**${title}**\n\n${content}\n\n` : '';
};

export const formatCopyPasteResponse = (
  response: AiTutorCopyPasteResponse
): string => {
  let formattedResponse = '';
  formattedResponse += formatSection('Assumptions', response.assumptions);

  if (response.code?.length) {
    formattedResponse += `**Code**\n\n`;
    response.code.forEach(code => {
      formattedResponse += `\`${code.filename}\`\n\`\`\`\n${code.sourceCode}\n\`\`\`\n\n`;
    });
  }

  formattedResponse += formatSection('Explanation', response.explanation);
  formattedResponse += formatSection('Pseudocode', response.pseudocode);
  formattedResponse += formatSection('Example', response.example);
  formattedResponse += formatSection('Next Steps', response.nextSteps);
  formattedResponse += formatSection('Questions', response.questions);
  if (response.videoUrl) {
    formattedResponse += `\n[Watch this video](${response.videoUrl})\n`;
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
  answerType: string;
};

export type AiTutorAcceptRejectResponse = {
  explanation?: string;
  videoUrl?: string;
  code: AiTutorModelCodeFile[];
  answerType: string;
};

// Used for answer types a lab loads into the project for accept/reject.
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
        // Otherwise a file loaded from a URL keeps running its old contents.
        url: undefined,
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
        url: undefined,
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
