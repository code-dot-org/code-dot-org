import {QuizPage} from './types';

export const toBool = (value: boolean | undefined) => value ?? false;

// Groups a flat question list into pages, ascending by page number.
export function groupByPage<T extends {page: number | null}>(
  questions: T[]
): QuizPage<T>[] {
  const pages = new Map<number, T[]>();
  questions.forEach(question => {
    const page = question.page ?? 1;
    const pageQuestions = pages.get(page);
    if (pageQuestions) {
      pageQuestions.push(question);
    } else {
      pages.set(page, [question]);
    }
  });
  return Array.from(pages.entries())
    .sort(([pageA], [pageB]) => pageA - pageB)
    .map(([page, pageQuestions]) => ({page, questions: pageQuestions}));
}

export function formatSubmittedAt(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Unbounded mapping of a number to a unique letter or letters (A,B,...Z,AA,AB,...)
export function formatChoiceLetter(index: number): string {
  let n = index + 1;
  let label = '';
  while (n > 0) {
    label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}
