import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const styles = {
  main: {
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '0 5px'
  }
};

const StudentEntry = (props) => {
  const { isActive, status, isUnplugged, position, isPairing, isNavigator, name, id } = props;

  const path = `${window.location.href}&user_id=${id}`;

  let statusIcon;
  if (isUnplugged) {
    statusIcon = <span className="puzzle-named">Unplugged</span>;
  } else if (status === "passed" || status === "perfect") {
    // We want to use the same check-mark asset that is used elsewhere in dashboard.
    // We do this by letting Rails render a hidden element, that we extract the
    // src attribute from.
    const src = $("#check-mark-container").children().attr('src');
    statusIcon = (
      <img
        src={src}
        alt="White checkmark"
      />
    );
  } else {
    statusIcon = (
      <span className="puzzle-number">
        {position}
      </span>
    );
  }

  return (
    <tr className={'section-student' + (isActive ? ' active' : '')}>
      <td>
        <div className={"level_link " + status}>
          {statusIcon}
        </div>
      </td>
      <td className={'name' + (isNavigator ? ' navigator' : '')}>
        <a href={path}>
          {name}
          {isPairing && <FontAwesome icon="users" className="pair-programming-icon"/>}
        </a>
      </td>
    </tr>
  );
};
StudentEntry.propTypes = {
  isActive: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  isUnplugged: PropTypes.bool.isRequired,
  position: PropTypes.number.isRequired,
  isNavigator: PropTypes.bool.isRequired,
  isPairing: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired
};

const TeacherPanelStudentList = React.createClass({
  propTypes: {
    studentInfo: PropTypes.object.isRequired,
    sectionId: PropTypes.string.isRequired,
    activeUserId: PropTypes.string
  },

  getInitialState() {
    return {
      width: $(window).width(),
      height: $(window).height(),
      maxHeight: this.getMaxHeight()
    };
  },

  getMaxHeight() {
    // This isn't a great pattern, as we're depending on DOM outside of ourselves.
    // In this case, it is difficult to avoid since this DOM is not React based.
    return $('.teacher-panel').innerHeight() -
      $('.teacher-panel h3').outerHeight() -
      15 - // magic..
      $('.non-scrollable-wrapper').outerHeight();
  },

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  },

  onResize() {
    this.setState({
      width: $(window).width(),
      height: $(window).height(),
      maxHeight: this.getMaxHeight()
    });
  },

  render() {
    const { studentInfo, activeUserId, sectionId } = this.props;

    const mainStyle = {
      ...styles.main,
      maxHeight: this.state.maxHeight
    };

    const sectionStudentInfo = studentInfo[sectionId] || [];
    return (
      <div style={mainStyle} ref="scrollableWrapper">
        <table className="section-students">
          <tbody>
            {sectionStudentInfo.map((student, index) => {
              const { name, id, status, unplugged, position, pairing, navigator, path }  = student;
              return (
                <StudentEntry
                  key={index}
                  name={name}
                  id={id}
                  path={path}
                  isActive={activeUserId !== undefined && activeUserId === id}
                  isUnplugged={unplugged}
                  status={status}
                  position={position}
                  isPairing={!!pairing}
                  isNavigator={!!navigator}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  sectionId: state.sections.selectedSectionId
}))(TeacherPanelStudentList);
