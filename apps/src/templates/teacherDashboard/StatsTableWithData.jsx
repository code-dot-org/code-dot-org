import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import StatsTable from './StatsTable';
import {
  getStudentsCompletedLevelCount,
  asyncSetCompletedLevelCount
} from './statsRedux';

import {gql, useQuery} from '@apollo/client';

export const GET_SECTION = gql`
  query GetSectionStats($sectionId: ID!) {
    sectionById(id: $sectionId) {
      students {
        id
        name
        age
        completedLevels
        linesOfCode
      }
    }
  }
`;

const StatsTableWithData = ({sectionId}) => {
  // for when we want to do a real query:
  console.log('actual sectionID: ', sectionId);

  const {data, error} = useQuery(GET_SECTION, {
    variables: {sectionId: 1}
  });
  if (error) return <p>ERROR: {error.message}</p>;
  if (!data) return <p>Not found</p>;

  return <StatsTable section={data.sectionById} scriptName="test" />;
};

export default StatsTableWithData;

// OLD component using redux:

// class StatsTableWithData extends Component {
//   static propTypes = {
//     // Props provided by redux.
//     section: PropTypes.object,
//     studentsCompletedLevelCount: PropTypes.object,
//     asyncSetCompletedLevelCount: PropTypes.func.isRequired
//   };

//   componentDidMount() {
//     this.props.asyncSetCompletedLevelCount(this.props.section.id);
//   }

//   render() {
//     const {section, studentsCompletedLevelCount} = this.props;

//     return (
//       <StatsTable
//         section={section}
//         studentsCompletedLevelCount={studentsCompletedLevelCount}
//       />
//     );
//   }
// }

// export const UnconnectedStatsTableWithData = StatsTableWithData;

// export default connect(
//   state => ({
//     section: state.sectionData.section,
//     studentsCompletedLevelCount: getStudentsCompletedLevelCount(
//       state,
//       state.sectionData.section.id
//     )
//   }),
//   dispatch => ({
//     asyncSetCompletedLevelCount(sectionId) {
//       dispatch(asyncSetCompletedLevelCount(sectionId));
//     }
//   })
// )(StatsTableWithData);
