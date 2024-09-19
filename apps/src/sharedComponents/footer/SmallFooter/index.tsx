import React, {useState} from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog/index';
import I18nDropdown, {
  I18nDropdownProps,
} from '@cdo/apps/sharedComponents/footer/I18nDropdown/index';
import i18n from '@cdo/locale';

import './style.scss';

interface SmallFooterProps {
  i18nDropdownInBase: boolean;
  localeUrl?: I18nDropdownProps['localeUrl'];
  localeOptions?: I18nDropdownProps['optionsForLocaleSelect'];
  copyrightInBase: boolean;
  unitYearInBase: boolean;
  unitYear?: string;
  baseStyle?: React.CSSProperties;
  className?: string;
  fontSize?: number;
  rowHeight?: number;
  fullWidth?: boolean;
}

const SmallFooter: React.FC<SmallFooterProps> = ({
  i18nDropdownInBase,
  localeUrl,
  localeOptions,
  copyrightInBase,
  unitYearInBase,
  unitYear,
  baseStyle,
  className,
  fontSize,
  rowHeight,
  fullWidth,
}) => {
  const [isCopyrightDialogOpen, setIsCopyrightDialogOpen] = useState(false);

  const openCopyrightDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsCopyrightDialogOpen(true);
  };

  const closeCopyrightDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsCopyrightDialogOpen(false);
  };

  const renderCopyright = () => {
    return (
      <span className="copyright-button">
        <Button
          aria-label={i18n.copyrightInfoButton()}
          className="copyright-link no-mc"
          color={buttonColors.gray}
          icon={{
            iconName: 'copyright',
            iconStyle: 'light',
          }}
          isIconOnly
          onClick={openCopyrightDialog}
          size="xs"
          type="secondary"
        />
      </span>
    );
  };

  const yearIsNumeric = () => {
    return /^[0-9]+$/.test(unitYear || '');
  };

  const renderUnitYear = () => {
    return !!unitYear && yearIsNumeric ? (
      <p>
        <span className="version-caption">{i18n.version()}: </span>
        {unitYear}
      </p>
    ) : null;
  };

  return (
    <div className={className}>
      <div className="small-footer-base">
        {i18nDropdownInBase && (
          <I18nDropdown
            localeUrl={localeUrl}
            optionsForLocaleSelect={localeOptions}
          />
        )}
        {copyrightInBase && renderCopyright}
        {copyrightInBase && (
          <CopyrightDialog
            isOpen={isCopyrightDialogOpen}
            closeModal={closeCopyrightDialog}
          />
        )}
        {unitYearInBase && renderUnitYear}
      </div>
    </div>
  );
};

export default SmallFooter;
