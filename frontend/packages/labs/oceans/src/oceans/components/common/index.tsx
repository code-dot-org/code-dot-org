/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import * as React from 'react';

import loadingGif from '@/assets/images/loading.gif';
import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';
import styles from '@/oceans/styles';

interface BodyProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

class Body extends React.Component<BodyProps> {
  render() {
    const currentGuide = guide?.getCurrentGuide();
    const modalGuide = currentGuide && !currentGuide.noDimBackground;

    return (
      <div style={styles.body} onClick={this.props.onClick}>
        <div style={styles.bodyChildren} inert={modalGuide ? false : undefined}>
          {this.props.children}
        </div>
        <Guide />
      </div>
    );
  }
}

interface ContentProps {
  children?: React.ReactNode;
}

const Content = ({children}: ContentProps) => (
  <div style={styles.content}>{children}</div>
);

const Loading = () => (
  <Body>
    <img src={loadingGif} style={styles.loading} alt="Loading" />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
