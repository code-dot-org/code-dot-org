import React from 'react';
import {isolateComponentTree} from 'isolate-react';
import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';
import {expect} from '../../../util/reconfiguredChai';

describe('DataDocIndex', () => {
  let defaultProps;
  const dataDoc1 = {
    key: 'key1',
    name: 'First Name'
  };
  const dataDoc2 = {
    key: 'key2',
    name: 'Second Name'
  };
  const allDocs = [dataDoc1, dataDoc2];

  beforeEach(() => {
    defaultProps = {
      dataDocs: allDocs
    };
  });

  it('shows names of Data Docs and links to their pages', () => {
    const wrapper = isolateComponentTree(<DataDocIndex {...defaultProps} />);
    const links = wrapper.findAll('a').map(link => link.toString());
    allDocs.forEach((doc, index) => {
      expect(links[index]).to.contain(doc.name);
      expect(links[index]).to.contain(`/data_docs/${doc.key}`);
    });
  });
});
