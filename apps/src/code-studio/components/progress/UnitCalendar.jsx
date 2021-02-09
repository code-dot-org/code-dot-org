import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import UnitCalendarLessonChunk from './UnitCalendarLessonChunk';

const weekWidth = 592;
const styles = {
  weekColumn: {
    minWidth: 100,
    backgroundColor: 'rgb(118, 101, 160)',
    color: 'white',
    textAlign: 'center',
    border: '1px solid rgb(118, 101, 160)',
    borderCollapse: 'collapse',
    fontWeight: 'bold',
    minHeight: 50
  },
  scheduleColumn: {
    border: '1px solid rgb(118, 101, 160)',
    borderCollapse: 'collapse',
    width: weekWidth,
    display: 'flex',
    minHeight: 50
  },
  table: {
    border: '1px solid rgb(118, 101, 160)',
    borderCollapse: 'collapse',
    width: '100%'
  },
  key: {
    border: '1px solid rgb(118, 101, 160)',
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: 20
  },
  keyIcon: {
    marginRight: 5
  },
  keySection: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '90%',
    alignItems: 'center',
    fontSize: 15
  }
};

export default class UnitCalendar extends React.Component {
  static propTypes = {
    schedule: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          title: PropTypes.string.isRequired,
          duration: PropTypes.number.isRequired,
          assessment: PropTypes.bool.isRequired,
          unplugged: PropTypes.bool,
          isStart: PropTypes.boolean,
          isEnd: PropTypes.boolean,
          isMajority: PropTypes.boolean,
          url: PropTypes.string
        })
      )
    ).isRequired,
    weeklyInstructionalMinutes: PropTypes.number
  };
  constructor(props) {
    super(props);
    this.state = {
      hovering: ''
    };
  }
  handleHover = id => {
    this.setState({hovering: id});
  };
  renderWeeks = () => {
    const minuteWidth = weekWidth / this.props.weeklyInstructionalMinutes;
    return this.props.schedule.map(week => {
      return week.map((lesson, index) => {
        return (
          <UnitCalendarLessonChunk
            key={`lesson-${index}`}
            minuteWidth={minuteWidth}
            lesson={lesson}
            isHover={lesson.id === this.state.hovering}
            handleHover={this.handleHover}
          />
        );
      });
    });
  };

  render() {
    const weekPlans = this.renderWeeks();
    return (
      <div>
        <table style={styles.table}>
          <tbody>
            {weekPlans.map((week, index) => {
              return (
                <tr key={`week-${index}`}>
                  <td style={styles.weekColumn}>
                    {i18n.weekLabel({number: index + 1})}
                  </td>
                  <td style={styles.scheduleColumn}>{week}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table style={styles.key}>
          <tbody>
            <tr>
              <td style={styles.weekColumn}>Key</td>
              <td style={styles.scheduleColumn}>
                <div style={styles.keySection}>
                  <div>
                    <i
                      className="fa fa-square-o"
                      style={{
                        color: '#00adbc',
                        ...styles.keyIcon
                      }}
                    />
                    {i18n.instructionalLesson()}
                  </div>
                  <div>
                    <i
                      className="fa fa-check-circle"
                      style={{
                        color: 'rgb(118, 101, 160)',
                        ...styles.keyIcon
                      }}
                    />
                    {i18n.assessment()}
                  </div>
                  <div>
                    <i className="fa fa-scissors" style={styles.keyIcon} />
                    {i18n.unpluggedLesson()}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
