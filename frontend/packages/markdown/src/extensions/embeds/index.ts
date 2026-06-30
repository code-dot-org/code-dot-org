import type {MarkdownExtension} from '../../extension';

/**
 * Permits `<iframe>` embeds.
 *
 * Enable ONLY for non-student audiences (professional learning / facilitator
 * content). Legacy SafeMarkdown gated this server-side on
 * `participant_audience !== 'student'`; with extensions, that gating is the
 * caller's responsibility — never enable this for student-facing content.
 */
export const embeds: MarkdownExtension = {
  name: 'embeds',
  sanitizeSchema: {
    tagNames: ['iframe'],
    attributes: {
      iframe: [
        'src',
        'width',
        'height',
        'frameBorder',
        'allowFullScreen',
        'allow',
        'title',
      ],
    },
  },
};
