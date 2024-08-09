import React from 'react';

import style from './ai-tutor-tester.module.scss';

/**
 * Renders a table that explains the columns that can be in uploaded csvs for the AITutorTester.
 */

interface SampleColumnsProps {
  endpoint: string;
}

const AITutorTesterSampleColumns: React.FC<SampleColumnsProps> = ({
  endpoint,
}) => {
  const studentInputRow = {
    columnHeader: 'studentInput',
    description:
      'REQUIRED. The student\'s question e.g. "Why doesn\'t my code compile?"',
  };
  const basicRows = [
    {
      columnHeader: 'systemPrompt',
      description:
        'OPTIONAL. If not included, the default system prompt is used.',
    },
    {
      columnHeader: 'levelId',
      description:
        "OPTIONAL. If provided, will be used to fetch the level's instructions and test files if applicable. Reminder: it needs to be the levelId for the level in the environment in which you're running the tester.",
    },
  ];
  const aiTutorRows = [
    {
      columnHeader: 'studentCode',
      description: "OPTIONAL. The student's code.",
    },
    {
      columnHeader: 'scriptId',
      description:
        'OPTIONAL. If provided will be used to determine the programming language.',
    },
  ];
  const genAIRows = [
    {
      columnHeader: 'temperature',
      description:
        'OPTIONAL. Temperature parameter for model customization. Default is 0.8.',
    },
  ];

  let rows = [studentInputRow];

  if (endpoint === 'ai-tutor') {
    rows = rows.concat(basicRows, aiTutorRows);
  } else if (endpoint === 'gen-ai-mistral-7b-inst-v01') {
    rows = rows.concat(basicRows, genAIRows);
  }

  return (
    <div>
      <h4>Supported columns</h4>
      <table>
        <thead>
          {rows.map(row => (
            <tr className={style.row} key={row.columnHeader}>
              <td className={style.cell}>
                <div>{row.columnHeader}</div>
              </td>
              <td className={style.cell}>
                <div>{row.description}</div>
              </td>
            </tr>
          ))}
        </thead>
      </table>
      <br />
    </div>
  );
};

export default AITutorTesterSampleColumns;
