import React, {PropTypes} from 'react';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';
import StudioAppWrapper from '../templates/StudioAppWrapper';

/**
 * Top-level React wrapper for our NetSim app.
 */
export default class NetSimView extends React.Component {
  static propTypes = {
    generateCodeAppHtml: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.onMount();
  }

  render() {
    return (
      <StudioAppWrapper>
        <ProtectedStatefulDiv contentFunction={this.props.generateCodeAppHtml} />
      </StudioAppWrapper>
    );
  }
}
