/* eslint-disable react/no-is-mounted */

import PropTypes from 'prop-types';
import React from 'react';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import * as assets from '../../code-studio/assets';

const styles = {
  button: {
    float: 'left',
    marginRight: '5px'
  },
  attachment: {
    background: '#08c',
    color: '#fff',
    borderRadius: '4px',
    padding: '0 5px',
    margin: '4px 4px 4px 0',
    float: 'left',
    fontSize: '0.8em'
  }
};

/**
 * An attachment list component.
 */
export default class Attachments extends React.Component {
  static propTypes = {
    readonly: PropTypes.bool,
    showUnderageWarning: PropTypes.bool,
    projectId: PropTypes.string
  };

  state = {loaded: false};

  componentWillMount() {
    assetsApi
      .withProjectId(this.props.projectId)
      .getFiles(this.onAssetListReceived);
  }

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  onAssetListReceived = result => {
    assets.listStore.reset(result.files);
    if (this.isMounted_) {
      this.setState({loaded: true});
    }
  };

  showAssetManager = () => {
    assets.showAssetManager(
      null,
      'document',
      this.setState.bind(this, {loaded: true}),
      {
        showUnderageWarning: this.props.showUnderageWarning
      }
    );
  };

  render() {
    let attachmentList = <span style={{fontSize: '0.8em'}}>Loading...</span>;
    if (this.state.loaded) {
      attachmentList = assets.listStore.list().map(asset => {
        const url = assetsApi.basePath(asset.filename);
        return (
          <a
            key={asset.filename}
            style={styles.attachment}
            href={url}
            className="uitest-attachment"
            target="_blank"
          >
            {asset.filename}
          </a>
        );
      });
    }

    let button;
    if (!this.props.readonly) {
      button = (
        <input
          style={styles.button}
          className="btn btn-default"
          type="button"
          value="Add/Remove Attachments"
          onClick={this.showAssetManager}
        />
      );
    }

    return (
      <span>
        {button}
        {attachmentList}
      </span>
    );
  }
}
