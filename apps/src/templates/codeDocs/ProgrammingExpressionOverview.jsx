import React, {createRef, useEffect} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import Example from './Example';
import ParametersTable from './ParametersTable';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import i18n from '@cdo/locale';

const VIDEO_WIDTH = 560;
const VIDEO_HEIGHT = 315;

export default function ProgrammingExpressionOverview({programmingExpression}) {
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
  });
  // Spritelab passes down its color in HSL format, whereas other labs use hex color
  const color =
    programmingExpression.color &&
    (typeof programmingExpression.color === 'string'
      ? programmingExpression.color
      : `hsl(${programmingExpression.color[0]},${programmingExpression
          .color[1] * 100}%, ${programmingExpression.color[2] * 100}%)`);
  return (
    <div>
      {programmingExpression.imageUrl ? (
        <img src={programmingExpression.imageUrl} style={styles.image} />
      ) : (
        <h1>{programmingExpression.name}</h1>
      )}
      <div>
        <strong>{`${i18n.category()}:`}</strong>
        <span
          style={{
            backgroundColor: color,
            marginLeft: 10,
            padding: '5px 10px'
          }}
        >
          {programmingExpression.category}
        </span>
      </div>
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
              programmingEnvironmentName={
                programmingExpression.programmingEnvironmentName
              }
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
          />
        </div>
      )}
      {programmingExpression.parameters?.length > 0 && (
        <div>
          <h2>{i18n.parametersHeader()}</h2>
          <ParametersTable parameters={programmingExpression.parameters} />
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
          />
        </div>
      )}
      {!!programmingExpression.externalDocumentation && (
        <div>
          <h2>{i18n.additionalInformationHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={i18n.additionalInformationText({
              externalDocumentationUrl: programmingExpression.externalDocumentation.trim()
            })}
          />
        </div>
      )}
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
  programmingEnvironmentName: PropTypes.string,
  video: PropTypes.object,
  imageUrl: PropTypes.string
});

ProgrammingExpressionOverview.propTypes = {
  programmingExpression: programmingExpressionShape.isRequired
};

const styles = {
  image: {
    paddingBottom: 5
  },
  video: {
    paddingTop: 10
  }
};
