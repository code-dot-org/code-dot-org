import {Button, Popover} from '@mui/material';
import {useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import TitleComposer from './TitleComposer';

interface CreateEntityButtonProps {
  /** Visible button text, e.g. "New course". */
  buttonLabel: string;
  /** Title-field label inside the popover form, e.g. "Course title". */
  fieldLabel: string;
  /** Caller builds and applies the createCourse/createUnit/createLesson op. */
  onCreate: (displayName: string) => Promise<void>;
  className?: string;
}

/**
 * "+ New course/unit/lesson" affordance, author mode only (the caller gates
 * on useCanAuthor). Same inline-popover idiom as RemoveCourseButton and
 * InsertPoint's "Write content": a small form that appends to the same
 * CurriculumChange log the AI uses, so a manually created course/unit/lesson
 * is indistinguishable from an agent-created one afterward.
 */
export default function CreateEntityButton({
  buttonLabel,
  fieldLabel,
  onCreate,
  className,
}: CreateEntityButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" /> {buttonLabel}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      >
        <TitleComposer
          fieldLabel={fieldLabel}
          submitLabel="Create"
          onCancel={close}
          onSubmit={async displayName => {
            await onCreate(displayName);
            close();
          }}
        />
      </Popover>
    </>
  );
}
