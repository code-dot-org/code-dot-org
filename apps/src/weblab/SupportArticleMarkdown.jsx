import React from 'react';
import weblabI18n from '@cdo/weblab/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {SUPPORT_ARTICLE_URL} from '@cdo/apps/weblab/constants';

export default function SupportArticleMarkdown() {
  return (
    <SafeMarkdown
      markdown={weblabI18n.troubleshootingSupport({url: SUPPORT_ARTICLE_URL})}
      openExternalLinksInNewTab
    />
  );
}
