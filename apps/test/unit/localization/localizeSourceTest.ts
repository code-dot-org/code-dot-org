import localization from '@cdo/apps/localization';
import {localizeSource} from '@cdo/apps/localization/localizeSource';

// Configure localization.translate to use `mapping` for string lookups,
// returning the input unchanged on a miss. Other input shapes (arrays,
// elements, hashes) are returned untouched — localizeSource only ever
// invokes the string overload.
const mockTranslate = (mapping: Record<string, string> = {}) => {
  jest.spyOn(localization, 'translate').mockImplementation(((key: unknown) => {
    if (typeof key === 'string') {
      return mapping[key] ?? key;
    }
    return key;
  }) as typeof localization.translate);
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('localizeSource', () => {
  describe('parse failure', () => {
    it('returns source unchanged when input is not valid JS', () => {
      mockTranslate();
      const xml = '<xml><block type="foo"/></xml>';
      expect(localizeSource(xml)).toBe(xml);
    });

    it('returns source unchanged for an empty string', () => {
      mockTranslate();
      expect(localizeSource('')).toBe('');
    });
  });

  describe('bare string literals', () => {
    it('translates a bare string literal', () => {
      mockTranslate({hello: 'hola'});
      expect(localizeSource('var x = "hello";')).toBe('var x = "hola";');
    });

    it('leaves source byte-identical when the translator is a no-op', () => {
      mockTranslate();
      const src = 'var x = "hello";\nvar y = "world";';
      expect(localizeSource(src)).toBe(src);
    });

    it('re-escapes special characters via JSON.stringify', () => {
      mockTranslate({hello: 'a "quoted" \\ \n value'});
      expect(localizeSource('var x = "hello";')).toBe(
        'var x = "a \\"quoted\\" \\\\ \\n value";'
      );
    });

    it('passes opts.labels through to localization.translate', () => {
      const spy = jest
        .spyOn(localization, 'translate')
        .mockImplementation(
          ((key: unknown) => key) as typeof localization.translate
        );
      localizeSource('var x = "hello";', {labels: ['ctx-A', 'ctx-B']});
      expect(spy).toHaveBeenCalledWith('hello', ['ctx-A', 'ctx-B']);
    });

    it('skips object property keys but translates values', () => {
      mockTranslate({foo: 'BAR', baz: 'QUX'});
      expect(localizeSource('var o = {"foo": "baz"};')).toBe(
        'var o = {"foo": "QUX"};'
      );
    });

    it('skips class method keys', () => {
      mockTranslate({foo: 'BAR'});
      const src = 'class X { "foo"() { return 1; } }';
      expect(localizeSource(src)).toBe(src);
    });

    it('skips switch case discriminants', () => {
      mockTranslate({red: 'rojo'});
      const src = 'switch (c) { case "red": break; }';
      expect(localizeSource(src)).toBe(src);
    });

    it('skips computed member access keys', () => {
      mockTranslate({foo: 'BAR'});
      expect(localizeSource('var v = obj["foo"];')).toBe('var v = obj["foo"];');
    });

    it('skips require() module specifiers', () => {
      mockTranslate({fs: 'sistema'});
      expect(localizeSource('var f = require("fs");')).toBe(
        'var f = require("fs");'
      );
    });

    it('skips identical-translation cases without rewriting', () => {
      mockTranslate({hello: 'hello'});
      // Verifies the early-return on translated === value keeps the
      // source byte-identical (no spurious quote-style change, etc.).
      const src = "var x = 'hello';";
      expect(localizeSource(src)).toBe(src);
    });
  });

  describe('+ chain rewrites', () => {
    it('rewrites a literal + identifier chain', () => {
      mockTranslate({'Word: %1': 'Palabra: %1'});
      expect(localizeSource('var s = "Word: " + name;')).toBe(
        'var s = "Palabra: " + (name);'
      );
    });

    it('reorders placeholders to match the translation', () => {
      mockTranslate({'%1 then %2': '%2 first, %1 second'});
      expect(localizeSource('var s = a + " then " + b;')).toBe(
        'var s = (b) + " first, " + (a) + " second";'
      );
    });

    it('coalesces adjacent string-literal operands before translating', () => {
      const spy = jest
        .spyOn(localization, 'translate')
        .mockImplementation(
          ((key: unknown) => key) as typeof localization.translate
        );
      localizeSource('var s = "foo" + "bar" + x;');
      expect(spy).toHaveBeenCalledWith('foobar%1', []);
    });

    it('preserves numeric prefix semantics for 1 + 2 + "x"', () => {
      mockTranslate({'%1x': '%1y'});
      // Anything left of the first string literal is collapsed into one
      // opaque operand; `1 + 2` stays as a numeric add, not as two
      // separate placeholders.
      expect(localizeSource('var s = 1 + 2 + "x";')).toBe(
        'var s = (1 + 2) + "y";'
      );
    });

    it('leaves an unchanged chain byte-identical when translation matches format', () => {
      mockTranslate();
      const src = 'var s = "a " + x + " b";';
      expect(localizeSource(src)).toBe(src);
    });

    it('does not double-patch a literal that is also a chain operand', () => {
      // Regression: walk.ancestor fires children before parents, so an
      // earlier implementation that tracked "consumed" operands at the
      // BinaryExpression visit added the standalone-literal patch
      // first, producing two overlapping patches that corrupted the
      // splice. The current parent-is-+ guard prevents the bare-literal
      // patch from ever being registered.
      mockTranslate({
        'hello ': 'DOUBLE_PATCH',
        'hello %1': 'hola %1',
      });
      expect(localizeSource('var s = "hello " + name;')).toBe(
        'var s = "hola " + (name);'
      );
    });

    it('wraps each placeholder expression in parens for precedence safety', () => {
      // a * b binds tighter than + so the parens aren't strictly
      // necessary, but always emitting them keeps the rewrite robust
      // regardless of the placeholder expression's operator precedence.
      mockTranslate({'val: %1': 'X: %1'});
      expect(localizeSource('var s = "val: " + (a * b);')).toBe(
        'var s = "X: " + (a * b);'
      );
    });
  });

  describe('exclude (string-value Set)', () => {
    it('skips a bare literal whose value is in the set', () => {
      mockTranslate({hello: 'hola'});
      const src = 'var x = "hello";';
      expect(localizeSource(src, {exclude: ['hello']})).toBe(src);
    });

    it('treats an excluded literal in a chain as a non-literal placeholder', () => {
      // "myId" is excluded — it shouldn't reach the translator, but
      // its source text should survive in the rewritten chain. The
      // surrounding "start" and "end" literals sit on either side so
      // they don't get coalesced together.
      const spy = jest.spyOn(localization, 'translate').mockImplementation(((
        key: unknown
      ) => {
        if (typeof key === 'string' && key === 'start%1end') {
          return 'START %1 END';
        }
        return key;
      }) as typeof localization.translate);
      const out = localizeSource('var s = "start" + "myId" + "end";', {
        exclude: ['myId'],
      });
      expect(spy).toHaveBeenCalledWith('start%1end', []);
      expect(out).toBe('var s = "START " + ("myId") + " END";');
    });

    it('leaves a chain alone if every string operand is excluded', () => {
      mockTranslate();
      const src = 'var s = "a" + "b";';
      expect(localizeSource(src, {exclude: ['a', 'b']})).toBe(src);
    });
  });

  describe('excludeCallArgs', () => {
    it('skips a bare-literal argument at the configured position', () => {
      mockTranslate({click: 'clic'});
      const src = 'onEvent("btn", "click", fn);';
      expect(localizeSource(src, {excludeCallArgs: {onEvent: [1]}})).toBe(src);
    });

    it('skips a + chain argument at the configured position', () => {
      mockTranslate({'cl%1ck': 'CL%1CK'});
      const src = 'onEvent("btn", "cl" + middle + "ck", fn);';
      expect(localizeSource(src, {excludeCallArgs: {onEvent: [1]}})).toBe(src);
    });

    it('still translates strings at non-excluded positions of the same call', () => {
      mockTranslate({click: 'clic', label: 'etiqueta'});
      const out = localizeSource('onEvent("btn", "click", "label");', {
        excludeCallArgs: {onEvent: [1]},
      });
      // "click" (pos 1) is excluded; "label" (pos 2) is translated.
      // ("btn" at pos 0 is left to the standard pipeline.)
      expect(out).toBe('onEvent("btn", "click", "etiqueta");');
    });

    it('matches by trailing identifier for member-expression callees', () => {
      mockTranslate({log: 'registro'});
      const src = 'console.log("log");';
      // "log" callee name matches { log: [0] }, so the first arg is
      // skipped even though it's accessed via console.log.
      expect(localizeSource(src, {excludeCallArgs: {log: [0]}})).toBe(src);
    });

    it('does not match dynamically-computed callees', () => {
      mockTranslate({hello: 'hola'});
      // Callee is `fns["foo"]` — computed member access, no trailing
      // identifier we can pin down, so the position config doesn't
      // apply and "hello" gets translated.
      const out = localizeSource('fns["foo"]("hello");', {
        excludeCallArgs: {foo: [0]},
      });
      expect(out).toBe('fns["foo"]("hola");');
    });
  });

  describe('excludeLinesStartingWith', () => {
    it('skips all literals on a matching line', () => {
      mockTranslate({a: 'A', b: 'B', c: 'C'});
      const src = ['var keep = ["a", "b"];', 'var translateMe = "c";'].join(
        '\n'
      );
      const out = localizeSource(src, {
        excludeLinesStartingWith: ['var keep'],
      });
      expect(out).toBe(
        ['var keep = ["a", "b"];', 'var translateMe = "C";'].join('\n')
      );
    });

    it('matches the prefix after leading whitespace', () => {
      mockTranslate({a: 'A'});
      const src = '    var data = ["a"];';
      expect(
        localizeSource(src, {excludeLinesStartingWith: ['var data']})
      ).toBe(src);
    });

    it('skips a chain whose start lies on a matching line', () => {
      mockTranslate({'hello %1': 'hola %1'});
      const src = 'var x = "hello " + name;';
      expect(localizeSource(src, {excludeLinesStartingWith: ['var x']})).toBe(
        src
      );
    });

    it('does not affect lines that do not match any prefix', () => {
      mockTranslate({hello: 'hola', world: 'mundo'});
      const src = ['var skip = "hello";', 'var go = "world";'].join('\n');
      const out = localizeSource(src, {
        excludeLinesStartingWith: ['var skip'],
      });
      expect(out).toBe(['var skip = "hello";', 'var go = "mundo";'].join('\n'));
    });

    it('handles a file with no trailing newline', () => {
      mockTranslate({a: 'A'});
      const src = 'var x = "a";';
      expect(localizeSource(src, {excludeLinesStartingWith: ['var x']})).toBe(
        src
      );
    });
  });
});
