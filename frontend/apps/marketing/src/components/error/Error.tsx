'use client';

import {useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';

import Button, {LinkButton} from '@code-dot-org/component-library/button';
import Image from '@code-dot-org/component-library/image';
import Typography from '@code-dot-org/component-library/typography';

import Overline from '@/components/contentful/overline';
import {handleError} from '@/otel/errorHandler';
import sadBee404 from '@public/images/error/404.png';
import sadBee500 from '@public/images/error/500.png';

import errorStyles from './error.module.scss';

type ErrorProps = Error404Props | Error500Props;

interface BaseErrorProps {
  /** Trace ID for error tracking */
  errorTraceId?: string;
}

interface Error404Props extends BaseErrorProps {
  statusCode: 404;
}

interface Error500Props extends BaseErrorProps {
  statusCode: 500;
  /** Error object */
  error: Error & {digest?: string};
  /** Next.js function to reset the error boundary */
  resetAction?: () => void;
}

export default function Error(props: ErrorProps) {
  const [showError, setShowError] = useState(false);
  const [traceId, setTraceId] = useState<string | undefined>(
    props.errorTraceId,
  );

  if (props.statusCode === 500) {
    console.log(
      `****************OH NO ERRROR************** ${props.error?.message}`,
    );
    useEffect(() => {
      if (typeof traceId === 'undefined') {
        const currentTraceId = uuid();
        setTraceId(currentTraceId);
      }

      handleError(props.error, traceId);
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

  const reset = () => {
    if (props.statusCode === 500) {
      const serverResetAction = props.resetAction;

      if (serverResetAction) {
        serverResetAction();
      } else {
        // If no reset action is provided, we can just reload the page
        window.location.reload();
      }
    }
  };

  const getCallToAction = () => {
    switch (props.statusCode) {
      case 404:
        return <LinkButton href={'/'} text={'Go to homepage'} />;
      case 500:
        return (
          <>
            <Button onClick={reset} text={'Reload this page'} />
            <LinkButton
              href={'https://status.code.org/'}
              type={'secondary'}
              color={'black'}
              text={'Check status page'}
            />
          </>
        );
    }
  };

  const sadBeeImage = getSadBeeImage();

  return (
    <section className={errorStyles.errorContainer}>
      {sadBeeImage && (
        <Image
          className={errorStyles.sadBeeContainer}
          src={sadBeeImage.src}
          alt=""
          style={{width: '7.125rem'}}
        />
      )}
      <Overline removeMarginBottom={false} size={'l'} color={'primary'}>
        ERROR {props.statusCode}
      </Overline>

      <Typography
        visualAppearance={'heading-xxl'}
        semanticTag={'h1'}
        className={errorStyles.errorHeading}
      >
        {getHeadingText()}
      </Typography>

      <Typography
        visualAppearance={'body-two'}
        semanticTag={'p'}
        className={errorStyles.errorBody}
      >
        {getDescriptionText()}
      </Typography>

      <div className={errorStyles.callToActionContainer}>
        {getCallToAction()}
      </div>

      {props.statusCode === 500 && (
        <>
          <Typography
            visualAppearance={'body-two'}
            semanticTag={'p'}
          >{`Error Trace ID: ${traceId}`}</Typography>
          <Button
            size={'xs'}
            color={'destructive'}
            onClick={() => setShowError(!showError)}
            text={'Toggle error'}
          />

          {showError && <pre>{props.error?.stack}</pre>}
        </>
      )}
    </section>
  );
}
