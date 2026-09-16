import printCards from '@cdo/apps/templates/badges/printCards';

it('copies SVG codes and removes the private frame after printing', async () => {
  const cards = document.createElement('div');
  cards.innerHTML =
    '<section><h2>Student</h2><svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z" /></svg></section>';
  const onClose = jest.fn();
  const cleanup = printCards(cards, 'Badges', onClose);
  const frame = document.querySelector('iframe');
  frame.contentWindow.focus = jest.fn();
  frame.contentWindow.print = jest.fn();
  expect(frame.contentDocument.querySelector('svg').outerHTML).toBe(
    cards.querySelector('svg').outerHTML
  );
  expect(frame.contentDocument.title).toBe('Badges');
  frame.dispatchEvent(new Event('load'));
  await Promise.resolve();
  expect(frame.contentWindow.print).toHaveBeenCalledTimes(1);
  frame.contentWindow.dispatchEvent(new Event('afterprint'));
  expect(document.querySelector('iframe')).toBeNull();
  expect(onClose).toHaveBeenCalledTimes(1);
  cleanup();
});
