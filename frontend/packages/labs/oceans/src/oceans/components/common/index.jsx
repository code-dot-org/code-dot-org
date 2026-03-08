import React from 'react';
import PropTypes from 'prop-types';

import styles from '@ml/oceans/styles';
import guide from '@ml/oceans/models/guide';
import Guide from '@ml/oceans/components/common/Guide';
import Button from '@ml/oceans/components/common/Button';
import ConfirmationDialog from '@ml/oceans/components/common/ConfirmationDialog';
import loadingGif from '@public/images/loading.gif';

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    const currentGuide = guide?.getCurrentGuide();
    const modalGuide = currentGuide && !currentGuide.noDimBackground;

    return (
      <div style={styles.body} onClick={this.props.onClick}>
        <div style={styles.bodyChildren} inert={modalGuide ? '' : undefined}>
          {this.props.children}
        </div>
        <Guide />
      </div>
    );
  }
}

const Content = ({children}) => <div style={styles.content}>{children}</div>;
Content.propTypes = {
  children: PropTypes.node
};

const Loading = () => (
  <Body>
    <img src={loadingGif} style={styles.loading} alt="Loading" />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
