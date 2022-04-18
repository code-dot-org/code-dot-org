import React from 'react';
import PropTypes from 'prop-types';
import Example from './Example';
import ParametersTable from './ParametersTable';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';

export function StandaloneMethod({method, programmingEnvironmentName}) {
  return (
    <div id={`method-${method.key}`}>
      <h3>{method.name}</h3>
      {method.syntax && <EnhancedSafeMarkdown markdown={method.syntax} />}
      {method.content && <EnhancedSafeMarkdown markdown={method.content} />}
      {method.parameters?.length > 0 && (
        <div>
          <h4>{i18n.parametersHeader()}</h4>
          <ParametersTable parameters={method.parameters} />
        </div>
      )}
      {method.examples?.length > 0 && (
        <div>
          <h4>{i18n.examples()}</h4>
          {method.examples.map((example, idx) => (
            <Example
              key={idx}
              example={example}
              programmingEnvironmentName={programmingEnvironmentName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Method({method, programmingEnvironmentName}) {
  return (
    <div style={styles.container}>
      <StandaloneMethod method={method} />
    </div>
  );
}

const methodShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  syntax: PropTypes.string,
  content: PropTypes.string,
  parameters: PropTypes.arrayOf(PropTypes.object),
  examples: PropTypes.arrayOf(PropTypes.object)
});

StandaloneMethod.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string
};

Method.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string
};

const styles = {
  container: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10
  }
};
