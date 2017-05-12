import React, { PropTypes} from 'react';
import CollapsibleSection from './CollapsibleSection';
import Announcement from './Announcement';
import AnnouncementsCarousel from './AnnouncementsCarousel';
import i18n from "@cdo/locale";

const AnnouncementsCollapsible = React.createClass({
  propTypes: {
    announcements: PropTypes.arrayOf(
      PropTypes.shape({
        heading: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        image: React.PropTypes.string,
        link: React.PropTypes.string.isRequired,
        buttonText: React.PropTypes.string.isRequired,
      })
    )
  },

  render() {
    const { announcements } = this.props;

    return (
      <CollapsibleSection
        header={i18n.announcements()}
        linkText={i18n.viewAllAnnouncements()}
        link="http://teacherblog.code.org/"
      >
        <AnnouncementsCarousel>
          {announcements.map((announcement, index) =>
            <Announcement
              key={index}
              heading={announcement.heading}
              description={announcement.description}
              buttonText={announcement.buttonText}
              link={announcement.link}
              image={announcement.image}
            />
           )}
        </AnnouncementsCarousel>
      </CollapsibleSection>
    );
  }
});

export default AnnouncementsCollapsible;
