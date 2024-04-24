import PropTypes from 'prop-types';
import React, {createRef, useEffect} from 'react';
import ReactDOM from 'react-dom';

import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {
  convertXmlToBlockly,
  shrinkBlockSpaceContainer,
} from '@cdo/apps/templates/instructions/utils';
import {parseElement} from '@cdo/apps/xml';
import i18n from '@cdo/locale';

import Example from './Example';
import ParametersTable from './ParametersTable';

import '../../../style/curriculum/documentation_tables.scss';

const VIDEO_WIDTH = 560;
const VIDEO_HEIGHT = 315;

export default function ProgrammingExpressionOverview({
  programmingExpression,
  programmingEnvironmentName,
  programmingEnvironmentLanguage,
}) {
  const titleRef = React.createRef();
  const videoRef = createRef();

  useEffect(() => {
    if (programmingExpression.video) {
      createVideoWithFallback(
        $(ReactDOM.findDOMNode(videoRef.current)),
        programmingExpression.video,
        VIDEO_WIDTH,
        VIDEO_HEIGHT
      );
    }
    if (titleRef.current && programmingExpression.blockName) {
      convertXmlToBlockly(titleRef.current);
      const blocksDom = parseElement(
        `<block type='${programmingExpression.blockName}' />`
      );
      const blockSpace = Blockly.createEmbeddedWorkspace(
        titleRef.current,
        blocksDom,
        {
          noScrolling: true,
          inline: false,
        }
      );
      shrinkBlockSpaceContainer(blockSpace, true);
    }
  }, [programmingExpression, titleRef, videoRef]);

  const getColor = () => {
    const color = programmingExpression.color;
    if (!color) {
      return null;
    }
    // Spritelab passes down its color in HSL format, whereas other labs use hex color
    if (typeof color === 'string') {
      return color;
    } else {
      return `hsl(${color[0]},${color[1] * 100}%, ${color[2] * 100}%)`;
    }
  };

  const getTitle = () => {
    if (programmingExpression.blockName) {
      return (
        <div
          ref={titleRef}
          title={programmingExpression.blockName}
          role="heading"
          aria-level="1"
        />
      );
    }
    if (programmingExpression.imageUrl) {
      return (
        // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
        // Verify or update this alt-text as necessary
        <img src={programmingExpression.imageUrl} style={styles.image} alt="" />
      );
    }
    return <h1>{programmingExpression.name}</h1>;
  };

  return (
    <div>
      <div>{getTitle()}</div>
      {programmingExpression.category && (
        <div>
          <strong>{`${i18n.category()}:`}</strong>
          <span
            style={{
              backgroundColor: getColor(),
              marginLeft: 10,
              padding: '5px 10px',
            }}
          >
            {programmingExpression.category}
          </span>
        </div>
      )}
      {programmingExpression.video && (
        <div
          id={'programming-expression-video'}
          ref={videoRef}
          style={styles.video}
        />
      )}
      {!!programmingExpression.content && (
        <div style={{paddingTop: 20}}>
          <EnhancedSafeMarkdown
            markdown={programmingExpression.content.trim()}
            expandableImages
            className="docs-pages"
          />
        </div>
      )}
      {programmingExpression.examples?.length > 0 && (
        <div>
          <h2>Examples</h2>
          {programmingExpression.examples.map((example, idx) => (
            <Example
              key={idx}
              example={example}
              programmingEnvironmentName={programmingEnvironmentName}
            />
          ))}
        </div>
      )}
      {!!programmingExpression.syntax && (
        <div>
          <h2>{i18n.syntaxHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={`\`${programmingExpression.syntax}\``}
            expandableImages
            className="docs-pages"
          />
        </div>
      )}
      {programmingExpression.parameters?.length > 0 && (
        <div>
          <h2>{i18n.parametersHeader()}</h2>
          <ParametersTable
            parameters={programmingExpression.parameters}
            programmingEnvironmentLanguage={programmingEnvironmentLanguage}
          />
        </div>
      )}
      {!!programmingExpression.returnValue && (
        <div>
          <h2>{i18n.returnsHeader()}</h2>
          <div>{programmingExpression.returnValue}</div>
        </div>
      )}
      {!!programmingExpression.tips && (
        <div>
          <h2>{i18n.tipsHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={programmingExpression.tips.trim()}
            expandableImages
            className="docs-pages"
          />
        </div>
      )}
      {!!programmingExpression.externalDocumentation && (
        <div>
          <h2>{i18n.additionalInformationHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={i18n.additionalInformationText({
              externalDocumentationUrl:
                programmingExpression.externalDocumentation.trim(),
            })}
            className="docs-pages"
          />
        </div>
      )}
      <div>
        <p />
        <EnhancedSafeMarkdown markdown={i18n.documentationBug()} />
      </div>
    </div>
  );
}

const programmingExpressionShape = PropTypes.shape({
  name: PropTypes.string,
  category: PropTypes.string.isRequired,
  color: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  returnValue: PropTypes.string,
  tips: PropTypes.string,
  video: PropTypes.object,
  imageUrl: PropTypes.string,
  blockName: PropTypes.string,
  parameters: PropTypes.arrayOf(PropTypes.object),
  examples: PropTypes.arrayOf(PropTypes.object),
});

ProgrammingExpressionOverview.propTypes = {
  programmingExpression: programmingExpressionShape.isRequired,
  programmingEnvironmentName: PropTypes.string,
  programmingEnvironmentLanguage: PropTypes.string,
};

const styles = {
  image: {
    paddingBottom: 5,
  },
  video: {
    paddingTop: 10,
  },
};
