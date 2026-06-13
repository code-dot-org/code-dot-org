import {Box} from '@mui/material';
import type {ReactNode} from 'react';

import Tabs, {type TabModel} from '@code-dot-org/component-library/tabs';

export interface AccountTab {
  /** Stable tab id, also the `?tab=` value. */
  id: string;
  label: string;
  /** Future tabs (#73223+): disabled placeholders until their panels ship. */
  disabled?: boolean;
  /** Hidden for students (legacy parity — e.g. the educator-only profile). */
  educatorOnly?: boolean;
}

export interface AccountTabsProps {
  tabs: AccountTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /** The active tab's panel content. */
  children: ReactNode;
}

/**
 * Account-settings tabs, built on the design-system `Tabs` (type=primary, size
 * m) for design-faithful sizing rather than a hand-rolled widget. v1 ships one
 * live tab (Account Details); the rest are disabled placeholders (#73223+).
 *
 * Tradeoff accepted because the placeholders are non-functional: DSCO renders
 * disabled tabs with the HTML `disabled` attribute (not focusable, no
 * arrow-key roving, and the tablist carries no `aria-label`) — weaker than the
 * APG focusable-disabled pattern, but acceptable for tabs that do nothing yet.
 *
 * The tablist scrolls horizontally on narrow viewports instead of forcing
 * page-level horizontal scroll (WCAG 1.4.10 reflow); DSCO's `ul` is
 * `inline-flex` with no overflow handling of its own.
 */
export default function AccountTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: AccountTabsProps) {
  const model: TabModel[] = tabs.map(tab => ({
    value: tab.id,
    text: tab.label,
    disabled: tab.disabled,
    tabContent: tab.id === activeTab ? children : null,
  }));

  return (
    <Box
      sx={{
        // Scroll only the tablist (DSCO's first child div) when the tabs exceed
        // the viewport; the panel below must not scroll with it. Vertical
        // padding keeps the focus outline from clipping; the scrollbar is hidden.
        '& > div:first-of-type': {
          overflowX: 'auto',
          py: '3px',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {display: 'none'},
        },
        '& > div:nth-of-type(2)': {pt: 3},
        // Color override to match the Figma, which inverts DSCO's canonical
        // primary tabs: active label is teal (teal-70, >=4.5:1 for 16px/600),
        // inactive/placeholder labels are dark rather than grey. `&&&` outweighs
        // DSCO's `.tabs-primary.tabs-light …:disabled` selector.
        '&&& button[role="tab"]': {color: 'var(--text-neutral-primary)'},
        '&&& button[role="tab"]:disabled': {
          color: 'var(--text-neutral-primary)',
        },
        '&&& button[role="tab"][aria-selected="true"]': {
          color: 'var(--text-brand-teal-secondary)',
        },
      }}
    >
      <Tabs
        name="account-settings"
        type="primary"
        mode="light"
        size="m"
        tabs={model}
        defaultSelectedTabValue={activeTab}
        onChange={onTabChange}
      />
    </Box>
  );
}
