import sinon from 'sinon';
import ReactDOM from 'react-dom';
import {expect} from 'chai';
import initPage from '@cdo/apps/sites/studio/pages/levelbuilder_edit_script';

describe('the level builder page init script', () => {
  let container;
  beforeEach(() => {
    sinon.spy(ReactDOM, 'render');
    container = document.createElement('div');
    document.body.appendChild(container);
    container.className = 'edit_container';
    initPage({
      script: {
        name: 'Test script',
        stages: [],
        excludeCsfColumnInLegend: false
      },
      i18n: {
        stageDescriptions: []
      },
      beta: false,
      levelKeyList: [],
      locales: [['English', 'en-US'], ['French', 'fr-FR']],
      script_families: ['coursea', 'csd1'],
      version_year_options: ['2017', '2018']
    });
  });

  afterEach(() => {
    ReactDOM.render.restore();
  });

  it('renders to a div with the edit_container class', () => {
    expect(ReactDOM.render.calledWith(sinon.match.object, container)).to.be
      .true;
  });
});
