import React, {useState} from 'react';
import InteractionsTable from './InteractionsTable';
import AccessControls from './AccessControls';
import Button from '@cdo/apps/templates/Button';

/**
 * Renders table of student chat messages and toggles to control student access to AI Tutor.
 */
interface TutorTabProps {
  sectionId: number;
}

const TutorTab: React.FC<TutorTabProps> = ({sectionId}) => {
  const [showControls, setShowControls] = useState<boolean>(false);

  const onClickControls = () => {
    setShowControls(true);
  };

  const onClickShowChats = () => {
    setShowControls(false);
  };

  return (
    <div>
      <Button
        color={Button.ButtonColor.brandSecondaryDefault}
        key="controlAccess"
        onClick={onClickControls}
        size={Button.ButtonSize.default}
        text="Control Student Access to AI Tutor"
        disabled={showControls}
      />
      <Button
        color={Button.ButtonColor.brandSecondaryDefault}
        key="showChats"
        onClick={onClickShowChats}
        size={Button.ButtonSize.default}
        text="Show Student Chats with AI Tutor"
        disabled={!showControls}
      />
      {showControls ? (
        <AccessControls sectionId={sectionId} />
      ) : (
        <InteractionsTable sectionId={sectionId} />
      )}
    </div>
  );
};

export default TutorTab;
