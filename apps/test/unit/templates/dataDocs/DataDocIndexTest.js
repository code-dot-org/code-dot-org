import {isolateComponentTree} from 'isolate-react';
import React from 'react';

import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('DataDocIndex', () => {
  const dataDoc1 = {
    key: 'key1',
    name: 'First Name',
    content: 'First Content',
  };
  const dataDoc2 = {
    key: 'key2',
    name: 'Second Name',
    content: 'Second Content',
  };
  const allDocs = [dataDoc1, dataDoc2];

  const getLinksOnIndexPage = dataDocs => {
    const wrapper = isolateComponentTree(<DataDocIndex dataDocs={dataDocs} />);
    return wrapper.findAll('a').map(link => link.toString());
  };

  it('shows names of Data Docs and links to their pages', () => {
    const links = getLinksOnIndexPage(allDocs);
    allDocs.forEach((doc, index) => {
      expect(links[index]).to.contain(doc.name);
      expect(links[index]).to.contain(`/data_docs/${doc.key}`);
    });
  });

  it('does not show Doc without a name', () => {
    const docNoName = {
      key: 'noName',
      content: 'Content',
    };
    const links = getLinksOnIndexPage([docNoName]);
    expect(links).to.have.length(0);
  });

  it('does not show Doc without content', () => {
    const docNoContent = {
      key: 'noContent',
      name: 'Name',
    };
    const links = getLinksOnIndexPage([docNoContent]);
    expect(links).to.have.length(0);
  });
});
