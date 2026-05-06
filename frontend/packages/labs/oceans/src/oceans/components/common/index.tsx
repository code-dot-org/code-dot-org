import {Component, type ReactNode} from 'react';

import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';
import styles from '@/oceans/styles';
const loadingGif = new URL(
  '../../../assets/images/loading.gif',
  import.meta.url,
).href;

/** Props for the Body layout component. */
interface BodyProps {
  children?: ReactNode;
}

/** Full-screen activity wrapper; inerts its children while a modal guide is showing. */
class Body extends Component<BodyProps> {
  render() {
    const currentGuide = guide?.getCurrentGuide();
    const modalGuide = currentGuide && !currentGuide.noDimBackground;

    return (
      <div style={styles.body}>
        <div style={styles.bodyChildren} inert={modalGuide ? '' : undefined}>
          {this.props.children}
        </div>
        <Guide />
      </div>
    );
  }
}

/** Props for the Content layout component. */
interface ContentProps {
  children?: ReactNode;
}

/** Scrollable content area inside a Body. */
const Content = ({children}: ContentProps) => (
  <div style={styles.content}>{children}</div>
);

/** Full-screen loading spinner shown during mode transitions. */
const Loading = () => (
  <Body>
    <img src={loadingGif} style={styles.loading} alt="Loading" />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
