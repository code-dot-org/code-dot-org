import React, {useState} from 'react';

import moduleStyles from '../lesson-generator.module.scss';
import sharedStyles from '@cdo/apps/levelbuilder/curriculum-generator/curriculum-generator.module.scss';

interface SuppliedCodeFieldProps {
  id: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

// Open state is seeded from whether code is present, then the user's.
const SuppliedCodeField: React.FC<SuppliedCodeFieldProps> = ({
  id,
  value,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = useState(!!value);
  return (
    <details
      className={`${sharedStyles.collapsibleBlock} ${moduleStyles.suppliedCode}`}
      open={open}
      onToggle={e => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary>Supplied code (optional)</summary>
      <p id={`${id}-help`}>
        Starter code for this level — the AI reproduces it in the starter files
        and builds the level around it.
      </p>
      <textarea
        id={id}
        aria-label="Supplied code"
        aria-describedby={`${id}-help`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste starter code, optionally with file-name labels."
        spellCheck={false}
        disabled={disabled}
      />
    </details>
  );
};

export default SuppliedCodeField;
