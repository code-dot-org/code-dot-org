import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export default class ResourceList extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(PropTypes.object).isRequired,
    pageType: PropTypes.oneOf([
      'student-lesson-plan',
      'teacher-lesson-plan',
      'resources-rollup'
    ])
  };

  normalizeUrl = url => {
    const httpRegex = /https?:\/\//;
    if (httpRegex.test(url)) {
      return url;
    } else {
      return 'https://' + url;
    }
  };

  recordResourceDownload = resource => {
    firehoseClient.putRecord(
      {
        study:
          this.props.pageType === 'resources-rollup'
            ? 'rollup-pages'
            : 'lesson-plan',
        study_group: this.props.pageType,
        event: 'download-resource',
        data_json: JSON.stringify({
          resourceId: resource.id
        })
      },
      {includeUserId: true}
    );
  };

  recordResourceOpened = resource => {
    firehoseClient.putRecord(
      {
        study:
          this.props.pageType === 'resources-rollup'
            ? 'rollup-pages'
            : 'lesson-plan',
        study_group: this.props.pageType,
        event: 'open-resource',
        data_json: JSON.stringify({
          resourceId: resource.id
        })
      },
      {includeUserId: true}
    );
  };

  createResourceListItem = resource => (
    <li key={resource.key}>
      <a
        href={this.normalizeUrl(resource.url)}
        onClick={() => {
          this.recordResourceOpened(resource);
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {resource.name}
      </a>
      {resource.type && ` -  ${resource.type}`}
      {resource.download_url && (
        <span>
          {' ('}
          <a
            href={this.normalizeUrl(resource.download_url)}
            onClick={() => {
              this.recordResourceDownload(resource);
            }}
            target="_blank"
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
