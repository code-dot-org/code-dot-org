import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import FormFieldWrapper, {FormFieldWrapperProps} from '../FormFieldWrapper';

describe('Design System - FormFieldWrapper', () => {
  const renderFormFieldWrapper = (
    props: Partial<FormFieldWrapperProps> = {},
  ) => {
    render(<FormFieldWrapper {...props} />);
  };

  const queryFormFieldWrapperEl = () => document.querySelector('.formFieldWrapper');

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
    expect(childrenEl).toHaveClass('formFieldWrapper');
  });

  it('renders children inside <label> when label prop is provided', () => {
    const label = 'Test Label';
    const children = 'Content';

    renderFormFieldWrapper({label, children});

    const childrenEl = screen.getByText(children);
    expect(childrenEl).toBeInTheDocument();
    expect(childrenEl).toHaveClass('formFieldWrapperLabel');
    expect(childrenEl).toHaveTextContent(label + children);
  });

  it('renders helper section when helper props are provided', () => {
    const helperText = 'Helper text';

    renderFormFieldWrapper({helper: {text: helperText}});

    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.getByText(helperText).closest('div')).toHaveClass(
      'formFieldWrapperHelper',
    );
  });

  it('renders error section when error prop is provided', () => {
    const error = 'Test error message';

    renderFormFieldWrapper({error});

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByText(error).closest('div')).toHaveClass(
      'formFieldWrapperError',
    );
  });

  it('renders error section over helper section when both props are provided', () => {
    const error = 'Test error message';
    const helperText = 'Helper text';

    renderFormFieldWrapper({error, helper: {text: helperText}});

    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
  });

  it('renders with correct color class', () => {
    const color = 'gray';

    renderFormFieldWrapper({color});

    expect(queryFormFieldWrapperEl()).toHaveClass(`formFieldWrapper-${color}`);
  });

  it('renders with correct size class', () => {
    const size = 'l';

    renderFormFieldWrapper({size});

    expect(queryFormFieldWrapperEl()).toHaveClass(`formFieldWrapper-${size}`);
  });

  it('renders with default color class when no color is provided', () => {
    renderFormFieldWrapper();

    expect(queryFormFieldWrapperEl()).toHaveClass('formFieldWrapper-black');
  });

  it('renders with default size class when no size is provided', () => {
    renderFormFieldWrapper();

    expect(queryFormFieldWrapperEl()).toHaveClass('formFieldWrapper-m');
  });
});
