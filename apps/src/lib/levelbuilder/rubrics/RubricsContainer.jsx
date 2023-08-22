import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {BodyTwoText, Heading1} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
// import {navigateToHref} from '@cdo/apps/utils';
import RubricEditor from './RubricEditor';
import {snakeCase} from 'lodash';

const FORM_ID = 'rubrics-container';
const RUBRIC_PATH = '/rubrics';

// Custom hook to update the list of learning goals to create
// Currently, this hook returns two things:
//   - learningGoals: list of objects that represent the learningGoals to create
//   - updateLearningGoal: function to update the learningGoal at the given index
// const useLearningGoals = learningGoal => {
//   // added "default properties" for any new learningGoal
//   const [learningGoals, setLearningGoals] = useState(
//     learningGoal
//       ? [
//           {
//             ...Object.keys(learningGoal),
//             // aiEnabled: learningGoal.aiEnabled, // not sure about this syntax
//           },
//         ]
//       : [
//           {
//             aiEnabled: false,
//           },
//         ]
//   );

//   const updateLearningGoal = (learningGoalIdx, keyToUpdate, val) => {
//     const newLearningGoals = learningGoals.map((learningGoal, idx) => {
//       if (idx === learningGoalIdx) {
//         return {
//           ...learningGoal,
//           [keyToUpdate]: val,
//         };
//       } else {
//         return learningGoal;
//       }
//     });
//     setLearningGoals(newLearningGoals);
//   };

//   return [learningGoals, updateLearningGoal];
// };

export default function RubricsContainer({
  unitName,
  lessonNumber,
  levels,
  rubric,
  lessonId,
}) {
  //////////////////// BIG MISTAKE
  // const [learningGoals, updateLearningGoal] = useLearningGoals(
  //   learningGoalToBeEdited
  // );
  // // note that the use of currentId here is temporary until we are connected to the data
  // const [currentId, setCurrentId] = useState(1);

  const [learningGoalList, setLearningGoalList] = useState(
    !!rubric
      ? [rubric.learningGoals]
      : [
          {
            key: 'learningGoal-1',
            id: 'learningGoal-1',
            learningGoal: '',
            aiEnabled: false,
          },
        ]
  );

  const generateLearningGoalKey = () => {
    let learningGoalNumber = learningGoalList.length + 1;
    while (
      learningGoalList.some(
        learningGoal =>
          learningGoal.key === `learningGoal-${learningGoalNumber}`
      )
    ) {
      learningGoalNumber++;
    }

    return `learningGoal-${learningGoalNumber}`;
  };

  // update the goal list
  // setLearningGoalList(oldList => {
  //   return [...oldList, startingData];
  // });

  const addNewConceptHandler = event => {
    // temporary tool for creating unique Ids
    event.preventDefault();

    const newKey = generateLearningGoalKey();
    const newId = newKey;
    const startingData = {
      key: newKey,
      id: newId,
      learningGoal: '',
      aiEnabled: false,
    };

    const oldLearningGoalList = learningGoalList;

    setLearningGoalList([...oldLearningGoalList, startingData]);
  };

  const deleteKeyConcept = id => {
    event.preventDefault();
    var updatedLearningGoalList = learningGoalList.filter(
      item => item.id !== id
    );
    setLearningGoalList(updatedLearningGoalList);
  };

  const handleAiEnabledChange = idToUpdate => {
    const newLearningGoalData = learningGoalList.map(learningGoal => {
      if (idToUpdate === learningGoal.id) {
        const updatedAiValue = !learningGoal.aiEnabled;
        return {
          ...learningGoal,
          ['aiEnabled']: updatedAiValue,
        };
      } else {
        return learningGoal;
      }
    });
    console.log('I am for ' + idToUpdate);
    setLearningGoalList(newLearningGoalData);
  };

  const handleLearningGoalNameChange = (updatedName, idToUpdate) => {
    const newLearningGoalData = learningGoalList.map(learningGoal => {
      if (idToUpdate === learningGoal.id) {
        return {
          ...learningGoal,
          ['learningGoal']: updatedName,
        };
      } else {
        return learningGoal;
      }
    });
    console.log('I am for ' + idToUpdate);
    setLearningGoalList(newLearningGoalData);
  };

  // TODO: Check that there is at least one programming level here
  const initialLevelForAssessment = !!rubric ? rubric.levelId : levels[0].id;
  const [selectedLevelForAssessment, setSelectedLevelForAssessment] = useState(
    initialLevelForAssessment
  );

  const saveRubric = event => {
    event.preventDefault();
    // const dataUrl = !!rubric ? `${RUBRIC_PATH}/${rubric.id}/edit?` : RUBRIC_PATH;
    const dataUrl = !!rubric ? `/rubrics/${rubric.id}/edit` : RUBRIC_PATH;
    const method = !!rubric ? 'PATCH' : 'POST';

    // Checking that the csrf-token exists since it is disabled on test
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
      ? document.querySelector('meta[name="csrf-token"]').attributes['content']
          .value
      : null;

    const learningGoalListAsData = transformKeys(learningGoalList);

    const rubric_data = {
      levelId: selectedLevelForAssessment,
      lessonId: lessonId,
      learningGoalsAttributes: learningGoalListAsData,
    };

    console.log(dataUrl);

    fetch(dataUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(rubric_data),
    })
      .then(response => {
        if (!!rubric) {
          console.log(response);
          //let redirectUrl = response.url;
          // navigateToHref(redirectUrl);
        } else {
          console.log(response);
          //let redirectUrl = response.url;
          // navigateToHref(redirectUrl);
        }
      })
      .catch(err => {
        // setIsSaveInProgress(false);
        console.error('Error saving rubric:' + err);
      });
  };

  function transformKeys(startingList) {
    let newList = [];

    startingList.forEach(item => {
      let newItem = {};
      for (const [key, value] of Object.entries(item)) {
        newItem[snakeCase(key)] = value;
      }
      newList.push(newItem);
    });

    return newList;
  }

  const handleDropdownChange = event => {
    console.log(event.target.value);
    setSelectedLevelForAssessment(event.target.value);
  };

  // TODO: In the future we might want to filter the levels in the dropdown for "submittable" levels
  //  "submittable" is in the properties of each level in the list.
  return (
    <form id={FORM_ID}>
      <Heading1>Create or modify your rubric</Heading1>
      <BodyTwoText>
        This rubric will be used for {unitName}, lesson {lessonNumber}.
      </BodyTwoText>

      <div style={styles.containerStyle}>
        <label>Choose a level for this rubric to be evaluated on</label>
        <select
          id={'rubric_level_id'}
          required={true}
          onChange={handleDropdownChange}
          value={selectedLevelForAssessment}
        >
          {levels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <RubricEditor
        handleAiEnabledChange={handleAiEnabledChange}
        learningGoalList={learningGoalList}
        addNewConcept={addNewConceptHandler}
        deleteItem={id => deleteKeyConcept(id)}
        handleLearningGoalNameChange={handleLearningGoalNameChange}
      />
      <div style={styles.bottomRow}>
        <Button
          color={Button.ButtonColor.orange}
          text="Save your rubric"
          onClick={saveRubric}
          size={Button.ButtonSize.narrow}
        />
      </div>
    </form>
  );
}

RubricsContainer.propTypes = {
  unitName: PropTypes.string,
  lessonNumber: PropTypes.number,
  levels: PropTypes.arrayOf(
    PropTypes.shape({id: PropTypes.number, name: PropTypes.string})
  ),
  rubric: PropTypes.object,
  lessonId: PropTypes.number,
};

const styles = {
  containerStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};
