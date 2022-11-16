import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import PropTypes from 'prop-types';

class CourseBlocksWrapper extends Component {
  static propTypes = {
    cards: PropTypes.array,
    heading: PropTypes.string,
    description: PropTypes.string
  };

  render() {
    return (
      <ContentContainer
        heading={this.props.heading}
        description={this.props.description}
      >
        <CourseBlocksGradeBands cards={this.props.cards} />
      </ContentContainer>
    );
  }
}

export default CourseBlocksWrapper;
