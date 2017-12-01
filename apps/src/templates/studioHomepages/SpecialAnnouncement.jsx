import React, {Component, PropTypes} from 'react';
import TwoColumnActionBlock from '../TwoColumnActionBlock';
import Responsive from '../../responsive';
import styleConstants from '../../styleConstants';

const contentWidth = styleConstants['content-width'];

const styles = {
  fullWidthNonResponsive: {
    width: contentWidth
  },
};

export default class SpecialAnnouncement extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive),
    imageUrl: PropTypes.string.isRequired,
    heading: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    }))
  };

  render() {
    const { isRtl, responsive, imageUrl, heading, description, buttons } = this.props;

    return (
      <div style={styles.fullWidthNonResponsive}>
        <TwoColumnActionBlock
          isRtl={isRtl}
          responsive={responsive}
          imageUrl={imageUrl}
          subHeading={heading}
          description={description}
          buttons={buttons}
        />
      </div>
    );
  }
}
