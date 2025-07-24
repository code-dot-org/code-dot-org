import {Button} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import Papa from 'papaparse';
import React, {useState} from 'react';

import {createSkill} from './SkillsApi';
import {Skill, SkillsByConcept} from './types';

interface SkillsCreatorProps {
  skills: SkillsByConcept;
}

const SkillsCreator: React.FC<SkillsCreatorProps> = ({skills}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [data, setData] = useState<Skill[]>([]);
  const csvSelected = !!csvFile;

  const currentSkillKeys = Object.keys(skills).flatMap(concept =>
    skills[concept].map(skill => skill.key)
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<Skill>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const updateData = (result: {data: Skill[]}) => {
    if (result.data.length === 0) {
      alert('No data found in the CSV file.');
      return;
    }
    const validationErrors: string[] = [];
    result.data.forEach((skill, index) => {
      if (
        !skill.key ||
        !skill.concept ||
        !skill.description ||
        !skill.evaluationCriteria
      ) {
        validationErrors.push(
          `Row ${
            index + 1
          } is missing key, concept, description, and/or evaluationCriteria.`
        );
      }
      if (currentSkillKeys.includes(skill.key)) {
        validationErrors.push(
          `Duplicate skill key found: ${skill.key}. Keys must be unique.`
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
      setData(result.data);
      createSkills();
    }
  };

  const createSkills = async () => {
    if (data.length === 0) {
      alert('No skills to create. Please upload a CSV first.');
      return;
    }

    for (const skill of data) {
      try {
        await createSkill(skill);
      } catch (error) {
        alert(`Failed to create skill: ${skill.key}`);
      }
    }
    alert('Skills created successfully!');
    window.location.reload();
  };

  return (
    <div>
      <h2>Add New Skills</h2>
      <p>
        Upload a CSV of skills with the following columns: key, concept,
        description, evaluationCriteria. Key must be unique. After upload of
        your CSV, double-check the Skills Table to ensure your newly created
        skills are as expected. You can copy this{' '}
        <Link
          openInNewTab
          href="https://docs.google.com/spreadsheets/d/1gRuwitEoPM3kXRPSPJUSIxoahnsqO-lPxDnx3eSqdLI/edit?usp=sharing"
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
          text="Upload Skills"
          onClick={importCSV}
          disabled={!csvSelected}
        />
      </div>
    </div>
  );
};

export default SkillsCreator;
