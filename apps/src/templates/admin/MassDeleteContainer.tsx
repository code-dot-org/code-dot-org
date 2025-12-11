import {Button} from '@code-dot-org/component-library/button';
import Papa from 'papaparse';
import React, {useState} from 'react';
import * as Table from 'reactabular-table';

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
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: results => {
        try {
          if (results.errors.length > 0) {
            throw new Error(
              `CSV parsing errors: ${results.errors
                .map(e => e.message)
                .join(', ')}`
            );
          }

          if (!results.data || results.data.length === 0) {
            throw new Error('CSV must have at least one data row');
          }

          const headers = Object.keys(results.data[0]);

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

          // Process the data
          const parsedData: OriginalData[] = results.data.map((row, index) => {
            const studentId = row.student_id?.trim();
            const studentUsername = row.student_username?.trim();
            const unitName = row.unit_name?.trim();

            if ((!studentId && !studentUsername) || !unitName) {
              throw new Error(
                `Row ${index + 2} has missing student identifier or unit_name`
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

            return rowData;
          });

          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      },
      error: error => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
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

  const openingDirections = (
    <div>
      <h1>Mass Delete Student Progress</h1>
      <p className={styles.strongWarning}>
        Warning:Using this tool will permanently delete student progress. Use
        with caution.
      </p>
      <p>
        This tool is intended to only be used when deleting student progress by
        unit. For teacher requests needing all data to be deleted for students,
        please follow the process oulined in{' '}
        <a href="https://docs.google.com/document/d/1mBY56DeAzrwTM3CVIOFho3azTi9mudE37ZQrVZXxaMA/edit?tab=t.0#heading=h.k909psfgxiwj">
          our Process Doc.
        </a>
      </p>
      To delete student progress for multiple students by unit, please enter the{' '}
      <strong>teacher ID</strong> of the teacher associated with the student
      data and upload a <strong>CSV file</strong> using one of the following
      supported formats.
      <div className={styles.formatInfo}>
        <strong>Supported formats:</strong>
        <ul>
          <li>
            <strong>With student IDs:</strong> CSV with columns "student_id" and
            "unit_name"
          </li>
          <li>
            <strong>With usernames:</strong> CSV with columns "student_username"
            and "unit_name" (will be converted automatically)
          </li>
        </ul>
      </div>
      <hr />
    </div>
  );

  return (
    <div className={styles.massDeleteContainer}>
      {openingDirections}
      <div className={styles.teacherSection}>
        <div className={styles.inputRow}>
          <label htmlFor="teacher-id">Teacher ID:</label>
          <input
            id="teacher-id"
            type="text"
            value={teacherId}
            onChange={e => setTeacherId(e.target.value)}
            placeholder="Enter teacher ID"
            className={styles.teacherInput}
          />
        </div>
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
      </div>

      <div className={styles.buttonSection}>
        <Button
          text="Test delete"
          onClick={() => deleteProgress(true)}
          disabled={!csvData || !teacherId.trim() || hasUsernames}
        />
        <Button
          text="Delete for real"
          onClick={() => deleteProgress(false)}
          disabled={!csvData || !teacherId.trim() || hasUsernames}
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

      {csvData && csvData.length > 0 && (
        <div className={styles.dataPreview}>
          <h3>Uploaded Data Preview</h3>
          <p className={styles.previewInfo}>
            Showing {csvData.length} record{csvData.length !== 1 ? 's' : ''}
          </p>

          <div className={styles.tableContainer}>
            <Table.Provider
              className="table table-striped"
              columns={[
                {
                  property: 'index',
                  header: {
                    label: '#',
                  },
                },
                {
                  property: hasUsernames ? 'student_username' : 'student_id',
                  header: {
                    label: hasUsernames ? 'Student Username' : 'Student ID',
                  },
                },
                {
                  property: 'unit_name',
                  header: {
                    label: 'Unit Name',
                  },
                },
              ]}
            >
              <Table.Header />
              <Table.Body
                rows={csvData.map((row, index) => ({
                  ...row,
                  index: index + 1,
                  id: index,
                }))}
                rowKey="id"
              />
            </Table.Provider>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassDeleteContainer;
