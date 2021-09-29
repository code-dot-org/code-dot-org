import PropTypes from 'prop-types';
import React from 'react';
import ResourceLink from './ResourceLink';
import {metaTagDescription} from '../../lib/util/urlHelpers';

export default class NetworkResourceLink extends React.Component {
  static propTypes = {
    highlight: PropTypes.bool,
    icon: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
    openReferenceInNewTab: PropTypes.bool
  };

  state = {
    title: null
  };

  componentDidMount() {
    metaTagDescription(this.props.reference).then(title =>
      this.setState({title})
    );
  }

  render() {
    return (
      <ResourceLink
        highlight={this.props.highlight}
        icon={this.props.icon}
        text={this.state.title ? this.state.title : this.props.reference}
        reference={this.props.reference}
        openReferenceInNewTab={this.props.openReferenceInNewTab}
      />
    );
  }
}
