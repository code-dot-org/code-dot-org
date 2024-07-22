import Papa from 'papaparse';
import React, {useEffect, useState} from 'react';

import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import {formatQuestionForAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {ChatContext} from '@cdo/apps/aiTutor/types';
import Button from '@cdo/apps/componentLibrary/button/Button';

import AITutorTesterSampleColumns from './AITutorTesterSampleColumns';

import styles from './ai-tutor-tester.module.scss';

/**
 * Renders a series of buttons that allow levelbuilders to upload a CSV of
 * student inputs and get back AI Tutor responses in bulk.
 */

interface AIInteraction extends ChatContext {
  systemPrompt?: string | undefined;
  levelId?: number | undefined;
  aiResponse: string | undefined;
}

interface AITutorTesterProps {
  allowed: boolean;
}

const AITutorTester: React.FC<AITutorTesterProps> = ({allowed}) => {
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

  const getAIResponses = () => {
    setResponsesPending(true);
    for (let i = 0; i < data.length; i++) {
      askAI(data[i]);
    }
  };

  const askAI = async (row: AIInteraction) => {
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
      <h2>Generate AI Tutor Responses</h2>
      {!allowed && (
        <h3 className={styles.denied}>
          You need to be a levelbuilder with AI Tutor access to use this tool.
        </h3>
      )}
      <p>
        Upload a CSV of student inputs that will be sent to AI Tutor. AI Tutor
        responses will then be saved and you can download the resulting updated
        CSV.
      </p>
      <AITutorTesterSampleColumns />
      <div>
        <div className={styles.buttonSpacing}>
          <input
            className="csv-input"
            type="file"
            name="file"
            onChange={handleChange}
            disabled={!allowed}
          />
        </div>

        <div className={styles.buttonSpacing}>
          <Button
            text="Upload"
            onClick={importCSV}
            disabled={!csvSelected || !allowed}
          />
        </div>

        <div className={styles.buttonSpacing}>
          <Button
            text="Get AI Tutor Responses"
            onClick={getAIResponses}
            disabled={!dataUploaded || !allowed}
            isPending={responsesPending}
          />
          <span>
            {responseCount} of {data.length}
          </span>
        </div>

        <div>
          <Button
            text=" Download CSV"
            onClick={downloadCSV}
            disabled={!aiResponded || !allowed}
          />
        </div>
      </div>
      <br />
    </div>
  );
};

export default AITutorTester;
