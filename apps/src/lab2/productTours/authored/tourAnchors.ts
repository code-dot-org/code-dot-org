import {AppName} from '@cdo/apps/lab2/types';

import {ailabSelectorAnchors} from './ailabTourAnchors';

// A part of a lab that an authored tour step can point at. Labs mark one with
//   data-tour-anchor="train-button" data-tour-label="Train model button"
// on the element itself. Saved tours store the name, so the markup around it
// can change without breaking them; renaming an anchor does break them.
// Several elements may share a name: a step points at the first, and a click
// on any of them meets a click requirement.
export interface TourAnchor {
  name: string;
  // Shown to levelbuilders in the tour editor.
  label: string;
}

export interface TourAnchorMatch {
  anchor: TourAnchor;
  element: Element;
}

// A part that cannot carry the attribute, such as a tab drawn by a design
// system component, found by selector instead.
export interface SelectorTourAnchor extends TourAnchor {
  selector: string;
}

const NAME_ATTRIBUTE = 'data-tour-anchor';
const LABEL_ATTRIBUTE = 'data-tour-label';

const SelectorAnchorsPerLab: Partial<Record<AppName, SelectorTourAnchor[]>> = {
  ailab: ailabSelectorAnchors,
};

const selectorAnchors = (appName: string | undefined) =>
  SelectorAnchorsPerLab[appName as AppName] ?? [];

const quoted = (value: string) => `"${value.replace(/["\\]/g, '\\$&')}"`;

export const tourAnchorSelector = (
  appName: string | undefined,
  name: string
): string =>
  selectorAnchors(appName).find(anchor => anchor.name === name)?.selector ??
  `[${NAME_ATTRIBUTE}=${quoted(name)}]`;

const attributeAnchor = (element: Element): TourAnchor => {
  const name = element.getAttribute(NAME_ATTRIBUTE) ?? '';
  return {
    name,
    label:
      element.getAttribute(LABEL_ATTRIBUTE) ??
      element.getAttribute('aria-label') ??
      name,
  };
};

// Every element on the page that a step can point at right now.
export const findTourAnchorElements = (
  appName: string | undefined
): TourAnchorMatch[] => [
  ...Array.from(document.querySelectorAll(`[${NAME_ATTRIBUTE}]`)).map(
    element => ({anchor: attributeAnchor(element), element})
  ),
  ...selectorAnchors(appName).flatMap(({name, label, selector}) =>
    Array.from(document.querySelectorAll(selector)).map(element => ({
      anchor: {name, label},
      element,
    }))
  ),
];

// Returns the innermost anchor that contains the given element.
export const findTourAnchorAt = (
  appName: string | undefined,
  element: Element
): TourAnchorMatch | undefined => {
  const candidates: TourAnchorMatch[] = [];
  const marked = element.closest(`[${NAME_ATTRIBUTE}]`);
  if (marked) {
    candidates.push({anchor: attributeAnchor(marked), element: marked});
  }
  selectorAnchors(appName).forEach(({name, label, selector}) => {
    const match = element.closest(selector);
    if (match) {
      candidates.push({anchor: {name, label}, element: match});
    }
  });
  return candidates.reduce<TourAnchorMatch | undefined>(
    (innermost, candidate) =>
      !innermost || innermost.element.contains(candidate.element)
        ? candidate
        : innermost,
    undefined
  );
};
