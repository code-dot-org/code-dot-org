import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import FormFieldWrapper, {FormFieldWrapperProps} from '../FormFieldWrapper';

describe('Design System - FormFieldWrapper', () => {
  const renderFormFieldWrapper = (
    props: Partial<FormFieldWrapperProps> = {},
  ) => {
    render(<FormFieldWrapper {...props} />);
  };

  it('renders with the provided label', () => {
    const label = 'Test Label';
    renderFormFieldWrapper({label});
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders the children content', () => {
    const children = 'Content';
    renderFormFieldWrapper({children});
    const childrenEl = screen.getByText(children);
    expect(childrenEl).toBeInTheDocument();
  });

  it('renders helper section when helper props are provided', () => {
    const helperMessage = 'Helper text';
    renderFormFieldWrapper({helperMessage});
    expect(screen.getByText(helperMessage)).toBeInTheDocument();
  });

  it('renders error section when error prop is provided', () => {
    const errorMessage = 'Test error message';
    renderFormFieldWrapper({errorMessage});
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders error section over helper section when both props are provided', () => {
    const errorMessage = 'Test error message';
    const helperMessage = 'Helper text';

    renderFormFieldWrapper({errorMessage, helperMessage});

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText(helperMessage)).not.toBeInTheDocument();
  });
});
