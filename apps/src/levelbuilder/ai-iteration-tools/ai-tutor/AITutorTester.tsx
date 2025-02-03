import Papa from 'papaparse';
import React, {useEffect, useState} from 'react';

import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {formatQuestionForAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';

import AITutorTesterSampleColumns from './AITutorTesterSampleColumns';

import styles from './ai-tutor-tester.module.scss';

/**
 * Renders a series of buttons that allow levelbuilders to upload a CSV of
 * student inputs and get back AI responses in bulk.
 */

interface AIInteraction {
  studentInput: string;
  systemPrompt?: string | undefined;
  levelId?: number | undefined;
  temperature?: number | undefined;
  aiResponse: string | undefined;
}

const AITutorTester: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [data, setData] = useState<AIInteraction[]>([]);
  const [responseCount, setResponseCount] = useState<number>(0);
  const [responsesPending, setResponsesPending] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<AIInteraction>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const updateData = (result: {data: AIInteraction[]}) => {
    setData(result.data);
  };

  const getAIResponses = async () => {
    setResponsesPending(true);
    const responsePromises = data.map(async row => {
      return askAITutor(row);
    });

    await Promise.allSettled(responsePromises);
  };

  const askAITutor = async (row: AIInteraction) => {
    const chatApiResponse = await getChatCompletionMessage(
      formatQuestionForAITutor(row),
      [],
      row.systemPrompt,
      row.levelId
    );
    row.aiResponse = chatApiResponse.assistantResponse;
    setResponseCount(prevResponseCount => prevResponseCount + 1);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'ai_tutor_responses.csv');
    tempLink.click();
  };

  const csvSelected = !!csvFile;
  const dataUploaded = data.length !== 0;
  const aiResponded = dataUploaded && data.length === responseCount;

  useEffect(() => {
    if (aiResponded) {
      setResponsesPending(false);
    }
  }, [aiResponded]);

  return (
    <div>
      <h2>Generate AI Responses</h2>
      <div>
        <p>
          Upload a CSV of student inputs that will be sent to the selected
          service. AI responses will then be saved and you can download the
          resulting updated CSV.
        </p>
        <br />
        <br />
        <br />
        <AITutorTesterSampleColumns endpoint={'ai-tutor'} />
        <div>
          <div className={styles.buttonSpacing}>
            <input
              className="csv-input"
              type="file"
              name="file"
              onChange={handleChange}
            />
          </div>
          <div className={styles.buttonSpacing}>
            <Button text="Upload" onClick={importCSV} disabled={!csvSelected} />
          </div>
          <div className={styles.buttonSpacing}>
            <Button
              text="Get Responses"
              onClick={getAIResponses}
              disabled={!dataUploaded}
              isPending={responsesPending}
            />
            <span>
              {responseCount} of {data.length}
            </span>
          </div>
          <div>
            <Button
              text="Download CSV"
              onClick={downloadCSV}
              disabled={!aiResponded}
            />
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default AITutorTester;
