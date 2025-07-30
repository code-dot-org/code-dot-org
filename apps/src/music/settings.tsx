import React, {useEffect, useState} from 'react';

import {BLOCKLY_THEME, Themes} from '@cdo/apps/blockly/constants';
import {commonI18n} from '@cdo/apps/types/locale';

import {getBaseName, setWorkspaceTheme} from '../blockly/utils';
import {Setting} from '../lab2/views/components/Settings/SettingsDropdowns';
import UserPreferences from '../lib/util/UserPreferences';

const blockThemeOptions = [
  {
    value: Themes.MODERN,
    text: commonI18n.blocklyModernTheme(),
  },
  {
    value: Themes.HIGH_CONTRAST,
    text: commonI18n.blocklyHighContrastTheme(),
  },
  {
    value: Themes.PROTANOPIA,
    text: commonI18n.blocklyProtanopiaTheme(),
  },
  {
    value: Themes.DEUTERANOPIA,
    text: commonI18n.blocklyDeuteranopiaTheme(),
  },
  {
    value: Themes.TRITANOPIA,
    text: commonI18n.blocklyTritanopiaTheme(),
  },
];

export function useMusicSettings(): Setting[] {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    new UserPreferences()
      .getBlocklyTheme((error: Error | null) =>
        getBaseName(
          (localStorage.getItem(BLOCKLY_THEME) || Themes.MODERN) as Themes
        )
      )
      .then((theme: string) => {
        setSelectedTheme(theme);
      });
  }, []);

  const handleBlocklyThemeChange = (name: string) => {
    setWorkspaceTheme(Blockly.getMainWorkspace(), name);
    setSelectedTheme(name);
  };

  function renderPreviewBubbles() {
    if (!selectedTheme) {
      return null; // still loading
    }
    const {blockStyles} = Blockly.themes[selectedTheme as Themes];

    const blockStyleNamesForPreview = [
      'setup_blocks',
      'lab_blocks',
      'loop_blocks',
      'logic_blocks',
      'event_blocks',
      'procedure_blocks',
    ];
    const colorsForPreview: string[] = [];
    blockStyleNamesForPreview.forEach(style => {
      if (blockStyles[style]) {
        colorsForPreview.push(blockStyles[style].colourPrimary);
      }
    });

    const colors = colorsForPreview;

    // We get the font styles from Blockly's constants because they may be ommitted from the theme.
    const {FIELD_TEXT_FONTSIZE, FIELD_TEXT_FONTFAMILY, FIELD_TEXT_FONTWEIGHT} =
      Blockly.getMainWorkspace().getRenderer().getConstants();
    const fontSizePx = FIELD_TEXT_FONTSIZE * 1.333;
    const padding = 6;
    const svgSize = fontSizePx + padding * 2;
    const radius = svgSize / 2;
    return (
      <div style={{width: '100%', display: 'flex', gap: '8px'}}>
        {colors.map(color => (
          <svg key={color} width={svgSize} height={svgSize}>
            <circle cx={radius} cy={radius} r={radius} fill={color} />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="blocklyText"
              fill="white"
              style={{
                fontSize: `${fontSizePx}pt`,
                fontFamily: FIELD_TEXT_FONTFAMILY,
                fontWeight:
                  FIELD_TEXT_FONTWEIGHT as React.CSSProperties['fontWeight'],
              }}
            >
              A
            </text>
          </svg>
        ))}
      </div>
    );
  }
  if (selectedTheme === null) {
    return []; // still loading
  }

  return [
    {
      id: 'blocklyTheme',
      label: 'Block Color Theme',
      options: blockThemeOptions,
      selectedValue: selectedTheme,
      onChange: handleBlocklyThemeChange,
      renderBelow: renderPreviewBubbles,
    },
  ];
}
