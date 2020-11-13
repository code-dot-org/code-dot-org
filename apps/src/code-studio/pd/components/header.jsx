/**
 * Header present throughout the workshop dashboard UI.
 * Displays navigation breadcrumbs.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {Breadcrumb} from 'react-bootstrap';

export default class Header extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        breadcrumbs: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
              path: PropTypes.string
            })
          )
        ])
      })
    ).isRequired,
    params: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
    baseName: PropTypes.string
  };

  handleClick = path => {
    this.context.router.push(path.toLowerCase());
  };

  renderBreadcrumbItems() {
    const breadcrumbItems = [];
    let builtPath = '/';
    if (this.props.baseName) {
      breadcrumbItems.push({name: this.props.baseName, path: builtPath});
    }

    if (this.props.routes[1].breadcrumbs) {
      if (Array.isArray(this.props.routes[1].breadcrumbs)) {
        breadcrumbItems.push(...this.props.routes[1].breadcrumbs);
      } else {
        // The breadcrumbs property is a CSV string. Each item will be displayed in the breadcrumbs.
        // The associated path part will be an id if that is present in params (e.g. "Workshop" -> this.props.params.workshopId)
        // Otherwise it will be same as the display text.
        // The last item, the current page, will be plain text instead of a link.
        const breadcrumbs = this.props.routes[1].breadcrumbs.split(',');
        for (let i = 0; i < breadcrumbs.length; i++) {
          const breadcrumb = breadcrumbs[i];
          const paramName =
            breadcrumb[0].toLowerCase() + breadcrumb.substr(1) + 'Id';
          builtPath += (this.props.params[paramName] || breadcrumb) + '/';
          breadcrumbItems.push({name: breadcrumb, path: builtPath});
        }
      }
    }

    return breadcrumbItems.map((breadcrumbItem, i) => {
      if (i < breadcrumbItems.length - 1) {
        return (
          <Breadcrumb.Item
            onClick={this.handleClick.bind(null, breadcrumbItem.path)}
            key={i}
          >
            {breadcrumbItem.name}
          </Breadcrumb.Item>
        );
      } else {
        return (
          <Breadcrumb.Item active key={i}>
            {breadcrumbItem.name}
          </Breadcrumb.Item>
        );
      }
    });
  }

  render() {
    return (
      <div className={'breadcrumb-header'}>
        <Breadcrumb>{this.renderBreadcrumbItems()}</Breadcrumb>
        {this.props.children}
      </div>
    );
  }
}
