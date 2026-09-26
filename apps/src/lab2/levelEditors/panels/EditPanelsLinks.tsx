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

// Editor for a single panel's `links` array. Renders one row per link
// (text, x/y/width sliders, target-panel dropdown, URL, delete) and an Add
// Link button. Targets exclude the current panel; a link with a URL leaves
// the level instead, so a single-panel level can still have links.
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
      targetKey: otherPanels[0]?.key ?? '',
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
        Links
      </Typography>
      {links.map((link, linkIndex) => (
        <div
          key={linkIndex}
          className={classNames(moduleStyles.fieldRow, moduleStyles.linkRow)}
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
          <label className={moduleStyles.linkSliderHorizontal}>
            X: {link.x}%
            <input
              type="range"
              min={0}
              max={100}
              value={link.x}
              onChange={e =>
                updateLink(linkIndex, {...link, x: Number(e.target.value)})
              }
            />
          </label>
          <label className={moduleStyles.linkSliderVertical}>
            Y: {link.y}%
            <input
              type="range"
              min={0}
              max={100}
              value={link.y}
              onChange={e =>
                updateLink(linkIndex, {...link, y: Number(e.target.value)})
              }
            />
          </label>
          <label className={moduleStyles.linkSliderHorizontal}>
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
          {otherPanels.length > 0 && (
            <SimpleDropdown
              labelText="Target panel"
              name={`link-target-${linkIndex}`}
              size="s"
              selectedValue={link.targetKey}
              onChange={e =>
                updateLink(linkIndex, {...link, targetKey: e.target.value})
              }
              items={otherPanels.map(p => ({
                value: p.key,
                text: `Panel ${allPanels.indexOf(p) + 1}`,
              }))}
            />
          )}
          <label>
            URL (leaves the level; overrides the target panel)
            <input
              value={link.url ?? ''}
              onChange={e =>
                updateLink(linkIndex, {
                  ...link,
                  url: e.target.value || undefined,
                })
              }
            />
          </label>
          <button
            type="button"
            className={moduleStyles.deleteButton}
            onClick={() => deleteLink(linkIndex)}
            aria-label="Delete link"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        onClick={addLink}
        text="Add Link"
        color="gray"
        icon="plus"
      />
    </div>
  );
};

export default EditPanelsLinks;
