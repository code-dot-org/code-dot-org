import {Button} from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import styles from './mass_delete.module.scss';

// Type definitions
interface OriginalData {
  student_id?: string;
  student_username?: string;
  unit_name: string;
}

interface ProcessedData {
  student_id: string;
  unit_name: string;
}

// Utility functions
const parseCsv = (file: File): Promise<OriginalData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          throw new Error(
            'CSV must have at least a header row and one data row'
          );
        }

        // Parse header row
        const headers = lines[0]
          .split(',')
          .map(header => header.trim().toLowerCase());

        // Check for student identifier column (either student_id or student_username)
        const hasStudentId = headers.includes('student_id');
        const hasStudentUsername = headers.includes('student_username');

        if (!hasStudentId && !hasStudentUsername) {
          throw new Error(
            'CSV must have a column named "student_id" or "student_username"'
          );
        }

        if (!headers.includes('unit_name')) {
          throw new Error('CSV must have a column named "unit_name"');
        }

        // Find column indices
        const studentIdIndex = hasStudentId
          ? headers.indexOf('student_id')
          : -1;
        const studentUsernameIndex = hasStudentUsername
          ? headers.indexOf('student_username')
          : -1;
        const unitNameIndex = headers.indexOf('unit_name');

        // Parse data rows
        const parsedData: OriginalData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',').map(cell => cell.trim());

          const maxIndex = Math.max(
            studentIdIndex,
            studentUsernameIndex,
            unitNameIndex
          );

          if (cells.length < maxIndex + 1) {
            throw new Error(`Row ${i + 1} has insufficient columns`);
          }

          const studentId =
            studentIdIndex >= 0 ? cells[studentIdIndex] : undefined;
          const studentUsername =
            studentUsernameIndex >= 0 ? cells[studentUsernameIndex] : undefined;
          const unitName = cells[unitNameIndex];

          if ((!studentId && !studentUsername) || !unitName) {
            throw new Error(
              `Row ${i + 1} has missing student identifier or unit_name`
            );
          }

          const rowData: OriginalData = {
            unit_name: unitName,
          };

          if (studentId) {
            rowData.student_id = studentId;
          }

          if (studentUsername) {
            rowData.student_username = studentUsername;
          }

          parsedData.push(rowData);
        }

        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const hasUsernameColumn = (data: OriginalData[]): boolean => {
  return data.length > 0 && data[0].student_username !== undefined;
};

const getCSRFToken = (): string => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
  return token || '';
};

// Main container component
const MassDeleteContainer: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Array<{
    student_id?: string;
    student_username?: string;
    unit_name: string;
  }> | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [hasUsernames, setHasUsernames] = useState<boolean>(false);
  const [teacherId, setTeacherId] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Keep original uploaded data in state
  const [originalCsvData, setOriginalCsvData] = useState<OriginalData[]>();
  // Keep processed data ready for deletion
  const [processedCsvData, setProcessedCsvData] = useState<ProcessedData[]>();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setCsvError(null);

    if (file && file.type === 'text/csv') {
      setCsvFile(file);

      try {
        // Parse and validate CSV
        const parsedData = await parseCsv(file);
        setOriginalCsvData(parsedData);
        setCsvData(parsedData);

        // Determine if conversion is needed
        if (hasUsernameColumn(parsedData)) {
          setHasUsernames(true);
        } else {
          // Convert to ProcessedData format for data that already has student_id
          const processedData = parsedData.map(item => ({
            student_id: item.student_id!,
            unit_name: item.unit_name,
          }));
          setProcessedCsvData(processedData);
          setHasUsernames(false);
        }
      } catch (error) {
        setCsvError(
          error instanceof Error ? error.message : 'Failed to parse CSV'
        );
        setCsvData(null);
        setOriginalCsvData(undefined);
        setProcessedCsvData(undefined);
      }
    } else {
      setCsvError('Please upload a valid CSV file');
    }
  };

  const convertUsernamesToIds = async () => {
    if (!originalCsvData || !hasUsernames) {
      console.log('No username data to convert');
      return;
    }

    setIsConverting(true);
    setConversionError(null);
    console.log('Starting username to ID conversion...');

    try {
      const response = await fetch('/admin/convert_usernames_to_ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          csv_data: originalCsvData,
          teacher_id: teacherId,
        }),
      });

      if (!response.ok) {
        console.info(
          `HTTP error for convert_usernames_to_ids. status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setProcessedCsvData(result.converted_data);
        setCsvData(result.converted_data);
        setHasUsernames(false);
      }
    } catch (error) {
      console.error('Error during conversion:', error);
      setConversionError(
        error instanceof Error
          ? error.message
          : 'Failed to convert usernames to student IDs. Please try again.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  const deleteProgress = async (isDryRun = true) => {
    try {
      const response = await fetch('/admin/delete_user_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          csv_data: processedCsvData,
          teacher_id: teacherId,
          dry_run: isDryRun,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        console.log('Delete operation completed successfully');
        console.log('Result:', result);

        // Show user-friendly feedback
        alert(
          `${
            result.dry_run ? 'Test delete' : 'Actual delete'
          } completed successfully. Check console for details.`
        );
      } else {
        console.error('Delete operation failed:', result);
        throw new Error(
          result.error +
            (result.details ? `\n\nDetails: ${result.details}` : '')
        );
      }
    } catch (error) {
      console.error('Error during deletion:', error);
      alert(
        error instanceof Error
          ? `Delete operation failed: ${error.message}`
          : 'Delete operation failed. Please try again.'
      );
      throw error;
    }
  };

  return (
    <div className={styles.massDeleteContainer}>
      <h1>Mass Delete Student Progress</h1>

      <div className={styles.teacherSection}>
        <label htmlFor="teacher-id">Teacher ID or Email:</label>
        <input
          id="teacher-id"
          type="text"
          value={teacherId}
          onChange={e => setTeacherId(e.target.value)}
          placeholder="Enter teacher ID"
          className={styles.teacherInput}
        />
        <p className={styles.helperText}>
          Required: The teacher whose students' progress will be deleted
        </p>
      </div>

      <div className={styles.uploadSection}>
        <label htmlFor="csv-upload">Upload CSV file:</label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className={styles.fileInput}
        />
        {csvError && (
          <div className={styles.errorMessage}>Error: {csvError}</div>
        )}
        {csvFile && !csvError && (
          <div>
            <p>
              File uploaded: {csvFile.name} ({csvData?.length || 0} rows)
            </p>
            {hasUsernames ? (
              <div>
                <p className={styles.warningMessage}>
                  ⚠️ CSV contains usernames - will need conversion to IDs before
                  deletion
                </p>
                <Button
                  text={
                    isConverting
                      ? 'Converting...'
                      : 'Convert usernames to student IDs'
                  }
                  onClick={convertUsernamesToIds}
                  disabled={isConverting}
                  className={
                    isConverting ? styles.converting : styles.convertButton
                  }
                />
                {conversionError && (
                  <p className={styles.conversionError}>{conversionError}</p>
                )}
              </div>
            ) : (
              <p className={styles.successMessage}>
                ✅ CSV contains student IDs - ready for deletion
              </p>
            )}
          </div>
        )}
        <div className={styles.formatInfo}>
          <p>
            <strong>Supported formats:</strong>
          </p>
          <ul>
            <li>
              <strong>With student IDs:</strong> CSV with columns "student_id"
              and "unit_name"
            </li>
            <li>
              <strong>With usernames:</strong> CSV with columns
              "student_username" and "unit_name" (will be converted
              automatically)
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.buttonSection}>
        <Button
          text="Test delete"
          onClick={() => deleteProgress(true)}
          disabled={!csvData || !teacherId.trim()}
        />
        <Button
          text="Delete for real"
          onClick={() => deleteProgress(false)}
          disabled={!csvData || !teacherId.trim()}
        />
        {(!csvData || !teacherId.trim()) && (
          <p className={styles.disabledInfo}>
            {!teacherId.trim() && !csvData
              ? 'Please enter a Teacher ID and upload a CSV file'
              : !teacherId.trim()
              ? 'Please enter a Teacher ID'
              : 'Please upload a CSV file'}
          </p>
        )}
      </div>

      {/* Data Preview Table */}
      {csvData && csvData.length > 0 && (
        <div className={styles.dataPreview}>
          <h3>Uploaded Data Preview</h3>
          <p className={styles.previewInfo}>
            Showing {csvData.length} record{csvData.length !== 1 ? 's' : ''}
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableHeaderCell}>#</th>
                  {hasUsernames ? (
                    <th className={styles.tableHeaderCell}>Student Username</th>
                  ) : (
                    <th className={styles.tableHeaderCell}>Student ID</th>
                  )}
                  <th className={styles.tableHeaderCell}>Unit Name</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.indexCell}>{index + 1}</td>
                    <td className={styles.tableCell}>
                      {hasUsernames ? row.student_username : row.student_id}
                    </td>
                    <td className={styles.lastCell}>{row.unit_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {csvData.length > 10 && (
            <p className={styles.tableNote}>
              Note: All {csvData.length} records will be processed during
              deletion.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MassDeleteContainer;
