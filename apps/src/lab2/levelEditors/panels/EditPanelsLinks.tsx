import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {
  DEFAULT_PANEL_LINK_WIDTH,
  DEFAULT_PANEL_LINK_X,
  DEFAULT_PANEL_LINK_Y,
  Panel,
  PanelLink,
} from '@cdo/apps/panels/types';

import moduleStyles from './edit-panels.module.scss';

interface EditPanelsLinksProps {
  panel: Panel;
  allPanels: Panel[];
  updatePanel: (panel: Panel) => void;
}

// Editor for a single panel's positioned text elements. Stored in `links`
// for compatibility with existing panel data.
const EditPanelsLinks: React.FunctionComponent<EditPanelsLinksProps> = ({
  panel,
  allPanels,
  updatePanel,
}) => {
  const links = panel.links || [];
  const otherPanels = allPanels.filter(p => p.key !== panel.key);

  const updateLink = (linkIndex: number, newLink: PanelLink) => {
    const newLinks = [...links];
    newLinks[linkIndex] = newLink;
    updatePanel({...panel, links: newLinks});
  };

  const addLink = () => {
    const newLink: PanelLink = {
      text: '',
      x: DEFAULT_PANEL_LINK_X,
      y: DEFAULT_PANEL_LINK_Y,
    };
    updatePanel({...panel, links: [...links, newLink]});
  };

  const deleteLink = (linkIndex: number) => {
    const newLinks = links.filter((_, i) => i !== linkIndex);
    updatePanel({...panel, links: newLinks.length > 0 ? newLinks : undefined});
  };

  return (
    <div className={moduleStyles.linksSection}>
      <Typography variant="h6" gutterBottom>
        Text
      </Typography>
      {links.map((link, linkIndex) => (
        <div
          key={linkIndex}
          className={classNames(moduleStyles.fieldRow, moduleStyles.linkRow)}
          role="group"
          aria-label={`Text ${linkIndex + 1} settings`}
        >
          <label>
            Text
            <textarea
              value={link.text}
              onChange={e =>
                updateLink(linkIndex, {...link, text: e.target.value})
              }
            />
          </label>
          <label className={moduleStyles.linkWidthControl}>
            Width: {link.width ?? DEFAULT_PANEL_LINK_WIDTH}%
            <input
              type="range"
              min={1}
              max={100}
              value={link.width ?? DEFAULT_PANEL_LINK_WIDTH}
              onChange={e =>
                updateLink(linkIndex, {
                  ...link,
                  width: Number(e.target.value),
                })
              }
            />
          </label>
          <SimpleDropdown
            labelText="Target panel"
            name={`text-target-${linkIndex}`}
            size="s"
            selectedValue={link.targetKey || ''}
            disabled={otherPanels.length === 0}
            onChange={e => {
              const newLink = {...link};
              if (e.target.value) {
                newLink.targetKey = e.target.value;
              } else {
                delete newLink.targetKey;
              }
              updateLink(linkIndex, newLink);
            }}
            items={[
              {value: '', text: 'No target'},
              ...otherPanels.map(p => ({
                value: p.key,
                text: `Panel ${allPanels.indexOf(p) + 1}`,
              })),
            ]}
          />
          <button
            type="button"
            className={moduleStyles.deleteButton}
            onClick={() => deleteLink(linkIndex)}
            aria-label="Delete text"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        onClick={addLink}
        text="Add Text"
        color="gray"
        icon="plus"
      />
    </div>
  );
};

export default EditPanelsLinks;
