/*
We have to disable the jsx-no-target-blank here because we rely on the
referrer to determine the abuse url:
https://github.com/code-dot-org/code-dot-org/blob/b2efc7ca8331f8261ebd55a326e23f64cc29b5d9/apps/src/sites/studio/pages/report_abuse/report_abuse_form.js#L14
*/

/* eslint-disable react/jsx-no-target-blank */

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import _ from 'lodash';
import debounce from 'lodash/debounce';
import React, {useCallback, useRef, useEffect, useState} from 'react';

import localization from '@cdo/apps/localization';
import {userAlreadyReportedAbuse} from '@cdo/apps/reportAbuse';
import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog/index';
import I18nDropdown from '@cdo/apps/sharedComponents/footer/I18nDropdown/index';
import i18n from '@cdo/locale';

const MenuStates = {
  MINIMIZING: 'MINIMIZING',
  MINIMIZED: 'MINIMIZED',
  EXPANDED: 'EXPANDED',
  COPYRIGHT: 'COPYRIGHT',
};

export type MenuState = (typeof MenuStates)[keyof typeof MenuStates];

export interface SmallFooterProps {
  i18nDropdownInBase: boolean;
  localeUrl?: string;
  currentLocale?: string;
  localeOptions?: {
    value: string;
    text: string;
  }[];
  copyrightInBase: boolean;
  baseMoreMenuString: string;
  baseStyle: object;
  menuItems: {
    text: string;
    link: string;
    copyright: boolean;
    newWindow: boolean;
  }[];
  phoneFooter: boolean;
  className: string;
  fontSize: number;
  rowHeight: number;
  fullWidth: boolean;
  channel: string;
  unitYear: string;
}

const SmallFooter = (props: SmallFooterProps) => {
  const [menuState, setMenuState] = useState<MenuState>(MenuStates.MINIMIZED);
  const [baseWidth, setBaseWidth] = useState<number>(0);
  const [baseHeight, setBaseHeight] = useState<number>(0);
  const [currentLocale, setCurrentLocale] = useState<string>(
    localization.isLocalizeJS() ? 'en' : props.currentLocale
  );
  const [localeOptions, setLocaleOptions] = useState<
    SmallFooterProps['localeOptions']
  >(localization.isLocalizeJS() ? [] : props.localeOptions);
  const ref = useRef<HTMLDivElement>(null);

  const onLocaleUpdate = useCallback(
    info => {
      setLocaleOptions(localization.locales);
      setCurrentLocale(info.locale);
    },
    [setLocaleOptions, setCurrentLocale]
  );

  const captureBaseElementDimensions = useCallback(() => {
    const base = ref.current;
    setBaseWidth(base?.offsetWidth || 0);
    setBaseHeight(base?.offsetHeight || 0);
  }, [setBaseWidth, setBaseHeight]);

  useEffect(() => {
    captureBaseElementDimensions();

    const captureEvent = () => debounce(captureBaseElementDimensions, 100);

    window.addEventListener('resize', captureEvent);
    localization.on('change', onLocaleUpdate);

    return () => {
      window.removeEventListener('resize', captureEvent);
      localization.off('change', onLocaleUpdate);
    };
  }, [captureBaseElementDimensions, onLocaleUpdate]);

  const clickBase = useCallback(
    e => {
      if (props.copyrightInBase) {
        // When we have multiple items in our base row, ignore clicks to the
        // row that aren't on those particular items
        return;
      }
      clickBaseMenu(e);
    },
    [clickBaseMenu, props.copyrightInBase]
  );

  const clickBaseCopyright = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      if (menuState === MenuStates.MINIMIZING) {
        return;
      }

      if (menuState === MenuStates.COPYRIGHT) {
        setMenuState(MenuStates.MINIMIZED);
        return;
      }

      setMenuState(MenuStates.COPYRIGHT);
    },
    [menuState, setMenuState]
  );

  const clickMenuCopyright = useCallback(
    event => {
      event.stopPropagation();
      setMenuState(MenuStates.COPYRIGHT);
    },
    [setMenuState]
  );

  const closeCopyrightDialog = useCallback(
    e => {
      e?.stopPropagation();
      setMenuState(MenuStates.MINIMIZED);
    },
    [setMenuState]
  );

  const clickBaseMenu = useCallback(
    e => {
      e.stopPropagation();
      if (menuState === MenuStates.MINIMIZING) {
        return;
      }

      if (
        menuState === MenuStates.EXPANDED ||
        menuState === MenuStates.COPYRIGHT
      ) {
        setMenuState(MenuStates.MINIMIZED);
        return;
      }

      setMenuState(MenuStates.EXPANDED);
    },
    [menuState, setMenuState]
  );

  const styles = {
    smallFooter: {
      fontSize: props.fontSize,
    },
    base: {
      // subtract top/bottom padding from row height
      height: props.rowHeight ? props.rowHeight - 6 : undefined,
      alignItems: 'center',
    },
    // Additional styling to base, above.
    baseFullWidth: {
      width: '100%',
      boxSizing: 'border-box',
    },
    moreMenu: {
      display: menuState === MenuStates.EXPANDED ? 'block' : 'none',
      bottom: baseHeight,
      width: baseWidth,
    },
    version: {
      margin: 'auto 0',
    },
  };

  const combinedBaseStyle = {
    ...styles.base,
    ...props.baseStyle,
    ...(props.fullWidth && styles.baseFullWidth),
  };

  // Possible edge cases include unitYear with value 'unversioned'.
  // Filter for year ('20XX') all-numeral format.
  const yearIsNumeric = /^[0-9]+$/.test(props.unitYear);

  const renderCopyright = () => {
    return (
      <MuiIconButton
        variant="outlined"
        color="tertiary"
        size="extraSmall"
        className="copyright-button no-mc"
        onClick={clickBaseCopyright}
        aria-label={i18n.copyrightInfoButton()}
        type="button"
      >
        <FontAwesomeV6Icon iconName="copyright" iconStyle="light" />
      </MuiIconButton>
    );
  };

  const renderMoreMenuButton = () => {
    const menuItems = props.menuItems;
    if (menuItems && menuItems.length > 0) {
      const caretIcon =
        menuState === MenuStates.EXPANDED
          ? 'fa fa-caret-down'
          : 'fa fa-caret-up';
      // FND-1169: Copyright should be a <button>, not a <a>
      return (
        <button type="button" className="more-link" onClick={clickBaseMenu}>
          {props.baseMoreMenuString}&nbsp;
          <i className={caretIcon} />
        </button>
      );
    }
  };

  const renderMoreMenu = styles => {
    const channelId = props.channel;
    const alreadyReportedAbuse = userAlreadyReportedAbuse(channelId);
    if (alreadyReportedAbuse) {
      _.remove(props.menuItems, function (menuItem) {
        return menuItem.key === 'report-abuse';
      });
    }

    const menuItemElements = props.menuItems.map((item, index) => {
      return (
        <li
          key={index}
          style={styles.listItem}
          className={`ui-test-${item.key}`}
        >
          <a
            href={item.link}
            ref={item.copyright ? 'menuCopyright' : undefined}
            target={item.newWindow ? '_blank' : '_parent'}
            onClick={item.copyright ? clickMenuCopyright : undefined}
          >
            {item.text}
          </a>
        </li>
      );
    });
    return (
      <ul id="more-menu" style={styles.moreMenu}>
        {menuItemElements}
      </ul>
    );
  };

  return (
    <div className={props.className} style={styles.smallFooter}>
      <div
        className="small-footer-base"
        ref={ref}
        style={combinedBaseStyle}
        onClick={clickBase}
      >
        {props.i18nDropdownInBase && (
          <I18nDropdown
            localeUrl={props.localeUrl}
            selected={currentLocale}
            options={localeOptions}
          />
        )}
        {props.copyrightInBase && renderCopyright()}
        <CopyrightDialog
          isOpen={menuState === MenuStates.COPYRIGHT}
          closeModal={closeCopyrightDialog}
        />
        {!!props.unitYear && yearIsNumeric && (
          <p style={styles.version}>
            <span className="version-caption">{i18n.version()}: </span>
            {props.unitYear}
          </p>
        )}
        {renderMoreMenuButton()}
      </div>
      {renderMoreMenu(styles)}
    </div>
  );
};

export default SmallFooter;
