import Alert from '@code-dot-org/component-library/alert';
import {Button, buttonColors} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import Typography, {
  BodyTwoText,
  OverlineThreeText,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  Box,
  Divider,
} from '@mui/material';
import classNames from 'classnames';
import React, {
  FC,
  useState,
  MouseEvent,
  ChangeEvent,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {useOutletContext} from 'react-router-dom';

import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {EducatorRoles} from '@cdo/generated-scripts/sharedConstants';

import {EnrollmentData} from '../../WorkshopFormTemplate/types';
import {WorkshopContextValue} from '../types';

import styles from '../workshop.module.scss';

const pluralize = (length: number): string => (length > 1 ? 's' : '');

const columns: {key: keyof EnrollmentData; label: string}[] = [
  {key: 'givenName', label: 'First name'},
  {key: 'familyName', label: 'Last name'},
  {key: 'email', label: 'Email'},
  {key: 'districtName', label: 'District'},
  {key: 'schoolName', label: 'School'},
  {key: 'role', label: 'Role'},
  {key: 'attendances', label: 'Total attendance'},
  {key: 'enrolledDate', label: 'Enrolled date'},
];

export const WorkshopEnrollments: FC = () => {
  const {
    enrollments,
    workshop,
    refetchEnrollments,
    enrollmentsLoading,
    enrollmentsError,
  } = useOutletContext<WorkshopContextValue>();

  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selected, setSelected] = useState<EnrollmentData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeDialog, setActiveDialog] = useState<'move' | 'remove' | null>(
    null
  );
  const [moveToWorkshopId, setMoveToWorkshopId] = useState('');
  const [animateRefreshButton, setAnimateRefreshButton] = useState(false);
  const [removeEnrollmentError, setRemoveEnrollmentError] = useState('');
  const [moveEnrollmentError, setMoveEnrollmentsError] = useState('');

  const s = useMemo(() => pluralize(selected.length), [selected]);

  const [selectedAlreadyAttended, selectedNotAttended] = useMemo(
    () =>
      selected.reduce(
        (
          acc: [EnrollmentData[], EnrollmentData[]],
          enrollment: EnrollmentData
        ) => {
          acc[enrollment.attendances > 0 ? 0 : 1].push(enrollment);
          return acc;
        },
        [[], []]
      ),
    [selected]
  );

  const isSelected = useCallback(
    (id: number) => selected.findIndex(en => en.id === id) !== -1,
    [selected]
  );

  const renderCellValue = (row: EnrollmentData, key: keyof EnrollmentData) => {
    const value = row[key];
    if (key === 'role') {
      return EducatorRoles.find(role => role.value === value)?.label ?? '';
    }
    if (key === 'attendances') {
      return `${value}/${workshop?.sessions.length ?? '0'}`;
    }
    return value;
  };

  const resetStateAfterBulkAction = () => {
    setActiveDialog(null);
    setSelected([]);
    setPage(0);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(enrollments);
      return;
    }
    setSelected([]);
  };

  const handleClick = (enrollment: EnrollmentData) => {
    const selectedIndex = selected.findIndex(e => e.id === enrollment.id);
    let newSelected: EnrollmentData[] = [];

    if (selectedIndex === -1) {
      newSelected = selected.concat(enrollment);
    } else {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleWorkshopIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const numericValue = event.target.value.replace(/\D/g, '');
    setMoveToWorkshopId(numericValue);
  };

  const handleRefreshClick = () => {
    setAnimateRefreshButton(true);
    refetchEnrollments();

    refreshTimeout.current = setTimeout(() => {
      setAnimateRefreshButton(false);
      refreshTimeout.current = null;
    }, 1000);
  };

  const handleDownload = () => {
    if (!workshop?.id) return;
    window.open(`/api/v1/pd/workshops/${workshop.id}/enrollments.csv`);
  };

  const handleRemoveEnrollments = async () => {
    setRemoveEnrollmentError('');
    try {
      if (!workshop || !selectedNotAttended.length) return;
      const authToken = await getAuthenticityToken();
      const deletePromises = selectedNotAttended.map(({id}) =>
        fetch(`/api/v1/pd/workshops/${workshop.id}/enrollments/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': authToken,
          },
        })
      );

      const results = await Promise.all(deletePromises);

      if (results.every(({ok}) => ok)) {
        resetStateAfterBulkAction();
      } else {
        setRemoveEnrollmentError(
          `There was an error while removing enrollments. Please try again.`
        );
      }
      refetchEnrollments();
    } catch (unknownError) {
      setRemoveEnrollmentError('An unknown error occurred. Please try again.');
    }
  };

  const handleMoveEnrollments = async () => {
    setMoveEnrollmentsError('');
    try {
      if (!selected.length) return;

      // Build query string manually to avoid URL encoding the brackets
      const enrollmentIds = selected
        .map(({id}) => `enrollment_ids[]=${encodeURIComponent(id)}`)
        .join('&');
      const queryString = `destination_workshop_id=${encodeURIComponent(
        moveToWorkshopId
      )}&${enrollmentIds}`;

      const response = await fetch(
        `/api/v1/pd/enrollments/move?${queryString}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
        }
      );

      if (response.ok) {
        resetStateAfterBulkAction();
        setMoveToWorkshopId('');
      } else {
        setMoveEnrollmentsError(
          `There was an error while moving enrollments. Please try again.`
        );
      }
      refetchEnrollments();
    } catch (unknownError) {
      setMoveEnrollmentsError('An unknown error occurred. Please try again.');
    }
  };

  useEffect(
    // cleanup function used to clear timeout
    () => () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    },
    []
  );

  if (!enrollments.length && enrollmentsLoading) {
    return <FontAwesomeV6Icon iconName="spinner" animationType="spin" />;
  }

  if (enrollmentsError) {
    return (
      <Alert
        size="m"
        text="There was an error fetching enrollments. Please try again."
        type="danger"
      />
    );
  }

  if (!enrollments.length) {
    return (
      <Alert
        size="m"
        text="No enrollments found for this workshop"
        type="warning"
      />
    );
  }

  return (
    <>
      <Box className={styles.bulkActionRow}>
        <Button
          ariaLabel="Refresh enrollment table data"
          icon={{
            iconName: 'refresh',
            animationType:
              animateRefreshButton || enrollmentsLoading ? 'spin' : undefined,
          }}
          isIconOnly
          onClick={handleRefreshClick}
          size="s"
        />
        <Button
          ariaLabel="Export all enrollment data as csv"
          iconLeft={{
            iconName: 'download',
          }}
          onClick={handleDownload}
          size="s"
          type="secondary"
          color={buttonColors.gray}
          text="Export all"
        />
        {selected.length > 0 && (
          <>
            <Divider
              flexItem
              orientation="vertical"
              className={styles.actionDivider}
            />
            <OverlineTwoText noMargin className={styles.numSelectedText}>
              {selected.length} selected
            </OverlineTwoText>
            <Button
              ariaLabel={`Move selected enrollment${s}`}
              onClick={() => setActiveDialog('move')}
              size="s"
              type="secondary"
              color={buttonColors.gray}
              text={`Move selected enrollment${s}`}
            />
            <Button
              ariaLabel={`Remove selected enrollment${s}`}
              onClick={() => setActiveDialog('remove')}
              size="s"
              type="secondary"
              color={buttonColors.destructive}
              text={`Remove selected enrollment${s}`}
            />
          </>
        )}
      </Box>
      <Card className={styles.card}>
        <TableContainer>
          <Table
            aria-label="Workshop enrollments"
            className={styles.enrollmentsTable}
          >
            <TableHead>
              <TableRow
                className={classNames(styles.tableRow, styles.headerRow)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    name="select-all"
                    className={styles.checkbox}
                    checked={
                      enrollments.length > 0 &&
                      selected.length === enrollments.length
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < enrollments.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {columns.map(({label, key}) => (
                  <TableCell key={key}>
                    <OverlineThreeText noMargin>{label}</OverlineThreeText>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
                  const isItemSelected = isSelected(row.id);

                  return (
                    <TableRow
                      className={classNames(styles.tableRow, {
                        [styles.selected]: isItemSelected,
                      })}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          name={`select-${row.id}`}
                          className={styles.checkbox}
                          checked={isItemSelected}
                          onChange={() => handleClick(row)}
                        />
                      </TableCell>
                      {columns.map(({key}) => (
                        <TableCell key={key}>
                          <BodyTwoText noMargin>
                            {renderCellValue(row, key)}
                          </BodyTwoText>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className={styles.tableFooter}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={enrollments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {activeDialog === 'remove' && (
        <Dialog
          id="remove-enrollments-dialog"
          onClose={() => {
            setActiveDialog(null);
            setRemoveEnrollmentError('');
          }}
          title={`Remove Enrollment${s}?`}
          customContent={
            <Box id="dsco-dialog-description">
              <Typography semanticTag="div" visualAppearance="body-two">
                {`Are you sure you want to remove the enrollment${s} for:`}
                <ul className={styles.enrollmentList}>
                  {selectedNotAttended.map(
                    ({id, givenName, familyName, email}) => (
                      <li
                        key={id}
                        className={styles.enrollmentListItem}
                      >{`${givenName} ${familyName} (${email})`}</li>
                    )
                  )}
                </ul>
              </Typography>
              {selectedAlreadyAttended.length > 0 && (
                <>
                  <Alert
                    type="warning"
                    text={`The following users have already attended a session and cannot be removed.`}
                  />
                  <Typography
                    noMargin
                    semanticTag="div"
                    visualAppearance="body-two"
                  >
                    <ul className={styles.enrollmentList}>
                      {selectedAlreadyAttended.map(
                        ({id, givenName, familyName, email}) => (
                          <li
                            key={id}
                            className={styles.enrollmentListItem}
                          >{`${givenName} ${familyName} (${email})`}</li>
                        )
                      )}
                    </ul>
                  </Typography>
                </>
              )}
              {removeEnrollmentError && (
                <Alert
                  className={styles.dialogErrorMessage}
                  type="danger"
                  text={removeEnrollmentError}
                />
              )}
            </Box>
          }
          primaryButtonProps={{
            text: `Remove enrollment${s}`,
            size: 's',
            onClick: handleRemoveEnrollments,
            color: buttonColors.destructive,
          }}
          secondaryButtonProps={{
            size: 's',
            text: 'Cancel',
            type: 'secondary',
            color: buttonColors.gray,
            onClick: () => {
              setActiveDialog(null);
              setRemoveEnrollmentError('');
            },
          }}
        />
      )}

      {activeDialog === 'move' && (
        <Dialog
          id="move-enrollments-dialog"
          onClose={() => {
            setActiveDialog(null);
            setMoveToWorkshopId('');
          }}
          title={`Move Enrollment${s}?`}
          customContent={
            <Box id="dsco-dialog-description">
              <Typography semanticTag="div" visualAppearance="body-two">
                {`You are moving the following enrollment${s} for:`}
                <ul className={styles.enrollmentList}>
                  {selected.map(({id, givenName, familyName, email}) => (
                    <li
                      key={id}
                      className={styles.enrollmentListItem}
                    >{`${givenName} ${familyName} (${email})`}</li>
                  ))}
                </ul>
              </Typography>
              <Alert
                type="warning"
                text={`Warning: moving ${
                  s ? '' : 'this'
                } enrollment${s} will delete any associated attendance data!`}
              />
              <TextField
                className={styles.workshopIdField}
                size="s"
                name="workshop-id"
                label="Destination workshop id:"
                helperMessage="The number at the end of the workshop's url"
                onChange={handleWorkshopIdChange}
                value={moveToWorkshopId}
              />
              {moveEnrollmentError && (
                <Alert
                  className={styles.dialogErrorMessage}
                  type="danger"
                  text={moveEnrollmentError}
                />
              )}
            </Box>
          }
          primaryButtonProps={{
            text: `Move enrollment${s}`,
            size: 's',
            onClick: handleMoveEnrollments,
            disabled: !moveToWorkshopId,
          }}
          secondaryButtonProps={{
            size: 's',
            text: 'Cancel',
            type: 'secondary',
            color: buttonColors.gray,
            onClick: () => {
              setActiveDialog(null);
              setMoveToWorkshopId('');
            },
          }}
        />
      )}
    </>
  );
};
