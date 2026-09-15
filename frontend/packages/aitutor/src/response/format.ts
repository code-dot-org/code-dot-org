// An answer, as prose.
//
// Verbatim from `formatCopyPasteResponse` in
// `apps/src/aiTutor/helpers/aiTutorResponseHelpers.ts` — the section headings,
// their order, the two newlines after each, the backticked filename above each
// fence, and the video link last.
//
// It is called "copy paste" in the legacy because it is what the student gets
// when the answer is NOT something the lab can apply for them: the code is
// there, fenced and labelled with the file it belongs in, and they move it
// across themselves. Every answer takes this path unless the host said it could
// apply the change (`response/proposal`).

import type {Answer} from './schema';

const section = (title: string, content?: string): string =>
  content ? `**${title}**\n\n${content}\n\n` : '';

export const formatAnswer = (answer: Answer): string => {
  let out = '';
  out += section('Assumptions', answer.assumptions);

  if (answer.code?.length) {
    out += `**Code**\n\n`;
    for (const file of answer.code) {
      out += `\`${file.filename}\`\n\`\`\`\n${file.sourceCode}\n\`\`\`\n\n`;
    }
  }

  out += section('Explanation', answer.explanation);
  out += section('Pseudocode', answer.pseudocode);
  out += section('Example', answer.example);
  out += section('Next Steps', answer.nextSteps);
  out += section('Questions', answer.questions);
  if (answer.videoUrl) {
    out += `\n[Watch this video](${answer.videoUrl})\n`;
  }

  return out;
};

/**
 * The prose that accompanies a proposal.
 *
 * A proposal shows its files as chips and its reasoning as text, so the code
 * fences would be the same content twice — once unreadably. Ported from
 * `formatAcceptRejectResponse`, which makes the same cut.
 */
export const formatProposalText = (answer: Answer): string =>
  section('Explanation', answer.explanation) +
  (answer.videoUrl ? `\n[Watch this video](${answer.videoUrl})\n` : '');
