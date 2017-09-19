/**
 * Header present throughout the workshop dashboard UI.
 * Displays navigation breadcrumbs.
 */
import React, {PropTypes} from 'react';
import {Breadcrumb} from 'react-bootstrap';

const Header = React.createClass({
  contextTypes: {
    router: PropTypes.object.isRequired
  },

  propTypes: {
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        breadcrumbs: PropTypes.string
      })
    ).isRequired,
    params: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  },

  handleClick(path) {
    this.context.router.push(path.toLowerCase());
  },

  renderBreadcrumbItems() {
    const breadcrumbItems = [];
    let builtPath = "/";
    breadcrumbItems.push({name: "Workshop Dashboard", path: builtPath});

    if (this.props.routes[1].breadcrumbs) {
      // The breadcrumbs property is a CSV string. Each item will be displayed in the breadcrumbs.
      // The associated path part will be an id if that is present in params (e.g. "Workshop" -> this.props.params.workshopId)
      // Otherwise it will be same as the display text.
      // The last item, the current page, will be plain text instead of a link.
      const breadcrumbs = this.props.routes[1].breadcrumbs.split(",");
      for (let i = 0; i < breadcrumbs.length; i++) {
        const breadcrumb = breadcrumbs[i];
        const paramName = breadcrumb[0].toLowerCase() + breadcrumb.substr(1) + "Id";
        builtPath += (this.props.params[paramName] || breadcrumb) + "/";
        breadcrumbItems.push({name: breadcrumb, path: builtPath});
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
  },

  render() {
    return (
      <div>
        <Breadcrumb>
          {this.renderBreadcrumbItems()}
        </Breadcrumb>
        {this.props.children}
      </div>
    );
  }
});
export default Header;
