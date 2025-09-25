import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import Iframe, {IframeProps} from '../Iframe';

describe('Design System - Iframe', () => {
  const title = 'Iframe Title';
  const src = 'data:text/html,<h1>Hello, world!</h1>';

  const renderIframeEmbedContainer = (props: Partial<IframeProps> = {}) => {
    render(<Iframe {...props} {...{title, src}} />);
  };

  const getIframe = () => screen.getByTitle(title);

  it('renders iframe with default props', () => {
    renderIframeEmbedContainer();

    const iframe = getIframe();

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('title', title);
    expect(iframe).toHaveAttribute('src', src);
    expect(iframe).toHaveAttribute('width', '100%');
    expect(iframe).toHaveAttribute('height', '100%');
  });

  it('renders iframe with provided width prop', () => {
    const width = '200px';
    renderIframeEmbedContainer({width});
    expect(getIframe()).toHaveAttribute('width', width);
  });

  it('renders iframe with provided height prop', () => {
    const height = '200px';
    renderIframeEmbedContainer({height});
    expect(getIframe()).toHaveAttribute('height', height);
  });

  it('renders iframe with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderIframeEmbedContainer({className});
    const iframe = getIframe();

    expect(iframe).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(iframe).toHaveStyle(classStyle);
  });
});
