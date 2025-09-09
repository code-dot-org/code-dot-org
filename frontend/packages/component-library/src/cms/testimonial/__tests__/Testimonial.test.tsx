import {render, screen, within} from '@testing-library/react';

import Testimonial, {
  TESTIMONIAL_BACKGROUNDS,
  TestimonialProps,
} from '../Testimonial';

describe('CMS Testimonial', () => {
  const quote = 'This is a great product!';
  const source = 'John Doe';
  const context = 'CTO of Tech Corp';

  const renderComponent = (props: Partial<TestimonialProps> = {}) =>
    render(
      <Testimonial
        quote={quote}
        source={source}
        context={context}
        {...props}
      />,
    );

  const getComponent = () => screen.getByRole('figure');

  beforeEach(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .testimonial-background-${TESTIMONIAL_BACKGROUNDS.DARK} { background: ${TESTIMONIAL_BACKGROUNDS.DARK}; }
      .testimonial-background-${TESTIMONIAL_BACKGROUNDS.PRIMARY} { background: ${TESTIMONIAL_BACKGROUNDS.PRIMARY}; }
    `;
    document.head.appendChild(style);
  });

  it('renders with provided props', () => {
    renderComponent();

    const component = getComponent();

    expect(within(component).getByRole('blockquote')).toHaveTextContent(quote);
    expect(component).toHaveTextContent(source + context);
  });

  it('renders with dark background by default', () => {
    renderComponent();
    expect(getComponent()).toHaveStyle(
      `background: ${TESTIMONIAL_BACKGROUNDS.DARK}]`,
    );
  });

  it('renders with provided background', () => {
    const background = TESTIMONIAL_BACKGROUNDS.PRIMARY;
    renderComponent({background});
    expect(getComponent()).toHaveStyle(`background: ${background}]`);
  });

  it('renders with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'background: red;';

    renderComponent({className});
    const component = getComponent();

    expect(component).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(component).toHaveStyle(classStyle);
  });
});
