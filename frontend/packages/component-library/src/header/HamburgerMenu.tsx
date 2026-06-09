import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import {styled} from '@mui/material/styles';
import {visuallyHidden} from '@mui/utils';
import {Fragment, useId, useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {headerTriggerBase} from './headerMenu';
import {getSupportLinks} from './supportLinks';
import type {MenuItem, UserType} from './types';

interface GlobalNavEntry {
  label: string;
  href?: string;
  subEntries?: MenuItem[];
}

const GLOBAL_NAV: GlobalNavEntry[] = [
  {label: 'Learn', href: '//code.org/students'},
  {
    label: 'Teach',
    subEntries: [
      {label: 'Educator Overview', href: '//code.org/teach'},
      {
        label: 'Elementary School',
        href: '//code.org/educate/curriculum/elementary-school',
      },
      {
        label: 'Middle School',
        href: '//code.org/educate/curriculum/middle-school',
      },
      {label: 'High School', href: '//code.org/educate/curriculum/high-school'},
      {label: 'Hour of Code', href: 'https://hourofcode.com'},
      {
        label: 'Beyond Code.org',
        href: '//code.org/educate/curriculum/3rd-party',
      },
      {label: 'Online Community', href: 'https://forum.code.org/'},
      {label: 'Technical Requirements', href: '//code.org/educate/it'},
      {label: 'Tools and Videos', href: '//code.org/educate/resources/videos'},
    ],
  },
  {label: 'Districts', href: '//code.org/administrators'},
  {label: 'Stats', href: '//code.org/promote'},
  {label: 'Donate', href: '//code.org/donate'},
  {
    label: 'About',
    subEntries: [
      {label: 'About Us', href: '//code.org/about'},
      {label: 'Leadership', href: '//code.org/about/leadership'},
      {label: 'Donors', href: '//code.org/about/donors'},
      {label: 'Partners', href: '//code.org/about/partners'},
      {label: 'Full Team', href: '//code.org/about/team'},
      {label: 'Newsroom', href: '//code.org/about/news'},
      {label: 'Careers', href: '//code.org/about/jobs'},
      {label: 'Contact Us', href: '//code.org/contact'},
      {label: 'FAQs', href: '//code.org/faq'},
    ],
  },
  {
    label: 'Privacy & Legal',
    subEntries: [
      {label: 'Privacy Policy', href: '//code.org/privacy'},
      {label: 'Cookie Notice', href: '//code.org/cookies'},
      {label: 'Terms of Service', href: '//code.org/terms-of-service'},
    ],
  },
];

interface HamburgerMenuProps {
  menuItems: MenuItem[];
  userType?: UserType;
}

/** Shared `name` makes the sections a native exclusive accordion (one open at a time). */
const ACCORDION_NAME = 'hamburger-section';

/**
 * 3-bar hamburger icon: 25×3px bars with 1px border-radius, 8px gaps. Carries a
 * literal `barsIcon` class as a stable hook for layout tests/stories that query
 * the glyph (the emotion class is hashed).
 */
const BarsIcon = styled('span')({
  position: 'relative',
  display: 'block',
  width: '25px',
  height: '3px',
  borderRadius: '1px',
  backgroundColor: 'currentColor',
  '&::before, &::after': {
    content: '""',
    display: 'block',
    position: 'absolute',
    width: '25px',
    height: '3px',
    borderRadius: '1px',
    backgroundColor: 'currentColor',
  },
  '&::before': {
    top: '-8px',
  },
  '&::after': {
    top: '8px',
  },
});

/**
 * Trigger: always visible (the hamburger shows at every width). Compound
 * `.MuiIconButton-root` selector beats MUI's single-class defaults.
 */
const HamburgerTrigger = styled(IconButton)({
  '&.MuiIconButton-root': {
    ...headerTriggerBase,
    minWidth: 0,
    minHeight: 0,
    // Symmetric horizontal padding centers the bars so the focus ring frames them evenly.
    padding: '18px 6px 20px 6px',
    '&:hover, &:active': {
      backgroundColor: 'transparent',
    },
  },
});

/**
 * Popover surface (legacy #hamburger-contents). The compound `.MuiPaper-root`
 * selector beats MUI's Paper defaults on specificity, not stylesheet order.
 */
const popoverSx = {
  '& .MuiPaper-root': {
    marginTop: '4px',
    backgroundColor: 'var(--background-neutral-primary)',
    border: '1px solid var(--borders-neutral-primary)',
    borderRadius: '4px',
    boxShadow:
      'rgb(0 0 0 / 0.1) 0 10px 15px -3px, rgb(0 0 0 / 0.05) 0 4px 6px -2px',
  },
};

/** 6px inset + 228px content + 1px border = 242px, matching #hamburger-contents. */
const HamburgerList = styled('ul')({
  minWidth: '240px',
  margin: 0,
  padding: '6px',
  listStyle: 'none',
});

/**
 * App-nav, support links, and their dividers: shown only below the top-nav
 * breakpoint (1061px), where the top bar's nav collapses (prod's .show-mobile).
 * Authored default-visible so jsdom (which ignores @media) keeps them testable.
 * Carries a literal `mobileOnly` class as a stable hook for tests asserting the
 * width gate (the emotion class is hashed).
 */
const MobileOnlyItem = styled('li')({
  '@media (min-width: 1061px)': {
    display: 'none',
  },
});

const Divider = styled('li')({
  height: '1px',
  margin: '0.5rem 0',
  padding: 0,
  // Legacy header divider gray (rgb(209,212,216)); no design token matches.
  background: '#d1d4d8',
  '@media (min-width: 1061px)': {
    display: 'none',
  },
});

const linkSx = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: '8px',
  color: 'var(--text-neutral-primary)',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  textDecoration: 'none',
  '&:visited, &:active': {
    color: 'var(--text-neutral-primary)',
  },
  // Legacy header hover gray (rgb(231,232,234)); prod rounds the hamburger
  // highlight, unlike the square help/account hovers.
  '&:hover': {
    backgroundColor: '#e7e8ea',
    borderRadius: '4px',
    color: 'var(--text-neutral-primary)',
  },
};

/**
 * Native `<details>` section. The summary hides its UA marker; the chevron is
 * the only open/closed cue, rotated via `[open]`. Toggling is instant (no JS, no
 * animation — reduced-motion safe).
 */
const HamburgerSection = styled('details')({
  '& summary': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: '100%',
    padding: '8px',
    listStyle: 'none',
    cursor: 'pointer',
    // Match the link rows' metrics — the UA summary default shifts the baseline.
    fontSize: '14px',
    lineHeight: '21px',
    '&::-webkit-details-marker': {
      display: 'none',
    },
    '&:hover': {
      backgroundColor: '#e7e8ea',
      borderRadius: '4px',
    },
  },
  '& .chevron': {
    color: 'var(--text-neutral-primary)',
    fontSize: '14px',
  },
  '&[open] .chevron': {
    transform: 'rotate(180deg)',
  },
});

const expandTextSx = {
  maxWidth: '210px',
  overflow: 'hidden',
  color: 'var(--text-neutral-primary)',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Sub-list: 20px indent, no fill — indent is the only visual cue. */
const subListSx = {
  width: 'auto',
  margin: '0 0 0 20px',
  padding: 0,
  listStyle: 'none',
};

/** Expandable section: a native `<details>` disclosure with an indented sub-link list. */
const ExpandableSection: FunctionComponent<{entry: GlobalNavEntry}> = ({
  entry,
}) => (
  <li>
    <HamburgerSection name={ACCORDION_NAME}>
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
        {entry.subEntries?.map(sub => (
          <li key={sub.label}>
            <Box component="a" href={sub.href} sx={linkSx}>
              {sub.label}
            </Box>
          </li>
        ))}
      </Box>
    </HamburgerSection>
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
> = ({menuItems, userType, newTabId}) => {
  const supportLinks = getSupportLinks(userType);

  // Prod lists Incubator once, in the global-nav region after Donate (not in
  // the app-nav block). Pull it out of `menuItems` and re-inject it there.
  const incubator = menuItems.find(item => item.label === 'Incubator');
  const appNavItems = menuItems.filter(item => item.label !== 'Incubator');

  return (
    <HamburgerList>
      {/* App nav — gated below the top-nav breakpoint (prod .show-mobile) */}
      {appNavItems.map(item => (
        <MobileOnlyItem key={item.label} className="mobileOnly">
          <Box component="a" href={item.href} sx={linkSx}>
            {item.label}
          </Box>
        </MobileOnlyItem>
      ))}

      <Divider className="mobileOnly" role="separator" />

      {/* Support links — gated below the top-nav breakpoint */}
      {supportLinks.map(link => (
        <MobileOnlyItem key={link.label} className="mobileOnly">
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
        </MobileOnlyItem>
      ))}

      <Divider className="mobileOnly" role="separator" />

      {/* Global site nav — always visible. Incubator is re-injected after
          Donate (app-nav-gated), matching prod's single listing. */}
      {GLOBAL_NAV.map(entry => {
        const row = entry.subEntries ? (
          <ExpandableSection entry={entry} />
        ) : (
          <li>
            <Box component="a" href={entry.href} sx={linkSx}>
              {entry.label}
            </Box>
          </li>
        );
        if (entry.label === 'Donate' && incubator) {
          return (
            <Fragment key={entry.label}>
              {row}
              <MobileOnlyItem className="mobileOnly">
                <Box component="a" href={incubator.href} sx={linkSx}>
                  {incubator.label}
                </Box>
              </MobileOnlyItem>
            </Fragment>
          );
        }
        return <Fragment key={entry.label}>{row}</Fragment>;
      })}
    </HamburgerList>
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
  userType,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const menuId = useId();
  const newTabId = useId();

  return (
    <>
      <HamburgerTrigger
        aria-label="Open navigation menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        <BarsIcon className="barsIcon" />
      </HamburgerTrigger>
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
          userType={userType}
          newTabId={newTabId}
        />
      </Popover>
    </>
  );
};

export default HamburgerMenu;
