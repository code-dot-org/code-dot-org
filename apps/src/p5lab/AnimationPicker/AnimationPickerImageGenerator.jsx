import {connect} from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

import {createUuid} from '@cdo/apps/utils';
import Button from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import msg from '@cdo/locale';
import SearchBar from '@cdo/apps/templates/SearchBar';

import {
  select,
  GENERATOR_DROPDOWNS_PREFIX,
  stabilityAIStylePresets
} from './animationPickerImageGeneratorDropdowns';
import {
  generateStabilityAIImage,
  uploadGeneratedBase64Image
} from '../../util/generateImage.js';
import {
  beginUpload,
  handleUploadComplete,
  handleUploadError,
  saveSelectedAnimations
} from '../redux/animationPicker.js';
import TabView from '../../componentLibrary/TabView.jsx';

class AnimationPickerImageGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: '',
      results: [],
      loading: false,
      profanityCheckEnabled: true,
      errorMessage: '',
      stylePreset: ''
    };
  }

  static propTypes = {
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    channelId: PropTypes.string.isRequired
  };

  handleUploadClick = idx => {
    const filename = createUuid() + '.png';
    this.props.onUploadStart(filename);
    uploadGeneratedBase64Image(
      this.props.channelId,
      filename,
      this.state.results[idx].base64
    ).then(result => {
      const jsResult = JSON.parse(result);
      this.props.onUploadDone(jsResult);
    });
  };

  onSearchQueryChange = ({target: {value}}) => {
    this.setState({query: value, errorMessage: ''});
  };

  handleGenerateClick = () => {
    const {query, profanityCheckEnabled, stylePreset} = this.state;
    console.log('stylePreset: ', stylePreset);
    console.log('query: ', query);
    this.setState({loading: true, errorMessage: '', results: []});

    generateStabilityAIImage(query, {profanityCheckEnabled, stylePreset}).then(
      result => {
        console.log('result: ', result);
        this.setState({results: result.artifacts, loading: false});
      },
      jqXHR => {
        console.log('jqXHR: ', jqXHR);
        console.log('jqXHR.responseText: ', jqXHR.responseText);
        const errorMessage = jqXHR.responseJSON && jqXHR.responseJSON.error;
        this.setState({
          loading: false,
          errorMessage: errorMessage || 'An error occurred'
        });
      }
    );
  };

  handleDropdownChange = () => {
    let query = '';
    console.log('Object.keys(select): ', Object.keys(select));
    Object.keys(select).forEach(key => {
      console.log('checking key', key);
      const value = document.getElementById(
        `${GENERATOR_DROPDOWNS_PREFIX}-${key}`
      ).value;
      console.log('value: ', value);
      query += `${value} `;
    });

    this.setState({query});
  };

  // TODO: Update to use existing Animation Preview component?
  renderGeneratedImages = () => {
    const {results} = this.state;

    return results.map((result, index) => {
      let src = `data:image/png;base64,${result.base64}`;
      return (
        <button
          key={index}
          onClick={() => {
            this.handleUploadClick(index);
          }}
        >
          <img
            key={index}
            src={src}
            style={{maxWidth: '200px', maxHeight: '200px'}}
          />
        </button>
      );
      {
        (' ');
      }
    });
  };

  renderProfanityCheckbox = () => (
    <div
      styles={{
        verticalAlign: 'top',
        marginRight: 15
      }}
    >
      <label htmlFor="profanityCheckEnabled">
        <input
          type="checkbox"
          id="profanityCheckEnabled"
          name="profanityCheckEnabled"
          checked={this.state.profanityCheckEnabled}
          onChange={() => {
            const {profanityCheckEnabled} = this.state;
            this.setState({profanityCheckEnabled: !profanityCheckEnabled});
          }}
        />
        Enable profanity checking
      </label>
    </div>
  );

  render() {
    const STABILITY_AI_STYLES = [
      'enhance',
      'anime',
      'photographic',
      'digital-art',
      'comic-book',
      'fantasy-art',
      'line-art',
      'analog-film',
      'neon-punk',
      'isometric',
      'low-poly',
      'origami',
      'modeling-compound',
      'cinematic',
      '3d-model',
      'pixel-art',
      'tile-texture'
    ];

    return (
      <>
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
                  <select
                    name="Style Preset"
                    id="stylePreset"
                    onChange={({target: {value}}) => {
                      console.log('trying to change! ', value);
                      this.setState({stylePreset: value});
                    }}
                  >
                    {stabilityAIStylePresets}
                  </select>
                  {/* {this.renderProfanityCheckbox()} */}
                </div>
              )
            },
            {
              key: 'dropdowns',
              name: 'Dropdowns',
              renderFn: () => (
                <>
                  <form style={{marginTop: 10}}>
                    I would like a {select.emotions(this.handleDropdownChange)}{' '}
                    {select.colors(this.handleDropdownChange)}{' '}
                    {select.animals(this.handleDropdownChange)} in the style of
                    {
                      <select
                        name="Style Preset"
                        id="stylePreset"
                        onChange={({target: {value}}) => {
                          console.log('trying to change! ', value);
                          this.setState({stylePreset: value});
                        }}
                      >
                        {stabilityAIStylePresets}
                      </select>
                    }
                  </form>
                  {/* {this.renderProfanityCheckbox()} */}
                </>
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
        {!!this.state.errorMessage.length && (
          <span>{this.state.errorMessage}</span>
        )}
        {!!this.state.results.length && this.renderGeneratedImages()}
      </>
    );
  }
}

export default connect(null, dispatch => ({
  onUploadStart(filename) {
    // TODO: Check filesize and filetype?
    dispatch(beginUpload(filename));
  },
  onUploadDone(result) {
    dispatch(handleUploadComplete(result));
  },
  onUploadError(status) {
    dispatch(handleUploadError(status));
  },
  onAnimationSelectionComplete() {
    dispatch(saveSelectedAnimations());
  }
}))(AnimationPickerImageGenerator);
