import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import _, {orderBy} from 'lodash';
import moment from 'moment';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import {WorkshopTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {StatusColors, getApplicationStatuses} from './constants';
import {
  UNMATCHED_PARTNER_VALUE,
  ALL_PARTNERS_VALUE,
  RegionalPartnerPropType
} from '../components/regional_partner_dropdown';

const styles = {
  container: {
    overflowX: 'auto'
  },
  table: {
    width: '100%'
  },
  statusCellCommon: {
    padding: '5px'
  },
  statusCell: StatusColors,
  notesCell: {
    maxWidth: '200px'
  },
  notesCellContent: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '2px'
  }
};

export class CohortViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    viewType: PropTypes.oneOf(['facilitator', 'teacher']).isRequired,
    regionalPartnerGroup: PropTypes.number,
    isWorkshopAdmin: PropTypes.bool,
    regionalPartnerFilter: RegionalPartnerPropType,
    regionalPartners: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        workshop_type: PropTypes.string
      })
    )
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.constructColumns();

    // default
    let sortColumnIndex = 0;
    let direction = 'desc';

    this.state = {
      sortingColumns: {
        [sortColumnIndex]: {
          direction,
          position: 0
        }
      }
    };
  }

  UNSAFE_componentWillUpdate() {
    this.constructColumns();
  }

  showLocked = () => this.props.viewType === 'facilitator';

  constructColumns() {
    if (
      [UNMATCHED_PARTNER_VALUE, ALL_PARTNERS_VALUE].includes(
        this.props.regionalPartnerFilter.value
      )
    ) {
      this.workshopType = WorkshopTypes['both'];
    } else {
      this.workshopType = this.props.regionalPartners.find(
        partner => partner.id === this.props.regionalPartnerFilter.value
      ).workshop_type;
    }

    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, {
      container: {whiteSpace: 'nowrap'},
      default: {color: color.light_gray}
    });

    let columns = [
      {
        property: 'id',
        header: {
          label: 'View Application'
        },
        cell: {
          formatters: [this.formatViewButton]
        }
      },
      {
        property: 'date_accepted',
        header: {
          label: 'Date Accepted',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatDate]
        }
      },
      {
        property: 'applicant_name',
        header: {
          label: 'Name',
          transforms: [sortable]
        }
      },
      {
        property: 'district_name',
        header: {
          label: 'School District',
          transforms: [sortable]
        }
      },
      {
        property: 'school_name',
        header: {
          label: 'School Name',
          transforms: [sortable]
        }
      },
      {
        property: 'email',
        header: {
          label: 'Email',
          transforms: [sortable]
        }
      },
      {
        property: 'status',
        header: {
          label: 'Status',
          transforms: [sortable]
        },
        cell: {
          formatters: [
            status =>
              getApplicationStatuses(this.props.viewType)[status] ||
              _.upperFirst(status)
          ],
          transforms: [
            status => ({
              style: {...styles.statusCellCommon, ...styles.statusCell[status]}
            })
          ]
        }
      }
    ];

    if (this.props.viewType === 'teacher') {
      columns.push({
        property: 'friendly_scholarship_status',
        header: {
          label: 'Scholarship Teacher?',
          transforms: [sortable]
        }
      });
    }

    if (this.showLocked()) {
      columns.push({
        property: 'locked',
        header: {
          label: 'Locked'
        },
        cell: {
          formatters: [this.formatBoolean]
        }
      });
    }

    if (this.props.viewType === 'facilitator') {
      columns.push(
        {
          property: 'assigned_fit',
          header: {
            label: 'Assigned FIT',
            transforms: [sortable]
          }
        },
        {
          property: 'registered_fit',
          header: {
            label: 'Registered FIT',
            transforms: [sortable]
          }
        }
      );
    }

    columns.push({
      property: 'assigned_workshop',
      header: {
        label: 'Assigned Workshop',
        transforms: [sortable]
      }
    });

    if (
      [WorkshopTypes['local_summer'], WorkshopTypes['both']].includes(
        this.workshopType
      )
    ) {
      columns.push({
        property: 'registered_workshop_id',
        header: {
          label: 'Registered Workshop',
          transforms: [sortable]
        },
        cell: {
          formatters: [
            workshopId =>
              workshopId ? this.formatWorkshopUrl(workshopId) : 'No'
          ]
        }
      });
    }

    [
      {property: 'notes', label: 'General Notes'},
      {property: 'notes_2', label: 'Notes 2'},
      {property: 'notes_3', label: 'Notes 3'},
      {property: 'notes_4', label: 'Notes 4'},
      {property: 'notes_5', label: 'Notes 5'}
    ].forEach(notesField => {
      columns.push({
        property: notesField.property,
        header: {
          label: notesField.label,
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatNotesTooltip],
          transforms: [
            () => ({
              style: {...styles.notesCell}
            })
          ]
        }
      });
    });

    this.columns = columns;
  }

  getSortingColumns = () => this.state.sortingColumns || {};

  onSort = selectedColumn => {
    const sortingColumns = sort.byColumn({
      sortingColumns: this.state.sortingColumns,
      // Custom sortingOrder removes 'no-sort' from the cycle
      sortingOrder: {
        FIRST: 'asc',
        asc: 'desc',
        desc: 'asc'
      },
      selectedColumn
    });

    this.setState({sortingColumns});
  };

  // Format dates as abbreviated month and day, e.g. "Mar 9"
  formatDate = iso8601Date =>
    iso8601Date ? moment(iso8601Date).format('MMM D') : '';

  formatBoolean = bool => (bool ? 'Yes' : 'No');

  formatNotesTooltip = notes => {
    let tooltipId = _.uniqueId();
    return (
      <div>
        <div
          data-tip
          data-for={tooltipId}
          aria-describedby={tooltipId}
          style={styles.notesCellContent}
        >
          {notes}
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
        >
          {notes}
        </ReactTooltip>
      </div>
    );
  };

  formatViewButton = id => {
    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        // TODO: (mehal) Build a wrapper for react stories that lets us pass in a context with router
        href={
          this.context.router &&
          this.context.router.createHref(
            `/${this.props.path.replace('_cohort', '')}/${id}`
          )
        }
      >
        View Application
      </Button>
    );
  };

  formatWorkshopUrl = workshopId => {
    return (
      <a
        href={
          location.origin + '/pd/workshop_dashboard/workshops/' + workshopId
        }
      >
        Workshop {workshopId}
      </a>
    );
  };

  render() {
    const rows = this.props.data;

    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns: this.columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <div style={styles.container}>
        <Table.Provider
          id="cohort-view"
          className="pure-table table-striped"
          columns={this.columns}
          style={styles.table}
        >
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
        </Table.Provider>
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartners.regionalPartnerGroup,
  isWorkshopAdmin: state.applicationDashboard.permissions.workshopAdmin,
  regionalPartnerFilter: state.regionalPartners.regionalPartnerFilter,
  regionalPartners: state.regionalPartners.regionalPartners
}))(CohortViewTable);
