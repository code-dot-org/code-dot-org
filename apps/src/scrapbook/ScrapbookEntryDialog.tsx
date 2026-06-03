import {Dialog} from '@code-dot-org/component-library/dialog';
import {Button as MuiButton, Chip as MuiChip} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import HttpClient from '@cdo/apps/util/HttpClient';

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

// Cap uploaded images at ~5MB pre-base64 so we don't blow up the JSON payload
// to the scrapbook_entries endpoint.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

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

  const handleFileSelected = async (
    slot: 'before' | 'after',
    file: File | null
  ) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Image is too large. Please choose one under 5 MB.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (slot === 'before') setBeforeUrl(dataUrl);
      else setAfterUrl(dataUrl);
    } catch {
      setError('Could not read the selected file.');
    }
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

  return createPortal(
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
          <div className={moduleStyles.experimentChipRow}>
            <MuiChip
              label="experiment"
              size="small"
              className={moduleStyles.experimentChip}
            />
          </div>
          <div className={moduleStyles.screenshots}>
            <ScreenshotSlot
              label="Before"
              url={beforeUrl}
              onFileSelected={file => handleFileSelected('before', file)}
              disabled={saving || loading}
            />
            <ScreenshotSlot
              label="After"
              url={afterUrl}
              onFileSelected={file => handleFileSelected('after', file)}
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
                <textarea
                  className={moduleStyles.stemField}
                  rows={2}
                  maxLength={500}
                  value={form[field]}
                  onChange={handleChange(field)}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
          {error && <div className={moduleStyles.error}>{error}</div>}
        </div>
      }
    />,
    document.body
  );
}

function ScreenshotSlot({
  label,
  url,
  onFileSelected,
  disabled,
}: {
  label: string;
  url: string | null;
  onFileSelected: (file: File | null) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={moduleStyles.screenshotSlot}>
      <span className={moduleStyles.screenshotLabel}>{label}</span>
      <img
        src={
          url ||
          'https://studio.code.org/lab_resources/html-placeholder-image.avif'
        }
        alt={url ? `${label} screenshot` : `${label} placeholder`}
        className={moduleStyles.screenshotImg}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          const file = e.target.files?.[0] || null;
          onFileSelected(file);
          // Reset so picking the same file twice still fires onChange.
          e.target.value = '';
        }}
      />
      <MuiButton
        variant="text"
        size="small"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        {url ? 'Replace' : 'Upload image'}
      </MuiButton>
    </div>
  );
}
