import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default class StyledCodeBlock extends Component {
  static propTypes = {
    programmingExpression: PropTypes.shape({
      color: PropTypes.string,
      name: PropTypes.string.isRequired,
      link: PropTypes.string
    }).isRequired
  };

  render() {
    const {programmingExpression} = this.props;

    let blockMarkdown = programmingExpression.color
      ? `[\`${programmingExpression.name}\`(${programmingExpression.color})](${
          programmingExpression.link
        })`
      : `[\`${programmingExpression.name}\`](${programmingExpression.link})`;

    return <SafeMarkdown markdown={blockMarkdown} />;
  }
}
