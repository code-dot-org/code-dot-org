import {Panel} from '@cdo/apps/panels/types';

// Per-slide content captured during a single Generate run so each
// slide we process can be told what came before it.
export interface PriorSlide {
  position: number;
  description: string;
  panel?: Panel;
}

// Render the running preceding-slides context as a plain-text block.
// Image URLs are deliberately left out — only the description and
// overlay text matter for continuity. Caller responsibility to skip
// emitting a heading when this returns the empty string.
export function formatPrecedingSlides(slides: PriorSlide[]): string {
  if (slides.length === 0) return '';
  return slides
    .map(s => {
      const lines: string[] = [];
      lines.push(`Slide ${s.position}:`);
      if (s.description) {
        lines.push(`  Description: ${s.description}`);
      }
      if (s.panel?.text) {
        lines.push(`  Overlay text: ${s.panel.text}`);
      }
      if (s.panel?.teacherNote) {
        lines.push(`  Teacher note: ${s.panel.teacherNote}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}
