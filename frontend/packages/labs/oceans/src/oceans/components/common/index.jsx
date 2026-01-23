import React from 'react'
import PropTypes from 'prop-types'

import styles from "@ml/oceans/styles";

import Guide from "@ml/oceans/components/common/Guide";
import Button from "@ml/oceans/components/common/Button";
import ConfirmationDialog from "@ml/oceans/components/common/ConfirmationDialog";
import loadingGif from "@public/images/loading.gif";

const Body = ({onClick, children}) => (
  <div style={styles.body} onClick={onClick}>
    {children}
    <Guide />
  </div>
)
Body.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
}

const Content = ({children}) => (<div style={styles.content}>{children}</div>)
Content.propTypes = {
  children: PropTypes.node
};

const Loading = () => (
  <Body>
    <img src={loadingGif} style={styles.loading} alt="Loading"/>
  </Body>
)


export {Body, Content, Loading, Guide, Button, ConfirmationDialog}
