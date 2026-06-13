import {useRef, type KeyboardEvent, type ReactNode} from 'react';

import styles from './AccountTabs.module.scss';

export interface AccountTab {
  /** Stable tab id, also the `?tab=` value. */
  id: string;
  label: string;
  /** Future tabs (#73223+): rendered aria-disabled, focusable but not activatable. */
  disabled?: boolean;
}

export interface AccountTabsProps {
  tabs: AccountTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  idPrefix?: string;
  /** The active tab's panel content. */
  children: ReactNode;
}

/**
 * ARIA tabs pattern (WAI-ARIA APG) with roving tabindex and
 * Left/Right/Home/End. Inactive tabs are `aria-disabled` — reachable by arrow
 * keys but not activatable — per the account-settings-a11y spec. Neither DSCO
 * Tabs nor MUI Tabs supports focusable-disabled tabs, so this is hand-rolled.
 *
 * Only the active tab sets `aria-controls`: the v1 placeholder tabs (#73223+)
 * have no panel in the DOM to reference, and a dangling reference is worse than
 * an absent one. When those tabs ship panels, each must gain `aria-controls`.
 */
export default function AccountTabs({
  tabs,
  activeTab,
  onTabChange,
  idPrefix = 'account',
  children,
}: AccountTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabDomId = (id: string) => `${idPrefix}-tab-${id}`;
  const panelDomId = (id: string) => `${idPrefix}-panel-${id}`;

  const focusTabAt = (index: number) => {
    const {id} = tabs[(index + tabs.length) % tabs.length];
    tabRefs.current[id]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const handlers: Record<string, () => void> = {
      ArrowRight: () => focusTabAt(index + 1),
      ArrowLeft: () => focusTabAt(index - 1),
      Home: () => focusTabAt(0),
      End: () => focusTabAt(tabs.length - 1),
    };
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Account settings sections"
        className={styles.tablist}
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={element => {
                tabRefs.current[tab.id] = element;
              }}
              type="button"
              role="tab"
              id={tabDomId(tab.id)}
              aria-selected={selected}
              aria-controls={selected ? panelDomId(tab.id) : undefined}
              aria-disabled={tab.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onKeyDown={event => onKeyDown(event, index)}
              onClick={() => {
                if (!tab.disabled) onTabChange(tab.id);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {/*
        No tabindex on the panel: the roving tablist leaves only the active tab
        tabbable, so Tab moves from it into the first focusable element in the
        panel (WAI-ARIA APG — a panel needs tabindex only when it has none).
      */}
      <div
        role="tabpanel"
        id={panelDomId(activeTab)}
        aria-labelledby={tabDomId(activeTab)}
        className={styles.tabpanel}
      >
        {children}
      </div>
    </>
  );
}
