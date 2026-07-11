import {Button, Typography} from '@mui/material';

import type {CertificateRecommendation} from '@/api/completion';

import styles from './certificateRecommendations.module.css';

export function CertificateRecommendations({
  recommendations,
}: {
  recommendations: readonly CertificateRecommendation[];
}) {
  return (
    <div className={styles.cards}>
      {recommendations.map(recommendation => (
        <article className={styles.card} key={recommendation.path}>
          {recommendation.imageUrl && (
            <img alt="" src={recommendation.imageUrl} />
          )}
          <div>
            <Typography gutterBottom variant="h3">
              {recommendation.title}
            </Typography>
            {recommendation.description && (
              <Typography gutterBottom variant="body2">
                {recommendation.description}
              </Typography>
            )}
            <Button href={recommendation.path} variant="contained">
              {recommendation.actionLabel}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
