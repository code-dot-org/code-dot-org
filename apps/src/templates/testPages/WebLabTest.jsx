import React, {Component} from 'react';
import ValidationStep, {Status} from '../../../src/lib/ui/ValidationStep';
import testImageAccess from '../../code-studio/url_test';

const scriptData = document.querySelector('script[data-bramble]');
const brambleConfig = JSON.parse(scriptData.dataset.bramble);

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

class WebLabTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      [STATUS_CODE_PROJECTS]: Status.WAITING,
      [STATUS_COMPUTING_IN_THE_CORE]: Status.WAITING,
      [STATUS_BRAMBLE_MOUNTABLE]: Status.WAITING,
      renderCallToAction: false
    };
  }

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
      event.origin === brambleConfig.studioUrl &&
      message.type &&
      message.type === 'bramble:readyToMount' &&
      this.state[STATUS_BRAMBLE_MOUNTABLE] === Status.ATTEMPTING
    ) {
      this.setState({[STATUS_BRAMBLE_MOUNTABLE]: Status.SUCCEEDED});
    }
  };

  pollBrambleStatus = ({timeout, interval}) => {
    const endTime = Number(new Date()) + timeout;

    let checkStatus = (resolve, _) => {
      if (this.state.statusBrambleMountable === Status.SUCCEEDED) {
        return resolve();
      } else if (Number(new Date()) < endTime) {
        return setTimeout(checkStatus, interval, resolve);
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

  verifyBrambleMountable = () => {
    // Here we just want to check that WebLab reaches a MOUNTABLE state,
    // i.e. we want a "blank" load and will not provide a project or file paths
    document.getElementById('empty-bramble-container').src =
      '/weblab/host?blank_load=true';
    return this.pollBrambleStatus({timeout: 3000, interval: 500});
  };

  runWebLabTest = () => {
    this.setState(
      {
        [STATUS_COMPUTING_IN_THE_CORE]: Status.ATTEMPTING,
        [STATUS_CODE_PROJECTS]: Status.ATTEMPTING,
        [STATUS_BRAMBLE_MOUNTABLE]: Status.ATTEMPTING,
        renderCallToAction: false
      },
      () => {
        const webLabChecksComplete = Promise.all([
          ...domainDependencies.map(this.verifyDomainAccess),
          this.verifyBrambleMountable()
        ]);

        webLabChecksComplete.then(() => {
          this.setState({renderCallToAction: true});
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
            modules. Web Lab communicates with domains which may be blocked by
            some school systems’ networks or device policies. If the network
            check is unsuccessful, you will need to reach out to your school's
            IT department to update your school's firewall settings or device
            policies.
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
            Click "Connect" to check whether your school's network supports the
            Web Lab tool
          </label>
          <button
            type="submit"
            id="connect"
            className="btn btn-primary"
            onClick={this.runWebLabTest}
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

export default WebLabTest;
