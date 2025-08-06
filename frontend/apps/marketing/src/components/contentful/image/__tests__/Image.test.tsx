import {render, screen} from '@testing-library/react';

import Image from '../Image';

describe('Image Component', () => {
  it('renders Image component', () => {
    render(<Image src="test.jpg" altText={'This is an image'} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'This is an image');
  });

  it('applies border decoration class', () => {
    render(<Image src="test.jpg" altText="With border" decoration="border" />);
    const figure = screen.getByRole('figure');
    expect(figure.className).toMatch(/image--hasBorder/);
  });

  it('applies shadow decoration class', () => {
    render(<Image src="test.jpg" altText="With shadow" decoration="shadow" />);
    const figure = screen.getByRole('figure');
    expect(figure.className).toMatch(/image--hasShadow/);
  });

  it('applies rounded corners class', () => {
    render(
      <Image
        src="test.jpg"
        altText="Has rounded corners"
        hasRoundedCorners={true}
      />,
    );
    const figure = screen.getByRole('figure');
    expect(figure.className).toMatch(/image--hasRoundedCorners/);
  });

  it('renders Image with provided className styles', () => {
    const className = 'customClass';
    const cssSelector = `figure.${className}`;
    const classStyle = 'width: 100px;';

    render(
      <Image src="test.jpg" altText="This is an image" className={className} />,
    );
    const imageFigure = screen.getByRole('figure');

    expect(imageFigure).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `${cssSelector} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(imageFigure).toHaveStyle(classStyle);
  });

  it('sets loading attribute to lazy by default', () => {
    render(<Image src="test.jpg" altText="Lazy load" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
