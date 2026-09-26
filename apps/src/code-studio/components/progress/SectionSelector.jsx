/**
 * A dropdown for switching the selected section. Which URL carries the section
 * differs by context, so changing it is split in two: away from the teacher
 * dashboard the section lives in the section_id query param, on the teacher
 * dashboard it is a segment of the route.
 */
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {
  generatePath,
  matchPath,
  useInRouterContext,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {selectSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionsNameAndId} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {LABELED_TEACHER_NAVIGATION_PATHS} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

import {reload} from '../../../utils';
import {updateQueryParam} from '../../utils';

// Exported for unit testing
export const NO_SELECTED_SECTION_VALUE = '';

const sharedPropTypes = {
  className: PropTypes.string,
  requireSelection: PropTypes.bool,
  alwaysShow: PropTypes.bool,
  reloadOnChange: PropTypes.bool,

  // redux provided
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedSectionId: PropTypes.number,
  selectSection: PropTypes.func.isRequired,
};

function SectionDropdown({
  className,
  requireSelection,
  sections,
  selectedSectionId,
  onSelectSection,
}) {
  const items = (
    requireSelection
      ? []
      : [{value: NO_SELECTED_SECTION_VALUE, text: i18n.selectSection()}]
  ).concat(sections.map(({id, name}) => ({value: String(id), text: name})));

  return (
    <SimpleDropdown
      className={classNames('uitest-sectionselect', className)}
      name="sections"
      size="s"
      labelText={i18n.selectSection()}
      isLabelVisible={false}
      items={items}
      selectedValue={String(selectedSectionId || NO_SELECTED_SECTION_VALUE)}
      onChange={event => onSelectSection(event.target.value)}
    />
  );
}

SectionDropdown.propTypes = {
  className: sharedPropTypes.className,
  requireSelection: sharedPropTypes.requireSelection,
  sections: sharedPropTypes.sections,
  selectedSectionId: sharedPropTypes.selectedSectionId,
  onSelectSection: PropTypes.func.isRequired,
};

function QueryParamSectionSelector({reloadOnChange, selectSection, ...props}) {
  const onSelectSection = newSectionId => {
    updateQueryParam(
      'section_id',
      newSectionId === NO_SELECTED_SECTION_VALUE ? undefined : newSectionId
    );
    // If we have a user_id when we switch sections we should get rid of it
    updateQueryParam('user_id', undefined);
    if (reloadOnChange) {
      reload();
    } else {
      selectSection(newSectionId);
    }
  };

  return <SectionDropdown {...props} onSelectSection={onSelectSection} />;
}

QueryParamSectionSelector.propTypes = sharedPropTypes;

/**
 * On the teacher dashboard the route's :sectionId is the source of truth, and
 * TeacherNavigationBar dispatches selectSection whenever redux disagrees with
 * it. Dispatching from here instead would be reverted by that effect on the
 * next render, leaving the dropdown on the old section. Navigate instead, and
 * let that same effect update redux and load the new section's data.
 */
function RoutedSectionSelector(props) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const params = useParams();

  const routePattern = React.useMemo(
    () =>
      Object.values(LABELED_TEACHER_NAVIGATION_PATHS).find(
        ({absoluteUrl}) => !!matchPath(absoluteUrl, pathname)
      )?.absoluteUrl,
    [pathname]
  );

  if (!routePattern || !params.sectionId) {
    return <QueryParamSectionSelector {...props} />;
  }

  const onSelectSection = newSectionId => {
    if (newSectionId === NO_SELECTED_SECTION_VALUE) {
      return;
    }
    navigate(generatePath(routePattern, {...params, sectionId: newSectionId}));
  };

  return (
    <SectionDropdown
      className={props.className}
      requireSelection={props.requireSelection}
      sections={props.sections}
      selectedSectionId={props.selectedSectionId}
      onSelectSection={onSelectSection}
    />
  );
}

RoutedSectionSelector.propTypes = sharedPropTypes;

function SectionSelector(props) {
  const inRouterContext = useInRouterContext();

  if (props.sections.length === 0) {
    return null;
  }

  return inRouterContext ? (
    <RoutedSectionSelector {...props} />
  ) : (
    <QueryParamSectionSelector {...props} />
  );
}

SectionSelector.propTypes = sharedPropTypes;

export const UnconnectedSectionSelector = SectionSelector;

export default connect(
  state => ({
    selectedSectionId: state.teacherSections.selectedSectionId,
    sections: sectionsNameAndId(state.teacherSections),
  }),
  dispatch => ({
    selectSection(sectionId) {
      dispatch(selectSection(sectionId));
    },
  })
)(SectionSelector);
