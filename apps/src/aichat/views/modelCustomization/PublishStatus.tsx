import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

const PublishStatus: React.FunctionComponent<{
  iconName: string;
  iconStyle: string;
  content: React.ReactNode;
  contentStyle: string;
  containerStyle: string;
}> = ({iconName, iconStyle, content, contentStyle, containerStyle}) => {
  return (
    <div className={containerStyle}>
      <FontAwesomeV6Icon iconName={iconName} className={iconStyle} />
      <span className={contentStyle}>{content}</span>
    </div>
  );
};

export default PublishStatus;
