import color from '@cdo/apps/util/color';

export default function initializeCss(blocklyWrapper) {
  blocklyWrapper.Css.register(
    `.fieldGridDropDownContainer.blocklyMenu .blocklyMenuItem {
      width: 32px;
      height: 32px;
      padding: 0px;
      border: none;
    }
    .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemSelected {
      background-color: white;
    }
    /* Change look of focus/highlighted cell */
    .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemHighlight {
      box-shadow: 0 0 0 4px hsla(0.57, 10%, 34%, .2);
    }
    .blocklyMenuItemContent > img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .blocklyFlyoutButton {
      fill: ${color.brand_secondary_default};
      cursor: pointer;
    }
    .blocklyFlyoutButtonShadow {
      fill: none;
    }
    .blocklyFlyoutButton:hover {
      fill: ${color.brand_secondary_dark};
    }
    `
  );
}
