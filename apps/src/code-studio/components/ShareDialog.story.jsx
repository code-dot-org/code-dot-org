import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { UnconnectedShareDialog as ShareDialog } from './ShareDialog';
import publishDialogReducer from '../../templates/publishDialog/publishDialogRedux';

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

// Provide the redux store because the unconnected ShareDialog renders a
// connected PublishDialog.

function configureStore() {
  return createStore(combineReducers({
    publishDialog: publishDialogReducer,
  }));
}

export default storybook => {
  storybook
    .storiesOf('ShareDialog', module)
    .addStoryTable([
      {
        name: 'basic example',
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'applab',
        description: `The applab version has an advanced sharing dialog with more options`,
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="applab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with export',
        description: `This feature has not yet shipped.`,
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="applab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
                onClickExport={storybook.action('onClickExport')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with under 13 warning',
        description: `We hide social sharing buttons and display a warning for users under 13`,
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                canShareSocial={false}
                appType="gamelab"
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'abusive',
        description: `The abusive version shows a warning message`,
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={true}
                channelId="some-id"
                canShareSocial={true}
                appType="gamelab"
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with icon',
        description: `An icon can be specified for the dialog`,
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={false}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                icon="https://studio.code.org/blockly/media/skins/pvz/static_avatar.png"
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                canShareSocial={true}
                appType="gamelab"
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with publish button',
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={true}
                isPublished={false}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with unpublish button',
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={true}
                isPublished={true}
                isUnpublishPending={false}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }, {
        name: 'with unpublish pending',
        story: () => {
          const store = configureStore();
          return (
            <Provider store={store}>
              <ShareDialog
                isOpen={true}
                isSignedIn={true}
                isPublished={true}
                isUnpublishPending={true}
                onClose={storybook.action('close')}
                onShowPublishDialog={storybook.action('show publish dialog')}
                onUnpublish={storybook.action('unpublish')}
                hideBackdrop={true}
                i18n={fakei18n}
                shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
                isAbusive={false}
                channelId="some-id"
                appType="gamelab"
                canShareSocial={true}
                onClickPopup={storybook.action('onClickPopup')}
              />
            </Provider>
          );
        }
      }
    ]);
};
