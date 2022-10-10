import React, {useState} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import AssignmentSelector from './AssignmentSelector';
import Button from '@cdo/apps/templates/Button';
import {asyncLoadSectionData} from './teacherSectionsRedux';

function useSelectedSectionIds() {
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const addSelectedSectionId = id => {
    if (!selectedSectionIds.includes(id)) {
      setSelectedSectionIds([...selectedSectionIds, id]);
    }
  };

  const removeSelectedSectionId = id => {
    const itemIndex = selectedSectionIds.indexOf(id);
    if (itemIndex > -1) {
      const copiedSelection = [...selectedSectionIds];
      copiedSelection.split(itemIndex, 1);
      setSelectedSectionIds(copiedSelection);
    }
  };

  return [selectedSectionIds, addSelectedSectionId, removeSelectedSectionId];
}

// Dialog to change the assignment of multiple sections at once
// Note that this does not work for PL sections as the assignment
// list would be trickier to determine
function MultiChangeAssignmentDialog({
  courseOfferings,
  sections,
  handleClose,
  reloadSectionData
}) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [
    selectedSectionIds,
    addSelectedSectionId,
    removeSelectedSectionId
  ] = useSelectedSectionIds();

  const onSave = () => {
    fetch('/api/v1/sections/multi_update_assignment', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        section_ids: selectedSectionIds,
        course_offering_id: selectedAssignment.courseOfferingId,
        course_version_id: selectedAssignment.courseVersionId,
        script_id: selectedAssignment.unitId
      })
    }).then(() => {
      reloadSectionData();
      handleClose();
    });
  };

  console.log(sections);

  return (
    <BaseDialog isOpen handleClose={handleClose}>
      Assign
      <AssignmentSelector
        courseOfferings={courseOfferings}
        onChange={selected => setSelectedAssignment(selected)}
        participantTypeDefault="student"
      />
      to
      <div>
        {sections.map(section => (
          <label key={section.id} style={{paddingRight: 3}}>
            {section.name}
            <input
              type="checkbox"
              onClick={e =>
                e.target.checked
                  ? addSelectedSectionId(section.id)
                  : removeSelectedSectionId(section.id)
              }
            />
          </label>
        ))}
      </div>
      <Button onClick={onSave} text="Save" />
    </BaseDialog>
  );
}

export default connect(
  state => ({
    courseOfferings: state.teacherSections.courseOfferings,
    sections: Object.values(state.teacherSections.sections)
  }),
  dispatch => ({
    reloadSectionData() {
      dispatch(asyncLoadSectionData());
    }
  })
)(MultiChangeAssignmentDialog);
