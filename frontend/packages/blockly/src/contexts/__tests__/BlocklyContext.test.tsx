import {render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {PluginType} from '../../plugins';
import type {GlobalPlugin} from '../../plugins';
import {BlocklyProvider, useBlocklyContext} from '../BlocklyContext';

describe('workspace.md: BlocklyProvider', () => {
  it('WS-26: builds one Driver, and registers its plugins once, however often it renders', () => {
    const initialize = vi.fn();
    const plugin: GlobalPlugin = {type: PluginType.Global, initialize};
    const drivers: unknown[] = [];
    const Probe = () => {
      drivers.push(useBlocklyContext().driver?.current);
      return null;
    };
    const tree = () => (
      <BlocklyProvider plugins={[plugin]}>
        <Probe />
      </BlocklyProvider>
    );

    const {rerender} = render(tree());
    rerender(tree());
    rerender(tree());

    expect(new Set(drivers).size).toBe(1);
    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('WS-27: outside a provider the context has only a setTheme that does nothing', () => {
    const contexts: object[] = [];
    const Probe = () => {
      contexts.push(useBlocklyContext());
      return null;
    };
    render(<Probe />);
    expect(Object.keys(contexts[0])).toEqual(['setTheme']);
  });
});
