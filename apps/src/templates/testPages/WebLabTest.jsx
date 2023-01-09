// /* global adjustScroll */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
// import i18n from '@cdo/locale';

class WebLabTest extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired
  };

  constructor() {
    super();
    this.state = {};
  }

  // handleSchoolDropdownChange = option => {
  //   this.setState({
  //     schoolDropdownOption: option,
  //     showExistingInaccuracy: false,
  //     existingInaccuracy: false
  //   });
  // };

  render() {
    return (
      <div>
        <h1>Web Lab Test</h1>
        <p>Here I am!</p>
      </div>
    );
  }
}

// const styles = {
//   heading: {
//     marginTop: 20,
//     marginBottom: 0
//   },
//   description: {
//     marginTop: 10,
//     marginBottom: 20,
//     fontSize: 14,
//     fontFamily: '"Gotham 4r", sans-serif',
//     lineHeight: '1.5em'
//   },
//   mapFooter: {
//     fontFamily: '"Gotham 7r", sans-serif',
//     fontSize: 20,
//     marginLeft: 25,
//     marginRight: 25
//   },

//   banner: {
//     marginBottom: 35
//   }
// };

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(WebLabTest);
