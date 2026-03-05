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
  masteryLevel: string;
}

interface StudentSkills {
  [skillId: string]: MasteryLevel;
}

interface MasteryData {
  [studentId: number]: StudentSkills;
}

interface Skill {
  id: number;
  key: string;
  description: string;
}

interface SkillsData {
  [skillId: string]: Skill;
}

interface SkillsResponse {
  evaluationData: MasteryData;
  skillsData: Skill[];
}

const SkillsDashboard: React.FC<SkillsDashboardProps> = () => {
  const selectedSection = useAppSelector(selectedSectionSelector);
  const students = useAppSelector(
    state => state.teacherSections.selectedStudents
  );

  const [masteryData, setMasteryData] = React.useState<MasteryData | null>(
    null
  );

  const [skillsData, setSkillsData] = React.useState<SkillsData | null>(null);

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
    return HttpClient.fetchJson<SkillsResponse>(
      dataUrl(selectedSection.id, selectedSection.unitName)
    ).then(response => {
      if (response?.value?.skillsData) {
        setMasteryData(response.value.evaluationData as MasteryData);
        setSkillsData(
          Object.fromEntries(
            response.value.skillsData.map(skill => [skill.id, skill])
          ) as SkillsData
        );
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
      {masteryData && skillsData ? (
        <div>
          {Object.entries(masteryData).map(([studentId, skills]) => (
            <div key={studentId}>
              <h3>
                StudentName:{' '}
                {
                  students.find(student => student.id === Number(studentId))
                    ?.name
                }
              </h3>
              <ul>
                {Object.entries(skills).map(([skillId, skillMastery]) => (
                  <li key={skillId}>
                    {skillsData[skillId]?.key || skillId}:{' '}
                    {(skillMastery as MasteryLevel).masteryLevel}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No mastery data loaded.</p>
      )}
    </div>
  );
};

export default SkillsDashboard;
