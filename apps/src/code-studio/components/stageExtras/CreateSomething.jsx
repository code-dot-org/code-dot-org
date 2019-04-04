import React from 'react';
import msg from '@cdo/locale';

const styles = {
  courseblockContainer: {
    width: 720,
    paddingTop: 20
  }
};

export default class CreateSomething extends React.Component {
  constructor(props) {
    super(props);

    this.links = [
      {
        href: '/projects/artist/new',
        img: '/shared/images/courses/logo_tall_artist.jpg',
        title: msg.playzoneArtistTitle(),
        className: 'artist',
        description: msg.playzoneArtistDescription()
      },
      {
        href: '/projects/playlab/new',
        img: '/shared/images/courses/logo_tall_playlab.jpg',
        title: msg.playzonePlaylabTitle(),
        className: 'playlab',
        description: msg.playzonePlaylabDescription()
      },
      {
        href: '/projects',
        img: '/shared/images/courses/logo_tall_applab.png',
        title: msg.playzoneProjectsTitle(),
        className: 'projects',
        description: msg.playzoneProjectsDescription()
      }
    ];
  }

  render() {
    return (
      <div className="center" style={styles.courseblockContainer}>
        {this.links.map(link => (
          <div
            key={link.className}
            className="courseblock-noaction courseblock-span3 courseblock-tall"
          >
            <a href={link.href}>
              <div className="imgspan">
                <img
                  height="120px"
                  src={link.img}
                  alt={`Logo tall ${link.className}`}
                />
              </div>
              <div className="heading">
                <h3>{link.title}</h3>
              </div>
              <div className="smalltext">{link.description}</div>
            </a>
          </div>
        ))}
      </div>
    );
  }
}
