import Alert from '@code-dot-org/component-library/alert';
import {Button, buttonColors} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import Dialog from '@code-dot-org/component-library/dialog';
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
import React, {FC, useMemo, useState, MouseEvent, ChangeEvent} from 'react';

import styles from '../workshop.module.scss';

interface EnrollmentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  district: string;
  school: string;
  role: string;
  totalAttendance: string;
  enrolledDate: string;
}

const enrollments: EnrollmentData[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'firstnamelast@school.edu',
    district: 'CHILTON COUNTY',
    school: 'ISABELLA HIGH SCHOOL',
    role: 'Classroom Teacher',
    totalAttendance: '1/4',
    enrolledDate: '2019-06-24',
  },
  {
    id: '2',
    firstName: 'Franklin',
    lastName: 'Elephante',
    email: 'firstnamelast@school.edu',
    district: 'ISABELLA SCHOOL',
    school: 'BARACK H. OBAMA SCHOOL O...',
    role: 'Librarian/Media Specialist',
    totalAttendance: '1/4',
    enrolledDate: '2019-06-24',
  },
  {
    id: '3',
    firstName: 'Lorena',
    lastName: 'Johnson',
    email: 'firstnamelast@school.edu',
    district: 'FULTON COUNTY',
    school: 'RED LEVEL HIGH SCHOOL',
    role: 'Classroom Teacher',
    totalAttendance: '4/4',
    enrolledDate: '2019-06-24',
  },
  {
    id: '4',
    firstName: 'Thelma',
    lastName: 'Ronson',
    email: 'firstnamelast@school.edu',
    district: 'DEKALB COUNTY',
    school: 'SHADES VALLEY HIGH SCHOOL',
    role: 'Classroom Teacher',
    totalAttendance: '2/4',
    enrolledDate: '2019-06-24',
  },
  {
    id: '5',
    firstName: 'Isaac',
    lastName: 'Goldstein',
    email: 'firstnamelast@school.edu',
    district: 'MACON COUNTY',
    school: 'LEE HIGH SCHOOL',
    role: 'Classroom Teacher',
    totalAttendance: '3/4',
    enrolledDate: '2019-06-24',
  },
  {
    id: '6',
    firstName: 'Gene',
    lastName: 'Hackman',
    email: 'firstnamelast@school.edu',
    district: 'MACON COUNTY',
    school: 'LEE HIGH SCHOOL',
    role: 'Classroom Teacher',
    totalAttendance: '3/4',
    enrolledDate: '2019-06-24',
  },
];

const pluralize = (length: number): string => (length > 1 ? 's' : '');

const columns: {key: keyof EnrollmentData; label: string}[] = [
  {key: 'firstName', label: 'First name'},
  {key: 'lastName', label: 'Last name'},
  {key: 'email', label: 'Email'},
  {key: 'district', label: 'District'},
  {key: 'school', label: 'School'},
  {key: 'role', label: 'Role'},
  {key: 'totalAttendance', label: 'Total attendance'},
  {key: 'enrolledDate', label: 'Enrolled date'},
];

export const WorkshopEnrollments: FC = () => {
  const [selected, setSelected] = useState<EnrollmentData[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveToWorkshopId, setMoveToWorkshopId] = useState('');

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

  const s = useMemo(() => pluralize(selected.length), [selected]);

  const isSelected = (id: string) =>
    selected.findIndex(en => en.id === id) !== -1;

  return (
    <>
      <Box className={styles.bulkActionRow}>
        <Button
          ariaLabel="Refresh enrollment table data"
          icon={{
            iconName: 'refresh',
          }}
          isIconOnly
          onClick={() => {}}
          size="s"
        />
        <Button
          ariaLabel="Export all enrollment data as csv"
          iconLeft={{
            iconName: 'download',
          }}
          onClick={() => {}}
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
              onClick={() => setMoveDialogOpen(true)}
              size="s"
              type="secondary"
              color={buttonColors.gray}
              text={`Move selected enrollment${s}`}
            />
            <Button
              ariaLabel={`Remove selected enrollment${s}`}
              onClick={() => setDeleteDialogOpen(true)}
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
                          <BodyTwoText noMargin>{row[key]}</BodyTwoText>
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

      {deleteDialogOpen && (
        <Dialog
          onClose={() => setDeleteDialogOpen(false)}
          title={`Remove Enrollment${s}?`}
          customContent={
            <Typography noMargin semanticTag="div" visualAppearance="body-two">
              {`Are you sure you want to remove the enrollment${s} for:`}
              <ul className={styles.enrollmentList}>
                {selected.map(({id, firstName, lastName, email}) => (
                  <li
                    key={id}
                    className={styles.enrollmentListItem}
                  >{`${firstName} ${lastName} (${email})`}</li>
                ))}
              </ul>
            </Typography>
          }
          primaryButtonProps={{
            text: `Remove enrollment${s}`,
            size: 's',
            onClick: () => {},
            color: buttonColors.destructive,
          }}
          secondaryButtonProps={{
            size: 's',
            text: 'Cancel',
            type: 'secondary',
            color: buttonColors.gray,
            onClick: () => setDeleteDialogOpen(false),
          }}
        />
      )}

      {moveDialogOpen && (
        <Dialog
          onClose={() => {
            setMoveDialogOpen(false);
            setMoveToWorkshopId('');
          }}
          title={`Move Enrollment${s}?`}
          customContent={
            <>
              <Typography
                noMargin
                semanticTag="div"
                visualAppearance="body-two"
              >
                {`You are moving the following enrollment${s} for:`}
                <ul className={styles.enrollmentList}>
                  {selected.map(({id, firstName, lastName, email}) => (
                    <li
                      key={id}
                      className={styles.enrollmentListItem}
                    >{`${firstName} ${lastName} (${email})`}</li>
                  ))}
                </ul>
              </Typography>
              <Alert
                type="warning"
                text={`Warning: moving enrollment${s} will delete any associated attendance data!`}
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
            </>
          }
          primaryButtonProps={{
            text: `Move enrollment${s}`,
            size: 's',
            onClick: () => {},
            disabled: !moveToWorkshopId,
          }}
          secondaryButtonProps={{
            size: 's',
            text: 'Cancel',
            type: 'secondary',
            color: buttonColors.gray,
            onClick: () => {
              setMoveDialogOpen(false);
              setMoveToWorkshopId('');
            },
          }}
        />
      )}
    </>
  );
};
