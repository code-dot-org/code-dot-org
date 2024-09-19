import React, {useState} from 'react';

import CopyrightDialog from '@cdo/apps/sharedComponents/footer/CopyrightDialog/index';
import i18n from '@cdo/locale';

import './style.scss';

interface PhoneFooterProps {
  baseMoreMenuString: string;
  baseStyle?: React.CSSProperties;
  menuItems: {
    text: string;
    link: string;
    copyright: boolean;
    newWindow: boolean;
  }[];
  className: string;
  fontSize: number;
  rowHeight: number;
  fullWidth: boolean;
  unitYear: string;
}

const PhoneFooter: React.FC<PhoneFooterProps> = ({
  baseMoreMenuString,
  baseStyle,
  menuItems,
  className,
  fontSize,
  rowHeight,
  fullWidth,
  unitYear,
}) => {
  const [isCopyrightDialogOpen, setIsCopyrightDialogOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

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

  const clickBaseMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsMenuExpanded(!isMenuExpanded);
  };

  const renderMoreMenu = () => {
    const menuItemElements = menuItems.map((item, index) => (
      <li key={index}>
        <a
          href={item.link}
          ref={item.copyright ? 'menuCopyright' : undefined}
          target={item.newWindow ? '_blank' : '_parent'}
          onClick={item.copyright ? openCopyrightDialog : undefined}
          rel="noreferrer"
        >
          {item.text}
        </a>
      </li>
    ));
    return <ul id="more-menu">{menuItemElements}</ul>;
  };

  const yearIsNumeric = () => {
    return /^[0-9]+$/.test(unitYear || '');
  };

  return (
    <div className={this.props.className}>
      <div className="phone-footer-base" ref="base" onClick={clickBaseMenu}>
        <CopyrightDialog
          isOpen={isCopyrightDialogOpen}
          closeModal={closeCopyrightDialog}
        />
        {!!this.props.unitYear && yearIsNumeric && (
          <p>
            <span className="version-caption">{i18n.version()}: </span>
            {this.props.unitYear}
          </p>
        )}
      </div>
      {renderMoreMenu}
    </div>
  );
};

export default PhoneFooter;
