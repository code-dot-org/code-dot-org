import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {SUPPORT_ARTICLE_URL} from '@cdo/apps/weblab/constants';
import weblabI18n from '@cdo/weblab/locale';

export default function SupportArticleMarkdown() {
  return (
    <SafeMarkdown
      markdown={weblabI18n.troubleshootingSupport({url: SUPPORT_ARTICLE_URL})}
      openExternalLinksInNewTab
    />
  );
}
