import PropTypes from 'prop-types';
import React, {useState} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styleConstants from '@cdo/apps/styleConstants';

export default function CollapsibleEditorSection(props) {
  const [collapsed, setCollapsed] = useState(props.collapsed || false);

  const {title, fullWidth} = props;
  const editorsStyle = {
    ...styles.editors,
    width: fullWidth ? null : styleConstants['content-width']
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 onClick={() => setCollapsed(!collapsed)} style={styles.title}>
          <FontAwesome
            icon={collapsed ? 'expand' : 'compress'}
            style={styles.icon}
          />
          {title}
        </h2>
      </div>
      <div style={editorsStyle} hidden={collapsed}>
        {props.children}
      </div>
    </div>
  );
}

CollapsibleEditorSection.propTypes = {
  title: PropTypes.string,
  fullWidth: PropTypes.bool,
  collapsed: PropTypes.bool,
  children: PropTypes.any
};

const styles = {
  header: {
    borderBottom: '1px solid rgb(204, 204, 204)'
  },
  icon: {
    marginRight: 10
  },
  editors: {
    padding: 10
  },
  title: {
    fontSize: 20
  }
};
