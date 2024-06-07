import throttle from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';

import commonStyles from '@cdo/apps/commonStyles';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {
  collapseMetadataForStudents,
  expandMetadataForStudents,
} from '../sectionProgress/sectionProgressRedux';

import style from '@cdo/apps/applab/designElements/copy-element-to-screen-button.module.scss';

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
    return {
      menuTop: rect.bottom + window.pageYOffset,
      menuLeft: rect.left + window.pageXOffset,
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

  //   const handleMenuClick = () => {
  //     closeMenu();
  //     console.log('do a thing');
  //   };

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
        style={{...commonStyles.button}}
        className={style.copyElementToScreenButton}
        onClick={handleDropdownClick}
      >
        <i className="fa fa-chevron-down" />
      </button>
      {opened && (
        <PopUpMenu
          isOpen={opened}
          targetPoint={targetPoint}
          offset={{x: 0, y: 0}}
          onClose={onClose}
          className={style.menu}
        >
          <PopUpMenu.Item onClick={expandMetaDataForAllStudents}>
            {'Expand all'}
          </PopUpMenu.Item>
          <PopUpMenu.Item onClick={collapseMetaDataForAllStudents}>
            {'Collapse all'}
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
