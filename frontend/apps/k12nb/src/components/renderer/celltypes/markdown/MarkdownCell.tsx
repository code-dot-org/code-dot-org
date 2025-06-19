import React from 'react';
import {marked} from 'marked';
import {notebookStore} from '@/components/renderer/store/notebookStore';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
// Assume imports exist
// import { notebookStore } from "@renderer/store/notebookStore.react";

export default function MarkdownCell({
  cell,
  locale,
}: {
  cell: any;
  locale: string;
}) {
  // Get the localized source from the singleton store
  const source = notebookStore.getLocalizedSource(cell.id, locale);
  const html = source ? marked.parse(source.join('')) : '';
  return (
    <div
      className="markdown-cell"
      style={{maxWidth: 800, margin: '0 auto', padding: '16px 0'}}
    >
      <BodyTwoText>
        <span dangerouslySetInnerHTML={{__html: html}} />
      </BodyTwoText>
    </div>
  );
}
