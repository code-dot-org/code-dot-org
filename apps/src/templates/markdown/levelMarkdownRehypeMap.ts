import {WEBLAB2_WIDGET_TAG} from '@cdo/apps/templates/SafeMarkdown';

import Weblab2WidgetEmbed from './Weblab2WidgetEmbed';

// A module-level singleton: SafeMarkdown caches its unified processor in a WeakMap keyed
// on this object's identity, so a fresh object per render would rebuild the pipeline
// every time. Registering a component here is also what grants a page the capability to
// turn <weblab2-widget> into an iframe; pages that never pass this map render it inert.
const levelMarkdownRehypeMap = Object.freeze({
  [WEBLAB2_WIDGET_TAG]: Weblab2WidgetEmbed,
});

export default levelMarkdownRehypeMap;
