import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';

import clientState from '@cdo/apps/code-studio/clientState';
import HttpClient from '@cdo/apps/util/HttpClient';

import {createDecoder} from './decoder';

import styles from './badges.module.scss';

export default function BadgeScanner({strings}) {
  const video = useRef(null);
  const stream = useRef(null);
  const timer = useRef(null);
  const runId = useRef(0);
  const cameraControl = useRef(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('instruction');
  const [facing, setFacing] = useState('user');

  const releaseCamera = () => {
    clearTimeout(timer.current);
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) {
      video.current.srcObject = null;
    }
  };
  const stop = () => {
    runId.current++;
    releaseCamera();
    setActive(false);
    setStatus('instruction');
  };

  useEffect(() => {
    const cleanup = () => {
      runId.current++;
      releaseCamera();
    };
    window.addEventListener('pagehide', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('pagehide', cleanup);
    };
  }, []);

  useEffect(() => {
    cameraControl.current?.focus();
  }, [active]);

  const start = async direction => {
    stop();
    const run = runId.current;
    setFacing(direction);
    setActive(true);
    setStatus('waiting');
    if (!navigator.mediaDevices?.getUserMedia) {
      setActive(false);
      setStatus('camera_unsupported');
      return;
    }
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({
        video: {facingMode: {ideal: direction}},
        audio: false,
      });
      if (run !== runId.current) {
        acquired.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = acquired;
      video.current.srcObject = acquired;
      await video.current.play();
      const decode = await createDecoder();
      if (run !== runId.current) {
        return;
      }
      setStatus('scanning');
      const scan = async () => {
        try {
          if (run !== runId.current) {
            return;
          }
          const payload = await decode(video.current);
          if (run !== runId.current) {
            return;
          }
          if (!payload) {
            timer.current = setTimeout(scan, 200);
            return;
          }
          releaseCamera();
          setStatus('signing_in');
          const response = await HttpClient.post(
            '/badge_login',
            JSON.stringify({badge_payload: payload}),
            true,
            {'Content-Type': 'application/json'}
          );
          const result = await response.json();
          if (run === runId.current) {
            clientState.reset();
            window.location.assign(result.redirect);
          }
        } catch (error) {
          if (run === runId.current) {
            releaseCamera();
            setActive(false);
            setStatus(
              error.response?.status === 401
                ? 'login_error'
                : error.response?.status === 429
                ? 'try_later'
                : 'network_error'
            );
          }
        }
      };
      scan();
    } catch (error) {
      if (run === runId.current) {
        releaseCamera();
        setActive(false);
        setStatus(
          {
            NotAllowedError: 'camera_denied',
            SecurityError: 'camera_denied',
            NotFoundError: 'camera_missing',
            NotReadableError: 'camera_busy',
          }[error.name] || 'camera_error'
        );
      }
    }
  };

  return (
    <>
      <Typography component="p" role="status" aria-live="polite">
        {strings[status]}
      </Typography>
      {!active && (
        <svg className={styles.guide} viewBox="0 0 280 120" aria-hidden="true">
          <rect x="170" y="5" width="90" height="110" rx="8" />
          <circle cx="215" cy="16" r="3" />
          <rect x="15" y="28" width="85" height="64" rx="5" />
          <path d="M32 42h14v14H32z M68 42h14v14H68z M32 67h14v14H32z M66 69h16v12H66z M115 60h38m-12-12 12 12-12 12" />
        </svg>
      )}
      <video
        ref={video}
        className={styles.camera}
        aria-label={strings.instruction}
        muted
        playsInline
      />
      <div className={styles.controls}>
        {!active && (
          <Button
            ref={cameraControl}
            variant="contained"
            onClick={() => start(facing)}
          >
            {strings.start}
          </Button>
        )}
        {active && (
          <>
            <Button
              ref={cameraControl}
              onClick={stop}
              disabled={status === 'signing_in'}
            >
              {strings.cancel}
            </Button>
            <Button
              onClick={() => start(facing === 'user' ? 'environment' : 'user')}
              disabled={status === 'signing_in'}
            >
              {strings.switch_camera}
            </Button>
          </>
        )}
        <Button href="/users/sign_in">{strings.other_login}</Button>
      </div>
    </>
  );
}

BadgeScanner.propTypes = {
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
};
