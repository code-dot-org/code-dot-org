import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {createUuid} from '@cdo/apps/utils';
import FontAwesome from '../../templates/FontAwesome';

import {
  select,
  GENERATOR_DROPDOWNS_PREFIX
} from './animationPickerImageGeneratorDropdowns';

import {
  generateOpenAIImage,
  uploadGeneratedBase64Image
  // uploadGeneratedImageUrl
} from '../../util/generateImage.js';
import {
  hide,
  pickNewAnimation,
  pickLibraryAnimation,
  beginUpload,
  handleUploadComplete,
  handleUploadError,
  saveSelectedAnimations
} from '../redux/animationPicker.js';

import msg from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import SearchBar from '@cdo/apps/templates/SearchBar';
import TabView from '../../componentLibrary/TabView.jsx';

import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import {connect} from 'react-redux';

// import AnimationPreview from './AnimationPreview.jsx';

class AnimationPickerImageGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useDropdowns: false,
      query: '',
      results: [],
      loading: false
    };
  }

  static propTypes = {};

  handleUploadClick = idx => {
    const filename = createUuid() + '.png';
    this.props.onUploadStart(filename);
    uploadGeneratedBase64Image(
      this.props.channelId,
      filename,
      this.state.results[idx].b64_json
    ).then(result => {
      console.log('before JSON parse ', result);
      const jsResult = JSON.parse(result);
      console.log('uploaded! result ' + jsResult);
      this.props.onUploadDone(jsResult);
    });
  };

  onSearchQueryChange = ({target: {value}}) => {
    this.setState({query: value});
  };

  handleGenerateClick = () => {
    this.setState({loading: true});
    console.log('selecting your animations!');
    console.log('query: ', this.state.query);
    const prompt = generateOpenAIImage(this.state.query)
      .then(results => {
        console.log('here are my results', results);
        this.setState({results, query: '', loading: false});
      })
      .catch(err => {
        console.log('error: ', err);
      });
  };

  handleDropdownChange = ({target: {value}}) => {
    var emotion = document.getElementById(
      `${GENERATOR_DROPDOWNS_PREFIX}-emotions`
    ).value;
    var color = document.getElementById(
      `${GENERATOR_DROPDOWNS_PREFIX}-colors`
    ).value;
    var animal = document.getElementById(
      `${GENERATOR_DROPDOWNS_PREFIX}-animals`
    ).value;
    // var number = document.getElementById(
    //   `${GENERATOR_DROPDOWNS_PREFIX}-number`
    // ).value;
    // var bodyPart = document.getElementById(
    //   `${GENERATOR_DROPDOWNS_PREFIX}-bodyParts`
    // ).value;
    var artisticStyle = document.getElementById(
      `${GENERATOR_DROPDOWNS_PREFIX}-artisticStyles`
    ).value;
    console.log(
      'setting State',
      `${emotion} ${color} ${animal} ${artisticStyle}`
    );
    this.setState({
      query: `${emotion} ${color} ${animal} ${artisticStyle}`
    });
  };

  renderGeneratedImages = () => {
    let elements;
    const {results} = this.state;
    console.log('results: ', results);
    // let openAISrc = 'https://picsum.photos/200/300';

    elements = results.map((result, index) => {
      let src = `data:image/png;base64,${result.b64_json}`;
      return (
        <button
          key={index}
          onClick={() => {
            this.handleUploadClick(index);
          }}
        >
          <img key={index} src={src} />
        </button>
      );
    });
    console.log('elements: ', elements);
    return elements;
  };

  render() {
    console.log('!!this.state.results.length: ', !!this.state.results.length);
    return (
      <>
        {/* <div>
          {this.state.useDropdowns ? (
            <div>
            </div>
          ) : (
            <SearchBar
              placeholderText={msg.animationGeneratePlaceholder()}
              onChange={this.onSearchQueryChange}
            />
          )}
        </div> */}
        <TabView
          tabs={[
            {
              key: 'freeText',
              name: 'Free Text',
              renderFn: () => (
                <div>
                  <SearchBar
                    placeholderText={msg.animationGeneratePlaceholder()}
                    onChange={this.onSearchQueryChange}
                  />
                </div>
              )
            },
            {
              key: 'dropdowns',
              name: 'Dropdowns',
              renderFn: () => (
                <form style={{marginTop: 10}}>
                  I would like a {select.emotions(this.handleDropdownChange)}{' '}
                  {select.colors(this.handleDropdownChange)}{' '}
                  {select.animals(this.handleDropdownChange)}
                  {/* with{' '}
                  {select.number(this.handleDropdownChange)}{' '}
                  {select.bodyParts(this.handleDropdownChange)}. */}
                  in the style of
                  {select.artisticStyles(this.handleDropdownChange)}
                </form>
              )
            }
          ]}
        />
        <Button
          text={'Generate!'}
          onClick={this.handleGenerateClick}
          color={Button.ButtonColor.orange}
        />
        {this.state.loading && (
          <FontAwesome icon="spinner" className="fa-fw fa-spin" />
        )}
        {!!this.state.results.length && this.renderGeneratedImages()}
      </>
    );
  }
}

export default connect(null, dispatch => ({
  onClose() {
    dispatch(hide());
  },
  onPickNewAnimation() {
    dispatch(pickNewAnimation());
  },
  // onPickLibraryAnimation(animation) {
  //   dispatch(pickLibraryAnimation(animation));
  // },
  onUploadStart(filename) {
    // console.log('here is my data in onUploadStart', data);
    // if (data.files[0].size >= MAX_UPLOAD_SIZE) {
    //   dispatch(handleUploadError(msg.animationPicker_unsupportedSize()));
    // } else if (
    //   data.files[0].type === 'image/png' ||
    //   data.files[0].type === 'image/jpeg'
    // ) {
    //   dispatch(beginUpload(data.files[0].name));
    //   data.submit();
    // } else {
    //   dispatch(handleUploadError(msg.animationPicker_unsupportedType()));
    // }
    dispatch(beginUpload(filename));
  },
  onUploadDone(result) {
    console.log('result in onUploadDone: ', result);
    dispatch(handleUploadComplete(result));
  },
  onUploadError(status) {
    dispatch(handleUploadError(status));
  },
  onAnimationSelectionComplete() {
    dispatch(saveSelectedAnimations());
  }
}))(AnimationPickerImageGenerator);
