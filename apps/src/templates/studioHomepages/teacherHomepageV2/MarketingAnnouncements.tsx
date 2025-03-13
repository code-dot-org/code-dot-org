import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  MarketingAnnouncement,
  MarketingAnnouncementInfo,
} from './MarketingAnnouncement';

import styles from './teacherHomepage.module.scss';

interface ServerAnnouncementType {
  announcement_type: string;
  background_color: string;
  title: string;
  description: string;
  button_label: string;
  button_target: string;
  image: string;
  is_closeable: boolean;
}

const serverAnnouncementToAnnouncement = (
  serverAnnouncement: ServerAnnouncementType
) => ({
  announcementType: serverAnnouncement.announcement_type,
  backgroundColor: serverAnnouncement.background_color,
  title: serverAnnouncement.title,
  description: serverAnnouncement.description,
  buttonLabel: serverAnnouncement.button_label,
  buttonTarget: serverAnnouncement.button_target,
  image: serverAnnouncement.image,
  // TODO(lfm): make sure this is working with contentful.
  isCloseable:
    serverAnnouncement.is_closeable === undefined
      ? true
      : serverAnnouncement.is_closeable,
});

export const MarketingAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = React.useState<
    MarketingAnnouncementInfo[]
  >([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    HttpClient.get('/marketing/teacher/promotions/55R4y1NlZ0qJG9O0qgyq0Q')
      .then(response => response.json())
      .then(data => {
        setAnnouncements(data.map(serverAnnouncementToAnnouncement));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error retrieving marketing promotions', {error});
      });
  }, []);

  const closeAnnouncementCallback = React.useCallback(
    (index: number) => {
      setAnnouncements([...announcements].splice(index, 1));

      // TODO(lfm): Send a POST request to the server to mark the announcement as closed
    },
    [announcements]
  );

  return (
    <div className={styles.announcements}>
      {isLoading && <div>Loading...</div>}
      {/* TODO(lfm): Add a skeleton here */}
      {announcements.map((announcement, ind) => (
        <MarketingAnnouncement
          {...announcement}
          closeAnnouncementCallback={() => closeAnnouncementCallback(ind)}
        />
      ))}
    </div>
  );
};
