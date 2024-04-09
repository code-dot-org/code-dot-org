import React, {useState} from 'react';
import AITutorChatMessagesTable from './aiTutorChatMessagesTable';
import AITutorTeacherControls from './aiTutorTeacherControls';
import Button from '@cdo/apps/templates/Button';

/**
 * Renders table of student chat messages and toggles to control student access to AI Tutor.
 */
interface AITutorTeacherDashboardProps {
  sectionId: number;
}

const AITutorTeacherDashboard: React.FunctionComponent<
  AITutorTeacherDashboardProps
> = ({sectionId}) => {
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
        <AITutorTeacherControls sectionId={sectionId} />
      ) : (
        <AITutorChatMessagesTable sectionId={sectionId} />
      )}
    </div>
  );
};

export default AITutorTeacherDashboard;
