import React from 'react';

import styles from './teacherHomepage.module.scss';

const EMOJIS = [
  '🔥',
  '🐧',
  '👾',
  '👻',
  '🌈',
  '🤖',
  '🍄',
  '🚀',
  '🦕',
  '🛼',
  '😺',
  '☔',
  '🍩',
  '🐙',
  '🐝',
  '🥨',
  '☎️',
  '🐼',
  '🧩',
  '🐬',
  '🦄',
];

const COLORS = [
  '#EB1460',
  '#F62CAF',
  '#9C1AB1',
  '#6633B9',
  '#3D4DB7',
  '#1093F5',
  '#00BBD5',
  '#009687',
  '#46AF4A',
  '#88C440',
  '#CCDD1E',
  '#FFEC16',
  '#FFC100',
  '#FF9800',
  '#FF6505',
  '#F62C2C',
  '#7A5547',
  '#9D9D9D',
  '#5E7C8B',
  '#000000',
];

interface SectonAvatarProps {
  color: number;
  emoji: number;
}

const SectionAvatar: React.FC<SectonAvatarProps> = ({color, emoji}) => {
  return (
    <div
      className={styles.sectionAvatar}
      style={{backgroundColor: COLORS[color]}}
    >
      {EMOJIS[emoji]}
    </div>
  );
};

export default SectionAvatar;
