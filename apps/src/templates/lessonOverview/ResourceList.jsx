import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {windowOpen} from '@cdo/apps/utils';

export default class ResourceList extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(PropTypes.object).isRequired,
    pageType: PropTypes.oneOf([
      'student-lesson-plan',
      'teacher-lesson-plan',
      'resources-rollup'
    ]).isRequired
  };

  normalizeUrl = url => {
    const httpRegex = /https?:\/\//;
    if (httpRegex.test(url)) {
      return url;
    } else {
      return 'https://' + url;
    }
  };

  downloadResource = resource => {
    firehoseClient.putRecord(
      {
        study:
          this.props.pageType === 'resources-rollup'
            ? 'course-rollup-pages'
            : 'lesson-plan',
        study_group: this.props.pageType,
        event: 'download-resource',
        data_int: resource.id,
        data_json: JSON.stringify({
          resourceId: resource.id
        })
      },
      {
        includeUserId: true,
        callback: () => {
          windowOpen(
            this.normalizeUrl(resource.download_url),
            'noopener',
            'noreferrer'
          );
        }
      }
    );
  };

  openResource = resource => {
    firehoseClient.putRecord(
      {
        study:
          this.props.pageType === 'resources-rollup'
            ? 'rollup-pages'
            : 'lesson-plan',
        study_group: this.props.pageType,
        event: 'open-resource',
        data_int: resource.id,
        data_json: JSON.stringify({
          resourceId: resource.id
        })
      },
      {
        includeUserId: true,
        callback: () => {
          windowOpen(this.normalizeUrl(resource.url), 'noopener', 'noreferrer');
        }
      }
    );
  };

  createResourceListItem = resource => (
    <li key={resource.key}>
      <a
        onClick={() => {
          this.openResource(resource);
        }}
        rel="noopener noreferrer"
      >
        {resource.name}
      </a>
      {resource.type && ` -  ${resource.type}`}
      {resource.download_url && (
        <span>
          {' ('}
          <a
            onClick={() => {
              this.downloadResource(resource);
            }}
            rel="noopener noreferrer"
          >{`${i18n.download()}`}</a>
          {')'}
        </span>
      )}
    </li>
  );

  render() {
    return (
      <div>
        <ul>
          {this.props.resources.map(resource =>
            this.createResourceListItem(resource)
          )}
        </ul>
      </div>
    );
  }
}
