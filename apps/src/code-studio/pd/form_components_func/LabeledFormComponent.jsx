import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {
  SingleCheckbox,
  ButtonsFromOptions,
  ButtonsWithAdditionalTextFieldsFromOptions,
  ButtonsWithAdditionalTextFields,
  Buttons,
  SelectFieldGroupFromOptions,
  FieldGroup,
  UsPhoneNumberInput
} from './FormComponent';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

// Containers of labeled form components should provide this context
// using <LabelsContext.Provider value={context}>
// The format of the context is { labelName: labelString }
export const LabelsContext = React.createContext({});

// UI Helpers
export const labelFor = name => {
  const labels = useContext(LabelsContext);
  if (!(name in labels)) {
    console.warn(`Label missing for ${name}`);
    return name;
  }

  return (
    // SafeMarkdown wraps markdown in a <div> and uses <p> tags for each
    // paragraph, but the form system was built using a prior markdown
    // renderer which didn't do that for single-line entries, and so we rely
    // on some CSS styling in pd.scss to set these elements to
    // "display: inline" to maintain backwards compatibility.
    <div className="inline_markdown">
      <SafeMarkdown openExternalLinksInNewTab markdown={labels[name]} />
    </div>
  );
};

const defaultOptions = (name, label) => {
  return {
    name,
    label: label || labelFor(name),
    controlWidth: {md: 6},
    required: true
  };
};

export const LabeledSingleCheckbox = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    ...props
  };
  return <SingleCheckbox {...passProps} />;
};
LabeledSingleCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledCheckBoxes = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    ...props
  };
  return <ButtonsFromOptions {...passProps} />;
};
LabeledCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledCheckBoxesWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFieldsFromOptions {...passProps} />;
};
LabeledCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  textFieldMap: PropTypes.object
};

export const LabeledRadioButtonsWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFieldsFromOptions {...passProps} />;
};
LabeledRadioButtonsWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  textFieldMap: PropTypes.object
};

export const LabeledRadioButtons = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    ...props
  };
  return <ButtonsFromOptions {...passProps} />;
};
LabeledRadioButtons.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledDynamicRadioButtonsWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    options: props.options,
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFields {...passProps} />;
};
LabeledDynamicRadioButtonsWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.object,
  textFieldMap: PropTypes.object
};

export const LabeledDynamicCheckBoxes = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    answers: props.options,
    ...props
  };
  return <Buttons {...passProps} />;
};
LabeledDynamicCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.object
};

export const LabeledDynamicCheckBoxesWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    options: props.options,
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFields {...passProps} />;
};
LabeledDynamicCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.object,
  textFieldMap: PropTypes.object
};

export const LabeledSelect = (props = {}) => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'select',
    ...props
  };
  return <SelectFieldGroupFromOptions {...passProps} />;
};
LabeledSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'text',
    ...props
  };
  return <FieldGroup {...passProps} />;
};
LabeledInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledNumberInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'number',
    ...props
  };
  return <FieldGroup {...passProps} />;
};
LabeledNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};

export const LabeledLargeInput = props => {
  const passProps = {
    componentClass: 'textarea',
    controlWidth: {md: 12},
    rows: 4,
    maxLength: 500,
    ...props
  };
  return <LabeledInput {...passProps} />;
};

export const LabeledUsPhoneNumberInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    ...props
  };
  return <UsPhoneNumberInput {...passProps} />;
};
LabeledUsPhoneNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string
};
