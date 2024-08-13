import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';
import project from '@cdo/apps/code-studio/projectRedux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import {reduxStore} from '@cdo/storybook/decorators';

import {UnconnectedShareAllowedDialog as ShareAllowedDialog} from './ShareAllowedDialog';

export default {
  component: ShareAllowedDialog,
};

const defaultArgs = {
  isOpen: true,
  canPublish: false,
  isPublished: false,
  isUnpublishPending: false,
  onClose: action('close'),
  onShowPublishDialog: action('show publish dialog'),
  onUnpublish: action('unpublish'),
  openLibraryCreationDialog: action('open library creation dialog'),
  hideBackdrop: true,
  shareUrl: 'https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ',
  isAbusive: false,
  channelId: 'some-id',
  appType: 'gamelab',
  canShareSocial: true,
  onClickPopup: action('onClickPopup'),
};

const Template = args => (
  <Provider
    store={reduxStore({publishDialog, pageConstants, shareDialog, project})}
  >
    {/* ShareAllowedDialog has a marginLeft of -360 so it shows up correctly on the page.
        Nesting inside a div so it appears in storybook correctly */}
    <div style={{marginLeft: 360}}>
      <ShareAllowedDialog {...args} />
    </div>
  </Provider>
);

export const SpriteLab = Template.bind({});
SpriteLab.args = {
  ...defaultArgs,
  appType: 'spritelab',
};

export const WithThumbnail = Template.bind({});
WithThumbnail.args = {
  ...defaultArgs,
  canPrint: true,
  thumbnailUrl:
    'https://studio.code.org/v3/files/eDTsqHl7lQygvEa1j3HSwlUFHAu507gI54D_PUy5mWE/.metadata/thumbnail.png',
};

export const AppLab = Template.bind({});
AppLab.args = {
  ...defaultArgs,
  appType: 'applab',
};

export const WithExportForWeb = Template.bind({});
WithExportForWeb.args = {
  ...defaultArgs,
  appType: 'applab',
  canShareSocial: true,
  exportApp: action('onClickExport'),
};

export const WithUnder13Warning = Template.bind({});
WithUnder13Warning.args = {
  ...defaultArgs,
  canShareSocial: false,
};

export const Abusive = Template.bind({});
Abusive.args = {
  ...defaultArgs,
  isAbusive: true,
};

export const WithPublishButton = Template.bind({});
WithPublishButton.args = {
  ...defaultArgs,
  canPublish: true,
  thumbnailUrl:
    'https://studio.code.org/v3/files/eDTsqHl7lQygvEa1j3HSwlUFHAu507gI54D_PUy5mWE/.metadata/thumbnail.png',
};

export const WithDisabledPublishButton = Template.bind({});
WithDisabledPublishButton.args = {
  ...defaultArgs,
  canPublish: true,
};

export const WithUnpublishButton = Template.bind({});
WithUnpublishButton.args = {
  ...defaultArgs,
  canPublish: true,
  isPublished: true,
};

export const WithUnpublishPending = Template.bind({});
WithUnpublishPending.args = {
  ...defaultArgs,
  canPublish: true,
  isPublished: true,
  isUnpublishPending: true,
};

export const WithSharingForUserDisabled = Template.bind({});
WithSharingForUserDisabled.args = {
  ...defaultArgs,
  canPublish: true,
  isPublished: true,
  isUnpublishPending: true,
  userSharingDisabled: true,
};

export const InRestrictedShareMode = Template.bind({});
InRestrictedShareMode.args = {
  ...defaultArgs,
  canPublish: true,
  inRestrictedShareMode: true,
  appType: 'spritelab',
};
