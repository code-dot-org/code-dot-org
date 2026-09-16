import React, {useState} from 'react';

import moduleStyles from './weblab2-widget-embed.module.scss';

// Mirrors WIDGET2_ID_PATTERN in dashboard/app/helpers/widget2_helper.rb. Rejecting "/",
// ":" and "." is what guarantees a validated id can only build a same-origin relative
// path, so markdown can never point this iframe somewhere else.
const WIDGET_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const MAX_WIDGET_ID_LENGTH = 64;

const DEFAULT_HEIGHT_PX = 920;
const MIN_HEIGHT_PX = 200;
const MAX_HEIGHT_PX = 2000;

// rehype-react derives prop names from the raw attribute rather than the hast property
// for attributes it does not recognize, so these arrive kebab-cased.
interface Weblab2WidgetEmbedProps {
  'data-widget-id'?: string;
  'data-height'?: string;
  'data-title'?: string;
  'data-max-width'?: string;
}

const clampHeight = (rawHeight: string | undefined): number => {
  const parsedHeight = Number.parseInt(rawHeight ?? '', 10);
  if (!Number.isFinite(parsedHeight)) {
    return DEFAULT_HEIGHT_PX;
  }
  return Math.min(Math.max(parsedHeight, MIN_HEIGHT_PX), MAX_HEIGHT_PX);
};

const Weblab2WidgetEmbed: React.FunctionComponent<
  Weblab2WidgetEmbedProps
> = props => {
  const widgetId = props['data-widget-id'];
  const [isLoaded, setIsLoaded] = useState(false);

  const isValidWidgetId =
    !!widgetId &&
    widgetId.length <= MAX_WIDGET_ID_LENGTH &&
    WIDGET_ID_PATTERN.test(widgetId);

  if (!isValidWidgetId) {
    return (
      <div className={moduleStyles.embedError} role="note">
        This interactive widget could not be loaded
        {widgetId ? ` (unknown widget "${widgetId}")` : ' (no widget id given)'}
        .
      </div>
    );
  }

  const heightPx = clampHeight(props['data-height']);
  const title =
    props['data-title']?.trim() || `Interactive widget: ${widgetId}`;

  return (
    <div
      className={moduleStyles.embedFrame}
      style={{
        height: `${heightPx}px`,
        maxWidth: props['data-max-width'] || undefined,
      }}
    >
      {!isLoaded && (
        <div className={moduleStyles.embedLoading} role="status">
          Loading interactive widget…
        </div>
      )}
      {/*
        No sandbox: this is our own same-origin page and it must register a service
        worker, which only "allow-scripts allow-same-origin" permits — a combination the
        frame can strip anyway. The real boundary is one frame down, where HTMLPreview
        sandboxes the separate-origin preview under a CSP. Omitting "allow" likewise
        grants nothing, since Permissions-Policy denies by default.
      */}
      <iframe
        className={moduleStyles.embedIframe}
        src={`/widget2/${widgetId}/embed`}
        title={title}
        loading="lazy"
        referrerPolicy="same-origin"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default Weblab2WidgetEmbed;
