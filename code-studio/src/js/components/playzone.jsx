/**
 * @overview React for the End-of-Stage Experience
 */
/* global React */

export class PlayZone extends React.Component {
  constructor(props) {
    super(props);
    this.links = [{
      href: "/projects/artist/new",
      img: "/shared/images/courses/logo_tall_artist.jpg",
      title: "Artist",
      className: "artist",
      description: "Draw cool pictures and designs with the Artist!"
    }, {
      href: "/projects/applab/new",
      img: "/shared/images/courses/logo_tall_applab.jpg",
      title: "App Lab",
      className: "applab",
      description: "Design an app, code with blocks or JavaScript to make it work, then share your app in seconds."
    }, {
      href: "/projects/playlab/new",
      img: "/shared/images/courses/logo_tall_playlab.jpg",
      title: "Play Lab",
      className: "playlab",
      description: "Create a story or make a game with Play Lab!"
    }];
  }
  render() {
    return (
      <div style={{margin: "20px"}}>
        <h1 style={{fontSize: "200%"}}>{`Congratulations! You finished ${this.props.stageName}!`}</h1>
        <h4>Ask your teacher what to do next</h4>
        <div className="center" style={{width: '720px', paddingTop: '20px'}}>{this.links.map(link =>
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
          <button id="ok-button" className="secondary" onClick={this.props.onContinue} style={{marginTop: '20px', marginRight: 0}}>
            Go on to the next Stage
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

