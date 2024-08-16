import PropTypes from 'prop-types';
import React, {useState} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import Example from './Example';
import ParametersTable from './ParametersTable';

export function SingleMethod({
  method,
  programmingEnvironmentName,
  programmingEnvironmentLanguage,
  isSmallWindow,
}) {
  return (
    <div id={`method-${method.key}`}>
      <h3>{method.name}</h3>
      {method.syntax && <EnhancedSafeMarkdown markdown={method.syntax} />}
      {method.content && <EnhancedSafeMarkdown markdown={method.content} />}
      {!!method.returnValue && (
        <div>
          <h4>{i18n.returnsHeader()}</h4>
          <div>{method.returnValue}</div>
        </div>
      )}
      {method.parameters?.length > 0 && (
        <div>
          <h4>{i18n.parametersHeader()}</h4>
          <ParametersTable
            parameters={method.parameters}
            programmingEnvironmentLanguage={programmingEnvironmentLanguage}
            isSmallWindow={isSmallWindow}
          />
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
      {!!method.externalLink && (
        <div>
          <h4>{i18n.additionalInformationHeader()}</h4>
          <EnhancedSafeMarkdown
            markdown={i18n.additionalInformationText({
              externalLinkUrl: method.externalLink.trim(),
            })}
          />
        </div>
      )}
    </div>
  );
}

export function MethodOverloadSection({
  overloads,
  programmingEnvironmentName,
  programmingEnvironmentLanguage,
  isSmallWindow,
}) {
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
            <SingleMethod
              key={overload.key}
              method={overload}
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

export default function MethodWithOverloads({
  method,
  programmingEnvironmentName,
  programmingEnvironmentLanguage,
  isSmallWindow,
}) {
  return (
    <div style={styles.container}>
      <SingleMethod
        method={method}
        programmingEnvironmentName={programmingEnvironmentName}
        programmingEnvironmentLanguage={programmingEnvironmentLanguage}
        isSmallWindow={isSmallWindow}
      />
      {method.overloads?.length > 0 && (
        <MethodOverloadSection
          overloads={method.overloads}
          programmingEnvironmentName={programmingEnvironmentName}
          programmingEnvironmentLanguage={programmingEnvironmentLanguage}
          isSmallWindow={isSmallWindow}
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
  externalLink: PropTypes.string,
  parameters: PropTypes.arrayOf(PropTypes.object),
  examples: PropTypes.arrayOf(PropTypes.object),
  overloads: PropTypes.arrayOf(PropTypes.object),
  returnValue: PropTypes.string,
});

SingleMethod.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string,
  programmingEnvironmentLanguage: PropTypes.string,
  isSmallWindow: PropTypes.bool,
};

MethodOverloadSection.propTypes = {
  overloads: PropTypes.arrayOf(methodShape),
  programmingEnvironmentName: PropTypes.string,
  programmingEnvironmentLanguage: PropTypes.string,
  isSmallWindow: PropTypes.bool,
};

MethodWithOverloads.propTypes = {
  method: methodShape.isRequired,
  programmingEnvironmentName: PropTypes.string,
  programmingEnvironmentLanguage: PropTypes.string,
  isSmallWindow: PropTypes.bool,
};

const styles = {
  container: {
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 3,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    minWidth: 'fit-content',
  },
  openOverloadHeader: {
    backgroundColor: color.lightest_gray,
    borderStyle: 'solid solid hidden solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '5px 5px 0px 0px',
    padding: 5,
    marginTop: 15,
    fontSize: 20,
  },
  closedOverloadHeader: {
    backgroundColor: color.lightest_gray,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '5px',
    padding: 5,
    marginTop: 15,
    fontSize: 20,
  },
  overloadBox: {
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderWidth: 1,
    borderRadius: '0px 0px 5px 5px',
    padding: 3,
  },
};
