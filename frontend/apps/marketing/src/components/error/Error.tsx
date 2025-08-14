'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';

import Image from '@code-dot-org/component-library/image';

import Overline from '@/components/contentful/overline';
import {handleError} from '@/otel/errorHandler';
import sadBee404 from '@public/images/error/404.webp';
import sadBee500 from '@public/images/error/500.webp';

type ErrorProps = Error404Props | Error500Props;

interface Error404Props {
  statusCode: 404;
}

interface Error500Props {
  statusCode: 500;
  /** Error object */
  error: Error & {digest?: string};
  /** Next.js function to reset the error boundary */
  resetAction: () => void;
}

const styles = {
  section: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBlock: 12,
    paddingInline: 4,
    textAlign: 'center',
  },
  image: {
    display: 'inline-block',
    height: 'auto',
    width: '7.125rem',
  },
  callToAction: {
    marginTop: 2,
    display: 'flex',
    gap: 2,
  },
  callToActionWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    marginBottom: 3,
  },
};

export default function Error(props: ErrorProps) {
  const [showError, setShowError] = useState(false);
  const [traceId, setTraceId] = useState<string>();

  if (props.statusCode === 500) {
    useEffect(() => {
      const currentTraceId = uuid();
      setTraceId(currentTraceId);

      handleError(props.error, currentTraceId);
    }, [props.error]);
  }

  const getSadBeeImage = () => {
    switch (props.statusCode) {
      case 404:
        return sadBee404;
      case 500:
        return sadBee500;
      default:
        return undefined;
    }
  };

  const getHeadingText = () => {
    switch (props.statusCode) {
      case 404:
        return "We couldn't find this page";
      case 500:
      default:
        return "This page isn't working";
    }
  };

  const getDescriptionText = () => {
    switch (props.statusCode) {
      case 404:
        return "We couldn't find the page you were looking for, let's get you back on track.";
      case 500:
      default:
        return "Uh oh! We ran into an internal server error and couldn't complete your request.";
    }
  };

  const getCallToAction = () => {
    switch (props.statusCode) {
      case 404:
        return (
          <Button
            href={'/'}
            variant="contained"
            color="primary"
            size="medium"
            disableElevation
            disableRipple
          >
            Go to homepage
          </Button>
        );
      case 500:
        return (
          <Box sx={styles.callToActionWrapper}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              disableElevation
              disableRipple
              onClick={
                // Attempt to recover by trying to re-render the segment
                () => props.resetAction()
              }
            >
              Reload this page
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              disableElevation
              disableRipple
              href="https://status.code.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check status page
            </Button>
          </Box>
        );
    }
  };

  const sadBeeImage = getSadBeeImage();

  return (
    <Box component="section" sx={styles.section}>
      {sadBeeImage && (
        <Image src={sadBeeImage.src} alt="" style={styles.image} />
      )}

      <Overline
        removeMarginBottom={false}
        size={'l'}
        color={'primary'}
        sx={{marginTop: 2}}
      >
        ERROR {props.statusCode}
      </Overline>

      <Typography component="h1" variant="h1" gutterBottom>
        {getHeadingText()}
      </Typography>

      <Typography component="p" variant="body2" gutterBottom>
        {getDescriptionText()}
      </Typography>

      <Box sx={styles.callToAction}>{getCallToAction()}</Box>

      {props.statusCode === 500 && (
        <>
          <Typography
            component="p"
            variant="body2"
            gutterBottom
          >{`Error Trace ID: ${traceId}`}</Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setShowError(!showError)}
            disableElevation
            disableRipple
          >
            Toggle error
          </Button>

          {showError && <pre>{props.error?.stack}</pre>}
        </>
      )}
    </Box>
  );
}
