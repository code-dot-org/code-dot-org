/**
 * Loader for table displaying workshop summaries based on a supplied query.
 * It requires exactly one child component that expects workshops in its props.
 * It runs the query specified in queryUrl and passes resulting workshop data to the child
 * component or displays "None" if no workshops are returned.
 * It optionally handles deleting workshops.
 */
import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom';

import Spinner from '../../../../sharedComponents/Spinner';

export default function WorkshopTableLoader({
  queryUrl,
  queryParams,
  canDelete,
  children,
  hideNoWorkshopsMessage,
}) {
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const effectiveParams = _.omitBy(
      queryParams,
      value => value === null || value === undefined
    );
    const url = queryParams
      ? `${queryUrl}?${$.param(effectiveParams)}`
      : queryUrl;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to load workshops');
        }
      })
      .then(data => {
        setWorkshops(data);
        setLoading(false);
      });
  }, [queryParams, queryUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const childElement = useRef(null);
  const childHeight = useRef(null);
  useEffect(() => {
    if (childElement.current) {
      // Save child element rendered height, to preserve during reload for a smoother transition.
      childHeight.current = ReactDOM.findDOMNode(
        childElement.current
      ).offsetHeight;
    }
  }, [childElement]);

  const handleDelete = workshopId => {
    fetch(`/api/v1/pd/workshops/${workshopId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (response.ok) {
        load();
      } else {
        throw new Error('Failed to delete workshop');
      }
    });
  };

  if (loading) {
    return (
      // While reloading, preserve the height of the previous child component so the refresh is smoother.
      <div style={{height: childHeight?.current}}>
        <Spinner />
      </div>
    );
  }

  if (workshops && !workshops.length && !workshops.total_count) {
    if (hideNoWorkshopsMessage) {
      return null;
    } else {
      return <p>No workshops found</p>;
    }
  }

  return (
    <div ref={childElement}>
      {React.cloneElement(children, {
        workshops: workshops,
        onDelete: canDelete ? handleDelete : null,
      })}
    </div>
  );
}

WorkshopTableLoader.propTypes = {
  queryUrl: PropTypes.string.isRequired,
  queryParams: PropTypes.object,
  canDelete: PropTypes.bool, // When true, sets child prop onDelete to this.handleDelete
  children: PropTypes.element.isRequired, // Require exactly 1 child component.
  hideNoWorkshopsMessage: PropTypes.bool, // Should we show "no workshops found" if no workshops are found?
};
