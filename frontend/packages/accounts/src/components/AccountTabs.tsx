import {Box} from '@mui/material';
import type {ReactNode} from 'react';

import Tabs, {type TabModel} from '@code-dot-org/component-library/tabs';

export interface AccountTab {
  id: string;
  label: string;
  disabled?: boolean;
  /** Hidden for students, per legacy parity. */
  educatorOnly?: boolean;
}

export interface AccountTabsProps {
  tabs: AccountTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}

/**
 * Account-settings tabs on the design-system Tabs. Disabled tabs use HTML
 * `disabled` (not focusable, no aria-label), accepted for non-functional tabs.
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
        // Scroll the tablist (DSCO's first child div), not the panel; pad for the focus ring.
        '& > div:first-of-type': {
          overflowX: 'auto',
          py: '3px',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {display: 'none'},
        },
        '& > div:nth-of-type(2)': {pt: 3},
        // Teal active label, dark inactive; `&&&` beats DSCO's `:disabled` selector.
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
