import {getHtmlLintDiagnostics} from './htmlLintDiagnostics';
import type {HtmlLintRequest, HtmlLintResponse} from './htmlLinter';

onmessage = (event: MessageEvent<HtmlLintRequest>) => {
  const {id, source} = event.data;
  const response: HtmlLintResponse = {
    id,
    diagnostics: getHtmlLintDiagnostics(source),
  };
  postMessage(response);
};
