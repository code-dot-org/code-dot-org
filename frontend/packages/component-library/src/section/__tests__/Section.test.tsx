import {render} from '@testing-library/react';

import Section, {SectionProps} from '../Section';

describe('Section Component', () => {
  const renderComponent = (props: Partial<SectionProps> = {}) => {
    return render(
      <Section {...props}>
        <div>This is content.</div>
      </Section>,
    );
  };

  it('renders section and container', () => {
    const {getByTestId} = renderComponent();
    const section = getByTestId('section');
    const container = getByTestId('container');

    // check if section is in the document
    expect(section).toBeInTheDocument();

    // check if container is in the document
    expect(container).toBeInTheDocument();
  });

  it('renders children content', () => {
    const {getByTestId} = renderComponent();
    const content = getByTestId('container');

    // check if children content is in the document
    expect(content).toHaveTextContent('This is content.');
  });
});
