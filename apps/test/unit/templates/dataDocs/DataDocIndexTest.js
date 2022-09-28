import React from 'react';
import {isolateComponentTree} from 'isolate-react';
import DataDocIndex from '@cdo/apps/templates/dataDocs/DataDocIndex';
import {expect} from '../../../util/reconfiguredChai';

describe('DataDocIndex', () => {
  let defaultProps;
  const dataDoc1 = {
    key: 'key1',
    name: 'First Name',
    content: 'First Content'
  };
  const dataDoc2 = {
    key: 'key2',
    name: 'Second Name',
    content: 'Second Content'
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

  it('does not show Doc without a name', () => {
    const docNoName = {
      key: 'noName',
      content: 'Content'
    };
    const wrapper = isolateComponentTree(
      <DataDocIndex dataDocs={[docNoName]} />
    );
    const links = wrapper.findAll('a').map(link => link.toString());
    expect(links).to.have.length(0);
  });

  it('does not show Doc without content', () => {
    const docNoName = {
      key: 'noContent',
      name: 'Name'
    };
    const wrapper = isolateComponentTree(
      <DataDocIndex dataDocs={[docNoName]} />
    );
    const links = wrapper.findAll('a').map(link => link.toString());
    expect(links).to.have.length(0);
  });
});
