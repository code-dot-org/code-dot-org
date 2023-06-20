import React from 'react';
// import classnames from 'classnames';

// import Typography from '@cdo/apps/componentLibrary/typography';
// import moduleStyles from './segmentedButtons.module.scss';

type SegmentedButtonProps = {
  label: string;
};

interface SegmentedButtonsProps {
  buttons: SegmentedButtonProps[];
  size?: 'xs' | 's' | 'm' | 'l';
}

const Checkbox: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  // size = 'm',
}) => {
  return (
    <div>
      {buttons.map(button => (
        <button type="button" key={button.label}>
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default Checkbox;
