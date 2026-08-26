import {render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {MCP_APPS_PROTOCOL_VERSION} from '../types';
import WidgetFrame from '../WidgetFrame';

// jsdom gives an <iframe srcDoc> a real contentWindow, so these tests drive
// the actual postMessage listener bound in WidgetFrame — not a reimplemented
// stand-in — by dispatching MessageEvents on `window` with `source` set to
// that contentWindow, exactly like a sandboxed widget would.
function postToHost(contentWindow: Window, data: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', {data, source: contentWindow}),
  );
}

describe('WidgetFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers a ui/initialize request from the widget', async () => {
    const {container} = render(<WidgetFrame html="<html></html>" />);
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;
    const postMessage = vi.spyOn(contentWindow, 'postMessage');

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      id: 1,
      method: 'ui/initialize',
      params: {},
    });

    await waitFor(() => expect(postMessage).toHaveBeenCalled());
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: '2.0',
        id: 1,
        result: expect.objectContaining({
          protocolVersion: MCP_APPS_PROTOCOL_VERSION,
          hostContext: expect.objectContaining({theme: 'light'}),
        }),
      }),
      '*',
    );
  });

  it('delivers tool-input and tool-result once the widget declares readiness', async () => {
    const {container} = render(
      <WidgetFrame
        html="<html></html>"
        toolInput={{question: 'What is 2+2?'}}
        toolResult={{answer: 4}}
      />,
    );
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;
    const postMessage = vi.spyOn(contentWindow, 'postMessage');

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      method: 'ui/notifications/initialized',
    });

    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'ui/notifications/tool-input',
          params: {arguments: {question: 'What is 2+2?'}},
        }),
        '*',
      ),
    );
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'ui/notifications/tool-result',
        params: {answer: 4},
      }),
      '*',
    );
  });

  it('routes a widget-initiated tools/call through onToolCall', async () => {
    const onToolCall = vi.fn().mockResolvedValue({ok: true});
    const {container} = render(
      <WidgetFrame html="<html></html>" onToolCall={onToolCall} />,
    );
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;
    const postMessage = vi.spyOn(contentWindow, 'postMessage');

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {name: 'grade_answer', arguments: {value: 4}},
    });

    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({id: 7, result: {ok: true}}),
        '*',
      ),
    );
    expect(onToolCall).toHaveBeenCalledWith('grade_answer', {value: 4});
  });

  it('rejects tools/call by default when no onToolCall is supplied', async () => {
    const {container} = render(<WidgetFrame html="<html></html>" />);
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;
    const postMessage = vi.spyOn(contentWindow, 'postMessage');

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {name: 'x', arguments: {}},
    });

    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 9,
          error: expect.objectContaining({code: -32000}),
        }),
        '*',
      ),
    );
  });

  it('forwards ui/update-model-context to onModelContextUpdate', async () => {
    const onModelContextUpdate = vi.fn();
    const {container} = render(
      <WidgetFrame
        html="<html></html>"
        onModelContextUpdate={onModelContextUpdate}
      />,
    );
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      id: 2,
      method: 'ui/update-model-context',
      params: {structuredContent: {selected: 'B'}},
    });

    await waitFor(() =>
      expect(onModelContextUpdate).toHaveBeenCalledWith({
        structuredContent: {selected: 'B'},
      }),
    );
  });

  it('ignores messages that are not from the mounted iframe', async () => {
    const {container} = render(<WidgetFrame html="<html></html>" />);
    const iframe = container.querySelector('iframe')!;
    const postMessage = vi.spyOn(iframe.contentWindow!, 'postMessage');

    // No `source`, so this looks like a message from anywhere else on the
    // page — WidgetFrame must not treat it as coming from its own widget.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {jsonrpc: '2.0', id: 1, method: 'ui/initialize', params: {}},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('clamps the reported size between minHeight and maxHeight', async () => {
    const {container} = render(
      <WidgetFrame html="<html></html>" minHeight={100} maxHeight={300} />,
    );
    const iframe = container.querySelector('iframe')!;
    const contentWindow = iframe.contentWindow!;

    postToHost(contentWindow, {
      jsonrpc: '2.0',
      method: 'ui/notifications/size-changed',
      params: {height: 9999},
    });

    await waitFor(() => expect(iframe.style.height).toBe('300px'));
  });
});
