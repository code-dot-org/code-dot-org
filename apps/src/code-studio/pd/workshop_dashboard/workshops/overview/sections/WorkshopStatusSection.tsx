import {Button, buttonColors} from '@code-dot-org/component-library/button';
import Tags from '@code-dot-org/component-library/tags';
import {
  Heading2,
  BodyFourText,
  StrongText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {WorkshopData} from '../../types';

import styles from '../../workshop.module.scss';

interface WorkshopStatusSectionProps {
  workshop: WorkshopData;
  onWorkshopUpdate: () => void;
}

export const WorkshopStatusSection: React.FC<WorkshopStatusSectionProps> = ({
  workshop,
  onWorkshopUpdate,
}) => {
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartWorkshop = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/v1/pd/workshops/${workshop.id}/start`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        onWorkshopUpdate();
      } else {
        console.error('Failed to start workshop');
      }
    } catch (error) {
      console.error('Error starting workshop:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEndWorkshop = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/pd/workshops/${workshop.id}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onWorkshopUpdate();
        setShowEndDialog(false);
      } else {
        console.error('Failed to end workshop');
      }
    } catch (error) {
      console.error('Error ending workshop:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const canStartWorkshop = workshop.state === 'Not Started';
  const canEndWorkshop =
    workshop.state === 'In Progress' && workshop.readyToClose;

  return (
    <>
      <Card className={styles.card}>
        <CardHeader
          className={styles.cardHeader}
          title={
            <Box className={styles.cardHeaderContainer}>
              <Heading2 visualAppearance="body-two" noMargin>
                <StrongText>Workshop Status</StrongText>
              </Heading2>
              <Tags
                className={classNames(styles.workshopTag, styles.status)}
                tagsList={[
                  {
                    label: workshop.state,
                    key: 'workshop-status',
                  },
                ]}
                size="s"
              />
            </Box>
          }
        />
        <CardContent className={styles.cardContent}>
          <Box className={styles.sectionContainer}>
            <Box className={styles.column}>
              <BodyFourText>
                On the day of your workshop, click the "Start Workshop" button
                below.
              </BodyFourText>
            </Box>
          </Box>

          <Box>
            {canStartWorkshop && (
              <Button
                size="s"
                text="Start Workshop"
                onClick={handleStartWorkshop}
                disabled={isUpdating}
              />
            )}

            {canEndWorkshop && (
              <Button
                size="s"
                text="End workshop"
                type="secondary"
                color={buttonColors.destructive}
                onClick={() => setShowEndDialog(true)}
                disabled={isUpdating}
              />
            )}

            {workshop.state === 'In Progress' && !workshop.readyToClose && (
              <BodyFourText>
                Workshop cannot end until all sessions are complete and
                attendance has been taken.
              </BodyFourText>
            )}

            {workshop.state === 'Ended' && (
              <BodyFourText>This workshop has ended.</BodyFourText>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* End Workshop Confirmation Dialog */}
      <Dialog open={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <DialogTitle className={styles.dialogTitle}>
          <StrongText>End Workshop</StrongText>
        </DialogTitle>
        <DialogContent>
          <BodyThreeText>
            Are you sure you want to end this workshop? This action cannot be
            undone.
          </BodyThreeText>
        </DialogContent>
        <DialogActions>
          <Button
            size="s"
            text="End Workshop"
            type="secondary"
            color={buttonColors.destructive}
            onClick={handleEndWorkshop}
            disabled={isUpdating}
          />
          <Button
            size="s"
            text="Cancel"
            type="secondary"
            color={buttonColors.gray}
            onClick={() => setShowEndDialog(false)}
            disabled={isUpdating}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
