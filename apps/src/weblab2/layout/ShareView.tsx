import Button from '@code-dot-org/component-library/button';
import React from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import commonI18n from '@cdo/locale';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/share-layout.module.scss';

const ShareView: React.FunctionComponent = () => {
  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onViewCode = () => {
    projectManager?.redirectToView();
  };

  const onRemix = () => {
    projectManager?.redirectToRemix();
  };

  return (
    <div className={moduleStyles.shareContainer}>
      <div className={moduleStyles.sidebar}>
        <Button
          text={commonI18n.viewCode()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'solid', iconName: 'code'}}
          onClick={onViewCode}
        />
        <Button
          text={commonI18n.makeMyOwn()}
          type="tertiary"
          color="black"
          size="xs"
          iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
          onClick={onRemix}
        />
      </div>
      <div className={moduleStyles.previewContainer}>
        <HTMLPreview />
      </div>
    </div>
  );
};

export default ShareView;
