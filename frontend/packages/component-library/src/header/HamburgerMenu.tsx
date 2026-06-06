import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {useState, type FunctionComponent} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './hamburgerMenu.module.scss';

interface MenuItem {
  label: string;
  href: string;
}

interface SubEntry {
  label: string;
  href: string;
}

interface GlobalNavEntry {
  label: string;
  href?: string;
  subEntries?: SubEntry[];
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
  {label: 'Incubator', href: '//code.org/incubator'},
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

function getSupportLinks(userType?: 'student' | 'teacher' | 'admin') {
  return [
    {label: 'Help and support', href: 'https://support.code.org'},
    {
      label: 'Report a problem',
      href: 'https://support.code.org/hc/en-us/requests/new',
    },
    ...(userType === 'teacher'
      ? [{label: 'Teacher forum', href: 'https://forum.code.org'}]
      : []),
  ];
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
  userType?: 'student' | 'teacher' | 'admin';
}

/** Expandable section within the drawer global nav. */
const ExpandableSection: FunctionComponent<{
  entry: GlobalNavEntry;
  expanded: boolean;
  onToggle: () => void;
}> = ({entry, expanded, onToggle}) => (
  <li>
    <button
      className={moduleStyles.expandTrigger}
      onClick={onToggle}
      type="button"
    >
      <Typography variant="body3" component="span">
        {entry.label}
      </Typography>
      <FontAwesomeV6Icon
        iconName={expanded ? 'chevron-up' : 'chevron-down'}
        iconStyle="solid"
      />
    </button>
    <Collapse in={expanded} unmountOnExit>
      <ul className={moduleStyles.subList}>
        {entry.subEntries?.map(sub => (
          <li key={sub.label}>
            <a href={sub.href} className={moduleStyles.subLink}>
              <Typography variant="body3" component="span">
                {sub.label}
              </Typography>
            </a>
          </li>
        ))}
      </ul>
    </Collapse>
  </li>
);

/**
 * Always-visible hamburger icon that opens a right-anchored drawer.
 * The drawer always shows app nav items (fixing the legacy 1024–1060px gap
 * where nav was inaccessible in neither the top bar nor the old hamburger).
 */
const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({
  menuItems,
  userType,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (label: string) =>
    setExpandedSection(prev => (prev === label ? null : label));

  const supportLinks = getSupportLinks(userType);

  return (
    <>
      <IconButton
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        sx={{
          '&&': {
            color: 'var(--neutral-base-white)',
            paddingLeft: '14px',
            paddingRight: '6px',
            paddingTop: '18px',
            paddingBottom: '20px',
            minWidth: 0,
            minHeight: 0,
          },
          '&&:hover, &&:active, &&:focus-visible': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <span className={moduleStyles.barsIcon} />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{className: moduleStyles.drawerPaper}}
      >
        <div className={moduleStyles.drawerHeader}>
          <IconButton
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            sx={{
              '&&': {color: 'var(--neutral-base-white)', padding: '0.375rem'},
              '&&:hover': {backgroundColor: 'rgba(255,255,255,0.1)'},
            }}
          >
            <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
          </IconButton>
        </div>

        <nav aria-label="Site navigation">
          {/* App-specific nav — always present, fixes the legacy 1024–1060px gap */}
          <ul className={moduleStyles.section}>
            {menuItems.map(item => (
              <li key={item.label}>
                <a href={item.href} className={moduleStyles.navLink}>
                  <Typography variant="body3" component="span">
                    {item.label}
                  </Typography>
                </a>
              </li>
            ))}
          </ul>

          <hr className={moduleStyles.divider} />

          {/* Support links */}
          <ul className={moduleStyles.section}>
            {supportLinks.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={moduleStyles.navLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography variant="body3" component="span">
                    {link.label}
                  </Typography>
                </a>
              </li>
            ))}
          </ul>

          <hr className={moduleStyles.divider} />

          {/* Global site nav */}
          <ul className={moduleStyles.section}>
            {GLOBAL_NAV.map(entry =>
              entry.subEntries ? (
                <ExpandableSection
                  key={entry.label}
                  entry={entry}
                  expanded={expandedSection === entry.label}
                  onToggle={() => toggleSection(entry.label)}
                />
              ) : (
                <li key={entry.label}>
                  <a href={entry.href} className={moduleStyles.navLink}>
                    <Typography variant="body3" component="span">
                      {entry.label}
                    </Typography>
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>
      </Drawer>
    </>
  );
};

export default HamburgerMenu;
