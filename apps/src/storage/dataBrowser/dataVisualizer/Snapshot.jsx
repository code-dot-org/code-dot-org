/* global ClipboardItem */
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
import * as dataStyles from '../dataStyles';
import {CROSS_TAB_CHART_AREA, GOOGLE_CHART_AREA} from './constants';

const PLACEHOLDER_IMAGE = require('./placeholder.png');

const INITIAL_STATE = {
  isSnapshotOpen: false,
  isCopyPending: false,
  isSavePending: false,
  imageSrc: PLACEHOLDER_IMAGE
};

class Snapshot extends React.Component {
  static propTypes = {
    chartType: PropTypes.oneOf(Object.values(ChartType)).isRequired,
    chartTitle: PropTypes.string.isRequired,
    selectedOptions: PropTypes.string.isRequired,
    // Provided via Redux
    tableName: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired
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
      background: '#fff'
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
      background: '#fff'
    };
    const canvas = await html2canvas(element, options);
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    return blob;
  };

  copy = async () => {
    this.setState({isCopyPending: true});
    const pngBlob = await this.getPngBlob();
    await navigator.clipboard.write([
      new ClipboardItem({'image/png': pngBlob})
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
          style={dataStyles.grayButton}
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
            <img style={{maxHeight: '50vh'}} src={this.state.imageSrc} />
            <p>
              {msg.dataVisualizerSnapshotDescription({
                date: moment().format('YYYY/MM/DD'),
                table: this.props.tableName,
                project: this.props.projectName
              })}
            </p>
            <p>{this.props.selectedOptions}</p>
          </div>
          <PendingButton
            isPending={this.state.isCopyPending}
            onClick={this.copy}
            pendingText="Please Wait"
            style={dataStyles.blueButton}
            text="Copy"
          />
          <PendingButton
            isPending={this.state.isSavePending}
            onClick={this.save}
            pendingText="Please Wait"
            style={dataStyles.blueButton}
            text="Save"
          />
        </BaseDialog>
      </div>
    );
  }
}

export default connect(state => ({
  tableName: state.data.tableName || '',
  projectName: state.header.projectName || ''
}))(Snapshot);
