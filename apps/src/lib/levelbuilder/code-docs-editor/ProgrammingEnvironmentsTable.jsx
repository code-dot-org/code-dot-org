import PropTypes from 'prop-types';
import React, {useState} from 'react';
import * as Table from 'reactabular-table';

import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const destroyEnvironment = (destroyPath, successCallback, failureCallback) => {
  fetch(destroyPath, {
    method: 'DELETE',
    headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
  }).then(response => {
    if (response.ok) {
      successCallback();
    } else {
      failureCallback();
    }
  });
};

export default function ProgrammingEnvironmentsTable({
  programmingEnvironments,
  hidden,
}) {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentEnvironments, setCurrentEnvironments] = useState(
    programmingEnvironments
  );

  const actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <Button
          icon="edit"
          text=""
          href={rowData.editPath}
          target="_blank"
          __useDeprecatedTag
          color="teal"
        />
        <Button
          onClick={() => setItemToDelete(rowData)}
          text=""
          icon="trash"
          color="red"
          style={{margin: 0}}
        />
      </div>
    );
  };

  const publishedFormatter = published => {
    if (published) {
      return <FontAwesome icon="check" />;
    } else {
      return null;
    }
  };

  const getColumns = () => {
    return [
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '10%'},
          },
        },
        cell: {
          formatters: [actionsCellFormatter],
        },
      },
      {
        property: 'name',
        header: {
          label: 'Name',
        },
      },
      {
        property: 'title',
        header: {
          label: 'Title',
        },
      },
      {
        property: 'published',
        header: {
          label: 'Published?',
        },
        cell: {
          formatters: [publishedFormatter],
        },
      },
    ];
  };
  if (hidden) {
    return null;
  }
  return (
    <>
      <Table.Provider columns={getColumns()} style={{width: '100%'}}>
        <Table.Header />
        <Table.Body rows={currentEnvironments} rowKey="name" />
      </Table.Provider>
      {!!itemToDelete && (
        <StylizedBaseDialog
          body="Are you sure you want to remove this IDE and all of its associated code docs?"
          handleConfirmation={() => {
            destroyEnvironment(
              `/programming_environments/${itemToDelete.name}`,
              () => {
                setCurrentEnvironments(
                  currentEnvironments.filter(
                    env => env.name !== itemToDelete.name
                  )
                );
                setItemToDelete(null);
              }
            );
          }}
          handleClose={() => setItemToDelete(null)}
          isOpen
        />
      )}
    </>
  );
}

ProgrammingEnvironmentsTable.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object),
  hidden: PropTypes.bool,
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
};
