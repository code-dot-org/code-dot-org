import {render, screen} from '@testing-library/react';

import Image from '../Image';

jest.mock('@/selectors/contentful/getImage', () => {
  return {
    getAbsoluteImageUrl: (src: string) =>
      src ? `https://cdn.example.com/${src}` : undefined,
    getImageEntityFromImageUrl: (src: string) => {
      if (src === 'https://cdn.example.com/with-entity.jpg') {
        return {
          fields: {
            file: {
              details: {
                image: {
                  height: 123,
                  width: 456,
                },
              },
            },
          },
        };
      }
      return undefined;
    },
  };
});

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

  it('renders NextImage when image entity has dimensions', () => {
    render(<Image src="with-entity.jpg" altText="NextImage" />);
    const nextImg = screen.getByAltText('NextImage');
    expect(nextImg).toHaveAttribute('height', '123');
    expect(nextImg).toHaveAttribute('width', '456');
    expect(nextImg).toHaveAttribute(
      'src',
      '/_next/image?url=https%3A%2F%2Fcdn.example.com%2Fwith-entity.jpg&w=1080&q=75',
    );
  });

  it('renders fallback img when image entity is missing', () => {
    render(<Image src="no-entity.jpg" altText="RawImage" />);
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('height', '123');
    expect(img).not.toHaveAttribute('width', '456');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/no-entity.jpg');
  });

  it('renders placeholder text if src is missing', () => {
    render(<Image src="" altText="Missing" />);
    expect(screen.getByText(/Image placeholder/i)).toBeInTheDocument();
  });
});
