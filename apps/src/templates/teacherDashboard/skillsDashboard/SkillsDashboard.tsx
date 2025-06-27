import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectedSectionSelector} from '../teacherSectionsReduxSelectors';

interface SkillsDashboardProps {}

const EVALUATE_URL = '/openai/evaluate_section';
const dataUrl = (sectionId: number, unitName: string) =>
  `/skills/section/${sectionId}/unit/${unitName}`;

interface MasteryLevel {
  mastery_level: string;
}

interface StudentSkills {
  [skillId: string]: MasteryLevel;
}

interface MasteryData {
  [studentId: number]: StudentSkills;
}

const SkillsDashboard: React.FC<SkillsDashboardProps> = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);

  const [masteryData, setMasteryData] = React.useState<MasteryData | null>(
    null
  );

  const evaluateSkills = React.useCallback(() => {
    return HttpClient.post(
      EVALUATE_URL,
      JSON.stringify({
        sectionId: selectedSection.id,
        unitName: selectedSection.unitName,
      }),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
  }, [selectedSection.id, selectedSection.unitName]);

  const loadSkillEvaluations = React.useCallback(() => {
    console.log('lfm', dataUrl(selectedSection.id, selectedSection.unitName));
    return HttpClient.fetchJson(
      dataUrl(selectedSection.id, selectedSection.unitName)
    ).then(response => {
      if (response?.value) {
        setMasteryData(response.value.skillsData as MasteryData);
      } else {
        console.error('Failed to load skill evaluations');
      }
      return response;
    });
  }, [selectedSection.id, selectedSection.unitName]);

  return (
    <div>
      <h1>Skills Dashboard</h1>
      <Button onClick={evaluateSkills} text="Evaluate Skills" />
      <Button onClick={loadSkillEvaluations} text="Load Skill Evaluations" />
      {masteryData && <pre>{JSON.stringify(masteryData, null, 2)}</pre>}
      {/* Dashboard content will go here */}
    </div>
  );
};

export default SkillsDashboard;
