import {render, screen} from '@testing-library/react';

import {Image} from '../';

describe('Image Component', () => {
  it('renders Image component', () => {
    render(<Image src="test.jpg" altText={'This is an image'} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'This is an image');
  });

  it('applies border decoration class', () => {
    render(<Image src="test.jpg" altText="With border" decoration="border" />);
    const figure = screen.getByRole('figure');
    expect(figure.className).toMatch(/figure-hasBorder/);
  });

  it('applies shadow decoration class', () => {
    render(<Image src="test.jpg" altText="With shadow" decoration="shadow" />);
    const figure = screen.getByRole('figure');
    expect(figure.className).toMatch(/figure-hasBoxShadow/);
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

  it('applies inline width and height styles from props', () => {
    // Only use inline styles if there's no way to add custom className with needed styles.
    render(
      <Image
        src="test.jpg"
        altText="With styles"
        style={{
          width: '200px',
          height: '150px',
        }}
      />,
    );
    const figure = screen.getByRole('figure');
    expect(figure).toHaveStyle({width: '200px', height: '150px'});
  });

  it('calls onLoad callback when image loads', () => {
    const onLoad = jest.fn();
    render(<Image src="test.jpg" altText="Load test" onLoad={onLoad} />);
    const img = screen.getByRole('img');
    img.dispatchEvent(new Event('load'));
    expect(onLoad).toHaveBeenCalled();
  });

  it('calls onError callback when image fails', () => {
    const onError = jest.fn();
    render(<Image src="test.jpg" altText="Error test" onError={onError} />);
    const img = screen.getByRole('img');
    img.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalled();
  });

  it('sets loading attribute to lazy by default', () => {
    render(<Image src="test.jpg" altText="Lazy load" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('sets loading attribute to eager when specified', () => {
    render(<Image src="test.jpg" altText="Eager load" loading="eager" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});
