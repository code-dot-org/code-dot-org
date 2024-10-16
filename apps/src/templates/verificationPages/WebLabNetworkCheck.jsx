import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';

import testImageAccess from '../../code-studio/url_test';
import ValidationStep, {Status} from '../../sharedComponents/ValidationStep';
import {
  BRAMBLE_READY_STATE,
  FILE_SYSTEM_ERROR,
  SUPPORT_ARTICLE_URL,
} from '../../weblab/constants';

const WEBLAB_URL = '/weblab/host?skip_files=true';

const STATUS_CODE_PROJECTS = 'statusCodeProjects';
const STATUS_COMPUTING_IN_THE_CORE = 'statusComputingInTheCore';
const STATUS_BRAMBLE_MOUNTABLE = 'statusBrambleMountable';

const domainDependencies = [
  {
    url: 'https://codeprojects.org',
    status: STATUS_CODE_PROJECTS,
  },
  {
    url: 'https://downloads.computinginthecore.org',
    status: STATUS_COMPUTING_IN_THE_CORE,
  },
];

class WebLabNetworkCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      [STATUS_CODE_PROJECTS]: Status.WAITING,
      [STATUS_COMPUTING_IN_THE_CORE]: Status.WAITING,
      [STATUS_BRAMBLE_MOUNTABLE]: Status.WAITING,
      encounteredFileSystemError: false,
      runButtonDisabled: false,
      renderCallToAction: false,
      iframeSrc: 'about:blank',
    };
  }

  static propTypes = {
    studioUrl: PropTypes.string.isRequired,
  };

  componentDidMount = () => {
    window.addEventListener('message', this.updateBrambleStatus);
  };

  componentWillUnmount = () => {
    window.removeEventListener('message', this.updateBrambleStatus);
  };

  updateBrambleStatus = (event = {}) => {
    // Only react to events if we're attempting the Bramble test
    // and we receive and event from the appropriate origin
    if (
      !event.origin === this.props.studioUrl ||
      !this.state[STATUS_BRAMBLE_MOUNTABLE] === Status.ATTEMPTING
    ) {
      return;
    }

    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.log(err);
    }

    // These two are mutually exclusive -- if there's a filesystem
    // error, Bramble will not reach the ready state
    if (data?.msg === FILE_SYSTEM_ERROR) {
      this.setState({encounteredFileSystemError: true});
    } else if (data?.msg === BRAMBLE_READY_STATE) {
      this.setState({
        [STATUS_BRAMBLE_MOUNTABLE]: Status.SUCCEEDED,
      });
    }
  };

  verifyBrambleMountable = ({timeout, interval}) => {
    const endTime = Number(new Date()) + timeout;

    let checkStatus = (resolve, _) => {
      if (this.state.statusBrambleMountable === Status.SUCCEEDED) {
        return resolve();
      } else if (Number(new Date()) < endTime) {
        setTimeout(checkStatus, interval, resolve);
      } else {
        this.setState({[STATUS_BRAMBLE_MOUNTABLE]: Status.FAILED});
        return resolve();
      }
    };

    return new Promise(checkStatus);
  };

  verifyDomainAccess = ({url, status}) =>
    new Promise((resolve, _) => {
      testImageAccess(
        `${url}/favicon.ico?${Math.random()}`,
        () => {
          this.setState({[status]: Status.SUCCEEDED});
          return resolve();
        },
        () => {
          this.setState({[status]: Status.FAILED});
          return resolve();
        }
      );
    });

  runWebLabTest = () => {
    this.setState(
      {
        [STATUS_COMPUTING_IN_THE_CORE]: Status.ATTEMPTING,
        [STATUS_CODE_PROJECTS]: Status.ATTEMPTING,
        [STATUS_BRAMBLE_MOUNTABLE]: Status.ATTEMPTING,
        encounteredFileSystemError: false,
        runButtonDisabled: true,
        renderCallToAction: false,
        iframeSrc: WEBLAB_URL,
      },
      () => {
        const webLabChecksComplete = Promise.all([
          ...domainDependencies.map(this.verifyDomainAccess),
          // Polls for success every 500 ms; times out after 3 seconds
          this.verifyBrambleMountable({timeout: 3000, interval: 500}),
        ]);

        webLabChecksComplete.then(() => {
          this.setState({
            renderCallToAction: true,
            runButtonDisabled: false,
            iframeSrc: 'about:blank',
          });
        });
      }
    );
  };

  renderStatusText = status => (
    <p>{`${
      {
        [Status.WAITING]: 'Not complete',
        [Status.ATTEMPTING]: 'Connecting...',
        [Status.SUCCEEDED]: 'Success',
        [Status.FAILED]: 'Failed',
      }[status]
    }`}</p>
  );

  listActionItems = () => {
    let actionItems = [];

    if (
      [
        this.state[STATUS_CODE_PROJECTS],
        this.state[STATUS_COMPUTING_IN_THE_CORE],
      ].includes(Status.FAILED)
    ) {
      actionItems.push(
        <li key="domain-access">
          Please work with your IT department to ensure your devices allow full
          access (including cookies) for https://codeprojects.org/ and
          https://downloads.computinginthecore.org/.
        </li>
      );
    }

    if (this.state.encounteredFileSystemError) {
      actionItems.push(
        <li key="private-browsing">
          Please make sure you are not using private browsing/incognito mode to
          access Web Lab. Web Lab is known not to work in these modes for most
          browsers.
        </li>,
        <li key="reset-indexed-db">
          Web Lab depends on a browser feature called the IndexedDB API.
          Occasionally this feature gets "stuck" and must be reset. Try loading
          a Web Lab level, and if you see an error dialog, click the button that
          says "Reset Web Lab."
        </li>
      );
    }

    return actionItems;
  };

  renderCallToAction = () => {
    const testFailed = [
      STATUS_CODE_PROJECTS,
      STATUS_COMPUTING_IN_THE_CORE,
      STATUS_BRAMBLE_MOUNTABLE,
    ].some(test => this.state[test] !== Status.SUCCEEDED);

    const actionItems = this.listActionItems();

    if (testFailed) {
      return (
        <div>
          <p>
            <strong>Error. One or more checks failed.</strong>
          </p>
          {!!actionItems.length && (
            <React.Fragment>
              <p>
                <strong>
                  Based on the results of this test, we recommend the following
                  steps:{' '}
                </strong>
              </p>
              <ul>{actionItems}</ul>
            </React.Fragment>
          )}
          <p>
            For more troubleshooting information, see our support article on{' '}
            <a href={SUPPORT_ARTICLE_URL}>Troubleshooting Web Lab problems</a>.
            You may also contact our Support Team (
            <a href="mailto:support@code.org">support@code.org</a>) for further
            assistance.
          </p>
        </div>
      );
    }

    return (
      <p>
        <strong>You passed all checks! No further action is needed.</strong>
      </p>
    );
  };

  render() {
    return (
      <div className={'contentContainer'}>
        <div className={'content'} style={styles.content}>
          <h1>Web Lab Network Support Check</h1>
          <p>
            Use this page to test your school's network support for our Web Lab
            modules. Web Lab has additional requirements that may be blocked by
            some school systems' network or device policies. For example, it
            requires access to browser storage, additional domains, and the use
            of iframes. If the following network check is unsuccessful, you may
            need to reach out to your school's IT department to update your
            school's firewall settings or device policies.
          </p>
          <p>
            When checking network support, try to meet as many of these criteria
            as possible:
          </p>
          <ul>
            <li>Use your school's internet connection</li>
            <li>Use a student computer</li>
            <li>Log into the computer with a student account</li>
          </ul>
          <br />
          <p>
            Note: You do not need to be logged in to Code.org for this test to
            be successful.
          </p>
          <label htmlFor="connect">
            Click "Connect" to check whether your school's network and device
            policies support the Web Lab tool.
          </label>
          <button
            type="submit"
            id="connect"
            className="btn btn-primary"
            onClick={this.runWebLabTest}
            disabled={this.state.runButtonDisabled}
          >
            Connect
          </button>
          <div id="weblab-validation-steps">
            <ValidationStep
              stepStatus={this.state[STATUS_COMPUTING_IN_THE_CORE]}
              stepName={
                'Connected to `https://downloads.computinginthecore.org`'
              }
              hideWaitingSteps={false}
            />
            <ValidationStep
              stepStatus={this.state[STATUS_CODE_PROJECTS]}
              stepName={'Connected to `https://codeprojects.org`'}
              hideWaitingSteps={false}
            />
            <ValidationStep
              stepStatus={this.state[STATUS_BRAMBLE_MOUNTABLE]}
              stepName={'Connected to Web Lab editor'}
              hideWaitingSteps={false}
            />
          </div>
          {this.state.renderCallToAction && this.renderCallToAction()}
          <br />
          <iframe
            id="empty-bramble-container"
            frameBorder="0"
            scrolling="no"
            style={styles.iframe}
            src={this.state.iframeSrc}
            title={i18n.emptyBrambleContainer()}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  content: {
    marginTop: '30px',
  },
  iframe: {
    display: 'none',
  },
};

export default WebLabNetworkCheck;
