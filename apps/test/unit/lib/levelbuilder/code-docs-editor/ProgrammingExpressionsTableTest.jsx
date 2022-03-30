import React from 'react';
import {shallow, mount} from 'enzyme';
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
      allProgrammingEnvironments: [
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
      allCategories: [
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
    const wrapper = shallow(<ProgrammingExpressionsTable {...defaultProps} />);

    const environmentSelector = wrapper.find('select').at(0);
    environmentSelector.simulate('change', {target: {value: 1}});

    const categorySelector = wrapper.find('select').at(1);
    expect(categorySelector.find('option').length).to.equal(2);
  });

  it('shows table with programming expressions after load', () => {
    fetchStub
      .withArgs('/programming_expressions/get_filtered_expressions?page=1')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    const wrapper = isolateComponent(
      <ProgrammingExpressionsTable {...defaultProps} />
    );
    return new Promise(resolve => setImmediate(resolve)).then(() => {
      expect(fetchStub.callCount).to.equal(1);
      // A reactabular table has a Header and a Body
      expect(wrapper.findAll('Header').length).to.equal(1);
      expect(wrapper.findAll('Body').length).to.equal(1);
      expect(wrapper.findOne('Body').props.rows).to.eql(returnData.expressions);
    });
  });

  it('loads data but doesnt show expressions if hidden is true', () => {
    fetchStub
      .withArgs('/programming_expressions/get_filtered_expressions?page=1')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    const wrapper = isolateComponent(
      <ProgrammingExpressionsTable {...defaultProps} hidden />
    );
    return new Promise(resolve => setImmediate(resolve)).then(() => {
      expect(fetchStub.callCount).to.equal(1);
      // A reactabular table has a Header and a Body
      expect(wrapper.findAll('Header').length).to.equal(0);
      expect(wrapper.findAll('Body').length).to.equal(0);
    });
  });

  it('shows confirmation dialog before destroying expression', () => {
    fetchStub
      .withArgs('/programming_expressions/get_filtered_expressions?page=1')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    const wrapper = mount(<ProgrammingExpressionsTable {...defaultProps} />);
    return new Promise(resolve => setImmediate(resolve)).then(() => {
      const fetchCount = fetchStub.callCount;
      expect(fetchCount).to.equal(1);
      wrapper.update();
      const destroyButton = wrapper
        .find('BodyRow')
        .at(1)
        .find('Button')
        .at(2);
      destroyButton.simulate('click');
      expect(wrapper.find('StylizedBaseDialog').length).to.equal(1);
      expect(fetchStub.callCount).to.equal(fetchCount);
    });
  });

  it('shows clone dialog to clone expression', () => {
    fetchStub
      .withArgs('/programming_expressions/get_filtered_expressions?page=1')
      .returns(Promise.resolve({ok: true, json: () => returnData}));
    const wrapper = mount(<ProgrammingExpressionsTable {...defaultProps} />);
    return new Promise(resolve => setImmediate(resolve)).then(() => {
      wrapper.update();
      const destroyButton = wrapper
        .find('BodyRow')
        .at(2)
        .find('Button')
        .at(1);
      destroyButton.simulate('click');
      expect(wrapper.find('CloneProgrammingExpressionDialog').length).to.equal(
        1
      );
    });
  });
});
