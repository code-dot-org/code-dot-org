import PropTypes from 'prop-types';
import React from 'react';

import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';
import styles from '@/oceans/styles';
const loadingGif = new URL(
  '../../../assets/images/loading.gif',
  import.meta.url,
).href;

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
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
  children: PropTypes.node,
};

const Loading = () => (
  <Body>
    <img src={loadingGif} style={styles.loading} alt="Loading" />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
