import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import {PracticeProblemTypes} from '@cdo/generated-scripts/sharedConstants';

import {PracticeProblemData, problemTypeLabel} from './types';

import moduleStyles from './practiceProblems.module.scss';

interface PracticePreviewProps {
  problem: PracticeProblemData;
}

const CorrectMark: React.FC = () => (
  <span className={moduleStyles.correctMark}>
    <FontAwesomeV6Icon iconName="check" title="correct answer" />
  </span>
);

// Read-only rendering of a practice problem that always reveals the correct
// answer. Purpose-built rather than reusing the interactive student
// QuestionTypes components, which shuffle their options on mount and only
// reveal correctness relative to a submitted student arrangement.
const PracticePreview: React.FC<PracticePreviewProps> = ({problem}) => {
  const {problemType, problemText, solution} = problem;

  const renderBody = () => {
    switch (problemType) {
      case PracticeProblemTypes.MULTIPLE_CHOICE_SINGLE:
      case PracticeProblemTypes.MULTIPLE_CHOICE_MULTI:
        return (
          <ul className={moduleStyles.optionList}>
            {solution.map((entry, i) => (
              <li key={i} className={moduleStyles.option}>
                {entry.correct === true && <CorrectMark />}
                <Typography variant="body2" component="span">
                  {entry.option}
                </Typography>
              </li>
            ))}
          </ul>
        );

      case PracticeProblemTypes.MATCH:
        return (
          <ul className={moduleStyles.optionList}>
            {solution.map((entry, i) => (
              <li key={i} className={moduleStyles.option}>
                <Typography variant="body2" component="span">
                  {entry.option} → {String(entry.correct)}
                </Typography>
              </li>
            ))}
          </ul>
        );

      case PracticeProblemTypes.SORT: {
        // Group options under their correct category.
        const byCategory = new Map<string, string[]>();
        solution.forEach(entry => {
          const category = String(entry.correct);
          byCategory.set(category, [
            ...(byCategory.get(category) ?? []),
            entry.option,
          ]);
        });
        return (
          <div>
            {[...byCategory.entries()].map(([category, options]) => (
              <div key={category} className={moduleStyles.category}>
                <Typography variant="strong" component="div">
                  {category}
                </Typography>
                <ul className={moduleStyles.optionList}>
                  {options.map((option, i) => (
                    <li key={i} className={moduleStyles.option}>
                      <Typography variant="body2" component="span">
                        {option}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      }

      case PracticeProblemTypes.SCRAMBLE: {
        const ordered = [...solution].sort(
          (a, b) => Number(a.correct) - Number(b.correct)
        );
        return (
          <ol className={moduleStyles.orderedList}>
            {ordered.map((entry, i) => (
              <li key={i}>
                <Typography variant="body2" component="span">
                  {entry.option}
                </Typography>
              </li>
            ))}
          </ol>
        );
      }

      default:
        return (
          <Typography variant="body3" className={moduleStyles.hint}>
            No preview available for type "{problemType}".
          </Typography>
        );
    }
  };

  return (
    <div className={moduleStyles.preview}>
      <Typography
        variant="overline2"
        component="div"
        className={moduleStyles.hint}
      >
        {problemTypeLabel(problemType)}
      </Typography>
      <Typography
        variant="body1"
        component="div"
        className={moduleStyles.previewQuestion}
      >
        {problemText}
      </Typography>
      {renderBody()}
    </div>
  );
};

export default PracticePreview;
