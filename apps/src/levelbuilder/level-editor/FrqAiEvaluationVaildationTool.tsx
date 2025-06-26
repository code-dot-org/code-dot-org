import Button from '@code-dot-org/component-library/button';
// import Link from '@code-dot-org/component-library/link';
import Papa from 'papaparse';
import React, {useState} from 'react';

type ExampleAnswer = {
  studentWork: string;
};

const FrqAiEvaluationVaildationTool = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<ExampleAnswer[]>([]);
  const csvSelected = !!csvFile;

  const importCSV = () => {
    if (csvFile) {
      Papa.parse<ExampleAnswer>(csvFile, {
        complete: updateData,
        header: true,
      });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCsvFile(file);
    }
  };

  const updateData = (result: {
    data: {studentWork?: string; expectedResponse?: string}[];
  }) => {
    if (result.data.length === 0) {
      alert('No data found in the CSV file.');
      return;
    }
    const validationErrors: string[] = [];
    result.data.forEach((row, index) => {
      if (!row.studentWork) {
        validationErrors.push(`Row ${index + 1} is missing studentWork.`);
      }
      if (!row.expectedResponse) {
        validationErrors.push(`Row ${index + 1} is missing expectedResponse.`);
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
      // Only keep rows with both fields present and cast to ExampleAnswer
      const validRows = result.data.filter(
        (row): row is ExampleAnswer =>
          typeof row.studentWork === 'string' &&
          typeof row.expectedResponse === 'string'
      );
      setStudentAnswers(validRows);
      console.log(studentAnswers);
    }
  };

  return (
    <div>
      <h3>
        <b>This section is still under construction</b>
      </h3>
      <div>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
      </div>

      <Button
        text="Upload tagged student work"
        onClick={importCSV}
        disabled={!csvSelected}
      />
    </div>
  );
};

export default FrqAiEvaluationVaildationTool;
