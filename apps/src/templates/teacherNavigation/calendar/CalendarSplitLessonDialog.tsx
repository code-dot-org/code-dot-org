import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton,
  Typography as MuiTypography,
} from '@mui/material';
import React, {useState} from 'react';

import i18n from '@cdo/locale';

import {CalendarPlanLesson, CalendarSplitLessonPart} from './calendarPlanTypes';

import styles from './calendar.module.scss';

interface CalendarSplitLessonDialogProps {
  initialParts: CalendarSplitLessonPart[];
  lesson: CalendarPlanLesson;
  onClose: () => void;
  onSave: (parts: CalendarSplitLessonPart[]) => void;
}

function distributeMinutes(totalMinutes: number, partCount: number) {
  const baseMinutes = Math.floor(totalMinutes / partCount);
  const remainder = totalMinutes % partCount;

  return Array.from(
    {length: partCount},
    (_, index) => baseMinutes + (index < remainder ? 1 : 0)
  );
}

function distributeParts(
  totalMinutes: number,
  existingParts: CalendarSplitLessonPart[],
  partCount: number
) {
  return distributeMinutes(totalMinutes, partCount).map((minutes, index) => ({
    clientId: existingParts[index]?.clientId,
    minutes,
  }));
}

const CalendarSplitLessonDialog: React.FC<CalendarSplitLessonDialogProps> = ({
  initialParts,
  lesson,
  onClose,
  onSave,
}) => {
  const expectedMinutes = lesson.duration;
  const [totalMinutes, setTotalMinutes] = useState(() =>
    initialParts.reduce((total, part) => total + part.minutes, 0)
  );
  const [parts, setParts] = useState(initialParts);

  const updateTotalMinutes = (value: number) => {
    const nextTotalMinutes = Math.max(1, value);
    setTotalMinutes(nextTotalMinutes);
    setParts(distributeParts(nextTotalMinutes, parts, parts.length));
  };

  const addCopy = () => {
    const nextPartCount = parts.length + 1;
    setParts(distributeParts(totalMinutes, parts, nextPartCount));
  };

  const removeCopy = (index: number) => {
    const nextParts = parts.filter((_, partIndex) => partIndex !== index);
    setParts(nextParts);
    setTotalMinutes(nextParts.reduce((total, part) => total + part.minutes, 0));
  };

  const updatePartMinutes = (index: number, value: number) => {
    const nextParts = parts.slice();
    nextParts[index] = {...nextParts[index], minutes: Math.max(1, value)};
    setParts(nextParts);
    setTotalMinutes(nextParts.reduce((total, part) => total + part.minutes, 0));
  };

  return (
    <Dialog
      title="Split lesson"
      closeLabel={i18n.closeDialog()}
      onClose={onClose}
      primaryButtonProps={{
        children: i18n.save(),
        onClick: () => onSave(parts),
      }}
      secondaryButtonProps={{
        children: i18n.cancel(),
        onClick: onClose,
      }}
      customContent={
        <div className={styles.splitLessonDialogContent}>
          <MuiTypography
            id="dsco-dialog-description"
            variant="body3"
            component="p"
          >
            {lesson.title}
          </MuiTypography>
          <div className={styles.splitLessonSummary}>
            <MuiTypography variant="body4" component="span">
              Expected: {expectedMinutes} min
            </MuiTypography>
            <label className={styles.splitLessonField}>
              <MuiTypography variant="body4" component="span">
                Total planned time
              </MuiTypography>
              <input
                min={1}
                type="number"
                value={totalMinutes}
                onChange={event =>
                  updateTotalMinutes(parseInt(event.target.value) || 1)
                }
              />
            </label>
          </div>
          <div className={styles.splitLessonParts}>
            {parts.map((part, index) => (
              <div
                className={styles.splitLessonPartRow}
                key={part.clientId || index}
              >
                <label className={styles.splitLessonField}>
                  <MuiTypography variant="body4" component="span">
                    Copy {index + 1}
                  </MuiTypography>
                  <input
                    min={1}
                    type="number"
                    value={part.minutes}
                    onChange={event =>
                      updatePartMinutes(
                        index,
                        parseInt(event.target.value) || 1
                      )
                    }
                  />
                </label>
                <IconButton
                  aria-label={`Remove copy ${index + 1}`}
                  disabled={parts.length === 1}
                  onClick={() => removeCopy(index)}
                  size="small"
                >
                  <FontAwesomeV6Icon iconName="trash" />
                </IconButton>
              </div>
            ))}
          </div>
          <MuiButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeV6Icon iconName="plus" />}
            onClick={addCopy}
          >
            Add copy
          </MuiButton>
        </div>
      }
    />
  );
};

export default CalendarSplitLessonDialog;
