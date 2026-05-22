import {Dialog} from '@code-dot-org/component-library/dialog';
import {Button as MuiButton, TextField} from '@mui/material';
import React, {useEffect, useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import captureLevelScreenshot from './captureLevelScreenshot';
import RegionSelector, {SelectionRect} from './RegionSelector';

import moduleStyles from './ScrapbookEntryDialog.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scriptId: number | undefined;
  levelId: number | undefined;
}

interface FormState {
  atFirst: string;
  butThen: string;
  andNow: string;
}

interface ExistingEntry {
  before_asset_url: string | null;
  after_asset_url: string | null;
  at_first_text: string | null;
  but_then_text: string | null;
  and_now_text: string | null;
}

const EMPTY_FORM: FormState = {atFirst: '', butThen: '', andNow: ''};

export default function ScrapbookEntryDialog({
  isOpen,
  onClose,
  scriptId,
  levelId,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [capturingSlot, setCapturingSlot] = useState<'before' | 'after' | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !scriptId || !levelId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    HttpClient.fetchJson<ExistingEntry[]>(
      `/api/v1/scrapbook_entries?script_id=${scriptId}&level_id=${levelId}`
    )
      .then(({value: existingEntries}) => {
        if (cancelled) return;
        const existing = existingEntries[0] || null;
        if (existing) {
          setForm({
            atFirst: existing.at_first_text || '',
            butThen: existing.but_then_text || '',
            andNow: existing.and_now_text || '',
          });
          setBeforeUrl(existing.before_asset_url);
          setAfterUrl(existing.after_asset_url);
        } else {
          setForm(EMPTY_FORM);
          setBeforeUrl(null);
          setAfterUrl(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, scriptId, levelId]);

  if (!isOpen) return null;

  if (capturingSlot) {
    return (
      <RegionSelector
        onSelect={async (rect: SelectionRect) => {
          const slot = capturingSlot;
          const captured = await captureLevelScreenshot(rect);
          setCapturingSlot(null);
          if (!captured) {
            setError('Could not capture screenshot.');
            return;
          }
          if (slot === 'before') setBeforeUrl(captured);
          else setAfterUrl(captured);
        }}
        onCancel={() => setCapturingSlot(null)}
      />
    );
  }

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({...prev, [field]: e.target.value}));
    };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setBeforeUrl(null);
    setAfterUrl(null);
    setError(null);
    onClose();
  };

  const handleRecapture = (slot: 'before' | 'after') => {
    setError(null);
    setCapturingSlot(slot);
  };

  const handleSave = async () => {
    if (!scriptId || !levelId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        script_id: scriptId,
        level_id: levelId,
        scrapbook_entry: {
          at_first_text: form.atFirst,
          but_then_text: form.butThen,
          and_now_text: form.andNow,
          ...(beforeUrl !== null ? {before_asset_url: beforeUrl} : {}),
          ...(afterUrl !== null ? {after_asset_url: afterUrl} : {}),
        },
      };
      const response = await HttpClient.post(
        '/api/v1/scrapbook_entries',
        JSON.stringify(payload),
        true,
        {'Content-Type': 'application/json'}
      );
      if (!response.ok) {
        setError('Could not save. Try again.');
      } else {
        handleClose();
      }
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = !saving && !loading && !!scriptId && !!levelId;

  return (
    <Dialog
      title="Add to Scrapbook"
      onClose={handleClose}
      primaryButtonProps={{
        children: saving ? 'Saving...' : 'Save',
        onClick: handleSave,
        disabled: !canSave,
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        onClick: handleClose,
        disabled: saving,
      }}
      customContent={
        <div className={moduleStyles.content}>
          <div className={moduleStyles.screenshots}>
            <ScreenshotSlot
              label="Before"
              url={beforeUrl}
              onRecapture={() => handleRecapture('before')}
              disabled={saving || loading}
            />
            <ScreenshotSlot
              label="After"
              url={afterUrl}
              onRecapture={() => handleRecapture('after')}
              disabled={saving || loading}
            />
          </div>
          <div className={moduleStyles.stems}>
            {[
              {label: 'At first...', field: 'atFirst' as const},
              {label: 'But then...', field: 'butThen' as const},
              {label: 'And now...', field: 'andNow' as const},
            ].map(({label, field}) => (
              <div key={field} className={moduleStyles.stemRow}>
                <span className={moduleStyles.stemLabel}>{label}</span>
                <TextField
                  className={moduleStyles.stemField}
                  fullWidth
                  multiline
                  rows={2}
                  value={form[field]}
                  onChange={handleChange(field)}
                  inputProps={{maxLength: 500}}
                  size="small"
                  disabled={loading}
                />
              </div>
            ))}
          </div>
          {error && <div className={moduleStyles.error}>{error}</div>}
        </div>
      }
    />
  );
}

function ScreenshotSlot({
  label,
  url,
  onRecapture,
  disabled,
}: {
  label: string;
  url: string | null;
  onRecapture: () => void;
  disabled: boolean;
}) {
  return (
    <div className={moduleStyles.screenshotSlot}>
      <span className={moduleStyles.screenshotLabel}>{label}</span>
      {url ? (
        <img
          src={url}
          alt={`${label} screenshot`}
          className={moduleStyles.screenshotImg}
        />
      ) : (
        <div className={moduleStyles.screenshotPlaceholder}>no screenshot</div>
      )}
      <MuiButton
        variant="text"
        size="small"
        onClick={onRecapture}
        disabled={disabled}
      >
        {url ? 'Recapture' : 'Capture now'}
      </MuiButton>
    </div>
  );
}
