import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Panel} from 'react-bootstrap';

/**
 * Simple wrapper component for a chunk of related content when
 * viewing a workshop.
 */
export default class WorkshopPanel extends React.Component {
  static propTypes = {
    header: PropTypes.node,
    children: PropTypes.node
  };

  render() {
    const {header, children} = this.props;
    return (
      <Row>
        <Col sm={12}>
          <Panel>
            <Panel.Heading>
              <Panel.Title>{header}</Panel.Title>
            </Panel.Heading>
            <Panel.Body>{children}</Panel.Body>
          </Panel>
        </Col>
      </Row>
    );
  }
}
