import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import PlcHeader from '@cdo/apps/code-studio/plc/header';

/**
 * This component takes some of the HAML generated content on the script overview
 * page, and moves it under our React root. This is done so that we can have React
 * content above and below this.
 * Long term, instead of generating the DOM elements in haml, we should pass the
 * client the data and have React generate the DOM. Doing so should not be super
 * difficult in this case
 */
class ScriptOverviewHeader extends Component {
  static propTypes = {
    plcHeaderProps: PropTypes.shape({
      unitName: PropTypes.string.isRequired,
      courseViewPath: PropTypes.string.isRequired,
    })
  };

  componentDidMount() {
    $('#react-scriptoverview-header').appendTo(ReactDOM.findDOMNode(this.protected));
  }

  render() {
    const { plcHeaderProps } = this.props;

    return (
      <div>
        {plcHeaderProps &&
          <PlcHeader
            unit_name={plcHeaderProps.unitName}
            course_view_path={plcHeaderProps.courseViewPath}
          />
        }
        <ProtectedStatefulDiv
          ref={element => this.protected = element}
        />
      </div>
    );
  }
}

export default connect(state => ({
  plcHeaderProps: state.plcHeader
}))(ScriptOverviewHeader);
