/* global levelbuilder */
import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  levelbuilder.jsonEditor('#callout_editor', {
    json_textarea: '#level_callout_json',
    add_button: '#add_callout',
    remove_button: '.remove_callout',
    value_space: '.callout_space',
    template: '.json_template',
    form_container: '#all_callouts_editor',
    wrapper: '.json_editor',
    model: {
      localization_key: '',
      callout_text: '',
      element_id: '',
      on: '',
      qtip_config: {
        codeStudio: {
          canReappear: false,
          dropletPaletteCategory: ''
        },
        style: {classes: ''},
        position: {
          my: '',
          at: '',
          adjust: {x: 0, y: 0}
        }
      }
    }
  });
}
