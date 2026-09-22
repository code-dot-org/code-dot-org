// Stand-in for an embedded Web Lab: read-only file tabs and a live preview
// built from the starter files. Nothing here is editable or persisted.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useMemo, useState} from 'react';

import moduleStyles from './pathway.module.scss';

type Files = {[name: string]: string};

const EMPTY_PAGE =
  '<!DOCTYPE html><html><body style="margin:0;height:100vh;display:grid;place-items:center;font-family:sans-serif;color:#888"><p>Your site will appear here.</p></body></html>';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Inlines each css/js file where index.html references it, so the preview
// needs no server.
function buildSrcDoc(files: Files): string {
  let html = files['index.html'];
  if (!html) return EMPTY_PAGE;
  for (const [name, content] of Object.entries(files)) {
    const ref = escapeRegExp(name);
    if (name.endsWith('.css')) {
      html = html.replace(
        new RegExp(`<link[^>]*href=["']${ref}["'][^>]*>`, 'i'),
        () => `<style>${content}</style>`
      );
    } else if (name.endsWith('.js')) {
      html = html.replace(
        new RegExp(`<script[^>]*src=["']${ref}["'][^>]*>\\s*</script>`, 'i'),
        () => `<script>${content}</script>`
      );
    }
  }
  return html;
}

interface FakeWebLabProps {
  files?: Files;
  viewMode?: 'split' | 'code' | 'preview';
  label?: string;
  /** When set, the code pane is replaced by this message and the tabs are disabled. */
  codeLocked?: string;
}

const FakeWebLab: React.FunctionComponent<FakeWebLabProps> = ({
  files = {},
  viewMode = 'split',
  label,
  codeLocked,
}) => {
  const names = Object.keys(files);
  const [active, setActive] = useState(names[0]);
  const srcDoc = useMemo(() => buildSrcDoc(files), [files]);

  return (
    <section className={moduleStyles.fakeLab} aria-label="Web Lab preview">
      <div className={moduleStyles.fileTabs}>
        {names.length === 0 && (
          <span
            className={classNames(
              moduleStyles.fileTab,
              moduleStyles.fileTabActive
            )}
          >
            index.html
          </span>
        )}
        {names.map(name => (
          <button
            key={name}
            type="button"
            className={classNames(
              moduleStyles.fileTab,
              name === active && moduleStyles.fileTabActive
            )}
            disabled={!!codeLocked}
            onClick={() => setActive(name)}
          >
            {codeLocked && <FontAwesomeV6Icon iconName="lock" />} {name}
          </button>
        ))}
        <span className={moduleStyles.labBadge}>
          {label ? `${label} · ` : ''}Web Lab, display only
        </span>
      </div>
      <div className={moduleStyles.labPanes}>
        {viewMode !== 'preview' &&
          (codeLocked ? (
            <div className={moduleStyles.lockedPane}>
              <FontAwesomeV6Icon
                iconName="lock"
                className={moduleStyles.lockedPaneIcon}
              />
              <span>{codeLocked}</span>
            </div>
          ) : (
            <pre className={moduleStyles.code}>
              {files[active] ?? '<!-- Your project code will appear here. -->'}
            </pre>
          ))}
        {viewMode !== 'code' && (
          <iframe
            className={moduleStyles.preview}
            title="Preview"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
          />
        )}
      </div>
    </section>
  );
};

export default FakeWebLab;
