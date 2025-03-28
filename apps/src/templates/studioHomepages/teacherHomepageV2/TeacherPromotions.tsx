import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import {TeacherPromo, TeacherPromoInfo} from './TeacherPromo';

import styles from './teacherHomepage.module.scss';

// This is a hard-coded ID for the Teacher Homepage Ad in contentful.
// This retrieves all the ads from contentful.
// If we want to have different ads for each teacher, we will need to stop hardcoding this ID.
const TEACHER_HOMEPAGE_CONTENTFUL_ID = '55R4y1NlZ0qJG9O0qgyq0Q';
const TEACHER_PROMOTION_URL = `/marketing/teacher/promotions/${TEACHER_HOMEPAGE_CONTENTFUL_ID}`;

interface ServerPromotion {
  id: string;
  announcement_type: string;
  background_color: string;
  title: string;
  description: string;
  button_label: string;
  button_target: string;
  image: string;
  is_closable: boolean;
}

const serverPromotionConverter = (serverPromotion: ServerPromotion) => ({
  id: serverPromotion.id,
  announcementType: serverPromotion.announcement_type,
  backgroundColor: serverPromotion.background_color,
  title: serverPromotion.title,
  description: serverPromotion.description,
  buttonLabel: serverPromotion.button_label,
  buttonTarget: serverPromotion.button_target,
  image: serverPromotion.image,
  isClosable: serverPromotion.is_closable,
});

export const TeacherPromotions: React.FC = () => {
  const [promotions, setPromotions] = React.useState<TeacherPromoInfo[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    HttpClient.fetchJson<ServerPromotion[]>(TEACHER_PROMOTION_URL)
      .then(response => response?.value)
      .then(data => {
        setPromotions(data.map(serverPromotionConverter));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error retrieving marketing promotions', {error});
        setIsLoading(false);
      });
  }, []);

  const closePromotionCallback = React.useCallback(
    (id: string) => {
      setPromotions(promotions.filter(promotion => promotion.id !== id));

      // TODO(lfm): Send a POST request to the server to mark the promotion as closed
    },
    [promotions]
  );

  return (
    <div className={styles.promotions}>
      {isLoading && <div>Loading...</div>}
      {/* TODO(lfm): Add a skeleton here */}
      {promotions.map((promotion, ind) => (
        <TeacherPromo {...promotion} onClose={closePromotionCallback} />
      ))}
    </div>
  );
};
