/**
 * Facilitator bio as used on the workshop enrollment form
 */
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {FacilitatorPropType} from './enrollmentConstants';

export default class FacilitatorBio extends React.Component {
  static propTypes = {
    facilitator: FacilitatorPropType,
  };

  image = () => {
    if (this.props.facilitator.image_path) {
      // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
      // Verify or update this alt-text as necessary
      return <img src={this.props.facilitator.image_path} alt="" />;
    }
  };

  bio = () => {
    if (this.props.facilitator.bio) {
      return (
        <div>
          <SafeMarkdown markdown={this.props.facilitator.bio} />
        </div>
      );
    } else {
      return (
        <div>
          <h2>{this.props.facilitator.name}</h2>
          <p>
            <a href={`mailto:${this.props.facilitator.email}`}>
              {this.props.facilitator.email}
            </a>
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
