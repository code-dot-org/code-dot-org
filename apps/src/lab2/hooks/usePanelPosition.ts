// hooks/usePanelPosition.ts
import {useLayoutEffect, useState} from 'react';

const PADDING = 20;

// A hook that calculates and updates the floating settings panel's position relative to the
// resource panel's settings button - returns the inline styles to position the panel above and
// to the right of the button.
export default function usePanelPosition(
  isFloatingSettingsOpen: boolean,
  hasTabs: boolean,
  settingsButtonRef: React.RefObject<HTMLElement>,
  floatingPanelRef: React.RefObject<HTMLDivElement>
) {
  const [panelStyles, setPanelStyles] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const updatePanelPosition = () => {
      // Calculate floating panel position when it opens.
      if (
        isFloatingSettingsOpen &&
        !hasTabs &&
        settingsButtonRef.current &&
        floatingPanelRef.current
      ) {
        const buttonRect = settingsButtonRef.current.getBoundingClientRect();
        const floatingPanelHeight = floatingPanelRef.current?.offsetHeight ?? 0;

        // Position relative to settings button.
        // Align to the right of button plus padding.
        const left = buttonRect.right + PADDING;
        // Align to the bottom of button taking into account the height of the settings panel.
        const top = buttonRect.bottom - floatingPanelHeight;

        setPanelStyles({left, top});
      }
    };

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
    };
  }, [floatingPanelRef, hasTabs, isFloatingSettingsOpen, settingsButtonRef]);

  return panelStyles;
}
