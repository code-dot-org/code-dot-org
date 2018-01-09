import React, { PropTypes, Component } from 'react';

export default class SectionProgress extends Component {
  static propTypes = {
    sectionId: PropTypes.string.isRequired,
  };

  render() {
    const { sectionId } = this.props;
    return (
      <div>Progress here for section {sectionId}</div>
    );
  }
}
