import React, { PropTypes } from 'react';

const StudentEntry = (props) => {
  const { isActive, status, isUnplugged, position, isNavigator, name, id } = props;

  const path = `$(window.location.href)&user_id=${id}`;

  let statusIcon;
  if (isUnplugged) {
    statusIcon = <span className="puzzle-named">Unplugged</span>;
  } else if (status === "passed" || status === "perfect") {
    // TODO: have server pass this down?
    statusIcon = (
      <img
        src="https://studio.code.org/assets/white-checkmark-f80a03318e57c26afca1a6e50c5973da929daf81a694b1783d3017df5875c712.png"
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
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired
};

const TeacherPanelStudentList = React.createClass({
  propTypes: {
    studentInfo: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeUserId: PropTypes.string
  },
  render() {
    const { studentInfo, activeUserId } = this.props;
    return (
      <div className="scrollable-wrapper">
        <table className="section-students">
          <tbody>
            {studentInfo.map((student, index) => {
              const { name, id, status, unplugged, position, navigator, path }  = student;
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

export default TeacherPanelStudentList;
