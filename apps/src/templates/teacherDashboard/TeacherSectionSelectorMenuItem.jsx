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
  const [isPending, setIsPending] = useState(false);

  const getIcon = () => {
    if (isPending) {
      return <FontAwesome icon="spinner" style={{marginRight: 5}} />;
    }

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
    setIsPending(true);
    if (section.isAssigned) {
      unassignSection(section.id).then(() => setIsPending(false));
    } else {
      assignToSection(
        section.id,
        courseId,
        courseOfferingId,
        courseVersionId,
        scriptId
      ).then(() => setIsPending(false));
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      onAssignClick(e);
    }
  };

  return (
    <PopUpMenu.Item onClick={onClick} style={styles.item} tabIndex="0">
      <span
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={!isPending && onAssignClick}
        onKeyDown={!isPending && onKeyDown}
        tabIndex="0"
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
