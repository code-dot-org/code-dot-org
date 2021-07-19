import PropTypes from 'prop-types';
import React from 'react';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {gql, useQuery} from '@apollo/client';
import _ from 'lodash';

const GET_LEVEL_PROGRESS = gql`
  query GetLevelProgress($userId: ID!, $scriptId: ID!) {
    user(id: $userId) {
      id
      name
      progress {
        levelProgress(scriptId: $scriptId) {
          levelId
          status
          isLocked
          isPaired
        }
      }
    }
  }
`;

const GET_LEVEL = gql`
  query GetLevel($scriptId: ID!, $levelId: ID!) {
    level(scriptId: $scriptId, levelId: $levelId) {
      id
      kind
      title
      isBonus
      isConcept
      isUnplugged
    }
  }
`;

const GqlProgressTableLevelBubble = ({studentId, levelId, scriptId}) => {
  const {data, loading, error} = useQuery(GET_LEVEL_PROGRESS, {
    variables: {
      userId: studentId,
      scriptId: scriptId,
      levelId: levelId
    }
  });

  const results2 = useQuery(GET_LEVEL, {
    variables: {
      scriptId: scriptId,
      levelId: levelId
    }
  });

  if (loading || results2.loading) {
    return null;
  }
  if (error) {
    return <p>ERROR: {error.message}</p>;
  }
  if (results2.error) {
    return <p>ERROR: {results2.error.message}</p>;
  }
  if (!data || !results2.data) {
    return <p>Not found</p>;
  }

  const levelProgress = data.user.progress.levelProgress.find(
    lp => lp.levelId === levelId
  );

  const {kind, isUnplugged, isBonus, isConcept, title} = results2.data.level;

  return (
    <div key={`${levelId}-${scriptId}-${studentId}`} style={styles.container}>
      <div>
        <ProgressTableLevelBubble
          levelStatus={levelProgress?.status}
          isLocked={levelProgress?.isLocked}
          levelKind={kind}
          isUnplugged={isUnplugged}
          isBonus={isBonus}
          isPaired={levelProgress?.isPaired}
          isConcept={isConcept}
          title={title}
          url={'temp'}
        />
      </div>
      {/* {level.sublevels && this.renderSublevels(level)} */}
    </div>
  );
};

const styles = {
  container: {
    ...progressStyles.flexBetween,
    position: 'relative',
    whiteSpace: 'nowrap'
  }
};

export default GqlProgressTableLevelBubble;
