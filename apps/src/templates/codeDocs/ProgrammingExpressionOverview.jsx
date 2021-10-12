import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

export default function ProgrammingExpressionOverview({programmingExpression}) {
  return (
    <div>
      <h1>{programmingExpression.name}</h1>
      <div>
        <strong>{`${i18n.category()}:`}</strong>
        <span
          style={{
            backgroundColor: programmingExpression.color,
            marginLeft: 10,
            padding: '5px 10px'
          }}
        >
          {programmingExpression.category}
        </span>
      </div>
      {!!programmingExpression.content && (
        <div style={{paddingTop: 20}}>
          <EnhancedSafeMarkdown
            markdown={programmingExpression.content.trim()}
            expandableImages
          />
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
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  color: PropTypes.string,
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  returnValue: PropTypes.string,
  tips: PropTypes.string
});

ProgrammingExpressionOverview.propTypes = {
  programmingExpression: programmingExpressionShape.isRequired
};
