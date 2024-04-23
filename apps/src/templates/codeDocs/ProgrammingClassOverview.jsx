import PropTypes from 'prop-types';
import React from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

import Example from './Example';
import FieldsTable from './FieldsTable';
import MethodSummaryTable from './MethodSummaryTable';
import MethodWithOverloads from './MethodWithOverloads';

export default function ProgrammingClassOverview({
  programmingClass,
  programmingEnvironmentName,
  programmingEnvironmentLanguage,
  includeMethodSummary,
  isSmallWindow,
}) {
  return (
    <div style={{width: '100%'}}>
      <h1>{programmingClass.name}</h1>
      {programmingClass.category && (
        <div>
          <strong>{`${i18n.category()}:`}</strong>
          <span
            style={{
              backgroundColor: programmingClass.color,
              marginLeft: 10,
              padding: '5px 10px',
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
          <h2>{i18n.examples()}</h2>
          {programmingClass.examples.map((example, idx) => (
            <Example
              key={idx}
              example={example}
              programmingEnvironmentName={programmingEnvironmentName}
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
              externalDocumentationUrl:
                programmingClass.externalDocumentation.trim(),
            })}
          />
        </div>
      )}
      {programmingClass.fields?.length > 0 && (
        <div>
          <h2>{i18n.fields()}</h2>
          <FieldsTable fields={programmingClass.fields} />
        </div>
      )}
      {programmingClass.methods?.length > 0 && includeMethodSummary && (
        <div>
          <h2>{i18n.methods()}</h2>
          <MethodSummaryTable methods={programmingClass.methods} />
        </div>
      )}
      {programmingClass.methods?.length > 0 && (
        <div>
          <h2>{i18n.methodDetails()}</h2>
          {programmingClass.methods.map(method => (
            <MethodWithOverloads
              key={method.key}
              method={method}
              programmingEnvironmentName={programmingEnvironmentName}
              programmingEnvironmentLanguage={programmingEnvironmentLanguage}
              isSmallWindow={isSmallWindow}
            />
          ))}
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
  examples: PropTypes.arrayOf(PropTypes.object),
  fields: PropTypes.arrayOf(PropTypes.object),
  methods: PropTypes.arrayOf(PropTypes.object),
});

ProgrammingClassOverview.propTypes = {
  programmingClass: programmingClassShape.isRequired,
  programmingEnvironmentName: PropTypes.string,
  programmingEnvironmentLanguage: PropTypes.string,
  includeMethodSummary: PropTypes.bool,
  isSmallWindow: PropTypes.bool,
};
