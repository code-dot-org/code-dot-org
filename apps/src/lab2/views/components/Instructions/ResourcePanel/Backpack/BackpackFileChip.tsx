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
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import moduleStyles from './backpack-file-chip.module.scss';

interface BackpackFileChipProps {
  filename: string;
  backpackApi: BackpackClientApi;
  addAlert: (type: 'success' | 'danger', message: string) => void;
  validateFilename: (filename: string) => {
    isSupportFilename: boolean;
    isDuplicateFilename: boolean;
  };
  saveFile: (filename: string, contents: string) => Promise<boolean>;
  createNewFile: (filename: string, contents: string) => Promise<boolean>;
}

const BackpackFileChip: React.FC<BackpackFileChipProps> = ({
  filename,
  backpackApi,
  addAlert,
  validateFilename,
  saveFile,
  createNewFile,
}) => {
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
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  // TODO: log errors to cloudwatch
  // TODO: chain of modals to handle duplicates
  const handleAdd = async () => {
    const {isSupportFilename, isDuplicateFilename} = validateFilename(filename);
    const errorMessage = `An error occurred while adding ${filename} to your project, please try again.`;
    const response = await backpackApi.fetchFileResponse(filename);
    if (!response || response instanceof Error) {
      addAlert('danger', errorMessage);
      return;
    }
    let fileContent = '';
    let url: string | undefined = undefined;
    if (response?.headers.get('Content-Type')?.startsWith('image/')) {
      // Handle image file content as a blob, and upload as an asset.
      // Store the url as the new file contents.
      const blob = await response.blob();
      const uuid = createUuid();
      const fileType = filename.split('.').pop();
      const uploadUrl = `/v3/assets/${channelId}/${uuid}.${fileType}`;
      try {
        await HttpClient.put(uploadUrl, blob);
      } catch (error) {
        addAlert('danger', errorMessage);
        return;
      }
      url = uploadUrl;
    } else {
      fileContent = await response.text();
    }
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
          menuPlacement="right"
        />
      </div>
    </div>
  );
};

export default BackpackFileChip;
