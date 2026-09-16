import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import Weblab2WidgetEmbed from '@cdo/apps/templates/markdown/Weblab2WidgetEmbed';

describe('Weblab2WidgetEmbed', () => {
  const getIframe = () => document.querySelector('iframe');

  it('builds a same-origin embed url from the widget id', () => {
    render(<Weblab2WidgetEmbed data-widget-id="pure-methods-visualizer" />);
    expect(getIframe()).toHaveAttribute(
      'src',
      '/widget2/pure-methods-visualizer/embed'
    );
  });

  it('uses data-title as the accessible name', () => {
    render(
      <Weblab2WidgetEmbed data-widget-id="viz" data-title="Array visualizer" />
    );
    expect(screen.getByTitle('Array visualizer')).toBeInTheDocument();
  });

  it('falls back to a non-empty name when data-title is missing or blank', () => {
    const {unmount} = render(<Weblab2WidgetEmbed data-widget-id="viz" />);
    expect(screen.getByTitle('Interactive widget: viz')).toBeInTheDocument();
    unmount();

    render(<Weblab2WidgetEmbed data-widget-id="viz" data-title="   " />);
    expect(screen.getByTitle('Interactive widget: viz')).toBeInTheDocument();
  });

  it.each([
    ['50', '200px'],
    ['9999', '2000px'],
    ['920', '920px'],
    ['abc', '920px'],
    [undefined, '920px'],
  ])('clamps data-height %s to %s', (given, expected) => {
    const {container} = render(
      <Weblab2WidgetEmbed data-widget-id="viz" data-height={given} />
    );
    expect(container.firstChild).toHaveStyle({height: expected});
  });

  it.each([
    '../../etc/passwd',
    'javascript:alert(1)',
    'https://evil.example',
    'foo/bar',
    'Foo',
    '-leading-dash',
    'a'.repeat(65),
  ])('refuses to build an iframe for widget id %s', widgetId => {
    render(<Weblab2WidgetEmbed data-widget-id={widgetId} />);
    expect(getIframe()).toBeNull();
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('reports a missing widget id', () => {
    render(<Weblab2WidgetEmbed />);
    expect(getIframe()).toBeNull();
    expect(screen.getByRole('note')).toHaveTextContent('no widget id given');
  });

  it('announces loading until the frame loads', () => {
    render(<Weblab2WidgetEmbed data-widget-id="viz" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.load(getIframe() as HTMLIFrameElement);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('applies data-max-width only when given', () => {
    const {container, unmount} = render(
      <Weblab2WidgetEmbed data-widget-id="viz" data-max-width="600px" />
    );
    expect(container.firstChild).toHaveStyle({maxWidth: '600px'});
    unmount();

    const {container: noMaxWidth} = render(
      <Weblab2WidgetEmbed data-widget-id="viz" />
    );
    expect((noMaxWidth.firstChild as HTMLElement).style.maxWidth).toBe('');
  });
});
