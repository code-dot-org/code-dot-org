import React from 'react';
import {UnconnectedShareAllowedDialog as ShareAllowedDialog} from './ShareAllowedDialog';
import {action} from '@storybook/addon-actions';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import shareDialog from '@cdo/apps/code-studio/components/shareDialogRedux';

export default storybook => {
  storybook
    .storiesOf('ShareAllowedDialog', module)
    .withReduxStore({
      publishDialog,
      pageConstants,
      shareDialog
    })
    .addStoryTable([
      {
        name: 'basic example',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with thumbnail',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPrint={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              thumbnailUrl="https://studio.code.org/v3/files/eDTsqHl7lQygvEa1j3HSwlUFHAu507gI54D_PUy5mWE/.metadata/thumbnail.png"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'applab',
        description: `The applab version has an advanced sharing dialog with more options`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="applab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with export for web',
        description: `The Export for Web section appears in advanced options with an Export button.`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="applab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
              exportApp={action('onClickExport')}
            />
          );
        }
      },
      {
        name: 'with export for expo',
        description: `The Run Natively section appears in advanced options with two buttons.`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={true}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="applab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
              exportApp={action('onClickExport')}
            />
          );
        }
      },
      {
        name: 'with under 13 warning',
        description: `We hide social sharing buttons and display a warning for users under 13`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              canShareSocial={false}
              appType="gamelab"
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'abusive',
        description: `The abusive version shows a warning message`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={true}
              channelId="some-id"
              canShareSocial={true}
              appType="gamelab"
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with icon',
        description: `An icon can be specified for the dialog`,
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              icon="https://studio.code.org/blockly/media/skins/pvz/static_avatar.png"
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              canShareSocial={true}
              appType="gamelab"
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with publish button',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={true}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              thumbnailUrl="https://studio.code.org/v3/files/eDTsqHl7lQygvEa1j3HSwlUFHAu507gI54D_PUy5mWE/.metadata/thumbnail.png"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with disabled publish button',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={true}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with unpublish button',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={true}
              isPublished={true}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with unpublish pending',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={true}
              isPublished={true}
              isUnpublishPending={true}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
            />
          );
        }
      },
      {
        name: 'with sharing for user disabled',
        story: () => {
          return (
            <ShareAllowedDialog
              allowExportExpo={false}
              isOpen={true}
              canPublish={true}
              isPublished={true}
              isUnpublishPending={true}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              openLibraryCreationDialog={action('open library creation dialog')}
              hideBackdrop={true}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={action('onClickPopup')}
              userSharingDisabled={true}
            />
          );
        }
      }
    ]);
};
