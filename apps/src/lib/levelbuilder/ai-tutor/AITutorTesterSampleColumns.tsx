import React from 'react';
import style from './ai-tutor-tester.module.scss';

/**
 * Renders a table that explains the columns that can be in uploaded csvs for the AITutorTester.
 */

const AITutorTesterSampleColumns: React.FC = () => {
  const rows = [
    {
      studentInput:
        "REQUIRED. The student's question e.g. 'Why doesn't my code compile?",
      systemPrompt:
        'OPTIONAL. If not included, the default system prompt is used.',
      studentCode: "OPTIONAL. The student's code.",
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
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr className={style.row}>
              <td className={style.cell}>{row.studentInput}</td>
              <td className={style.cell}>{row.systemPrompt}</td>
              <td className={style.cell}>{row.studentCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
    </div>
  );
};

export default AITutorTesterSampleColumns;
