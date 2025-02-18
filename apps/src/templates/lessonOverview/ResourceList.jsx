import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import {windowOpen} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import DropdownButton from '../DropdownButton';

import {
  isGDocsUrl,
  gDocsPdfUrl,
  gDocsMsOfficeUrl,
  gDocsCopyUrl,
} from './googleDocsUtils';

import style from './resource-list.module.scss';

export default class ResourceList extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(PropTypes.object).isRequired,
    pageType: PropTypes.oneOf([
      'student-lesson-plan',
      'teacher-lesson-plan',
      'resources-rollup',
    ]).isRequired,
  };

  normalizeUrl = url => {
    const httpRegex = /https?:\/\//;
    if (httpRegex.test(url)) {
      return url;
    } else {
      return 'https://' + url;
    }
  };

  downloadResource = (e, resource) => {
    e.preventDefault();

    this.sendLinkVisitedEvent(resource, 'download');

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
          resourceId: resource.id,
        }),
      },
      {
        includeUserId: true,
        callback: () => {
          windowOpen(
            this.normalizeUrl(resource.download_url),
            'noopener',
            'noreferrer'
          );
        },
      }
    );
  };

  openResource = (e, resource) => {
    e.preventDefault();

    this.sendLinkVisitedEvent(resource, 'open');

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
          resourceId: resource.id,
        }),
      },
      {
        includeUserId: true,
        callback: () => {
          windowOpen(this.normalizeUrl(resource.url), 'noopener', 'noreferrer');
        },
      }
    );
  };

  sendLinkVisitedEvent = (resource, visitType) => {
    analyticsReporter.sendEvent(EVENTS.LESSON_RESOURCE_LINK_VISITED_EVENT, {
      resourceId: resource.id,
      resourceName: resource.name,
      resourceAudience: resource.audience,
      resourceType: resource.type,
      resourceUrl: resource.url,
      resourceDownloadUrl: resource.download_url,
      visitType: visitType,
      path: document.location.pathname,
    });
  };

  createResourceListItem = resource => (
    <li key={resource.key}>
      <a
        onClick={e => {
          this.openResource(e, resource);
        }}
        href={resource.url}
      >
        {resource.name}
      </a>
      {resource.type && ` -  ${resource.type} `}
      {resource.download_url && (
        <span>
          {' ('}
          <a
            onClick={e => {
              this.downloadResource(e, resource);
            }}
            href={resource.download_url}
          >{`${i18n.download()}`}</a>
          {')'}
        </span>
      )}
      {isGDocsUrl(resource.url) && (
        <span>
          {' '}
          <DropdownButton
            text={i18n.makeACopy()}
            color={Button.ButtonColor.gray}
            size={Button.ButtonSize.small}
            className={style.dropdownButton}
          >
            <a
              href={gDocsPdfUrl(resource.url)}
              onClick={e => {
                this.sendLinkVisitedEvent(resource, `copyPdf`);
              }}
            >
              PDF
            </a>
            <a
              href={gDocsMsOfficeUrl(resource.url)}
              onClick={e => {
                this.sendLinkVisitedEvent(resource, `copyMsOffice`);
              }}
            >
              Microsoft Office
            </a>
            <a
              href={gDocsCopyUrl(resource.url)}
              onClick={e => {
                this.sendLinkVisitedEvent(resource, `copyGDocs`);
              }}
            >
              Google Docs
            </a>
          </DropdownButton>
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
