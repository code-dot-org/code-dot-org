import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';
import {
  Heading2,
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Divider,
  useMediaQuery,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {CopyButton} from '../../components/CopyButton';
import {WorkshopData} from '../../types';

import styles from '../../workshop.module.scss';

interface WorkshopLinksSectionProps {
  workshop: WorkshopData;
}

export const WorkshopLinksSection: React.FC<WorkshopLinksSectionProps> = ({
  workshop,
}) => {
  const isLargeScreen = useMediaQuery('(min-width: 768px)');

  const marketingPageUrl = `/professional-learning/workshops/${workshop.id}`;
  const fullMarketingPageUrl = `${window.origin}/professional-learning/workshops/${workshop.id}`;
  const joinWorkshopUrl = `/pd/workshops/${workshop.id}/join`;
  const fullJoinWorkshopUrl = `${window.origin}/pd/workshops/${workshop.id}/join`;

  return (
    <Card className={styles.card}>
      <CardHeader
        className={styles.cardHeader}
        title={
          <Box display="flex" alignItems="center">
            <Heading2 visualAppearance="body-two" noMargin>
              <strong>Your Workshop Links</strong>
            </Heading2>
          </Box>
        }
      />
      <CardContent className={styles.cardContent}>
        <Box className={styles.sectionContainer}>
          {/* Marketing Page Column */}
          <Box className={styles.column}>
            <Box className={styles.labelRow}>
              <StrongText>Marketing Page</StrongText>
              <Tags
                size="s"
                className={classNames(styles.workshopTag, styles.visibility)}
                tagsList={[
                  {
                    key: 'solo-tag',
                    label: `${
                      workshop.hidden ? 'Hidden from' : 'Visible in'
                    } catalog`,
                    icon: {
                      iconName: workshop.hidden ? 'eye-slash' : 'eye',
                      iconStyle: 'solid',
                      title: `Workshop is ${
                        workshop.hidden ? 'hidden' : 'visible'
                      } in catalog`,
                      placement: 'left',
                    },
                  },
                ]}
              />
            </Box>
            <Box>
              <BodyFourText noMargin>
                Share this page with teachers to promote your workshop. It
                includes key details and will guide them to the correct
                registration process.
              </BodyFourText>
              <Link
                className={styles.workshopLink}
                size="xs"
                openInNewTab
                aria-label="Open marketing page in new tab"
                href={marketingPageUrl}
              >
                {fullMarketingPageUrl}
              </Link>
            </Box>
            <Box>
              <CopyButton
                buttonText="Copy link"
                textToCopy={fullMarketingPageUrl}
                ariaLabel="Copy marketing page link to clipboard"
              />
            </Box>
          </Box>

          {/* Join Workshop Page Column - only show if has custom registration */}
          {workshop.registrationLink && (
            <>
              <Divider
                className={styles.divider}
                orientation={isLargeScreen ? 'vertical' : 'horizontal'}
                flexItem
              />

              <Box className={styles.column}>
                <Box className={styles.labelRow}>
                  <StrongText>Join Workshop Page</StrongText>
                </Box>
                <Box>
                  <BodyFourText noMargin>
                    Participants must use this link to enroll in this workshop
                    on Code.org after registering through your system. This
                    ensures they're counted for attendance, surveys, and
                    certificates.
                  </BodyFourText>
                  <Link
                    className={styles.workshopLink}
                    size="xs"
                    openInNewTab
                    aria-label="Open join workshop page in new tab"
                    href={joinWorkshopUrl}
                  >
                    {fullJoinWorkshopUrl}
                  </Link>
                </Box>
                <Box>
                  <CopyButton
                    buttonText="Copy link"
                    textToCopy={fullJoinWorkshopUrl}
                    ariaLabel="Copy join workshop link to clipboard"
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
