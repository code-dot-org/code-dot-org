import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import Label, {LabelProps} from './../Label';

describe('Design System - Label', () => {
  const renderLabel = (props: Partial<LabelProps> = {}) => {
    render(<Label {...props} />);

    const label = screen.getByText((_, el) => el?.tagName === 'LABEL');
    expect(label).toBeInTheDocument();

    return label;
  };

  it('renders with default props', () => {
    const label = renderLabel();

    expect(label).toHaveClass('label-black');
    expect(label).toHaveClass('label-m');
  });

  it('renders with custom color', () => {
    const color = 'gray';

    const label = renderLabel({color});

    expect(label).toHaveClass(`label-${color}`);
  });

  it('renders with custom size', () => {
    const size = 's';

    const label = renderLabel({size});

    expect(label).toHaveClass(`label-${size}`);
  });

  it('renders with text section', () => {
    const text = 'Label text';

    const label = renderLabel({text});
    const textSection = within(label).getByText(text);

    expect(textSection).toBeInTheDocument();
    expect(textSection).toHaveClass('labelText');
  });
});
