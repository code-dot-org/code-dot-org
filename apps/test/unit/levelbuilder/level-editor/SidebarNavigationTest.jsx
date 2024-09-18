import {render, screen} from '@testing-library/react';
import React from 'react';

import NavigationSidebar from '@cdo/apps/lab2/levelEditors/NavigationSidebar';

describe('Navigation Sidebar', () => {
  let textarea;

  beforeEach(() => {
    // NavigationSidebar expects to find a an element in the document with class
    // "control-legend", text and data-target attributes.
    textarea = document.createElement('h1');
    textarea.setAttribute('class', 'control-legend');
    textarea.setAttribute('text', `Heading 1`);
    textarea.setAttribute('data-target', '#target1');
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    document.body.removeChild(textarea);
  });

  it('renders the sidebar with list item', () => {
    const sideBar = render(<NavigationSidebar />);
    expect(sideBar).toBeDefined();
    expect(screen.getByRole('listitem')).toBeDefined();
  });
});
