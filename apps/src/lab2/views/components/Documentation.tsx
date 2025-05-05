import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {
  Heading2,
  Heading4,
  Heading5,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import moduleStyles from './Documentation.module.scss';

interface DocumentationProps {
  expressionKey: string;
}

type Doc = {
  name: string;
  properties: {
    content: string;
    palette_params: [
      {
        name: string;
        description: string;
      }
    ];
  };
};

const Documentation: React.FunctionComponent<DocumentationProps> = ({
  expressionKey,
}) => {
  const [doc, setDoc] = useState<Doc | undefined>(undefined);
  const onMount = useCallback(async () => {
    const response = await fetch(
      `/docs/ide/music/expressions/${expressionKey}`
    );
    const responseJson = await response.json();
    setDoc(responseJson);
  }, [expressionKey]);
  useEffect(() => {
    onMount();
  }, [onMount]);

  console.log(doc);

  return (
    <div>
      <Heading4>{doc?.name}</Heading4>
      <SafeMarkdown
        openExternalLinksInNewTab
        markdown={doc?.properties.content}
        className={moduleStyles.markdownText}
      />
      {doc?.properties.palette_params?.map(paletteParam => (
        <div>
          <Heading5>{paletteParam.name}</Heading5>
          <SafeMarkdown
            openExternalLinksInNewTab
            markdown={paletteParam.description}
            className={moduleStyles.markdownText}
          />
        </div>
      ))}
    </div>
  );
};

export default Documentation;
