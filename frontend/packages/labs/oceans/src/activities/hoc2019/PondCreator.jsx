import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Image from 'react-bootstrap/lib/Image';

// accepts + generates array of fish objects {img: fishImg, data: knnData}
// present fish images
// ability to select any # of fish images
// click "done" do add knnData as examples for our classifier
// click "cancel" to de-select all images?

export default class PondCreator extends React.Component {
  static propTypes = {
    startingPool: PropTypes.object
  };

  static defaultProps = {
    startingPool: {}
  };

  constructor(props) {
    super(props);

    // generate N fish objects
    this.state = {
      newPool: [
        {
          img:
            'https://thumbs-prod.si-cdn.com/qXrJJ-l_jMrQbARjnToD0fi-Tsg=/800x600/filters:no_upscale()/https://public-media.si-cdn.com/filer/d6/93/d6939718-4e41-44a8-a8f3-d13648d2bcd0/c3npbx.jpg',
          knnData: []
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <h4>Which fish do you want in your pond?</h4>
        <Row>
          {this.state.newPool.map(poolObj => (
            <Col>
              <Image src={poolObj.img} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}
