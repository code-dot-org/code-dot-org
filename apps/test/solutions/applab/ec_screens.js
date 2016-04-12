var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants').TestResults;
var _ = require('lodash');
var $ = require('jquery');
var ReactTestUtils = require('react-addons-test-utils');

// i'd like this test to not run through level tests, which has a lot of hacks,
// but this is the easiest approach for now. hopefully at some point in the
// (nearish) future, we have a better approach and this code can be moved
// without too much difficulty

function validatePropertyRow(index, label, value, assert) {
  var container = $("#propertyRowContainer")[0];
  assert(container, 'has design properties container');

  var propertyRow = $("#propertyRowContainer > div").eq(index);
  assert.equal(propertyRow.children(0).text(), label);
  // second col has an input with val screen 2
  assert.equal(propertyRow.children(1).children(0).val(), value);
}

function validateElementSelect(expected, assert) {
  var actual = $('#emptyTab').find('select option').map(function (_, element) { return element.value; }).get();
  assert.deepEqual(actual, expected);
}

module.exports = {
  app: "applab",
  skinId: "applab",
  levelFile: "levels",
  levelId: "ec_simple",
  tests: [
    {
      description: "basic test",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // We have an applab div with a single screen inside it
        var designModeViz = document.getElementById('designModeViz');
        assert(designModeViz);
        assert.equal(designModeViz.children.length, 1);
        var screen1 = designModeViz.children[0];
        assert.equal(screen1.id, 'design_screen1');
        assert.equal(screen1.tagName, 'DIV');

        // The design button is visible, and there's no dropdown
        var designModeButton = document.getElementById('designModeButton');
        assert.equal(designModeButton.textContent, 'Design');
        assert.equal(document.getElementById('screenSelector'), null);

        // our design mode box is hidden
        assert.equal($('#designWorkspace').is(':visible'), false);

        // click design mode button
        $(designModeButton).click();
        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');

        var orange = 'rgb(255, 160, 0)';
        var white = 'rgb(255, 255, 255)';
        assert.equal(orange, $("#designModeButton").css('background-color'),
          'expected Design button (active) to have orange background.');
        assert.equal(white, $("#codeModeButton").css('background-color'),
          'expected Code button (inactive) to have white background.');
        var screenSelector = document.getElementById('screenSelector');
        assert.notEqual(screenSelector, null);
        assert.equal(screenSelector.options.length, 2, 'expected 2 options');
        assert.equal($(screenSelector).val(), 'screen1');
        assert.equal($('#designWorkspace').is(':visible'), true);

        // initial property row container should be the default screen
        assert.equal($("#propertyRowContainer input:eq(0)").val(), 'screen1',
            'expected default screen property row container');

        //Default button and delete button should not show up
        assert.equal($('#propertyRowContainer button').length, 1, 'expected 1 button');
        assert.equal($('#propertyRowContainer button').attr('class'), 'rainbow-gradient', 'should be color picker');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "add a screen",
      editCode: true,
      timeout: 15000,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');
        assert.equal($("#designModeViz").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 3, 'has three options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(0, 'id', 'screen2', assert);
        validateElementSelect(['screen2'], assert);

        // drag a button onto our new screen
        testUtils.dragToVisualization('BUTTON', 10, 10);

        validatePropertyRow(0, 'id', 'button1', assert);
        validateElementSelect(['screen2', 'button1'], assert);
        var buttonElement = $('#design_button1')[0];
        var buttonParent = buttonElement.parentNode;
        assert($(buttonParent).hasClass('ui-draggable'));
        assert($(buttonParent).hasClass('ui-resizable'));
        assert.equal(buttonParent.parentNode.getAttribute('id'), 'design_screen2');

        // Change to screen1 using dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'screen1' } });

        validatePropertyRow(0, 'id', 'screen1', assert);
        validateElementSelect(['screen1'], assert);
        assert(!$('#button1').is(':visible'));

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "delete a screen",
      editCode: true,
      timeout: 15000,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var screenSelector = document.getElementById('screenSelector');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);

        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');
        assert.equal($("#designModeViz").children().length, 2, 'has two screen divs');
        assert.equal(screenSelector.options.length, 3, 'has three options in dropdown');
        assert.equal($(screenSelector).val(), 'screen2');

        validatePropertyRow(0, 'id', 'screen2', assert);

        var deleteButton = $("#design-properties button").eq(-1);
        assert.equal(deleteButton.text(), 'Delete', 'delete button on screen 2 should say delete');

        // Both screen 1 and 2 should have delete buttons
        $('#screenSelector').val('screen1');
        ReactTestUtils.Simulate.change(screenSelector);
        deleteButton = $("#design-properties button").eq(-1);
        validatePropertyRow(0, 'id', 'screen1', assert);
        assert.equal(deleteButton.text(), 'Delete', 'delete button on screen 1 should say delete');

        $('#screenSelector').val('screen2');
        ReactTestUtils.Simulate.change(screenSelector);
        validatePropertyRow(0, 'id', 'screen2', assert);
        deleteButton = $("#design-properties button").eq(-1);
        assert.equal(deleteButton.text(), 'Delete', 'last button is delete button');

        ReactTestUtils.Simulate.click(deleteButton[0]);

        // Should have resulted in two new buttons
        assert.equal($("#design-properties button").eq(-2).text(), 'No', 'second to last button should be no');
        assert.equal($("#design-properties button").eq(-1).text(), 'Yes', 'last button should be no');

        ReactTestUtils.Simulate.click($("#design-properties button").eq(-1)[0]);

        assert.equal($("#propertyRowContainer input:eq(0)").val(), 'screen1',
            'expected default screen property row container');
        assert.equal($("#designModeViz").children().length, 1, 'has one screen divs');
        assert.equal($(screenSelector).val(), 'screen1');

        // click on screen 1 (use jquery instead of React since screen1 is not
        // a react component)
        $("#design_screen1").click();
        validatePropertyRow(0, 'id', 'screen1', assert);

        // Two buttons, first is color picker, second is default
        assert.equal($("#design-properties button").length, 1, 'There should be one button');
        assert.equal($("#design-properties button").first().attr('class'), 'rainbow-gradient',
          'First button is color picker');

        // Change name
        var inputId = $('#design-properties input').first();
        ReactTestUtils.Simulate.change(inputId[0],
          { target: { value: 'renamed_screen' } });
        assert(document.getElementById('design_renamed_screen'));

        // Still can't delete
        assert.equal($("#design-properties button").length, 1, 'There should be one button');
        assert.equal($("#design-properties button:contains('Delete')").length, 0, 'None should say Delete');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "ensure API based element creation puts element on active screen",
      editCode: true,
      xml:
        'button("my_button", "my_button_text");' +
        'image("my_image", "http://code.org/images/logo.png");' +
        'createCanvas("my_canvas", 320, 450);' +
        'container("my_container", "<div>FOO</div>");' +
        'write("<div id=\'my_write\'>FOO</div>");' +
        'imageUploadButton("my_image_upload", "text");' +
        'textInput("my_text_input", "text");' +
        'textLabel("my_text_label", "label");' +
        'checkbox("my_checkbox", false);' +
        'radioButton("my_radio_button", false, "group");' +
        'dropdown("my_dropdown", "option1", "etc");',
      runBeforeClick: function (assert) {
        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          function idExistsOnScreen1(id) {
            var element = document.getElementById(id);
            assert(element);
            assert.equal(element.parentNode.id, 'screen1');
          }

          var button = document.getElementById('my_button');
          assert.equal(button.textContent, 'my_button_text');
          idExistsOnScreen1('my_button');

          idExistsOnScreen1('my_image');
          idExistsOnScreen1('my_canvas');
          idExistsOnScreen1('my_container');

          // write puts contents inside a div (so here we have a div inside a
          // div inside our screen)
          var write = document.getElementById('my_write');
          assert(write);
          assert.equal(write.parentNode.parentNode.id, 'screen1');

          idExistsOnScreen1('my_image_upload');
          idExistsOnScreen1('my_text_input');
          idExistsOnScreen1('my_text_label');
          idExistsOnScreen1('my_checkbox');
          idExistsOnScreen1('my_dropdown');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "switching screens works",
      editCode: true,
      xml:
        'button("button1", "my_button_text");' +
        'setScreen("screen2");' +
        'button("button2", "my_button_text");',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);
        assert.equal($("#designModeViz").children().length, 2, 'has two screen divs');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');

          assert.equal($('#divApplab #screen1').is(':visible'), false, 'screen1 is not visible');
          assert.equal($('#divApplab #screen2').is(':visible'), true, 'screen2 is visible');

          assert.equal($('#divApplab #button1').is(':visible'), false, 'button1 is not visible');
          assert.equal($('#divApplab #button2').is(':visible'), true, 'button2 is visible');

          assert.equal($('#divApplab #button1').parent().attr('id'), 'screen1', 'screen1 is parent of button1');
          assert.equal($('#divApplab #button2').parent().attr('id'), 'screen2', 'screen2 is parent of button2');

          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "stay on screen2 when entering code mode",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        var orange = 'rgb(255, 160, 0)';
        var white = 'rgb(255, 255, 255)';
        assert.equal(orange, $("#designModeButton").css('background-color'),
          'expected Design button (active) to have orange background.');
        assert.equal(white, $("#codeModeButton").css('background-color'),
          'expected Code button (inactive) to have white background.');
        // add a screen
        testUtils.dragToVisualization('SCREEN', 10, 10);
        validatePropertyRow(0, 'id', 'screen2', assert);
        assert.equal($('#designModeViz').is(':visible'), true, 'designModeViz is visible');
        assert.equal($('#design_screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#design_screen2')[0].style.display === 'none', false, 'screen 2 visible');

        // return to code mode
        $("#codeModeButton").click();
        assert.equal(white, $("#designModeButton").css('background-color'),
          'expected Design button (inactive) to have white background.');
        assert.equal(orange, $("#codeModeButton").css('background-color'),
          'expected Code button (active) to have orange background.');

        // should be on screen 2
        assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');
        assert.equal($('#divApplab #screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#divApplab #screen2')[0].style.display === 'none', false, 'screen 2 visible');

        // should be on screen 1 after run button click
        $("#runButton").click();
        assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');
        assert.equal($('#divApplab #screen1')[0].style.display === 'none', false, 'screen 1 visible');
        assert.equal($('#divApplab #screen2')[0].style.display === 'none', true, 'screen 2 hidden');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "running from design mode switches to default screen",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        // add a screen
        testUtils.dragToVisualization('SCREEN', 10, 10);
        validatePropertyRow(0, 'id', 'screen2', assert);
        assert.equal($('#designModeViz').is(':visible'), true, 'designModeViz is visible');
        assert.equal($('#design_screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#design_screen2')[0].style.display === 'none', false, 'screen 2 visible');

        // should be on screen 1 after run button click
        $("#runButton").click();
        assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');
        assert.equal($('#divApplab #screen1')[0].style.display === 'none', false, 'screen 1 visible');
        assert.equal($('#divApplab #screen2')[0].style.display === 'none', true, 'screen 2 hidden');

        // design toggle row still shows design mode
        var orange = 'rgb(255, 160, 0)';
        var white = 'rgb(255, 255, 255)';
        assert.equal(orange, $("#designModeButton").css('background-color'),
          'expected Design button (active) to have orange background.');
        assert.equal(white, $("#codeModeButton").css('background-color'),
          'expected Code button (inactive) to have white background.');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "switching to code mode while running in design mode doesn't change screen",
      editCode: true,
      xml: 'setScreen("screen2");',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();

        // add a screen
        testUtils.dragToVisualization('SCREEN', 10, 10);
        validatePropertyRow(0, 'id', 'screen2', assert);
        assert.equal($('#designModeViz').is(':visible'), true, 'designModeViz is visible');
        assert.equal($('#design_screen1')[0].style.display === 'none', true, 'screen 1 hidden');
        assert.equal($('#design_screen2')[0].style.display === 'none', false, 'screen 2 visible');
        assert.equal($('#design-mode-dimmed').length, 0, 'transparency layer not visible when designing');

        testUtils.runOnAppTick(Applab, 2, function () {
          // should be on screen 2 after run
          assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');
          assert.equal($('#divApplab #screen1')[0].style.display === 'none', true, 'screen 1 hidden after run');
          assert.equal($('#divApplab #screen2')[0].style.display === 'none', false, 'screen 2 visible after run');
          assert.equal($('#design-mode-dimmed').length, 1, 'transparency layer visible when running');

          // return to code mode, screen 2 still visible
          $("#codeModeButton").click();
          assert.equal($('#divApplab').is(':visible'), true, 'divApplab is visible');
          assert.equal($('#divApplab #screen1')[0].style.display === 'none', true, 'screen 1 hidden after code mode');
          assert.equal($('#divApplab #screen2')[0].style.display === 'none', false, 'screen 2 visible after code mode');

          // add a completion on timeout since this is a freeplay level
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "add/remove an element to a screen",
      editCode: true,
      xml: "",
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');

        testUtils.dragToVisualization('BUTTON', 10, 10);

        var button = $('#design_button1')[0];
        assert(button);

        var screenElement = $('#design_screen1')[0];

        assert.equal(screenElement.children.length, 1);

        var outerDiv = screenElement.children[0];
        assert($(outerDiv).hasClass('ui-resizable'), 'child is outer resizable div');

        assert(button.parentNode === outerDiv);

        var deleteButton = $("#design-properties button").eq(-1);
        assert.equal(deleteButton.text(), 'Delete');

        ReactTestUtils.Simulate.click(deleteButton[0]);

        // outdiv and child should have gone away
        assert.equal(screenElement.children.length, 0);

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "add a background",
      editCode: true,
      xml: "",
      runBeforeClick: function (assert) {
        // enter design mode
        var designModeButton = document.getElementById('designModeButton');

        $("#design_screen1").click();

        validatePropertyRow(0, 'id', 'screen1', assert);

        // take advantage of the fact that we expose the filesystem via
        // localhost:8001
        var assetUrl = '//localhost:8001/apps/static/flappy_promo.png';
        var imageInput = $("#design-properties input").eq(2)[0];

        ReactTestUtils.Simulate.change(imageInput, {
          target: { value: assetUrl }
        });

        var screenElement = document.getElementById('design_screen1');
        assert.equal(screenElement.style.backgroundImage, 'url(http:' + assetUrl + ')');

        assert.equal(screenElement.style.backgroundSize, '320px 450px', 'image stretched');

        // make sure dimensions didn't change
        assert.equal(screenElement.style.width, '320px');
        assert.equal(screenElement.style.height, '450px');

        // add a completion on timeout since this is a freeplay level
        testUtils.runOnAppTick(Applab, 2, function () {
          Applab.onPuzzleComplete();
        });
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },

    {
      description: "screen dropdown",
      editCode: true,
      xml: '',
      runBeforeClick: function (assert) {
        // enter design mode
        $("#designModeButton").click();
        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);
        assert.equal($("#designModeViz").children().length, 2, 'has two screen divs');
        validatePropertyRow(0, 'id', 'screen2', assert);

        assert.equal($("#screenSelector").children().length, 3);
        assert.equal($("#screenSelector").children().eq(2).text(), "New screen...");

        // New screen via dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'New screen...' } });

        assert.equal($("#designModeViz").children().length, 3, 'has three screen divs');
        assert.equal($("#screenSelector").children().length, 4);
        validatePropertyRow(0, 'id', 'screen3', assert);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "load a level with two screens",
      editCode: true,
      xml: '',
      levelHtml:
        '<div xmlns="http://www.w3.org/1999/xhtml" id="designModeViz" style="width: 320px; height: 450px; display: block;">' +
          '<div class="screen" tabindex="1" id="screen1" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
            '<button id="button1" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 160px; top: 70px; background-color: rgb(26, 188, 156);">Button</button>' +
          '</div>' +
          '<div class="screen" tabindex="1" id="screen2" style="display: none; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
            '<button id="button2" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); position: absolute; left: 185px; top: 65px; background-color: rgb(26, 188, 156);">Button</button>' +
          '</div>' +
        '</div>',
      runBeforeClick: function (assert) {
        assert.equal($("#divApplab").is(':visible'), true, 'divApplab is visible');
        assert.equal($("#divApplab").children().length, 2, 'code mode has two screen divs');
        assert.equal($("#divApplab #screen1 #button1").length, 1, 'code mode screen1 contains button1');
        assert.equal($("#divApplab #screen2 #button2").length, 1, 'code mode screen2 contains button2');

        // enter design mode
        $("#designModeButton").click();
        assert.equal($("#designModeViz").is(':visible'), true, 'designModeViz is visible');
        assert.equal($("#designModeViz").children().length, 2, 'design mode has two screen divs');
        assert.equal($("#designModeViz #design_screen1 #design_button1").length, 1, 'design mode screen1 contains button1');
        assert.equal($("#designModeViz #design_screen2 #design_button2").length, 1, 'design mode screen2 contains button2');
        assert.equal($("#propertyRowContainer button").last().text(), '', 'First screen should have no default button');
        assert.equal($("#propertiesBody button").last().text(), 'Delete', 'last button should be delete');

        // drag a new screen in
        testUtils.dragToVisualization('SCREEN', 10, 10);
        assert.equal($("#designModeViz").children().length, 3, 'has three screen divs');
        validatePropertyRow(0, 'id', 'screen3', assert);
        assert.equal($("#propertyRowContainer button").last().text(), 'Make Default', 'Third screen should have default button');
        assert.equal($("#propertiesBody button").last().text(), 'Delete', 'last button should be delete');

        assert.equal($("#screenSelector").children().length, 4);
        assert.equal($("#screenSelector").children().eq(3).text(), "New screen...");

        // New screen via dropdown
        ReactTestUtils.Simulate.change(document.getElementById('screenSelector'),
          { target: { value: 'New screen...' } });

        assert.equal($("#designModeViz").children().length, 4, 'has four screen divs');
        assert.equal($("#screenSelector").children().length, 5);
        assert.equal($("#propertyRowContainer button").last().text(), 'Make Default', 'New screen should have default button');
        assert.equal($("#propertiesBody button").last().text(), 'Delete', 'last button should be delete');
        validatePropertyRow(0, 'id', 'screen4', assert);

        Applab.onPuzzleComplete();
      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
    {
      description: "can load an run a level with bogus nested screens without javascript error",
      editCode: true,
      xml: 'setScreen("screen2");\n' +
        'write("<div class=\'screen\' id=\'myscreen\'></div>");\n' +
        'setScreen("myscreen");\n' +
        'button("mybutton", "My Button");\n',
      levelHtml: '' +
        '<div id="designModeViz" class="appModern withCrosshair" style="display: none; width: 320px; height: 450px;">' +
        '  <div class="screen" tabindex="1" id="screen1" style="height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
        '    <div class="screen" tabindex="1" id="screen2" style="display: none; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute;">' +
        '      <div class="screen" tabindex="1" id="screen3" style="display: block; height: 450px; width: 320px; left: 0px; top: 0px; position: absolute; z-index: 0;">' +
        '        <button id="button1" style="padding: 0px; margin: 0px; height: 30px; width: 80px; font-size: 14px; color: rgb(255, 255, 255); ' +
        '            position: absolute; left: 105px; top: 65px; background-color: rgb(26, 188, 156);">Button</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>',
      runBeforeClick: function (assert) {
        assert.equal($("#divApplab").is(':visible'), true, '#divApplab is visible');
        assert.equal($("#designModeButton").is(':visible'), true, '#designModeButton is visible');
        assert.equal($("#versions-header").is(':visible'), true, '#versions-header is visible');

        testUtils.runOnAppTick(Applab, 20, function () {
          assert.equal($("#screen1").is(':visible'), true, '#screen1 is visible');
          assert.equal($("#mybutton").is(':visible'), true, '#mybutton is visible');

          Applab.onPuzzleComplete();
        });

      },
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
    },
  ]
};
