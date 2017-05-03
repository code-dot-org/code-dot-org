import React, {Component} from 'react';
import msg from '@cdo/locale';

class PublicGallery extends Component {
  render() {
    return (
      <h1>{msg.publicGallery()}</h1>
    );
  }
}
export default PublicGallery;
