import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {
  MarketingAnnouncement,
  MarketingAnnouncementProps,
} from './MarketingAnnouncement';

import styles from './teacherHomepage.module.scss';

const TEST_ANNOUNCEMENT = {
  title: 'Test Announcement',
  description: 'This is a test announcement',
  buttonText: 'Click me',
  buttonLink: 'https://code.org',
  imageURL: 'https://code.org/images/logo.png',
};

export const MarketingAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = React.useState<
    MarketingAnnouncementProps[]
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

  return (
    <div className={styles.announcements}>
      {announcements.map(announcement => (
        <MarketingAnnouncement {...announcement} />
      ))}
      <div className={styles.blankAnnouncement} />
    </div>
  );
};
