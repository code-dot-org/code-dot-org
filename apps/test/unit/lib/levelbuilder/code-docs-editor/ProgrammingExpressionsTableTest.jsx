import React from 'react';
import {shallow} from 'enzyme';
import ProgrammingExpressionsTable from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionsTable';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {isolateComponent} from 'isolate-react';

describe('ProgrammingExpressionsTable', () => {
  let defaultProps, fetchStub, returnData;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    returnData = {
      numPages: 2,
      expressions: [
        {
          id: 1,
          key: 'button',
          name: 'Button',
          environmentId: 1,
          environmentTitle: 'App Lab',
          categoryName: 'UI Controls',
          editPath: '/programming_expressions/1/edit'
        },
        {
          id: 2,
          key: 'setText',
          name: 'setText',
          environmentId: 1,
          environmentTitle: 'App Lab',
          categoryName: 'UI Controls',
          editPath: '/programming_expressions/2/edit'
        },
        {
          id: 3,
          key: 'getSpeed',
          name: 'sprite.getSpeed()',
          environmentId: 3,
          environmentTitle: 'Game Lab',
          categoryName: 'Sprites',
          editPath: '/programming_expressions/3/edit'
        },
        {
          id: 4,
          key: 'codestudio_randomInt',
          environmentId: 2,
          environmentTitle: 'Sprite Lab',
          categoryName: 'Math',
          editPath: '/programming_expressions/4/edit'
        }
      ]
    };
    defaultProps = {
      programmingEnvironmentsForSelect: [
        {
          id: 1,
          name: 'applab',
          title: 'App Lab'
        },
        {
          id: 2,
          name: 'spritelab'
        },
        {
          id: 3,
          name: 'gamelab',
          title: 'Game Lab'
        }
      ],
      categoriesForSelect: [
        {
          id: 100,
          envId: 2,
          envName: 'spritelab',
          key: 'math',
          formattedName: 'Spritelab: Math'
        },
        {
          id: 200,
          envId: 1,
          envName: 'applab',
          key: 'uicontrols',
          formattedName: 'App Lab: UI Controls'
        },
        {
          id: 300,
          envId: 3,
          envName: 'gamelab',
          key: 'sprites',
          formattedName: 'Game Lab: Sprites'
        }
      ],
      hidden: false
    };
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('renders dropdowns with environments and categories', () => {
    const wrapper = shallow(<ProgrammingExpressionsTable {...defaultProps} />);
    expect(wrapper.find('select').length).to.equal(2);
  });

  it('renders dropdowns with environments and categories', () => {
    const wrapper = shallow(<ProgrammingExpressionsTable {...defaultProps} />);
    expect(wrapper.find('select').length).to.equal(2);
    const environmentSelector = wrapper.find('select').first();
    expect(environmentSelector.find('option').length).to.equal(4);
    expect(environmentSelector.props().value).to.equal('all');

    const categorySelector = wrapper.find('select').at(1);
    expect(categorySelector.find('option').length).to.equal(4);
    expect(categorySelector.props().value).to.equal('all');
  });

  it('updates category dropdown when environment is selected', () => {
    fetchStub.returns(Promise.resolve({ok: true, json: () => returnData}));
    const wrapper = isolateComponent(
      <ProgrammingExpressionsTable {...defaultProps} />
    );

    const environmentSelector = wrapper.findAll('select')[0];
    environmentSelector.props.onChange({target: {value: 1}});

    const categorySelector = wrapper.findAll('select')[1];
    expect(categorySelector.findAll('option').length).to.equal(2);
  });

  it('fetches programming expressions on load', () => {
    fetchStub
      .withArgs('/programming_expressions/get_filtered_expressions?page=1')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    isolateComponent(<ProgrammingExpressionsTable {...defaultProps} />);
    return new Promise(resolve => setImmediate(resolve)).then(() => {
      expect(fetchStub.callCount).to.be.greaterThan(1);
    });
  });
});
