import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {useToast} from '@code-dot-org/component-library/toast';
import {DashboardApiClient, useRemoveParentEmail} from '@code-dot-org/core/api';

import ParentEmailModal from '../components/ParentEmailModal';

import Section from './Section';
import type {SectionProps} from './types';

/**
 * Student-only "For Parents and Guardians" section: links a parent/guardian
 * email for progress updates and password recovery. One address per account.
 */
export default function ParentGuardianEmail({settings}: SectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const removeMutation = useRemoveParentEmail(DashboardApiClient);
  const toast = useToast();
  const {parentEmail} = settings;

  return (
    <Section id="parent-guardian-email" title="For Parents and Guardians">
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <Typography variant="body2">
          Link a parent/guardian email address to this account to stay updated
          on your child’s progress and projects. You will also be able to use
          this email address for password recovery.
        </Typography>
        <Typography variant="body2">
          <strong>Parent/guardian email:</strong> {parentEmail ?? 'None'}
        </Typography>
        <Box sx={{display: 'flex', gap: 2}}>
          {/* aria-label disambiguates the bare "Update"/"Remove" labels out of
              context; each contains its visible text (WCAG 2.5.3). */}
          <Button
            aria-label="Update parent/guardian email"
            onClick={() => setModalOpen(true)}
            sx={{px: 0}}
          >
            Update
          </Button>
          {parentEmail && (
            <Button
              aria-label="Remove parent/guardian email"
              onClick={() =>
                removeMutation.mutate(undefined, {
                  onSuccess: () => toast('Parent/guardian email removed.'),
                })
              }
              disabled={removeMutation.isPending}
              sx={{px: 0}}
            >
              Remove
            </Button>
          )}
        </Box>
        <Typography
          variant="body3"
          sx={{color: 'var(--text-neutral-secondary)'}}
        >
          Note: we are only able to support one parent/guardian email address
          per student account at this time.
        </Typography>
      </Box>
      <ParentEmailModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Section>
  );
}
