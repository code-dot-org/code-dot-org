import React, {useState} from 'react';
import PropTypes from 'prop-types';

import msg from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import SearchBar from '@cdo/apps/templates/SearchBar';

import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import {connect} from 'react-redux';

class AnimationPickerImageGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: ''
    };
  }

  static propTypes = {};

  onSearchQueryChange = ({target: {value}}) => {
    this.setState({query: value});
  };

  onGenerateClick = () => {
    console.log('selecting your animations!');
  };

  render() {
    return (
      <>
        <SearchBar
          placeholderText={msg.animationGeneratePlaceholder()}
          onChange={this.onSearchQueryChange}
        />
        <Button
          text={'Generate!'}
          onClick={this.onGenerateClick}
          color={Button.ButtonColor.orange}
        />
      </>
    );
  }
}

export default AnimationPickerImageGenerator;
