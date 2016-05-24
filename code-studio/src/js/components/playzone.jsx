/**
 * @overview React for the End-of-Stage Experience
 */
/* global React */
var color = require('@cdo/apps/color');

export class PlayZone extends React.Component {
  constructor(props) {
    super(props);

    // requiring here because locale references window.blockly, which is
    // defined during the pageload process but not necessarily before
    // code-studio is.
    this.locale = require('@cdo/apps/locale');

    this.links = [{
      href: "/projects/artist/new",
      img: "/shared/images/courses/logo_tall_artist.jpg",
      title: this.locale.playzoneArtistTitle(),
      className: "artist",
      description: this.locale.playzoneArtistDescription(),
    }, {
      href: "/projects/playlab/new",
      img: "/shared/images/courses/logo_tall_playlab.jpg",
      title: this.locale.playzonePlaylabTitle(),
      className: "playlab",
      description: this.locale.playzonePlaylabDescription(),
    }, {
      href: "/projects",
      img: "/shared/images/courses/logo_tall_applab.jpg",
      title: this.locale.playzoneProjectsTitle(),
      className: "projects",
      description: this.locale.playzoneProjectsDescription(),
    }];

    this.styles = {
      container: {margin: '20px'},
      primaryHeader: {fontSize: '200%'},
      secondaryHeader: {color: color.charcoal},
      courseblockContainer: {width: '720px', paddingTop: '20px'},
      continueButton: {marginTop: '20px', marginRight: 0}
    };
  }

  render() {
    return (
      <div style={this.styles.container}>
        <h1 style={this.styles.primaryHeader}>{this.locale.playzonePrimaryHeader({stageName: this.props.stageName})}</h1>
        <h4 style={this.styles.secondaryHeader}>{this.locale.playzoneSecondaryHeader()}</h4>
        <div className="center" style={this.styles.courseblockContainer}>{this.links.map(link =>
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
          <button id="ok-button" onClick={this.props.onContinue} style={this.styles.continueButton}>
            {this.locale.playzoneContinueButton()}
          </button>
        </div>
      </div>
    );
  }
}

PlayZone.propTypes = {
  stageName: React.PropTypes.string.isRequired,
  onContinue: React.PropTypes.func.isRequired,
};
