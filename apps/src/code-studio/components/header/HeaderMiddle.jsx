import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {getStore} from '../../redux';
import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import _ from 'lodash';

export default class HeaderMiddle extends React.Component {
  static propTypes = {
    scriptNameData: PropTypes.object.isRequired,
    stageData: PropTypes.object.isRequired,
    children: PropTypes.node
  };

  state = {
    width: -1
  };

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.

    if (this.props.stageData.script_stages > 1) {
      $('.header_popup_components')
        .appendTo(ReactDOM.findDOMNode(this.refs.header_popup_components))
        .show();

      $('.header_popup_link').show();
    }

    this.updateLayoutListener = _.throttle(this.updateLayout, 200);
    window.addEventListener('resize', this.updateLayoutListener);
    window.addEventListener('scroll', this.updateLayoutListener);
  }

  updateLayout = () => {
    console.log(this.refs.header_middle_parent.clientWidth);
    this.setState({width: this.refs.header_middle_parent.clientWidth});
  };

  getScriptNameWidth() {
    return this.state.width / 3;
  }

  render() {
    const {scriptNameData, stageData, children} = this.props;

    return (
      <div ref="header_middle_parent" style={{width: '100%'}}>
        {/*<Provider store={getStore()}>
          <ProjectInfo />
        </Provider>*/}

        <div style={{float: 'left', width: this.getScriptNameWidth()}}>
          <Provider store={getStore()}>
            <ScriptName {...scriptNameData} />
          </Provider>
        </div>

        <div style={{float: 'left'}}>
          <div className="progress_container">{children}</div>
        </div>

        {stageData.finishLink && (
          <div className="header_finished_link">
            <a href={stageData.finishLink}>{stageData.finishText}</a>
          </div>
        )}

        <ProtectedStatefulDiv ref="header_popup_components" />
      </div>
    );
  }
}
