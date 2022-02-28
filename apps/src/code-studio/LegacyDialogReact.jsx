import React from 'react';
import classnames from 'classnames';
import Dialog from '@cdo/apps/templates/Dialog';

// options.id = prop id
// options.width = prop width
// options.close = prop hasCloser
// options.header = prop header
// options.link = prop link
// options.body = prop body
// options.autoResizeScrollableElement = prop autoResizeScrollableElement
const LegacyDialogReact = ({
  id,
  hasCloser,
  width,
  header,
  link,
  body,
  autoResizeScrollableElement
}) => {
  const widthStyle = width
    ? {width: `${width}px`, marginLeft: `-${options.width / 2}px`}
    : {};

  const closerElement = (
    <div id="x-close" className="x-close" data-dismiss="modal" />
  );

  const linkElement = (
    <div className="open-link">
      <a target="_blank" href={link} rel="noopener noreferrer" />
    </div>
  );

  return (
    <Dialog isOpen={true}>
      <div
        tabIndex="-1"
        id={id || 'legacy-dialog-react'}
        className={classnames('modal dash_modal', {
          'auto-resize-scrollable': autoResizeScrollableElement
        })}
        style={widthStyle}
      >
        {header && (
          <div className="modal-header">
            {header}
            {hasCloser && closerElement}
            {link && linkElement}
          </div>
        )}
        <div className="modal-body dash_modal_body">
          {!header && hasCloser && closerElement}
          {!header && link && linkElement}
          {body}
        </div>
      </div>
    </Dialog>
  );
};

export default LegacyDialogReact;
