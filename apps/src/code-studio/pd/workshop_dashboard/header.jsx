/*
  Header present throughout the workshop dashboard UI.
  Displays navigation breadcrumbs.
 */
import React from 'react';
var Breadcrumb = require('react-bootstrap').Breadcrumb;

var Header = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    routes: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        breadcrumbs: React.PropTypes.string
      })
    ).isRequired,
    params: React.PropTypes.object.isRequired,
    children: React.PropTypes.object.isRequired
  },

  handleClick: function (path) {
    this.context.router.push(path.toLowerCase());
  },

  renderBreadcrumbItems: function () {
    var breadcrumbItems = [];
    var builtPath = "/";
    breadcrumbItems.push({name: "Workshop Dashboard", path: builtPath});

    if (this.props.routes[1].breadcrumbs) {
      // The breadcrumbs property is a CSV string. Each item will be displayed in the breadcrumbs.
      // The associated path part will be an id if that is present in params (e.g. "Workshop" -> this.props.params.workshopId)
      // Otherwise it will be same as the display text.
      // The last item, the current page, will be plain text instead of a link.
      var breadcrumbs = this.props.routes[1].breadcrumbs.split(",");
      for (var i = 0; i < breadcrumbs.length; i++) {
        var breadcrumb = breadcrumbs[i];
        var paramName = breadcrumb[0].toLowerCase() + breadcrumb.substr(1) + "Id";
        builtPath += (this.props.params[paramName] || breadcrumb) + "/";
        breadcrumbItems.push({name: breadcrumb, path: builtPath});
      }
    }

    return breadcrumbItems.map( function (breadcrumbItem, i) {
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
    }.bind(this));
  },

  render: function () {
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
module.exports = Header;
