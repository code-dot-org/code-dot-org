import {render, screen, fireEvent} from '@testing-library/react';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {BrowserRouter} from 'react-router-dom';

import {
  RouterContext,
  RouterProvider,
} from '@cdo/apps/code-studio/pd/RouterContext';

let mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const TestComponent = ({pushPath, replacePath, hrefPath}) => {
  const {router} = useContext(RouterContext);

  const handleNav = () => {
    router.push(pushPath);
  };

  const handleReplace = () => {
    router.replace(replacePath);
  };

  const href = router.createHref(hrefPath);

  return (
    <div>
      <a href={href}>Link</a>
      <button type="button" onClick={handleNav}>
        Navigate
      </button>
      <button type="button" onClick={handleReplace}>
        Replace
      </button>
    </div>
  );
};

TestComponent.propTypes = {
  pushPath: PropTypes.string,
  replacePath: PropTypes.string,
  hrefPath: PropTypes.string,
};

describe('RouterContext', () => {
  let baseName;
  let testPath;
  let expectedPath;

  beforeEach(() => {
    jest.resetAllMocks();
    baseName = '/app';
    testPath = '/test-path';
    expectedPath = baseName + testPath; // '/app/test-path'
  });
  describe('createHref', () => {
    it('works with basename', () => {
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent hrefPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles missing leading slashes', () => {
      baseName = 'app';
      testPath = 'test-path';
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent hrefPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles extra leading slashes', () => {
      baseName = '///app';
      testPath = '/////test-path';
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent hrefPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles trailing slashes', () => {
      baseName = '/app/';
      testPath = '/test-path/';
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent hrefPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles multiple trailing slashes', () => {
      baseName = '/app////';
      testPath = '/test-path//////';
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent hrefPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });
  });

  describe('push', () => {
    it('calls navigate correctly', () => {
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent pushPath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      const button = screen.getByRole('button', {name: /navigate/i});

      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(testPath);
    });
  });

  describe('replace', () => {
    it('calls navigate correctly', () => {
      render(
        <BrowserRouter>
          <RouterProvider basename={baseName}>
            <TestComponent replacePath={testPath} />
          </RouterProvider>
        </BrowserRouter>
      );

      const button = screen.getByRole('button', {name: /replace/i});

      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(testPath, {replace: true});
    });
  });
});
