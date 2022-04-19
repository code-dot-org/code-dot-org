import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Example from './Example';
import ParametersTable from './ParametersTable';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

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

export function MethodOverloads({overloads, programmingEnvironmentName}) {
  const [isOpen, setIsOpen] = useState(true);
  const icon = isOpen ? 'caret-down' : 'caret-up';
  return (
    <div>
      <div
        className="unittest-overloads-header"
        style={isOpen ? styles.openOverloadHeader : styles.closedOverloadHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesome icon={icon} /> {i18n.overloads()}
      </div>
      {isOpen && (
        <div style={styles.overloadBox}>
          {overloads.map(overload => (
            <StandaloneMethod
              key={overload.key}
              method={overload}
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
      {method.overloads?.length > 0 && (
        <MethodOverloads
          overloads={method.overloads}
          programmingEnvironmentName={programmingEnvironmentName}
        />
      )}
    </div>
  );
}

const methodShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  syntax: PropTypes.string,
  content: PropTypes.string,
  parameters: PropTypes.arrayOf(PropTypes.object),
  examples: PropTypes.arrayOf(PropTypes.object),
  overloads: PropTypes.arrayOf(PropTypes.object)
});

StandaloneMethod.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string
};

MethodOverloads.propTypes = {
  overloads: PropTypes.arrayOf(methodShape),
  programmingEnvironmentName: PropTypes.string
};

Method.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string
};

const styles = {
  container: {
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10
  },
  openOverloadHeader: {
    backgroundColor: color.lightest_gray,
    borderStyle: 'solid solid hidden solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '5px 5px 0px 0px',
    padding: 5,
    marginTop: 15,
    fontSize: 20
  },
  closedOverloadHeader: {
    backgroundColor: color.lightest_gray,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '5px',
    padding: 5,
    marginTop: 15,
    fontSize: 20
  },
  overloadBox: {
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '0px 0px 5px 5px',
    padding: 3
  }
};
