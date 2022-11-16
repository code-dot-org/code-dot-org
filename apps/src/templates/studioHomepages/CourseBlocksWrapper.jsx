import React, {Component} from 'react';
import ContentContainer from '../ContentContainer';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import PropTypes from 'prop-types';

class CourseBlocksWrapper extends Component {
  static propTypes = {
    cards: PropTypes.array.isRequired,
    heading: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string,
    hideBottomMargin: PropTypes.bool
  };

  render() {
    return (
      <ContentContainer
        heading={this.props.heading}
        description={this.props.description}
        link={this.props.link}
        linkText={this.props.linkText}
        hideBottomMargin={this.props.hideBottomMargin}
      >
        <CourseBlocksGradeBands cards={this.props.cards} />
      </ContentContainer>
    );
  }
}

export default CourseBlocksWrapper;
