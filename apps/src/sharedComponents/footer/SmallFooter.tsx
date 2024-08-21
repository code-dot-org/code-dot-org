/*
We have to disable the jsx-no-target-blank here because we rely on the
referrer to determine the abuse url:
https://github.com/code-dot-org/code-dot-org/blob/b2efc7ca8331f8261ebd55a326e23f64cc29b5d9/apps/src/sites/studio/pages/report_abuse/report_abuse_form.js#L14
*/

/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-danger */
import debounce from 'lodash/debounce';
import React, {useState, useEffect, useRef} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import i18n from '@cdo/locale';

// import CopyrightDialog from './CopyrightDialog';
import styles from './small-footer.module.scss';

interface SmallFooterProps {
  i18nDropdown?: string;
  copyrightInBase: boolean;
  baseMoreMenuString: string;
  baseStyle?: React.CSSProperties;
  menuItems: {
    text: string;
    link: string;
    copyright?: boolean;
    newWindow?: boolean;
  }[];
  phoneFooter?: boolean;
  className?: string;
  fontSize?: number;
  rowHeight?: number;
  fullWidth?: boolean;
  channel?: string;
  unitYear?: string;
}

const SmallFooter: React.FC<SmallFooterProps> = ({
  i18nDropdown,
  copyrightInBase,
  baseMoreMenuString,
  baseStyle,
  menuItems,
  phoneFooter,
  className,
  fontSize,
  rowHeight,
  fullWidth,
  channel,
  unitYear,
}) => {
  const [menuState, setMenuState] = useState<
    'MINIMIZED' | 'EXPANDED' | 'COPYRIGHT' | 'MINIMIZING'
  >('MINIMIZED');
  // const [baseWidth, setBaseWidth] = useState(0);
  // const [baseHeight, setBaseHeight] = useState(0);
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captureBaseElementDimensions();
    const handleResize = debounce(captureBaseElementDimensions, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const captureBaseElementDimensions = () => {
    if (baseRef.current) {
      setBaseWidth(baseRef.current.offsetWidth);
      setBaseHeight(baseRef.current.offsetHeight);
    }
  };

  const minimizeOnClickAnywhere = () => {
    const handleClick = (event: MouseEvent) => {
      if (event.target === baseRef.current) return;
      setMenuState('MINIMIZING');
      setTimeout(() => setMenuState('MINIMIZED'), 200);
    };

    document.body.addEventListener('click', handleClick, {once: true});
  };

  const clickBase = (e: React.MouseEvent) => {
    if (copyrightInBase) return;
    clickBaseMenu(e);
  };

  const clickBaseCopyright = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (menuState === 'MINIMIZING') return;

    if (menuState === 'COPYRIGHT') {
      setMenuState('MINIMIZED');
    } else {
      setMenuState('COPYRIGHT');
      minimizeOnClickAnywhere();
    }
  };

  const clickBaseMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuState === 'MINIMIZING') return;

    if (menuState === 'EXPANDED' || menuState === 'COPYRIGHT') {
      setMenuState('MINIMIZED');
    } else {
      setMenuState('EXPANDED');
      minimizeOnClickAnywhere();
    }
  };

  const yearIsNumeric = /^[0-9]+$/.test(unitYear || '');

  return (
    <div className={className} style={{fontSize}} ref={baseRef}>
      <div
        className={styles.smallFooterBase}
        style={{
          ...baseStyle,
          height: rowHeight ? rowHeight - 6 : undefined,
          ...(fullWidth && {width: '100%', boxSizing: 'border-box'}),
        }}
        onClick={clickBase}
      >
        {i18nDropdown && (
          <div className="i18n-dropdown-container">
            <span className="globe-icon">
              <i className="fa fa-globe" aria-hidden="true" />
            </span>
            <div
              dangerouslySetInnerHTML={{
                __html: decodeURIComponent(i18nDropdown),
              }}
            />
          </div>
        )}
        {copyrightInBase && (
          <span className="copyright-button">
            <Button
              aria-label={i18n.copyrightInfoButton()}
              className="copyright-link no-mc"
              color={buttonColors.gray}
              icon={{iconName: 'copyright', iconStyle: 'light'}}
              isIconOnly
              onClick={clickBaseCopyright}
              size="xs"
              type="secondary"
            />
          </span>
        )}
        {!!unitYear && yearIsNumeric && (
          <p className={styles.version}>
            <span className="version-caption">{i18n.version()}: </span>
            {unitYear}
          </p>
        )}
        {menuItems.length > 0 && (
          <button type="button" className="more-link" onClick={clickBaseMenu}>
            {baseMoreMenuString}&nbsp;
            <i
              className={`fa ${
                menuState === 'EXPANDED' ? 'fa-caret-down' : 'fa-caret-up'
              }`}
            />
          </button>
        )}
      </div>
      {/*menuState === 'COPYRIGHT' && (
        <CopyrightDialog
          onClose={() => setMenuState('MINIMIZED')}
          phoneFooter={phoneFooter}
        />) */}
    </div>
  );
};

export default SmallFooter;
