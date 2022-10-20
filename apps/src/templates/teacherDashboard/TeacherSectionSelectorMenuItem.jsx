import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import {sectionForDropdownShape} from './shapes';
import {
  assignToSection,
  unassignSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

function TeacherSectionSelectorMenuItem({
  section,
  onClick,
  courseId,
  scriptId,
  courseOfferingId,
  courseVersionId,
  assignToSection,
  unassignSection
}) {
  const [isHovering, setIsHovering] = useState(false);

  const getIcon = () => {
    if (section.isAssigned && isHovering) {
      return (
        <FontAwesome icon="times" style={{marginRight: 5, color: color.red}} />
      );
    }
    if (!section.isAssigned && !isHovering) {
      return <FontAwesome style={{marginRight: 5}} icon="square-o" />;
    }
    return (
      <FontAwesome
        style={{marginRight: 5, color: color.level_perfect}}
        icon="check"
      />
    );
  };

  const onAssignClick = e => {
    e.preventDefault();
    e.stopPropagation();
    console.log(section);
    if (section.isAssigned) {
      unassignSection(section.id);
    } else {
      assignToSection(
        section.id,
        courseId,
        courseOfferingId,
        courseVersionId,
        scriptId
      ).then(() => console.log('finished!'));
    }
  };

  return (
    <PopUpMenu.Item onClick={onClick} style={styles.item}>
      <span
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onAssignClick}
      >
        {getIcon()}
      </span>

      <span>{section.name}</span>
    </PopUpMenu.Item>
  );
}

TeacherSectionSelectorMenuItem.propTypes = {
  section: sectionForDropdownShape,
  onClick: PropTypes.func.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  courseOfferingId: PropTypes.number,
  courseVersionId: PropTypes.number,
  assignToSection: PropTypes.func,
  unassignSection: PropTypes.func
};

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 270,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10
  }
};

export default connect(
  () => ({}),
  {
    assignToSection,
    unassignSection
  }
)(TeacherSectionSelectorMenuItem);
