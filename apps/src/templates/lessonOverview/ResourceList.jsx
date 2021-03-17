import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';

export default class ResourceList extends Component {
  static propTypes = {
    resources: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  normalizeUrl = url => {
    const httpRegex = /https?:\/\//;
    if (httpRegex.test(url)) {
      return url;
    } else {
      return 'https://' + url;
    }
  };

  createResourceListItem = resource => (
    <li key={resource.key}>
      <a
        href={this.normalizeUrl(resource.url)}
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
