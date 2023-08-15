import React, {useState, useContext} from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import {ChatWorkspaceContext} from './ChatWorkspace';

const prompts = [
  "Let's dance a lot!",
  'Just wave your hands around for now.',
  'Start tapping your feet',
  'Stop tapping your feet',
  'Start moving your hands around',
  'Stop moving your hands around',
  'Start shaking your body',
  'Stop shaking your body',
  'Stop dancing',
  'Do the funky chicken',
  'Dance a little bit but not too much',
];

function getRandomSubarray(arr: any, size: any) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const onSubmit = useContext(ChatWorkspaceContext)?.onSubmit;

  const somePrompts = getRandomSubarray(prompts, 3);

  return (
    <div className={moduleStyles.UserChatMessageEditor}>
      {/*<textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />*/}
      {somePrompts?.map((prompt: string, index: number) => {
        return (
          <Button
            key={index}
            text={prompt}
            icon="arrow-up"
            onClick={() => {
              onSubmit?.(prompt);
              setUserMessage('');
            }}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        );
      })}
    </div>
  );
};

export default UserChatMessageEditor;
