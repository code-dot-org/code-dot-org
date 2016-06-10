/**
 * @overview React for the End-of-Stage Experience
 */
/* global React */
import color from '@cdo/apps/color';

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

export class PlayZone extends React.Component {
  constructor(props) {
    super(props);

    this.links = [{
      href: "/projects/artist/new",
      img: "/shared/images/courses/logo_tall_artist.jpg",
      title: this.props.i18n.t('components.playzone.artist_title'),
      className: "artist",
      description: this.props.i18n.t('components.playzone.artist_description'),
    }, {
      href: "/projects/playlab/new",
      img: "/shared/images/courses/logo_tall_playlab.jpg",
      title: this.props.i18n.t('components.playzone.playlab_title'),
      className: "playlab",
      description: this.props.i18n.t('components.playzone.playlab_description'),
    }, {
      href: "/projects",
      img: "/shared/images/courses/logo_tall_applab.jpg",
      title: this.props.i18n.t('components.playzone.projects_title'),
      className: "projects",
      description: this.props.i18n.t('components.playzone.projects_description'),
    }];
  }

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.primaryHeader}>
          {this.props.i18n.t('components.playzone.primary_header', {stageName: this.props.stageName})}
        </h1>
        <h4 style={styles.secondaryHeader}>
          {this.props.i18n.t('components.playzone.secondary_header')}
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
          <button id="ok-button"
              onClick={this.props.onContinue}
              style={styles.continueButton}>
            {this.props.i18n.t('components.playzone.continue_button')}
          </button>
        </div>
      </div>
    );
  }
}

PlayZone.propTypes = {
  stageName: React.PropTypes.string.isRequired,
  onContinue: React.PropTypes.func.isRequired,
  i18n: React.PropTypes.object.isRequired
};
