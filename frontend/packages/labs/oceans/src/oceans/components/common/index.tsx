/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import * as React from 'react';

import loadingGif from '@/assets/images/loading.gif';
import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';

interface BodyProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * 16:9 padded scaffold used by every scene.  When a modal guide is on
 * screen, marks the scene tree `inert` so screen readers / Tab focus
 * stay inside the dialog.
 */
class Body extends React.Component<BodyProps> {
  render() {
    const currentGuide = guide?.getCurrentGuide();
    const modalGuide = currentGuide && !currentGuide.noDimBackground;

    return (
      <div className="ocean-body" onClick={this.props.onClick}>
        <div
          className="ocean-body__children"
          inert={modalGuide ? '' : undefined}
        >
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

/** Top-aligned absolute content container used by the Words scene. */
const Content = ({children}: ContentProps) => (
  <div className="ocean-content">{children}</div>
);

/** Centered loading spinner.  Used while assets / models warm up. */
const Loading = () => (
  <Body>
    <img src={loadingGif} className="ocean-loading" alt="Loading" />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
