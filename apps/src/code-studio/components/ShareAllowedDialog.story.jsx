import React from 'react';
import { UnconnectedShareAllowedDialog as ShareAllowedDialog } from './ShareAllowedDialog';
import { action } from '@storybook/addon-actions';
import publishDialog from '@cdo/apps/templates/publishDialog/publishDialogRedux';

const fakei18n = {
    t(s) {
      return {
        'project.share_title': 'Share your project',
        'project.share_copy_link': 'Copy the link:',
        'project.close': 'Close',
        'project.advanced_share': 'Show advanced options',
        'project.embed': 'Embed',
        'project.share_embed_description': 'You can paste the embed code into an HTML page to display the project on a webpage.',
        'project.abuse.tos': `This project has been reported for violating Code.org's <a href='http://code.org/tos'>Terms of Service</a> and cannot be shared with others.`,
        'project.abuse.contact_us': `If you believe this to be an error, please <a href='https://code.org/contact'>contact us.</a>`,
        'project.share_u13_warning': 'Ask your teacher before sharing. Only share with others in your school.'
      }[s] || `<i18n>${s}</i18n>` ;
    }
  };

export default storybook => {
  storybook
    .storiesOf('ShareAllowedDialog', module)
    .withReduxStore({publishDialog})
    .addStoryTable([
      {
        name: 'basic example',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
      name: 'with thumbnail',
      story: () => {
        return (
            <ShareAllowedDialog
              isOpen={true}
              canPrint={true}
              canPublish={false}
              isPublished={false}
              isUnpublishPending={false}
              onClose={action('close')}
              onShowPublishDialog={action('show publish dialog')}
              onUnpublish={action('unpublish')}
              hideBackdrop={true}
              i18n={fakei18n}
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
    }, {
        name: 'applab',
        description: `The applab version has an advanced sharing dialog with more options`,
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="applab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with export',
        description: `This feature has not yet shipped.`,
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="applab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
                onClickExport={action('onClickExport')}
              />
          );
        }
      }, {
        name: 'with under 13 warning',
        description: `We hide social sharing buttons and display a warning for users under 13`,
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                canShareSocial={false}
                appType="gamelab"
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'abusive',
        description: `The abusive version shows a warning message`,
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={true}
                channelId="some-id"
                canShareSocial={true}
                appType="gamelab"
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with icon',
        description: `An icon can be specified for the dialog`,
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                icon="https://studio.code.org/blockly/media/skins/pvz/static_avatar.png"
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                canShareSocial={true}
                appType="gamelab"
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with publish button',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={true}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
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
      }, {
        name: 'with disabled publish button',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={true}
                isPublished={false}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with unpublish button',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={true}
                isPublished={true}
                isUnpublishPending={false}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with unpublish pending',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={true}
                isPublished={true}
                isUnpublishPending={true}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={action('onClickPopup')}
              />
          );
        }
      }, {
        name: 'with sharing for user disabled',
        story: () => {
          return (
              <ShareAllowedDialog
                isOpen={true}
                canPublish={true}
                isPublished={true}
                isUnpublishPending={true}
                onClose={action('close')}
                onShowPublishDialog={action('show publish dialog')}
                onUnpublish={action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
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
