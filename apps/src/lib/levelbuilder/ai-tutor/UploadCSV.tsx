import React, {useState} from 'react';
import Papa from "papaparse";
import { getChatCompletionMessage } from '@cdo/apps/aiTutor/chatApi';

/**
 * Renders 
 */

interface AIInteraction {
    id: number;
    // system_prompt: string;
    studentInput: string;
    // student_code: string;
    // ai_model: string;
    aiResponse: string | undefined;
  }
  
const UploadCSV: React.FC = () => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [data, setData] = useState<AIInteraction[]>([]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setCsvFile(file)
        }
    };
    
      const importCSV = () => {
        if (csvFile) {
            Papa.parse<AIInteraction>(csvFile, {
                complete: updateData,
                header: true
            });
        }
      };
    
      const updateData = (result: { data: any; }) => {
        setData(result.data);
      };

    const getAIResponses = () => {
        data.forEach((row) => 
            askAI(row)
        )
    }

    const askAI = async (prompt: AIInteraction) => {
        const chatApiResponse = await getChatCompletionMessage(
            prompt.studentInput,
            [],
          );
          const rowToUpdate = data.find((row) => row.id === prompt.id)
          if (rowToUpdate) {
            rowToUpdate.aiResponse = chatApiResponse.assistantResponse;
          }
    }

    const downloadCSV = () => {
        const csv = Papa.unparse(data);
        var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var csvURL = window.URL.createObjectURL(csvData);
        var tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', 'AITutorResponses.csv');
        tempLink.click();
    }

  return (
    <div>
        <h2>Import CSV File</h2>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
        <p />
        <button type="button" onClick={importCSV}>
          Upload
        </button>
        <button type="button" onClick={getAIResponses}>
          Get AI Responses
        </button>
        <button type="button" onClick={downloadCSV}>
          Download CSV
        </button>
      </div>
  );
};

export default UploadCSV;
