import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  MarketingAnnouncement,
  MarketingAnnouncementInfo,
} from './MarketingAnnouncement';

import styles from './teacherHomepage.module.scss';

const TEST_ANNOUNCEMENT = {
  title: 'Test Announcement',
  description: 'This is a test announcement',
  buttonText: 'Click me',
  buttonLink: 'https://code.org',
  imageURL: 'https://code.org/images/logo.png',
  isCloseable: true,
};

export const MarketingAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = React.useState<
    MarketingAnnouncementInfo[]
  >([]);

  React.useEffect(() => {
    HttpClient.get('/marketing/teacher/promotions/55R4y1NlZ0qJG9O0qgyq0Q')
      .then(response => response.json())
      .then(data => {
        console.log('lfm', {data});
      })
      .catch(error => {
        setAnnouncements([TEST_ANNOUNCEMENT]);
        console.error('lfm', {error});
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
      {announcements.map((announcement, ind) => (
        <MarketingAnnouncement
          {...announcement}
          closeAnnouncementCallback={() => closeAnnouncementCallback(ind)}
        />
      ))}
      <div className={styles.blankAnnouncement} />
    </div>
  );
};
