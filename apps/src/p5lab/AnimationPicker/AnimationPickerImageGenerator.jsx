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
  GENERATOR_DROPDOWNS_PREFIX
} from './animationPickerImageGeneratorDropdowns';
import {
  generateOpenAIImage,
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
      errorMessage: ''
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
      this.state.results[idx].b64_json
    ).then(result => {
      const jsResult = JSON.parse(result);
      this.props.onUploadDone(jsResult);
    });
  };

  onSearchQueryChange = ({target: {value}}) => {
    this.setState({query: value, errorMessage: ''});
  };

  handleGenerateClick = () => {
    const {query, profanityCheckEnabled} = this.state;
    this.setState({loading: true, errorMessage: '', results: []});

    generateOpenAIImage(query, {profanityCheckEnabled}).then(
      result => {
        this.setState({results: result, loading: false});
      },
      jqXHR => {
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
    Object.keys(select).forEach(key => {
      console.log('checking key', key);
      const value = document.getElementById(
        `${GENERATOR_DROPDOWNS_PREFIX}-${key}`
      ).value;
      query += `${value} `;
    });

    this.setState({query});
  };

  // TODO: Update to use existing Animation Preview component?
  renderGeneratedImages = () => {
    const {results} = this.state;

    return results.map((result, index) => {
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
                  {this.renderProfanityCheckbox()}
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
                    {select.animals(this.handleDropdownChange)}
                    in the style of
                    {select.artisticStyles(this.handleDropdownChange)}
                  </form>
                  {this.renderProfanityCheckbox()}
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
