/**
 * Facilitator bio as used on the workshop enrollment form
 */
import React from 'react';
import marked from 'marked';
import {FacilitatorPropType} from './enrollmentConstants';


export default class FacilitatorBio extends React.Component {
  static propTypes = {
    facilitator: FacilitatorPropType
  };

  image = () => {
    if (this.props.facilitator.image_path) {
      return <img src={this.props.facilitator.image_path}/>;
    }
  };

  bio = () => {
    if (this.props.facilitator.bio) {
      return (
        <div
          dangerouslySetInnerHTML={{__html: marked(this.props.facilitator.bio)}} // eslint-disable-line react/no-danger
        >
        </div>
      );
    } else {
      return (
        <div>
          <h2>{this.props.facilitator.name}</h2>
          <p>
            <a href={`mailto:${this.props.facilitator.email}`}>{this.props.facilitator.email}</a>
          </p>
        </div>
      );
    }
  };

  render() {
    return (
      <div>
        {this.image()}
        {this.bio()}
        <br />
      </div>
    );
  }
}
