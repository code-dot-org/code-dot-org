import React from 'react';

import style from './ai-tutor-tester.module.scss';

/**
 * Renders a table that explains the columns that can be in uploaded csvs for the AITutorTester.
 */

const AITutorTesterSampleColumns: React.FC = () => {
  const rows = [
    {
      id: 1,
      studentInput:
        "REQUIRED. The student's question e.g. 'Why doesn't my code compile?",
      systemPrompt:
        'OPTIONAL. If not included, the default system prompt is used.',
      studentCode: "OPTIONAL. The student's code.",
      levelId:
        "OPTIONAL. If provided, will be used to fetch the level's instructions and test files if applicable. Reminder: it needs to be the levelId for the level in the environment in which you're running the tester.",
      scriptId:
        'OPTIONAL. If provided will be used to determine the programming language.',
    },
  ];
  return (
    <div>
      <h4>Supported columns</h4>
      <table>
        <thead>
          <tr className={style.row}>
            <td className={style.cell}>
              <div>studentInput</div>
            </td>
            <td className={style.cell}>
              <div>systemPrompt</div>
            </td>
            <td className={style.cell}>
              <div>studentCode</div>
            </td>
            <td className={style.cell}>
              <div>levelId</div>
            </td>
            <td className={style.cell}>
              <div>scriptId</div>
            </td>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr className={style.row} key={row.id}>
              <td className={style.cell}>{row.studentInput}</td>
              <td className={style.cell}>{row.systemPrompt}</td>
              <td className={style.cell}>{row.studentCode}</td>
              <td className={style.cell}>{row.levelId}</td>
              <td className={style.cell}>{row.scriptId}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
    </div>
  );
};

export default AITutorTesterSampleColumns;
