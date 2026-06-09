import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import {visuallyHidden} from '@mui/utils';
import {Fragment, useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import type {GlobalNavItem, MenuItem} from '../../shared/types';

import {
  barsIconSx,
  dividerSx,
  expandTextSx,
  hamburgerListSx,
  hamburgerSectionSx,
  hamburgerTriggerSx,
  linkSx,
  mobileOnlyItemSx,
  popoverSx,
  subListSx,
} from './HamburgerMenu.styles';

interface HamburgerMenuProps {
  /** Top-bar app nav, re-listed in the drawer below the top-nav breakpoint. */
  menuItems: MenuItem[];
  /** Site-wide nav (always shown in the drawer). */
  globalNavItems: GlobalNavItem[];
  /** Help/support links shown below the top-nav breakpoint. */
  supportLinks: MenuItem[];
}

/** Shared `name` makes the sections a native exclusive accordion (one open at a time). */
const ACCORDION_NAME = 'hamburger-section';

/** Expandable section: a native `<details>` disclosure with an indented sub-link list. */
const ExpandableSection: FunctionComponent<{entry: GlobalNavItem}> = ({
  entry,
}) => (
  <li>
    <Box component="details" name={ACCORDION_NAME} sx={hamburgerSectionSx}>
      <summary>
        <Box component="span" sx={expandTextSx}>
          {entry.label}
        </Box>
        <FontAwesomeV6Icon
          iconName="chevron-down"
          iconStyle="solid"
          className="chevron"
        />
      </summary>
      <Box component="ul" sx={subListSx}>
        {entry.subItems?.map(sub => (
          <li key={sub.label}>
            <Box component="a" href={sub.href} sx={linkSx}>
              {sub.label}
            </Box>
          </li>
        ))}
      </Box>
    </Box>
  </li>
);

/**
 * Panel body. The app-nav, support links, Incubator, and their dividers are
 * gated to widths below the top-nav breakpoint (the dev analog of prod's
 * .show-mobile), where the top bar's nav collapses; the global nav is always
 * shown. Mounted by the Popover only while open, so the global nav never
 * duplicates the top-bar nav items.
 */
const HamburgerPanel: FunctionComponent<
  HamburgerMenuProps & {newTabId: string}
> = ({menuItems, globalNavItems, supportLinks, newTabId}) => {
  // Prod lists Incubator once, in the global-nav region after Donate (not in
  // the app-nav block). Pull it out of `menuItems` unless globalNavItems already
  // supplies one (avoids a double listing), and filter it out of the app nav.
  const incubatorInGlobal = globalNavItems.some(e => e.label === 'Incubator');
  const incubator = incubatorInGlobal
    ? undefined
    : menuItems.find(item => item.label === 'Incubator');
  const appNavItems = menuItems.filter(item => item.label !== 'Incubator');
  const donateIndex = globalNavItems.findIndex(e => e.label === 'Donate');

  // Dividers only sit *between* non-empty sections (app nav | support | global).
  const hasGlobal = globalNavItems.length > 0 || incubator !== undefined;
  const showAppNavDivider =
    appNavItems.length > 0 && (supportLinks.length > 0 || hasGlobal);
  const showSupportDivider = supportLinks.length > 0 && hasGlobal;

  const incubatorItem = incubator ? (
    <Box component="li" className="mobileOnly" sx={mobileOnlyItemSx}>
      <Box component="a" href={incubator.href} sx={linkSx}>
        {incubator.label}
      </Box>
    </Box>
  ) : null;

  return (
    <Box component="ul" sx={hamburgerListSx}>
      {/* App nav — gated below the top-nav breakpoint (prod .show-mobile) */}
      {appNavItems.map(item => (
        <Box
          component="li"
          key={item.label}
          className="mobileOnly"
          sx={mobileOnlyItemSx}
        >
          <Box component="a" href={item.href} sx={linkSx}>
            {item.label}
          </Box>
        </Box>
      ))}

      {showAppNavDivider && (
        <Box
          component="li"
          className="mobileOnly"
          role="separator"
          sx={dividerSx}
        />
      )}

      {/* Support links — gated below the top-nav breakpoint */}
      {supportLinks.map(link => (
        <Box
          component="li"
          key={link.label}
          className="mobileOnly"
          sx={mobileOnlyItemSx}
        >
          <Box
            component="a"
            href={link.href}
            sx={linkSx}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby={newTabId}
          >
            {link.label}
          </Box>
        </Box>
      ))}

      {showSupportDivider && (
        <Box
          component="li"
          className="mobileOnly"
          role="separator"
          sx={dividerSx}
        />
      )}

      {/* Global site nav — always visible. Incubator (app-nav-gated) is placed
          right after Donate to match prod's single listing. */}
      {globalNavItems.map((entry, i) => {
        const row = entry.subItems ? (
          <ExpandableSection entry={entry} />
        ) : (
          <li>
            <Box component="a" href={entry.href} sx={linkSx}>
              {entry.label}
            </Box>
          </li>
        );
        if (i === donateIndex && incubatorItem) {
          return (
            <Fragment key={entry.label}>
              {row}
              {incubatorItem}
            </Fragment>
          );
        }
        return <Fragment key={entry.label}>{row}</Fragment>;
      })}

      {/* No Donate entry to anchor it — append so Incubator never vanishes. */}
      {donateIndex === -1 && incubatorItem}
    </Box>
  );
};

/**
 * Hamburger (☰) menu — a Popover disclosure panel matching the legacy
 * #hamburger-contents. Always visible; the panel's app-nav/support sections are
 * width-gated. Sections are native `<details>` disclosures sharing a `name`, so
 * the browser keeps one open at a time with no JS and native expand semantics.
 */
const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  globalNavItems,
  supportLinks,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const newTabId = useId();

  return (
    <>
      <IconButton
        sx={hamburgerTriggerSx}
        aria-label="Open navigation menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <Box component="span" className="barsIcon" sx={barsIconSx} />
      </IconButton>
      <Box component="span" id={newTabId} sx={visuallyHidden}>
        Opens in a new tab
      </Box>
      <Popover
        id={menuId}
        sx={popoverSx}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        marginThreshold={0}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {elevation: 0}}}
      >
        <HamburgerPanel
          menuItems={menuItems}
          globalNavItems={globalNavItems}
          supportLinks={supportLinks}
          newTabId={newTabId}
        />
      </Popover>
    </>
  );
};

export default HamburgerMenu;
