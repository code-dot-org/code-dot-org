import {Button} from '@code-dot-org/component-library/button';
import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useMemo} from 'react';

import {getFileIconNameAndStyle} from '@cdo/apps/codebridge';

import moduleStyles from './backpack-file-chip.module.scss';

interface BackpackFileChipProps {
  filename: string;
}

const BackpackFileChip: React.FC<BackpackFileChipProps> = ({filename}) => {
  const fileExtension = filename.split('.').pop()?.toUpperCase();
  const fileIcon = useMemo(
    () =>
      getFileIconNameAndStyle({
        name: filename,
        id: '',
        language: '',
        contents: '',
        folderId: '',
      }),
    [filename]
  );

  const handleAdd = () => {
    console.log('adding file from backpack:', filename);
  };

  const handleDelete = () => {
    console.log('deleting file from backpack:', filename);
  };

  return (
    <div className={moduleStyles.backpackFileChip}>
      <div className={moduleStyles.fileIconContainer}>
        <FontAwesomeV6Icon
          iconName={fileIcon.iconName}
          iconStyle={fileIcon.iconStyle}
          className={moduleStyles.fileIcon}
          iconFamily={fileIcon.isBrand ? 'brands' : undefined}
        />
      </div>
      <div className={moduleStyles.fileInfo} title={filename}>
        <BodyThreeText className={moduleStyles.infoText}>
          <StrongText>{filename}</StrongText>
        </BodyThreeText>
        <BodyFourText className={moduleStyles.infoText}>
          {fileExtension}
        </BodyFourText>
      </div>
      <div className={moduleStyles.fileActions}>
        <Button
          size="xs"
          isIconOnly
          icon={{iconName: 'plus'}}
          color="gray"
          type="secondary"
          onClick={handleAdd}
        />
        <ActionDropdown
          name={`backpack-options-${filename}`}
          options={[
            {
              value: 'delete',
              label: 'Delete from Backpack',
              onClick: handleDelete,
              isOptionDestructive: true,
              icon: {iconName: 'trash', iconStyle: 'solid'},
            },
          ]}
          labelText={`${filename} options`}
          size={'xs'}
          triggerButtonProps={{
            color: 'gray',
            icon: {iconName: 'ellipsis-vertical'},
            isIconOnly: true,
            type: 'tertiary',
            size: 'xs',
          }}
        />
      </div>
    </div>
  );
};

export default BackpackFileChip;
