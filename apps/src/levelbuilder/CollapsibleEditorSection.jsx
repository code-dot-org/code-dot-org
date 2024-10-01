import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

import style from './levelbuilder.module.scss';

export default function CollapsibleEditorSection(props) {
  const [collapsed, setCollapsed] = useState(props.collapsed || false);

  const {title, fullWidth} = props;

  return (
    <div>
      <div className={style.collapsibleEditorSectionHeader}>
        <h2 className={style.collapsibleEditorSectionTitle}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            type="button"
            className={style.headerButton}
          >
            <FontAwesome
              icon={collapsed ? 'expand' : 'compress'}
              className={style.collapsibleEditorSectionIcon}
            />
            {title}
          </button>
        </h2>
      </div>
      <div
        className={classnames(style.collapsibleEditorSectionEditors, {
          [style.nonFullWidth]: !fullWidth,
        })}
        hidden={collapsed}
      >
        {props.children}
      </div>
    </div>
  );
}

CollapsibleEditorSection.propTypes = {
  title: PropTypes.string,
  fullWidth: PropTypes.bool,
  collapsed: PropTypes.bool,
  children: PropTypes.any,
};
