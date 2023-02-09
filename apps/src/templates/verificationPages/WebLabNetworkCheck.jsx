import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ValidationStep, {Status} from '../../lib/ui/ValidationStep';
import testImageAccess from '../../code-studio/url_test';

const WEBLAB_URL = '/weblab/host?skip_files=true';

const STATUS_CODE_PROJECTS = 'statusCodeProjects';
const STATUS_COMPUTING_IN_THE_CORE = 'statusComputingInTheCore';
const STATUS_BRAMBLE_MOUNTABLE = 'statusBrambleMountable';

const domainDependencies = [
  {
    url: 'https://codeprojects.org',
    status: STATUS_CODE_PROJECTS
  },
  {
    url: 'https://downloads.computinginthecore.org',
    status: STATUS_COMPUTING_IN_THE_CORE
  }
];

class WebLabNetworkCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      [STATUS_CODE_PROJECTS]: Status.WAITING,
      [STATUS_COMPUTING_IN_THE_CORE]: Status.WAITING,
      [STATUS_BRAMBLE_MOUNTABLE]: Status.WAITING,
      runButtonDisabled: false,
      renderCallToAction: false,
      iframeSrc: 'about:blank'
    };
  }

  static propTypes = {
    studioUrl: PropTypes.string.isRequired
  };

  componentDidMount = () => {
    window.addEventListener('message', this.updateBrambleStatus);
  };

  componentWillUnmount = () => {
    window.removeEventListener('message', this.updateBrambleStatus);
  };

  updateBrambleStatus = (event = {}) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (err) {
      console.log(err);
    }

    if (
      event.origin === this.props.studioUrl &&
      message?.type === 'bramble:readyToMount' &&
      this.state[STATUS_BRAMBLE_MOUNTABLE] === Status.ATTEMPTING
    ) {
      this.setState({[STATUS_BRAMBLE_MOUNTABLE]: Status.SUCCEEDED});
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
        runButtonDisabled: true,
        renderCallToAction: false,
        iframeSrc: WEBLAB_URL
      },
      () => {
        const webLabChecksComplete = Promise.all([
          ...domainDependencies.map(this.verifyDomainAccess),
          // Polls for success every 500 ms; times out after 3 seconds
          this.verifyBrambleMountable({timeout: 3000, interval: 500})
        ]);

        webLabChecksComplete.then(() => {
          this.setState({
            renderCallToAction: true,
            runButtonDisabled: false,
            iframeSrc: 'about:blank'
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
        [Status.FAILED]: 'Failed'
      }[status]
    }`}</p>
  );

  renderCallToAction = () => {
    const testFailed = [
      STATUS_CODE_PROJECTS,
      STATUS_COMPUTING_IN_THE_CORE,
      STATUS_BRAMBLE_MOUNTABLE
    ].some(test => this.state[test] !== Status.SUCCEEDED);

    if (testFailed) {
      return (
        <div>
          <p>
            <strong>Error. One or more checks failed.</strong>
          </p>
          <p>
            <strong>Action required: </strong>
            Please contact your IT department to update your school’s firewall
            settings or device policies. Contact our Support Team (
            <a href="mailto:support@code.org">support@code.org</a>) if you have
            any questions.
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
          <li>Use your school's internet connection</li>
          <li>Use a student computer</li>
          <li>Log into the computer with a student account</li>
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
          />
        </div>
      </div>
    );
  }
}

const styles = {
  content: {
    marginTop: '30px'
  },
  iframe: {
    display: 'none'
  }
};

export default WebLabNetworkCheck;
