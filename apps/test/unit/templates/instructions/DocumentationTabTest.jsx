import {render, waitFor} from '@testing-library/react';
import React from 'react';

import {UnconnectedDocumentationTab} from '@cdo/apps/templates/instructions/DocumentationTab';

const ENVIRONMENT = 'javalab';

describe('DocumentationTabTest', () => {
  let fetchSpy;

  const fakeDocumentation = [
    {
      key: 'org_code_theater',
      name: 'org.code.theater',
      docs: [
        {
          id: 1,
          key: 'Scene',
          name: 'Scene',
          category: 'org.code.theater',
          methods: [
            {
              key: 'getwidth',
              name: 'int getWidth()',
            },
            {
              key: 'getHeight',
              name: 'int getHeight()',
            },
          ],
        },
        {
          id: 2,
          key: 'Theater',
          name: 'Theater',
          category: 'org.code.theater',
          methods: [
            {
              key: 'play',
              name: 'public static void play(Scene scene)',
            },
          ],
        },
      ],
    },
    {
      key: 'org_code_neighborhood',
      name: 'org.code.neighborhood',
      docs: [
        {
          id: 1,
          key: 'Painter',
          name: 'Painter',
          category: 'org.code.neighborhood',
          methods: [
            {
              key: 'getx',
              name: 'int getX()',
            },
            {
              key: 'getY',
              name: 'int getY()',
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockImplementation();
    fetchSpy.mockReturnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeDocumentation),
      })
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('shows spinner while loading', async () => {
    const promise = new Promise(() => {});
    fetchSpy.mockReturnValue(promise);

    render(
      <UnconnectedDocumentationTab programmingEnvironment={ENVIRONMENT} />
    );

    await waitFor(() => {
      expect(document.querySelector('#uitest-spinner')).not.toBeNull();
    });
  });

  it('shows default class if it exists', async () => {
    const defaultClass = 'Painter';
    render(
      <UnconnectedDocumentationTab
        programmingEnvironment={ENVIRONMENT}
        defaultClassKey={defaultClass}
      />
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(document.querySelector('#uitest-spinner')).toBeNull();
    });
    await waitFor(() => {
      expect(document.querySelector('select').value).toBe(defaultClass);
    });
  });

  it('shows first class if default does not exist', async () => {
    const defaultClass = 'badDefault';
    render(
      <UnconnectedDocumentationTab
        programmingEnvironment={ENVIRONMENT}
        defaultClassKey={defaultClass}
      />
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(document.querySelector('#uitest-spinner')).toBeNull();
    });
    await waitFor(() => {
      expect(document.querySelector('select').value).toBe(
        fakeDocumentation[0].docs[0].key
      );
    });
  });
});
