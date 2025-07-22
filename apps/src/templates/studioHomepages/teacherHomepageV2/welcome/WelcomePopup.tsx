import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

export interface WelcomePopupProps {
  teacherName?: string;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({teacherName}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleNext = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Welcome to your new homepage!"
      onClose={handleNext}
      primaryButtonProps={{
        text: 'Next',
        onClick: handleNext,
      }}
    >
      <div>
        <FontAwesomeV6Icon iconName="robot" />
      </div>
    </Modal>
  );
};

export default WelcomePopup;
