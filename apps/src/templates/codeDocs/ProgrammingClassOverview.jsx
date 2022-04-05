import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import Example from './Example';
import FieldsTable from './FieldsTable';
import i18n from '@cdo/locale';

export default function ProgrammingClassOverview({programmingClass}) {
  const getColor = () => {
    const color = programmingClass.color;
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

  return (
    <div style={{width: '100%'}}>
      <h1>{programmingClass.name}</h1>
      {programmingClass.category && (
        <div>
          <strong>{`${i18n.category()}:`}</strong>
          <span
            style={{
              backgroundColor: getColor(),
              marginLeft: 10,
              padding: '5px 10px'
            }}
          >
            {programmingClass.category}
          </span>
        </div>
      )}
      {!!programmingClass.content && (
        <div style={{paddingTop: 20}}>
          <EnhancedSafeMarkdown
            markdown={programmingClass.content.trim()}
            expandableImages
          />
        </div>
      )}
      {programmingClass.examples?.length > 0 && (
        <div>
          <h2>Examples</h2>
          {programmingClass.examples.map((example, idx) => (
            <Example
              key={idx}
              example={example}
              programmingEnvironmentName={
                programmingClass.programmingEnvironmentName
              }
            />
          ))}
        </div>
      )}
      {!!programmingClass.syntax && (
        <div>
          <h2>{i18n.syntaxHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={`\`${programmingClass.syntax}\``}
            expandableImages
          />
        </div>
      )}
      {!!programmingClass.tips && (
        <div>
          <h2>{i18n.tipsHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={programmingClass.tips.trim()}
            expandableImages
          />
        </div>
      )}
      {!!programmingClass.externalDocumentation && (
        <div>
          <h2>{i18n.additionalInformationHeader()}</h2>
          <EnhancedSafeMarkdown
            markdown={i18n.additionalInformationText({
              externalDocumentationUrl: programmingClass.externalDocumentation.trim()
            })}
          />
        </div>
      )}
      {programmingClass.fields?.length > 0 && (
        <div>
          <h2>Fields</h2>
          <FieldsTable fields={programmingClass.fields} />
        </div>
      )}
    </div>
  );
}

const programmingClassShape = PropTypes.shape({
  name: PropTypes.string,
  category: PropTypes.string.isRequired,
  color: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  externalDocumentation: PropTypes.string,
  content: PropTypes.string,
  syntax: PropTypes.string,
  tips: PropTypes.string,
  programmingEnvironmentName: PropTypes.string
});

ProgrammingClassOverview.propTypes = {
  programmingClass: programmingClassShape.isRequired
};
