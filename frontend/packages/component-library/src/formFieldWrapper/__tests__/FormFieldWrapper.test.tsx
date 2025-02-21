import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import FormFieldWrapper, {FormFieldWrapperProps} from '../FormFieldWrapper';

describe('Design System - FormFieldWrapper', () => {
  const renderFormFieldWrapper = (
    props: Partial<FormFieldWrapperProps> = {},
  ) => {
    render(<FormFieldWrapper {...props} />);
  };

  const queryFormFieldWrapperEl = () =>
    document.querySelector('.formFieldWrapper');

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
    const helperMessage = 'Helper text';

    renderFormFieldWrapper({helperMessage});

    expect(screen.getByText(helperMessage)).toBeInTheDocument();
    expect(screen.getByText(helperMessage).closest('div')).toHaveClass(
      'formFieldWrapperHelper',
    );
  });

  it('renders error section when error prop is provided', () => {
    const errorMessage = 'Test error message';

    renderFormFieldWrapper({errorMessage});

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage).closest('div')).toHaveClass(
      'formFieldWrapperError',
    );
  });

  it('renders error section over helper section when both props are provided', () => {
    const errorMessage = 'Test error message';
    const helperMessage = 'Helper text';

    renderFormFieldWrapper({errorMessage, helperMessage});

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText(helperMessage)).not.toBeInTheDocument();
  });

  it('renders with correct color class', () => {
    const color = 'gray';

    renderFormFieldWrapper({color});

    expect(queryFormFieldWrapperEl()).toHaveClass(
      `formFieldWrapper-color-${color}`,
    );
  });

  it('renders with correct size class', () => {
    const size = 'l';

    renderFormFieldWrapper({size});

    expect(queryFormFieldWrapperEl()).toHaveClass(
      `formFieldWrapper-size-${size}`,
    );
  });

  it('renders with default color class when no color is provided', () => {
    renderFormFieldWrapper();

    expect(queryFormFieldWrapperEl()).toHaveClass(
      'formFieldWrapper-color-black',
    );
  });

  it('renders with default size class when no size is provided', () => {
    renderFormFieldWrapper();

    expect(queryFormFieldWrapperEl()).toHaveClass('formFieldWrapper-size-m');
  });
});
