import React from 'react';

import {useLevels} from '../hooks/useLevels';

import LevelsPagination from './LevelsPagination';
import LevelsSearch from './LevelsSearch';
import LevelsTable from './LevelsTable';

import moduleStyles from '../styles/levels-list.module.scss';

const LevelsList: React.FC = () => {
  const {
    data,
    loading,
    error,
    searchParams,
    fetchLevels,
    cloneLevel,
    deleteLevel,
  } = useLevels();

  if (loading) {
    return <div className={moduleStyles.loading}>Loading levels...</div>;
  }

  if (error) {
    return <div className={moduleStyles.error}>Error: {error}</div>;
  }

  if (!data) {
    return <div className={moduleStyles.noData}>No data available</div>;
  }

  const handleSearch = (params: typeof searchParams) => {
    fetchLevels({...params, page: 1});
  };

  const handlePageChange = (page: number) => {
    fetchLevels({...searchParams, page});
  };

  const handleCloneSuccess = () => {
    fetchLevels(searchParams);
  };

  const handleDeleteSuccess = () => {
    fetchLevels(searchParams);
  };

  return (
    <div className={moduleStyles.container}>
      {data.can_create && (
        <a href={data.new_level_url} className={moduleStyles.newLevel}>
          <i className="fa fa-plus-circle" />
          New Level
        </a>
      )}

      <h1>Levels</h1>

      <LevelsSearch
        searchFields={data.search_fields}
        onSearch={handleSearch}
        initialValues={searchParams}
      />

      <LevelsTable
        levels={data.levels}
        onClone={cloneLevel}
        onDelete={deleteLevel}
        onCloneSuccess={handleCloneSuccess}
        onDeleteSuccess={handleDeleteSuccess}
      />

      <LevelsPagination
        pagination={data.pagination}
        onPageChange={handlePageChange}
      />

      <div id="validation-error" className={moduleStyles.validationError} />
    </div>
  );
};

export default LevelsList;
