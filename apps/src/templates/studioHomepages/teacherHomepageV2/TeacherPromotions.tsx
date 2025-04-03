import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';

import PermanentPromotions from './PermanentPromotions';
import TeacherPromo, {TeacherPromoInfo} from './TeacherPromo';

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
  image?: string;
  is_closable: boolean;
  partner_logo?: string;
}

const serverPromotionConverter = (serverPromotion: ServerPromotion) => ({
  id: serverPromotion.id,
  announcementType: serverPromotion.announcement_type,
  backgroundColor: serverPromotion.background_color,
  title: serverPromotion.title,
  description: serverPromotion.description,
  buttonLabel: serverPromotion.button_label,
  buttonTarget: serverPromotion.button_target,
  image: serverPromotion.image || null,
  isClosable: serverPromotion.is_closable,
  partnerLogo: serverPromotion.partner_logo || null,
});

const TEACHER_PROMOTION_LOCAL_STORAGE_KEY = 'teacherPromotionClosed';

const TeacherPromotions: React.FC = () => {
  const [unfilteredPromotions, setUnfilteredPromotions] = React.useState<
    TeacherPromoInfo[]
  >([]);

  const [isLoading, setIsLoading] = React.useState(true);

  const [closedPromotions, setClosedPromotions] = React.useState<string[]>(
    () => {
      const stringPromotions = tryGetLocalStorage(
        TEACHER_PROMOTION_LOCAL_STORAGE_KEY,
        '[]'
      );
      return (JSON.parse(stringPromotions) as string[]) || [];
    }
  );

  React.useEffect(() => {
    HttpClient.fetchJson<ServerPromotion[]>(TEACHER_PROMOTION_URL)
      .then(response => response?.value)
      .then(data => {
        setUnfilteredPromotions(data.map(serverPromotionConverter));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error retrieving marketing promotions', {error});
        setIsLoading(false);
      });
  }, [closedPromotions]);

  const promotions = React.useMemo<TeacherPromoInfo[]>(
    () =>
      unfilteredPromotions.filter(
        promotion => !closedPromotions.includes(promotion.id)
      ),
    [unfilteredPromotions, closedPromotions]
  );

  const closePromotionCallback = React.useCallback(
    (id: string) => {
      setClosedPromotions([...closedPromotions, id]);

      // We don't want the promotions cookie to store old promotions.
      // So only save the promotions that are currently active and have been closed.
      const newClosedPromotions =
        promotions.length > 0
          ? closedPromotions.filter(promotion =>
              promotions.map(p => p.id).includes(promotion)
            )
          : closedPromotions;
      newClosedPromotions.push(id);
      trySetLocalStorage(
        TEACHER_PROMOTION_LOCAL_STORAGE_KEY,
        JSON.stringify(newClosedPromotions)
      );
    },
    [promotions, closedPromotions]
  );

  return (
    <div className={styles.promotions}>
      {isLoading && <div>Loading...</div>}
      {/* TODO(lfm): Add a skeleton here */}
      {promotions.map(promotion => (
        <TeacherPromo {...promotion} onClose={closePromotionCallback} />
      ))}
      <PermanentPromotions />
    </div>
  );
};

export default TeacherPromotions;
