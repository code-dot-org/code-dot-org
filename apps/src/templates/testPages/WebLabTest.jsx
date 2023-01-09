// /* global adjustScroll */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
// import i18n from '@cdo/locale';
import {Status} from '../../../src/lib/ui/ValidationStep';
import testImageAccess from '../../code-studio/url_test';

const STATUS_CODE_PROJECTS = 'statusCodeProjects';
const STATUS_COMPUTING_IN_THE_CORE = 'statusComputingInTheCore';

const imageAccessTests = [
  {
    url: 'https://codeprojects.org/favicon.ico',
    status: STATUS_CODE_PROJECTS
  },
  {
    url: 'https://downloads.computinginthecore.org/favicon.ico',
    status: STATUS_COMPUTING_IN_THE_CORE
  }
];

class WebLabTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      [STATUS_CODE_PROJECTS]: Status.WAITING,
      [STATUS_COMPUTING_IN_THE_CORE]: Status.WAITING,
      renderCallToAction: false
    };
  }

  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired
  };

  promisifiedTestImageAccess = ({url, status}) =>
    new Promise((resolve, _) => {
      testImageAccess(
        `${url}?${Math.random()}`,
        () => {
          this.setState({[status]: Status.SUCCEEDED});
          return resolve();
        },
        () => {
          this.setState({[status]: Status.FAILED});
          return resolve(null);
        }
      );
    });

  runWebLabTest = () => {
    this.setState({
      [STATUS_COMPUTING_IN_THE_CORE]: Status.ATTEMPTING,
      [STATUS_CODE_PROJECTS]: Status.ATTEMPTING,
      renderCallToAction: false
    });

    const webLabTestPromise = Promise.all(
      imageAccessTests.map(this.promisifiedTestImageAccess)
    );

    webLabTestPromise.then(() => {
      this.setState({renderCallToAction: true});
    });
  };

  renderTestStatus = test =>
    ({
      [Status.WAITING]: <p className="incomplete">Not complete</p>,
      [Status.ATTEMPTING]: <p className="loading">Connecting...</p>,
      [Status.SUCCEEDED]: <p className="succeeded">Success</p>,
      [Status.FAILED]: <p className="failed">Failed</p>
    }[this.state[test]]);

  renderCallToAction = () => {
    const testFailed = [
      STATUS_CODE_PROJECTS,
      STATUS_COMPUTING_IN_THE_CORE
    ].some(test => this.state[test] === Status.FAILED);

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
      <div id="main-content" className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <h1>Web Lab Network Support Check</h1>
              <p>
                Use this page to test your school's network support for our Web
                Lab modules. Web Lab communicates with domains which may be
                blocked by some school systems’ networks or device policies. If
                the network check is unsuccessful, you will need to reach out to
                your school's IT department to update your school's firewall
                settings or device policies.
              </p>
              <p>
                When checking network support, try to meet as many of these
                criteria as possible:
              </p>
              <li>Use your school's internet connection</li>
              <li>Use a student computer</li>
              <li>Log into the computer with a student account</li>
              <br />
              <p>
                Note: You do not need to be logged in to Code.org for this test
                to be successful.
              </p>
              <label htmlFor="connect">
                Click "Connect" to check whether your school's network supports
                the Web Lab tool
              </label>
              <div id="status-table">
                <table>
                  <tbody>
                    <tr>
                      <th>Check</th>
                      <th>Status</th>
                    </tr>
                    <tr>
                      <td>
                        Connected to
                        <code>https://downloads.computinginthecore.org</code>
                      </td>
                      <td className="computinginthecore">
                        {this.renderTestStatus(STATUS_COMPUTING_IN_THE_CORE)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Connected to <code>https://codeprojects.org</code>
                      </td>
                      <td className="codeprojects">
                        {this.renderTestStatus(STATUS_CODE_PROJECTS)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <button
                  type="submit"
                  id="connect"
                  className="btn btn-primary"
                  onClick={this.runWebLabTest}
                >
                  Connect
                </button>
              </div>
              {this.state.renderCallToAction && this.renderCallToAction()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(WebLabTest);
