import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';
import msg from '@cdo/locale';
import * as imageUtils from '@cdo/apps/imageUtils';
import {html2canvas} from '@cdo/apps/util/htmlToCanvasWrapper';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import PendingButton from '@cdo/apps/templates/PendingButton';
import {ChartType} from '../dataUtils';
import dataStyles from '../data-styles.module.scss';
import classNames from 'classnames';
import {CROSS_TAB_CHART_AREA, GOOGLE_CHART_AREA} from './constants';

import PLACEHOLDER_IMAGE from './placeholder.png';

const INITIAL_STATE = {
  isSnapshotOpen: false,
  isCopyPending: false,
  isSavePending: false,
  imageSrc: PLACEHOLDER_IMAGE,
};

class Snapshot extends React.Component {
  static propTypes = {
    chartType: PropTypes.oneOf(Object.values(ChartType)).isRequired,
    chartTypeName: PropTypes.string.isRequired,
    chartTitle: PropTypes.string.isRequired,
    selectedOptions: PropTypes.string.isRequired,
    // Provided via Redux
    tableName: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
  };

  state = {...INITIAL_STATE};

  componentDidMount() {
    this.isMounted_ = true;
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  handleOpen = () => {
    this.setState({isSnapshotOpen: true});
    this.getImageFromChart();
  };

  handleClose = () => this.setState(INITIAL_STATE);

  getImageFromChart = () => {
    if (this.props.chartType === ChartType.CROSS_TAB) {
      this.getImageFromCrossTab();
    } else {
      this.getImageFromGoogleChart();
    }
  };

  getImageFromCrossTab = () => {
    const element = document.getElementById(CROSS_TAB_CHART_AREA);
    if (!element) {
      return;
    }
    const options = {
      background: '#fff',
    };
    html2canvas(element, options).then(canvas => {
      const dataSrc = canvas.toDataURL('image/png');
      if (this.isMounted_) {
        this.setState({imageSrc: dataSrc});
      }
    });
  };

  getImageFromGoogleChart = () => {
    const container = document.getElementById(GOOGLE_CHART_AREA);
    const svgList = container && container.querySelectorAll('svg');
    const svg = svgList && svgList[0];
    if (!svg) {
      return;
    }
    imageUtils
      .svgToDataURI(svg, 'image/png', {renderer: 'native'})
      .then(imageURI => {
        if (this.isMounted_) {
          this.setState({imageSrc: imageURI});
        }
      });
  };

  getPngBlob = async () => {
    const element = this.refs.snapshot;
    if (!element) {
      return;
    }
    const options = {
      background: '#fff',
    };
    const canvas = await html2canvas(element, options);
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    return blob;
  };

  copy = async () => {
    this.setState({isCopyPending: true});
    const pngBlob = await this.getPngBlob();
    await navigator.clipboard.write([
      new ClipboardItem({'image/png': pngBlob}),
    ]);
    this.setState({isCopyPending: false});
  };

  save = async () => {
    this.setState({isSavePending: true});
    const pngBlob = await this.getPngBlob();
    imageUtils.downloadBlobAsPng(pngBlob);
    this.setState({isSavePending: false});
  };

  render() {
    return (
      <div>
        <button
          type="button"
          className={classNames(dataStyles.button, dataStyles.buttonGray)}
          onClick={this.handleOpen}
        >
          {msg.dataVisualizerViewSnapshot()}
        </button>
        <BaseDialog
          isOpen={this.state.isSnapshotOpen}
          handleClose={this.handleClose}
          fullWidth
          fullHeight
        >
          <div ref="snapshot">
            <h1>{this.props.chartTitle}</h1>
            <img
              style={{maxHeight: '50vh'}}
              src={this.state.imageSrc}
              alt={msg.dataVisualizerAltText({
                chartType: this.props.chartTypeName,
                values: this.props.selectedOptions,
                title: this.props.chartTitle,
              })}
            />
            <p>
              {msg.dataVisualizerSnapshotDescription({
                date: moment().format('YYYY/MM/DD'),
                table: this.props.tableName,
                project: this.props.projectName,
              })}
            </p>
            <p>{this.props.selectedOptions}</p>
          </div>
          <PendingButton
            isPending={this.state.isCopyPending}
            onClick={this.copy}
            pendingText="Please Wait"
            className={classNames(dataStyles.button, dataStyles.buttonBlue)}
            text="Copy"
          />
          <PendingButton
            isPending={this.state.isSavePending}
            onClick={this.save}
            pendingText="Please Wait"
            className={classNames(dataStyles.button, dataStyles.buttonBlue)}
            text="Save"
          />
        </BaseDialog>
      </div>
    );
  }
}

export default connect(state => ({
  tableName: state.data.tableName || '',
  projectName: state.project.projectName || '',
}))(Snapshot);
