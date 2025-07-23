import {Button} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import Papa from 'papaparse';
import React, {useState} from 'react';

import {addSkillToLevel} from './SkillsApi';
import {LevelSkill} from './types';

const LevelsSkillsCreator: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const csvSelected = !!csvFile;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<LevelSkill>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const updateData = (result: {data: LevelSkill[]}) => {
    if (result.data.length === 0) {
      alert('No data found in the CSV file.');
      return;
    }
    const validationErrors: string[] = [];
    result.data.forEach((levelSkill, index) => {
      if (!levelSkill.skillId || !levelSkill.levelId) {
        validationErrors.push(
          `Row ${index + 1} is missing skillId and/or levelId.`
        );
      }
    });
    if (validationErrors.length > 0) {
      alert(
        `Please fix: \n${validationErrors.join(
          '\n'
        )} \nThen, try the upload again.`
      );
      return;
    } else {
      createLevelsSkills(result.data);
    }
  };

  const createLevelsSkills = async (levelsSkillsData: LevelSkill[]) => {
    if (levelsSkillsData.length === 0) {
      alert('No LevelsSkills to create. Please upload a CSV first.');
      return;
    }

    for (const levelsSkill of levelsSkillsData) {
      try {
        await addSkillToLevel(levelsSkill);
      } catch (error) {
        alert(
          `Failed to add skill to level: check skillId: ${
            levelsSkill.skillId
          } for level ${levelsSkill.levelId}. Error: ${
            (error as Error).message
          }`
        );
      }
      window.location.reload();
    }
  };

  return (
    <div>
      <h2>Add Skills to Levels</h2>
      <p>
        Upload a CSV with the following columns: skillId and levelId. These ids
        are environment specific. You can check the Skills table on this page
        for skillId and the gray admin box on a level page for the levelId. The
        levelId is also in the url of the level edit page: /levels/levelId/edit.
        After upload of your CSV, double-check the Levels Skills association
        table to ensure skills are associated with levels correctly. You can
        copy this{' '}
        <Link
          openInNewTab
          href="https://docs.google.com/spreadsheets/d/1avXwCQ2qK5V3hhmFm_yk1IHzF-tUA30Tm2ZA5rq31ww/edit?usp=sharing"
        >
          template
        </Link>{' '}
        to get started.
      </p>
      <br />
      <div>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
      </div>
      <br />
      <div>
        <Button
          text="Add Skills to Levels"
          onClick={importCSV}
          disabled={!csvSelected}
        />
      </div>
    </div>
  );
};

export default LevelsSkillsCreator;
