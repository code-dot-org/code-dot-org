import React from 'react';
import BaseDialog from '../../templates/BaseDialog';
import AdvancedShareOptions from './AdvancedShareOptions';
import AbuseError from './abuse_error';
import SendToPhone from './SendToPhone';
import color from '../../color';
import * as applabConstants from '../../applab/constants';
import * as gamelabConstants from '../../gamelab/constants';

function select(event) {
  event.target.select();
}

const styles = {
  abuseStyle: {
    border: '1px solid',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20
  },
  abuseTextStyle: {
    color: '#b94a48',
    fontSize: 14
  },
  shareWarning: {
    color: color.red,
    fontSize: 13,
    fontWeight: 'bold'
  },
};


function checkImageReachability(imageUrl, callback) {
  const img = new Image();
  img.onabort = () => callback(false);
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
  img.src = (
    imageUrl +
    (imageUrl.indexOf('?') < 0 ? '?' : '&') +
    '__cacheBust=' + Math.random()
  );
}

/**
 * Share Dialog used by projects
 */
var ShareDialog = React.createClass({
  propTypes: {
    i18n: React.PropTypes.shape({
      t: React.PropTypes.func.isRequired,
    }).isRequired,
    icon: React.PropTypes.string,
    shareUrl: React.PropTypes.string.isRequired,
    isAbusive: React.PropTypes.bool.isRequired,
    channelId: React.PropTypes.string.isRequired,
    appType: React.PropTypes.string.isRequired,
    onClickPopup: React.PropTypes.func.isRequired,
    onClickExport: React.PropTypes.func,
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: React.PropTypes.bool.isRequired,
  },

  getInitialState: function () {
    return {
      isOpen: true,
      showSendToPhone: false,
      showAdvancedOptions: false,
      exporting: false,
      exportError: null,
      isTwitterAvailable: false,
      isFacebookAvailable: false,
    };
  },

  componentDidMount() {
    if (this.props.canShareSocial) {
      // check if twitter and facebook are actually available
      // and not blocked by network firewall
      checkImageReachability(
        'https://graph.facebook.com/Code.org/picture',
        isFacebookAvailable => this.setState({isFacebookAvailable})
      );
      checkImageReachability(
        'https://twitter.com/codeorg/profile_image?size=mini',
        isTwitterAvailable => this.setState({isTwitterAvailable})
      );
    }
  },

  componentWillReceiveProps: function (newProps) {
    this.setState({isOpen: true});
  },

  close: function () {
    this.setState({isOpen: false});
  },

  showSendToPhone: function (event) {
    this.setState({
      showSendToPhone: true,
      showAdvancedOptions: false,
    });
    event.preventDefault();
  },

  showAdvancedOptions() {
    this.setState({
      showSendToPhone: false,
      showAdvancedOptions: true,
    });
  },

  clickExport: function () {
    this.setState({exporting: true});
    this.props.onClickExport().then(
      () => this.setState({exporting: false}),
      () => {
        this.setState({
          exporting: false,
          exportError: 'Failed to export project. Please try again later.'
        });
      }
    );
  },

  render: function () {
    var image;
    var modalClass = 'modal-content';
    if (this.props.icon) {
      image = <img className="modal-image" src={this.props.icon}/>;
    } else {
      modalClass += ' no-modal-icon';
    }

    var facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" +
                           encodeURIComponent(this.props.shareUrl);
    var twitterShareUrl = "https://twitter.com/intent/tweet?url=" +
                          encodeURIComponent(this.props.shareUrl) +
                          "&amp;text=Check%20out%20what%20I%20made%20@codeorg" +
                          "&amp;hashtags=HourOfCode&amp;related=codeorg";

    const showShareWarning = (
      !this.props.canShareSocial &&
      (this.props.appType === 'applab' || this.props.appType === 'gamelab')
    );
    let embedOptions;
    if (this.props.appType === 'applab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: applabConstants.APP_HEIGHT + 140,
        iframeWidth: applabConstants.APP_WIDTH + 32,
      };
    } else if (this.props.appType === 'gamelab') {
      embedOptions = {
        // If you change this width and height, make sure to update the
        // #visualizationColumn.wireframeShare css
        iframeHeight: gamelabConstants.GAME_HEIGHT + 357,
        iframeWidth: gamelabConstants.GAME_WIDTH + 32,
      };
    }
    return (
      <BaseDialog
        useDeprecatedGlobalStyles
        isOpen={this.state.isOpen}
        handleClose={this.close}
        hideBackdrop={this.props.hideBackdrop}
      >
        <div>
          {image}
          <div id="project-share" className={modalClass} style={{position: 'relative'}}>
            <p className="dialog-title">{this.props.i18n.t('project.share_title')}</p>
            {this.props.isAbusive &&
             <AbuseError
               i18n={{
                 tos: this.props.i18n.t('project.abuse.tos'),
                 contact_us: this.props.i18n.t('project.abuse.contact_us')
               }}
               className="alert-error"
               style={styles.abuseStyle}
               textStyle={styles.abuseTextStyle}
             />}
            {showShareWarning &&
             <p style={styles.shareWarning}>
               {this.props.i18n.t('project.share_u13_warning')}
             </p>}
            <p style={{fontSize: 20}}>
              {this.props.i18n.t('project.share_copy_link')}
            </p>
            <div style={{marginBottom: 10}}>
              <input
                type="text"
                id="sharing-input"
                onClick={select}
                readOnly="true"
                value={this.props.shareUrl}
                style={{cursor: 'copy', width: 465}}
              />
            </div>
            <div className="social-buttons">
              <a id="sharing-phone" href="" onClick={this.showSendToPhone}>
                <i className="fa fa-mobile-phone" style={{fontSize: 36}}></i>
                <span>Send to phone</span>
              </a>
              {this.props.canShareSocial &&
               <span>
                 {this.state.isFacebookAvailable &&
                  <a
                    href={facebookShareUrl}
                    target="_blank"
                    onClick={this.props.onClickPopup.bind(this)}
                  >
                    <i className="fa fa-facebook"></i>
                  </a>}
                 {this.state.isTwitterAvailable &&
                  <a href={twitterShareUrl} target="_blank" onClick={this.props.onClickPopup.bind(this)}>
                    <i className="fa fa-twitter"></i>
                  </a>}
               </span>}
            </div>
            {this.state.showSendToPhone &&
             <SendToPhone
               channelId={this.props.channelId}
               appType={this.props.appType}
               styles={{label:{marginTop: 15, marginBottom: 0}}}
             />}
            {(this.props.appType === 'applab' || this.props.appType === 'gamelab') &&
             <AdvancedShareOptions
               i18n={this.props.i18n}
               onClickExport={this.props.onClickExport}
               expanded={this.state.showAdvancedOptions}
               onExpand={this.showAdvancedOptions}
               channelId={this.props.channelId}
               embedOptions={embedOptions}
             />}
            {/* Awkward that this is called continue-button, when text is
            close, but id is (unfortunately) used for styling */}
            <button
              id="continue-button"
              style={{position: 'absolute', right: 0, bottom: 0, margin: 0}}
              onClick={this.close}
            >
              {this.props.i18n.t('project.close')}
            </button>
          </div>
        </div>
      </BaseDialog>
    );
  }
});
module.exports = ShareDialog;

if (BUILD_STYLEGUIDE) {
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

  ShareDialog.styleGuideExamples = storybook => {
    storybook
      .storiesOf('ShareDialog', module)
      .addStoryTable([
        {
          name: 'basic example',
          story: () => (
            <ShareDialog
              hideBackdrop={true}
              i18n={fakei18n}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="gamelab"
              canShareSocial={true}
              onClickPopup={storybook.action('onClickPopup')}
            />
          )
        }, {
          name: 'applab',
          description: `The applab version has an advanced sharing dialog with more options`,
          story: () => (
            <ShareDialog
              hideBackdrop={true}
              i18n={fakei18n}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={false}
              channelId="some-id"
              appType="applab"
              canShareSocial={true}
              onClickPopup={storybook.action('onClickPopup')}
            />
          )
        }, {
          name: 'with export',
          description: `This feature has not yet shipped.`,
          story: () => (
            <ShareDialog
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
          )
        }, {
          name: 'with under 13 warning',
          description: `We hide social sharing buttons and display a warning for users under 13`,
          story: () => (
            <ShareDialog
              hideBackdrop={true}
              i18n={fakei18n}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              channelId="some-id"
              canShareSocial={false}
              appType="gamelab"
              onClickPopup={storybook.action('onClickPopup')}
            />
          )
        }, {
          name: 'abusive',
          description: `The abusive version shows a warning message`,
          story: () => (
            <ShareDialog
              hideBackdrop={true}
              i18n={fakei18n}
              shareUrl="https://studio.code.org/projects/applab/GmBgH7e811sZP7-5bALAxQ"
              isAbusive={true}
              channelId="some-id"
              canShareSocial={true}
              appType="gamelab"
              onClickPopup={storybook.action('onClickPopup')}
            />
          )
        }, {
          name: 'with icon',
          description: `An icon can be specifid for the dialog`,
          story: () => (
            <ShareDialog
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
          )
        }
      ]);
  };
}
