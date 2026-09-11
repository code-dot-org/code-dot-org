import {Markdown} from '@code-dot-org/markdown';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Renders a run of numbered steps as a single ordered list.
 *
 * Each step is a translated string already written as a markdown list item
 * ("1. ..."), so joining the run into one markdown source is what makes it one
 * <ol>; a Markdown per step would render a one-item list each. The list starts
 * at the first step's own number, so a run that follows other content keeps
 * counting from where that content left off. Falsy entries — a step that does
 * not apply to this section — are dropped.
 */
const MarkdownSteps = ({steps}) => (
  <Markdown content={steps.filter(Boolean).join('\n\n')} />
);

MarkdownSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
  ).isRequired,
};

export default MarkdownSteps;
