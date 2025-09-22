import Localizer from '@codebridge/Localizer';
import Tokenizr from 'tokenizr';

import {ProjectFile} from '@cdo/apps/lab2/types';
import localization from '@cdo/apps/localization';

/**
 * This localizes Python source code.
 */
class PythonLocalizer extends Localizer {
  localize(file: ProjectFile) {
    if (file.language !== 'py') {
      return file;
    }

    // Only localize if we are using LocalizeJS and we are currently viewing
    // with a language that is not some form of English
    if (!localization.isLocalizeJS() || localization.locale.startsWith('en')) {
      return file;
    }

    const code = file.contents;

    const tokenizer = new Tokenizr();

    // Keywords
    tokenizer.rule(/\bif\b|\belif\b|\belse\b|\bdef\b/, (ctx, match) => {
      ctx.accept('keyword', match[0]);
    });

    // Match boolean literals
    tokenizer.rule(/\bTrue\b|\bFalse\b/, (ctx, match) => {
      ctx.accept('boolean', match[0] === 'True');
    });

    tokenizer.rule(/\bNone\b/, (ctx, _match) => {
      ctx.accept('none');
    });

    // Match string literals
    tokenizer.rule(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, (ctx, match) =>
      ctx.accept('string', match[0])
    );

    // Match comments
    tokenizer.rule(/#[^\n]*/, (ctx, match) => ctx.accept('comment', match[0]));
    tokenizer.rule(/'''[\s\S]*?'''|"""[\s\S]*?"""/, (ctx, match) =>
      ctx.accept('comment', match[0])
    );

    // Match numbers
    tokenizer.rule(/\b[+-]?\d+(\.\d+)?\b/, (ctx, match) => {
      ctx.accept('number', parseInt(match[0]));
    });

    // Match identifiers (variable names, function names, etc.)
    tokenizer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
      ctx.accept('identifier', match[0]);
    });

    // Match operators
    tokenizer.rule(/==|!=|<=|>=|<|>|\+|\-|\*|\/|%|\=\=/, (ctx, match) => {
      ctx.accept('operator', match[0]);
    });

    // Match punctuation
    tokenizer.rule(/[(){}\[\],.:;]/, (ctx, match) => {
      ctx.accept('punctuation', match[0]);
    });

    // Ignore whitespace
    tokenizer.rule(/[ \t\r\n]+/, (ctx, _match) => {
      ctx.ignore();
    });

    // Just put any characters we do not otherwise understand down the drain
    tokenizer.rule(/./, (ctx, _match) => {
      ctx.ignore();
    });

    // Parse the starter code
    tokenizer.input(code);

    // Keep track of the position difference as we go
    let adjustedPosition = 0;
    let localized = code;
    try {
      tokenizer.tokens().forEach(token => {
        // Get the actual text content for the different localizable tokens
        const content =
          token.type === 'string'
            ? token.value.substring(1, token.value.length - 1).trim()
            : token.type === 'comment'
            ? token.value.substring(1).trim()
            : undefined;

        // Get the localized versions
        const localizedRaw =
          content !== undefined
            ? localization.translate(`[${token.type}] ${content}`, [
                `python-${token.type}`,
              ])
            : undefined;

        const localizedContent = localizedRaw?.startsWith(`[${token.type}] `)
          ? localizedRaw?.substring(token.type.length + 3) || content
          : content;

        console.log('PYTHONLAB LOCALIZATION', localizedRaw, localizedContent);

        if (
          localizedRaw !== undefined &&
          !(localizedRaw || '').startsWith(`[${token.type}] `)
        ) {
          console.warn(
            'Python localization failed since translated string does not start with the appropriate magic word.',
            token.type,
            content,
            localizedContent
          );
        }

        // Reform the token content with the localized strings
        const replaceWith =
          token.type === 'string'
            ? `${token.value[0]}${localizedContent || ''}${token.value[0]}`
            : token.type === 'comment'
            ? `# ${localizedContent?.trim() || ''}`
            : undefined;

        // Replace the content, if necessary
        if (replaceWith !== undefined) {
          localized =
            localized.substring(0, token.pos - adjustedPosition) +
            replaceWith +
            localized.substring(
              token.pos - adjustedPosition + token.value.length
            );

          // Readjust positions for tokens after this substitution
          adjustedPosition += token.value.length - replaceWith.length;
        }
      });
    } catch (err) {
      // Ignore any unlikely errors during tokenization
    }

    // Parse the python content
    return {
      ...file,
      contents: localized,
    };
  }
}

export default PythonLocalizer;
