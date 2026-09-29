import {Markdown} from '@code-dot-org/markdown';
import PropTypes from 'prop-types';
import React from 'react';

// Steps are already markdown list items ("1. ..."), so joining a run into one
// source renders it as a single <ol> starting at the first step's number.
const MarkdownSteps = ({steps}) => (
  <Markdown content={steps.filter(Boolean).join('\n\n')} />
);

MarkdownSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
  ).isRequired,
};

export default MarkdownSteps;
