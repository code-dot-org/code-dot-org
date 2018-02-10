import React, {PropTypes} from 'react';
import Button, {ButtonColor, ButtonSize} from '../../../../templates/Button';

export default class SurveySupportSection extends React.Component {
  static propTypes = {
    surveyUrl: PropTypes.string,
  };

  render() {
    const {surveyUrl} = this.props;
    return (
      <div>
        <h2>
          {surveyUrl ? 'Survey / Support' : 'Support'}
        </h2>
        <p>
          Check out our general
          {' '}
          <a href="https://codeorg.zendesk.com/hc/en-us/articles/115003407851">Maker Toolkit support article</a>
          {' '}
          to get help debugging common issues.
        </p>
        {surveyUrl &&
          <div>
            <p>Still having trouble?</p>
            <Button
              text="Submit our quick survey"
              href={surveyUrl}
              color={ButtonColor.gray}
              size={ButtonSize.large}
            />
          </div>
        }
        {!surveyUrl &&
          <p>
            You can also contact us at
            {' '}
            <a href="mailto:support@code.org">support@code.org</a>
            {' '}
            with any additional questions.
          </p>
        }
      </div>
    );
  }
}
