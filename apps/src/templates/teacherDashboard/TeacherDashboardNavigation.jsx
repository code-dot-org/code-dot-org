import $ from 'jquery';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export const TeacherDashboardPath = {
  progress: '/progress',
  textResponses: '/text_responses',
  assessments: '/assessments',
  projects: '/projects',
  stats: '/stats',
  manageStudents: '/manage_students',
  loginInfo: '/login_info'
};

const teacherDashboardLinks = [
  {
    label: i18n.teacherTabProgress(),
    url: TeacherDashboardPath.progress
  },
  {
    label: i18n.teacherTabStatsTextResponses(),
    url: TeacherDashboardPath.textResponses
  },
  {
    label: i18n.teacherTabAssessments(),
    url: TeacherDashboardPath.assessments
  },
  {
    label: i18n.teacherTabProjects(),
    url: TeacherDashboardPath.projects
  },
  {
    label: i18n.teacherTabStats(),
    url: TeacherDashboardPath.stats
  },
  {
    label: i18n.teacherTabManageStudents(),
    url: TeacherDashboardPath.manageStudents
  }
];

const ListPosition = {
  start: 'start',
  middle: 'middle',
  end: 'end'
};
const navId = 'teacher-dashboard-nav';
const navSelector = `#${navId}`;

export default class TeacherDashboardNavigation extends Component {
  static propTypes = {
    links: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      })
    )
  };

  state = {
    listPosition: ListPosition.start,
    shouldScroll: true
  };

  componentDidMount() {
    this.setShouldScroll();
  }

  setShouldScroll = () => {
    const navbar = $(navSelector);
    const navbarChildren = navbar.children();
    let childWidth = 0;

    for (var i = 0; i < navbarChildren.length; i++) {
      childWidth += navbarChildren[i].clientWidth;
    }

    const shouldScroll = navbar.width() < childWidth;
    this.setState({shouldScroll});
  };

  scrollTo = listPosition => {
    // Scroll to start (0) by default.
    let scrollLeft = 0;
    if (listPosition === ListPosition.end) {
      scrollLeft = $(navSelector).width();
    }

    this.setState({listPosition});
    $(navSelector).animate({scrollLeft}, 500);
  };

  handleScroll = () => {
    const {listPosition} = this.state;
    const scrollLeft = $(navSelector).scrollLeft();
    const maxScrollLeft =
      $(navSelector)[0].scrollWidth - $(navSelector)[0].clientWidth;
    const inMiddle = scrollLeft > 0 && scrollLeft < maxScrollLeft;

    // Update listPosition in state if necessary
    if (inMiddle && listPosition !== ListPosition.middle) {
      this.setState({listPosition: ListPosition.middle});
    } else if (scrollLeft === 0 && listPosition !== ListPosition.start) {
      this.setState({listPosition: ListPosition.start});
    } else if (
      scrollLeft === maxScrollLeft &&
      listPosition !== ListPosition.end
    ) {
      this.setState({listPosition: ListPosition.end});
    }
  };

  render() {
    const {listPosition, shouldScroll} = this.state;
    const links = this.props.links || teacherDashboardLinks;
    const containerStyles = this.state.shouldScroll
      ? {...styles.container, ...styles.scrollableContainer}
      : {...styles.container, ...styles.centerContainer};

    return (
      <div id={navId} style={containerStyles} onScroll={this.handleScroll}>
        {listPosition !== ListPosition.start && shouldScroll && (
          <FontAwesome
            icon="chevron-left"
            style={{...styles.chevron, ...styles.chevronLeft}}
            onClick={() => this.scrollTo(ListPosition.start)}
          />
        )}
        {links.map(link => (
          <NavLink
            key={link.url}
            to={link.url}
            style={styles.linkContainer}
            activeStyle={styles.activeLinkContainer}
          >
            <div style={styles.link}>{link.label}</div>
          </NavLink>
        ))}
        {listPosition !== ListPosition.end && shouldScroll && (
          <FontAwesome
            icon="chevron-right"
            style={{...styles.chevron, ...styles.chevronRight}}
            onClick={() => this.scrollTo(ListPosition.end)}
          />
        )}
      </div>
    );
  }
}

const NAVBAR_HEIGHT = 50;
const PADDING = 10;

const styles = {
  container: {
    width: '100%',
    height: NAVBAR_HEIGHT,
    backgroundColor: color.purple,
    display: 'flex',
    marginBottom: 30,
    overflow: 'hidden',
    position: 'relative'
  },
  centerContainer: {
    justifyContent: 'center'
  },
  scrollableContainer: {
    overflowX: 'scroll'
  },
  linkContainer: {
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: color.white,
    fontSize: 14,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    marginLeft: PADDING,
    marginRight: PADDING
  },
  activeLinkContainer: {
    borderBottom: `3px solid ${color.orange}`
  },
  link: {
    height: NAVBAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center'
  },
  chevron: {
    position: 'sticky',
    height: NAVBAR_HEIGHT,
    fontSize: 24,
    backgroundColor: color.purple,
    color: color.white,
    marginTop: 13,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    cursor: 'pointer'
  },
  chevronLeft: {
    left: 0
  },
  chevronRight: {
    right: 0
  }
};
