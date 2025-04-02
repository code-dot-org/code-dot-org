import React from 'react';

import styles from './teacherHomepage.module.scss';

interface SectonAvatarProps {
  color: string;
  emoji: string;
}

const SectionAvatar: React.FC<SectonAvatarProps> = ({color, emoji}) => {
  return <div className={styles.sectionAvatar}>{'test'}</div>;
};

export default SectionAvatar;
