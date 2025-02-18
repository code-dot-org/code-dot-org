import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
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

  // Convenience method; tests can use "await processEventLoop()" to wait for
  // all items in the event loop to be processed.
  const processEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchSpy.mockReturnValue(
      Promise.resolve({ok: true, json: () => fakeDocumentation})
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('shows spinner while loading', async () => {
    const promise = new Promise(() => {});
    fetchSpy.mockReturnValue(promise);
    const wrapper = mount(
      <UnconnectedDocumentationTab programmingEnvironment={ENVIRONMENT} />
    );
    await processEventLoop();
    expect(wrapper.find(Spinner).length).toBe(1);
  });

  it('shows default class if it exists', async () => {
    const defaultClass = 'Painter';
    const wrapper = mount(
      <UnconnectedDocumentationTab
        programmingEnvironment={ENVIRONMENT}
        defaultClassKey={defaultClass}
      />
    );
    await processEventLoop();
    wrapper.update();
    expect(wrapper.find(Spinner).length).toBe(0);
    const select = wrapper.find('select').at(0);
    expect(select.prop('value')).toBe(defaultClass);
  });

  it('shows first class if default does not exist', async () => {
    const defaultClass = 'badDefault';
    const wrapper = mount(
      <UnconnectedDocumentationTab
        programmingEnvironment={ENVIRONMENT}
        defaultClassKey={defaultClass}
      />
    );
    await processEventLoop();
    wrapper.update();
    expect(wrapper.find(Spinner).length).toBe(0);
    const select = wrapper.find('select').at(0);
    expect(select.prop('value')).toBe(fakeDocumentation[0].docs[0].key);
  });
});
