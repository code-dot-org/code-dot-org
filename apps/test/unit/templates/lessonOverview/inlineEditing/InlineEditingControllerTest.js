import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

// EnhancedSafeMarkdown is Redux-connected; mocking react-dom/client's
// createRoot keeps the test focused on the controller's behavior (DOM swap,
// PATCH wiring) without dragging in the entire Redux provider tree.
jest.mock('react-dom/client', () => ({
  createRoot: () => ({render: () => {}, unmount: () => {}}),
}));

const {
  enable,
  disable,
  __TEST_ONLY__,
} = require('@cdo/apps/templates/lessonOverview/inlineEditing/InlineEditingController');

const {parseIdentifier, MARKDOWN_RENDERED} = __TEST_ONLY__;

describe('InlineEditingController', () => {
  describe('parseIdentifier', () => {
    it('parses a well-formed identifier into {model, recordId, field}', () => {
      expect(parseIdentifier('Lesson:42:overview')).to.eql({
        model: 'Lesson',
        recordId: '42',
        field: 'overview',
      });
      expect(parseIdentifier('ActivitySection:7:description')).to.eql({
        model: 'ActivitySection',
        recordId: '7',
        field: 'description',
      });
    });

    it('returns null for malformed identifiers', () => {
      [
        null,
        undefined,
        '',
        'Lesson:overview',
        ':42:overview',
        'Lesson::overview',
        'Lesson:not-a-number:overview',
        42,
        'Lesson:42:overview:extra',
      ].forEach(bad => {
        expect(
          parseIdentifier(bad),
          `expected ${JSON.stringify(bad)} to parse as null`
        ).to.be.null;
      });
    });
  });

  describe('MARKDOWN_RENDERED set matches the server allowlist', () => {
    it('covers every (model, field) pair the server applies MarkdownPreprocessor to', () => {
      // Mirrors Services::LessonInlineEditing::MARKDOWN_RENDERED_FIELDS. If these
      // ever drift, on-save re-rendering produces output that does not match the
      // initial page load — the server-side fields are the source of truth.
      const expected = [
        'Lesson:overview',
        'Lesson:purpose',
        'Lesson:preparation',
        'Lesson:assessment_opportunities',
        'ActivitySection:description',
      ];
      expected.forEach(
        key => expect(MARKDOWN_RENDERED.has(key), `missing ${key}`).to.be.true
      );
      expect(MARKDOWN_RENDERED.size).to.equal(expected.length);
    });
  });

  describe('enable / disable lifecycle', () => {
    afterEach(() => {
      disable();
    });

    it('adds and removes the active body class', () => {
      expect(document.body.classList.contains('lesson-inline-editing-active'))
        .to.be.false;
      enable(123);
      expect(document.body.classList.contains('lesson-inline-editing-active'))
        .to.be.true;
      disable();
      expect(document.body.classList.contains('lesson-inline-editing-active'))
        .to.be.false;
    });

    it('is idempotent — repeat enable/disable calls do not double-register', () => {
      enable(123);
      enable(123);
      enable(123);
      // Body class still present, single registration: a disable call cleans it.
      expect(document.body.classList.contains('lesson-inline-editing-active'))
        .to.be.true;
      disable();
      expect(document.body.classList.contains('lesson-inline-editing-active'))
        .to.be.false;
    });
  });

  describe('click → editor → save flow', () => {
    let fetchStub;
    let region;

    beforeEach(() => {
      fetchStub = sinon.stub(window, 'fetch');
      // Set up the page state our controller expects.
      document.body.innerHTML =
        '<meta name="csrf-token" content="test-token"/>' +
        '<div id="root">' +
        '<div data-editable-field="Lesson:1:overview">' +
        '<p>rendered overview</p>' +
        '</div></div>';
      region = document.querySelector('[data-editable-field]');
      enable(1);
    });

    afterEach(() => {
      disable();
      fetchStub.restore();
      document.body.innerHTML = '';
    });

    it('opens a textarea seeded with the raw source on click', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({value: 'raw markdown source'}),
      });

      region.click();
      await flushPromises();

      const textarea = region.querySelector('textarea');
      expect(textarea, 'expected a textarea to be inserted').to.exist;
      expect(textarea.value).to.equal('raw markdown source');
      expect(fetchStub.calledOnce).to.be.true;
      const [url] = fetchStub.firstCall.args;
      expect(url).to.include('/lessons/1/inline_field?');
      expect(url).to.include('model=Lesson');
      expect(url).to.include('record_id=1');
      expect(url).to.include('field=overview');
    });

    it('on blur with unchanged content, restores original DOM and does not PATCH', async () => {
      fetchStub.resolves({
        ok: true,
        json: async () => ({value: 'raw markdown source'}),
      });

      region.click();
      await flushPromises();

      const textarea = region.querySelector('textarea');
      // Same value as loaded: simulate blur without modification.
      textarea.dispatchEvent(new window.Event('blur'));
      await flushPromises();

      expect(region.querySelector('textarea')).to.be.null;
      expect(region.querySelector('p')?.textContent).to.equal(
        'rendered overview'
      );
      // Only the GET happened, no PATCH.
      expect(fetchStub.calledOnce).to.be.true;
    });

    it('on blur with changed content, PATCHes and re-renders', async () => {
      fetchStub.onFirstCall().resolves({
        ok: true,
        json: async () => ({value: 'raw markdown source'}),
      });
      fetchStub.onSecondCall().resolves({
        ok: true,
        json: async () => ({
          value: 'edited typo fix',
          rendered_source: 'edited typo fix',
        }),
      });

      region.click();
      await flushPromises();

      const textarea = region.querySelector('textarea');
      textarea.value = 'edited typo fix';
      textarea.dispatchEvent(new window.Event('blur'));
      await flushPromises();

      expect(fetchStub.calledTwice).to.be.true;
      const [url, options] = fetchStub.secondCall.args;
      expect(url).to.equal('/lessons/1/inline_field');
      expect(options.method).to.equal('PATCH');
      const body = JSON.parse(options.body);
      expect(body).to.eql({
        model: 'Lesson',
        record_id: '1',
        field: 'overview',
        value: 'edited typo fix',
      });
    });

    it('opens a second edit on the same region without errors after a prior save', async () => {
      // Reproduces the "removeChild ... not a child of this node" crash that
      // happened when a second click on the same region tried to mutate DOM
      // owned by the React root mounted during the first save.
      // First edit: fetch raw, change, save.
      fetchStub.onCall(0).resolves({
        ok: true,
        json: async () => ({value: 'original'}),
      });
      fetchStub.onCall(1).resolves({
        ok: true,
        json: async () => ({
          value: 'first edit',
          rendered_source: 'first edit',
        }),
      });
      // Second edit: fetch raw again, then change & save.
      fetchStub.onCall(2).resolves({
        ok: true,
        json: async () => ({value: 'first edit'}),
      });
      fetchStub.onCall(3).resolves({
        ok: true,
        json: async () => ({
          value: 'second edit',
          rendered_source: 'second edit',
        }),
      });

      region.click();
      await flushPromises();
      let textarea = region.querySelector('textarea');
      textarea.value = 'first edit';
      textarea.dispatchEvent(new window.Event('blur'));
      await flushPromises();

      // Second click on the same region — must not throw.
      region.click();
      await flushPromises();
      textarea = region.querySelector('textarea');
      expect(textarea, 'second edit should re-open the textarea').to.exist;
      expect(textarea.value).to.equal('first edit');

      textarea.value = 'second edit';
      textarea.dispatchEvent(new window.Event('blur'));
      await flushPromises();

      // Four fetches total: GET, PATCH, GET, PATCH.
      expect(fetchStub.callCount).to.equal(4);
    });

    it('on PATCH failure, keeps the textarea open with the error message', async () => {
      fetchStub.onFirstCall().resolves({
        ok: true,
        json: async () => ({value: 'raw markdown source'}),
      });
      fetchStub.onSecondCall().resolves({
        ok: false,
        status: 422,
        json: async () => ({error: 'something went wrong on the server'}),
      });

      region.click();
      await flushPromises();

      const textarea = region.querySelector('textarea');
      textarea.value = 'edited but server rejects';
      textarea.dispatchEvent(new window.Event('blur'));
      await flushPromises();

      // Textarea is still there with the user's value.
      expect(region.querySelector('textarea')).to.exist;
      expect(region.querySelector('textarea').value).to.equal(
        'edited but server rejects'
      );
      const error = region.querySelector('.inline-editing-error');
      expect(error).to.exist;
      expect(error.textContent).to.include(
        'something went wrong on the server'
      );
    });
  });
});

// Helper: jsdom microtasks need to flush before assertions on async work.
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
