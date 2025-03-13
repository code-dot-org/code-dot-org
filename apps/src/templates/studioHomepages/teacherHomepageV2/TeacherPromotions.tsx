import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {TeacherPromo, TeacherPromoInfo} from './TeacherPromo';

import styles from './teacherHomepage.module.scss';

interface ServerPromotionType {
  announcement_type: string;
  background_color: string;
  title: string;
  description: string;
  button_label: string;
  button_target: string;
  image: string;
  is_closeable: boolean;
}

const serverPromotionConverter = (serverPromotion: ServerPromotionType) => ({
  announcementType: serverPromotion.announcement_type,
  backgroundColor: serverPromotion.background_color,
  title: serverPromotion.title,
  description: serverPromotion.description,
  buttonLabel: serverPromotion.button_label,
  buttonTarget: serverPromotion.button_target,
  image: serverPromotion.image,
  // TODO(lfm): make sure this is working with contentful.
  isCloseable:
    serverPromotion.is_closeable === undefined
      ? true
      : serverPromotion.is_closeable,
});

export const TeacherPromotions: React.FC = () => {
  const [promotions, setPromotions] = React.useState<TeacherPromoInfo[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    HttpClient.get('/marketing/teacher/promotions/55R4y1NlZ0qJG9O0qgyq0Q')
      .then(response => response.json())
      .then(data => {
        console.log('lfm', data);
        setPromotions(data.map(serverPromotionConverter));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error retrieving marketing promotions', {error});
      });
  }, []);

  const closePromotionCallback = React.useCallback(
    (index: number) => {
      setPromotions([...promotions].splice(index, 1));

      // TODO(lfm): Send a POST request to the server to mark the promotion as closed
    },
    [promotions]
  );

  return (
    <div className={styles.promotions}>
      {isLoading && <div>Loading...</div>}
      {/* TODO(lfm): Add a skeleton here */}
      {promotions.map((promotion, ind) => (
        <TeacherPromo
          {...promotion}
          onClose={() => closePromotionCallback(ind)}
        />
      ))}
    </div>
  );
};
