import {render, screen, fireEvent} from '@testing-library/react';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {MemoryRouter} from 'react-router-dom';

import {
  RouterContext,
  RouterProvider,
} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';

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

  const handleGoBack = () => {
    router.goBack();
  };

  const href = router.createHref(hrefPath);

  return (
    <>
      <a href={href}>Link</a>
      <button type="button" onClick={handleNav}>
        Navigate
      </button>
      <button type="button" onClick={handleReplace}>
        Replace
      </button>
      <button type="button" onClick={handleGoBack}>
        Back
      </button>
    </>
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

  const renderDefault = ({baseName, ...props}) => {
    render(
      <MemoryRouter>
        <RouterProvider basename={baseName}>
          <TestComponent {...props} />
        </RouterProvider>
      </MemoryRouter>
    );
  };

  describe('createHref', () => {
    it('works with basename', () => {
      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles missing leading slashes', () => {
      baseName = 'app';
      testPath = 'test-path';

      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles extra leading slashes', () => {
      baseName = '///app';
      testPath = '/////test-path';

      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles trailing slashes', () => {
      baseName = '/app/';
      testPath = '/test-path/';

      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles multiple trailing slashes', () => {
      baseName = '/app////';
      testPath = '/test-path//////';

      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        expectedPath
      );
    });

    it('handles multiple slash basename and path', () => {
      baseName = '/app/test/';
      testPath = '/path/works/fine';

      renderDefault({baseName, hrefPath: testPath});

      expect(screen.getByRole('link', {name: /link/i})).toHaveAttribute(
        'href',
        '/app/test/path/works/fine'
      );
    });
  });

  describe('push', () => {
    it('calls navigate correctly', () => {
      renderDefault({pushPath: testPath});

      const button = screen.getByRole('button', {name: /navigate/i});

      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(testPath);
    });
  });

  describe('replace', () => {
    it('calls navigate correctly', () => {
      renderDefault({replacePath: testPath});

      const button = screen.getByRole('button', {name: /replace/i});

      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(testPath, {replace: true});
    });
  });

  describe('goBack', () => {
    it('calls navigate correctly', () => {
      renderDefault({});

      const button = screen.getByRole('button', {name: /back/i});

      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
