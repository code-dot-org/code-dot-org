import React, {useEffect, useState} from 'react';
import Papa from 'papaparse';
import {getChatCompletionMessage} from '@cdo/apps/aiTutor/chatApi';
import Button from '@cdo/apps/componentLibrary/button/Button';

/**
 * Renders a series of buttons that allow levelbuilders to upload a CSV of
 * student inputs and get back AI Tutor responses in bulk.
 */

interface AIInteraction {
  id: number;
  studentInput: string;
  aiResponse: string | undefined;
}

const AITutorResponseGenerator: React.FC = () => {
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
    setResponsesPending(true)
    for (let i = 0; i < data.length; i++) {
      askAI(data[i]);
    }
  };

  const askAI = async (prompt: AIInteraction) => {
    const chatApiResponse = await getChatCompletionMessage(
      prompt.studentInput,
      []
    );
    prompt.aiResponse = chatApiResponse.assistantResponse;
    setResponseCount(prevResponseCount => prevResponseCount + 1);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const csvURL = window.URL.createObjectURL(csvData);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'AITutorResponses.csv');
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
      <p>
        This allows you to upload a CSV of student inputs that will be sent to
        AI Tutor. AI Tutor responses will then be saved and you can download the
        resulting updated CSV. Your CSV must include a `studentInput` column to
        succeed.
      </p>
      <div style={{marginBottom: '10px'}}>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
      </div>

      <div style={{marginBottom: '10px'}}>
        <Button text="Upload" onClick={importCSV} disabled={!csvSelected} />
      </div>

      <div style={{marginBottom: '10px'}}>
        <Button
          text="Get AI Tutor Responses"
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
          text=" Download CSV"
          onClick={downloadCSV}
          disabled={!aiResponded}
        />
      </div>
    </div>
  );
};

export default AITutorResponseGenerator;
