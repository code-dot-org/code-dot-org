import {isolateComponent} from 'isolate-react';
import React from 'react';

import DataDocEditAll from '@cdo/apps/lib/levelbuilder/data-docs-editor/DataDocEditAll';



describe('DataDocEditAll', () => {
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
  const wrapper = isolateComponent(<DataDocEditAll dataDocs={allDocs} />);

  it('shows names of Data Docs and links to their pages', () => {
    const links = wrapper.findAll('Link').map(link => link.toString());
    allDocs.forEach((doc, index) => {
      expect(links[index]).toEqual(expect.arrayContaining([doc.name]));
      expect(links[index]).toEqual(expect.arrayContaining([`/data_docs/${doc.key}`]));
    });
  });

  it('shows Data Doc even if it does not have name or content', () => {
    const emptyDoc = {
      key: 'emptyDoc',
    };
    const editAllWithEmptyDocWrapper = isolateComponent(
      <DataDocEditAll dataDocs={[emptyDoc]} />
    );
    const links = editAllWithEmptyDocWrapper
      .findAll('Link')
      .map(link => link.toString());
    expect(links).toHaveLength(1);
  });

  it('sets up all the actions for a data doc', () => {
    // check create button (TextLink) navigates user to new data doc page
    const createButton = wrapper.findAll('TextLink')[0];
    expect(createButton.props.text).toBe('Create New Data Doc');
    expect(createButton.props.href).toBe('/data_docs/new');

    // check there's an edit and delete button (TextLink) for each doc in the table
    const editAllTable = wrapper.findOne('.guides-table');
    expect(editAllTable.findAll('TextLink').length).toBe(2 * allDocs.length);

    // check edit button (TextLink) navigates user to the edit page for that doc
    expect(
      editAllTable.findAll('.actions-box')[0].findAll('TextLink')[0].props.href
    ).toBe(`/data_docs/${dataDoc1.key}/edit`);

    // check delete button (TextLink) calls initiate delete doc function
    expect(
      editAllTable.findAll('.actions-box')[0].findAll('TextLink')[1].toString()
    ).toContain('initiateDeleteDataDoc');
  });

  it('allows data doc to be deleted', () => {
    let server = sinon.fakeServer.create();

    const docToDelete = {
      key: 'docToDelete',
      name: 'deleteDoc',
      content: 'This doc will be deleted.',
    };
    let currDocs = [...allDocs];
    currDocs.push(docToDelete);

    server.respondWith('DELETE', `/data_docs/${docToDelete.key}`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(docToDelete),
    ]);

    const testDeleteWrapper = isolateComponent(
      <DataDocEditAll dataDocs={currDocs} />
    );
    expect(testDeleteWrapper.findAll('.guide-box').length).toBe(currDocs.length);
    expect(testDeleteWrapper.findAll('.guide-box').toString()).toContain(docToDelete.key);

    // click delete for data doc with key 'docToDelete' and confirm in dialog
    const docToDeleteActions = testDeleteWrapper
      .findAll('.actions-box')
      .filter(dataDoc => dataDoc.toString().includes(docToDelete.key))[0];
    docToDeleteActions.findAll('TextLink')[1].props.onClick();
    expect(testDeleteWrapper.exists('Dialog')).toBe(true);
    testDeleteWrapper.findOne('Dialog').props.onConfirm();
    server.respond();

    // ensure doc was successfully deleted
    expect(testDeleteWrapper.findAll('.guide-box').toString()).not.toContain(docToDelete.key);
    expect(testDeleteWrapper.exists('Dialog')).not.toBe(true);
    server.mockRestore();
  });
});
