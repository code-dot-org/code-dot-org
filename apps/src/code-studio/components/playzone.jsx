/**
 * @overview React for the End-of-Stage Experience
 */
import React from 'react';
import color from "../../util/color";
import msg from '@cdo/locale';

const styles = {
  container: {
    margin: 20
  },
  primaryHeader: {
    fontSize: '200%'
  },
  secondaryHeader: {
    color: color.charcoal
  },
  courseblockContainer: {
    width: 720,
    paddingTop: 20
  },
  continueButton: {
    marginTop: 20,
    marginRight: 0
  }
};

export default class PlayZone extends React.Component {
  constructor(props) {
    super(props);

    this.links = [{
      href: "/projects/artist/new",
      img: "/shared/images/courses/logo_tall_artist.jpg",
      title: msg.playzoneArtistTitle(),
      className: "artist",
      description: msg.playzoneArtistDescription(),
    }, {
      href: "/projects/playlab/new",
      img: "/shared/images/courses/logo_tall_playlab.jpg",
      title: msg.playzonePlaylabTitle(),
      className: "playlab",
      description: msg.playzonePlaylabDescription(),
    }, {
      href: "/projects",
      img: "/shared/images/courses/logo_tall_applab.png",
      title: msg.playzoneProjectsTitle(),
      className: "projects",
      description: msg.playzoneProjectsDescription(),
    }];
  }

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.primaryHeader}>
          {msg.playzonePrimaryHeader({stageName: this.props.stageName})}
        </h1>
        <h4 style={styles.secondaryHeader}>
          {msg.playzoneSecondaryHeader()}
        </h4>
        <div className="center" style={styles.courseblockContainer}>{this.links.map(link =>
          <div key={link.className} className="courseblock-noaction courseblock-span3 courseblock-tall">
            <a href={link.href}>
              <div className="imgspan">
                <img height="120px" src={link.img} alt={`Logo tall ${link.className}`} />
              </div>
              <div className="heading">
                <h3>{link.title}</h3>
              </div>
              <div className="smalltext">{link.description}</div>
            </a>
          </div>
        )}</div>
        <div className="farSide">
          <button
            id="ok-button"
            onClick={this.props.onContinue}
            style={styles.continueButton}
          >
            {msg.playzoneContinueButton()}
          </button>
        </div>
      </div>
    );
  }
}

PlayZone.propTypes = {
  stageName: React.PropTypes.string.isRequired,
  onContinue: React.PropTypes.func.isRequired
};
