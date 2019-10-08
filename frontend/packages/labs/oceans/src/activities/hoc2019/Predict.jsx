import React from 'react';
import ImageGrid from './ImageGrid';

export default class Predict extends React.Component {
  onSelectImage = () => {
    console.log('selected');
  };

  render() {
    const images = [
      '/images/cat1.jpg',
      '/images/cat2.jpg',
      '/images/cat3.jpg',
      '/images/dog1.png',
      '/images/dog2.png',
      '/images/dog3.png'
    ];

    return (
      <ImageGrid
        cols={3}
        label="like"
        images={images}
        onSelectImage={this.onSelectImage}
      />
    );
  }
}
