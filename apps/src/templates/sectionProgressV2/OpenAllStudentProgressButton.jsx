import throttle from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';

import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import FontAwesome from '../FontAwesome';
import {
  collapseMetadataForStudents,
  expandMetadataForStudents,
} from '../sectionProgress/sectionProgressRedux';

// import style from '@cdo/apps/applab/designElements/copy-element-to-screen-button.module.scss';
import style from './expand-all-rows-dropdown.module.scss';

const DROPDOWN_OFFSET = 184;

// based on CopyElementToScreenButton
function OpenAllStudentProgressButton({
  students,
  expandMetadataForStudents,
  collapseMetadataForStudents,
}) {
  const [opened, setOpened] = useState(false);
  const [menuLocation, setMenuLocation] = useState({menuTop: 0, menuLeft: 0});
  const elementRef = useRef(null);
  const resizeListener = useRef(null);

  const getAllStudentIds = students.map(student => student.id);

  const expandMetaDataForAllStudents = () => {
    expandMetadataForStudents(getAllStudentIds);
  };

  const collapseMetaDataForAllStudents = () => {
    collapseMetadataForStudents(getAllStudentIds);
  };

  const getMenuLocation = () => {
    const rect = elementRef.current.firstChild.getBoundingClientRect();
    console.log(
      rect.bottom,
      window.pageYOffset,
      rect.right,
      window.pageXOffset
    );
    return {
      menuTop: rect.bottom + window.pageYOffset,
      menuLeft: rect.right + window.pageXOffset - DROPDOWN_OFFSET,
    };
  };

  const updateMenuLocation = throttle(() => {
    setMenuLocation(getMenuLocation());
  }, 50);

  useEffect(() => {
    if (opened && !resizeListener.current) {
      resizeListener.current = updateMenuLocation;
      window.addEventListener('resize', resizeListener.current);
      setMenuLocation(getMenuLocation());
    } else if (!opened && resizeListener.current) {
      window.removeEventListener('resize', resizeListener.current);
      resizeListener.current = null;
    }

    return () => {
      if (resizeListener.current) {
        window.removeEventListener('resize', resizeListener.current);
      }
    };
  }, [updateMenuLocation, opened]);

  const handleDropdownClick = () => {
    setOpened(!opened);
  };

  const closeMenu = () => {
    if (opened) setOpened(false);
  };

  const onClose = () => {
    closeMenu();
  };

  const targetPoint = {top: menuLocation.menuTop, left: menuLocation.menuLeft};

  return (
    <div className={style.main} ref={elementRef}>
      <button
        type="button"
        className={style.expandButton}
        onClick={handleDropdownClick}
      >
        <FontAwesome icon="ellipsis-vertical" />
      </button>
      {opened && (
        <PopUpMenu
          isOpen={opened}
          targetPoint={targetPoint}
          offset={{x: -elementRef.current.firstChild.offsetWidth, y: 5}}
          onClose={onClose}
          className={style.menu}
        >
          <PopUpMenu.Item
            className={style.menuItem}
            onClick={expandMetaDataForAllStudents}
          >
            <FontAwesome icon="arrows-from-line" />
            <div>{i18n.expandAll()}</div>
          </PopUpMenu.Item>
          <PopUpMenu.Item
            className={style.menuItem}
            onClick={collapseMetaDataForAllStudents}
          >
            <FontAwesome icon="arrows-to-line" />
            <div>{i18n.collapseAll()}</div>
          </PopUpMenu.Item>
        </PopUpMenu>
      )}
    </div>
  );
}
OpenAllStudentProgressButton.propTypes = {
  students: PropTypes.arrayOf(studentShape),
  expandMetadataForStudents: PropTypes.func,
  collapseMetadataForStudents: PropTypes.func,
};

export default connect(
  state => ({
    students: state.teacherSections.selectedStudents,
  }),
  dispatch => ({
    expandMetadataForStudents: studentIds =>
      dispatch(expandMetadataForStudents(studentIds)),
    collapseMetadataForStudents: studentIds =>
      dispatch(collapseMetadataForStudents(studentIds)),
  })
)(OpenAllStudentProgressButton);
