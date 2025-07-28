import fontConstants from '@cdo/apps/fontConstants';
import color from '@cdo/apps/util/color';

import {BlocklyWrapperType} from '../types';
export default function initializeCss(blocklyWrapper: BlocklyWrapperType) {
  blocklyWrapper.Css.register(
    `.blocklyFieldGrid {
      margin: 5px;
    }
    .blocklyFieldGrid .blocklyFieldGridItem {
      border: none;
      padding: 0px;
      margin: 0px;
    }
    .blocklyFieldGrid .blocklyFieldGridItem img {
      opacity: 1;
      object-fit: contain;
    }
    .blocklyFieldGridContainer {
      padding: 0px;
      overflow: auto;
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
    /* Change look of the editor in angle fields */
    .blocklyAngleCircle {
      fill: ${color.white};
    }
    .blocklyAngleGauge {
      fill: ${color.brand_secondary_default};
    }
    .blocklyAngleLine {
      stroke: ${color.brand_secondary_dark};
      stroke-width: 3;
    }
    .blocklyLimit rect {
      fill: ${color.brand_accent_default};
    }
    .blocklyLimit.overLimit rect {
      fill: ${color.product_caution_default};
    }
    .blocklyLimit.overLimit text {
      fill: ${color.neutral_dark} !important;
    }
    .fieldAngleDropDownContainer .blocklyAngleHelperContainer {
      border-width: 1px;
      float: right;
    }
    .fieldAngleDropDownContainer .blocklyMenu{
      float: left;
    }
    .fieldAngleDropDownContainer .blocklyMenu::after {
      content: '';
      position: absolute;
      height: 80%;
      right: 0;
      top: 10%;
    }
    .fieldAngleDropDownContainer .blocklyMenuItem{
      min-width: 0em;
    }
    .k1ColourDropdown>tr>td {
      height: 35px;
      width: 45px;
    }
    .blocklyDropDownDiv .blocklyMenu {
      font-family: ${fontConstants['main-font']};
      font-weight: 400 !important; // Noto Sans Math only supports the normal font-weight
    }
    .blocklyShadowFieldText {
      fill: ${color.neutral_dark40} !important; // Prevents override by .blocklyText
    }
    .blocklyShadowMusicFieldRect {
      fill: ${color.neutral_dark};
    }
    .blocklyDisabled .blocklyPath {
      fill-opacity: 0.5;
      stroke-opacity: 0.5;
    }
    .blocklyPath:focus {
      outline: none;
    }
    `
  );
}
