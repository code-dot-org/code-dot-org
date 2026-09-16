import styles from './badges.module.scss';

export default function printCards(element, title, onClose) {
  const frame = document.createElement('iframe');
  frame.className = styles.printFrame;
  frame.title = title;
  document.body.appendChild(frame);
  let cancelled = false;
  const cleanup = () => {
    cancelled = true;
    frame.remove();
  };
  frame.addEventListener(
    'load',
    async () => {
      await frame.contentDocument.fonts?.ready;
      if (!cancelled) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      }
    },
    {once: true}
  );
  const doc = frame.contentDocument;
  doc.open();
  doc.write('<!doctype html><html><head></head><body></body></html>');
  doc.title = title;
  document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => {
    doc.head.appendChild(style.cloneNode(true));
  });
  doc.body.appendChild(element.cloneNode(true));
  frame.contentWindow.addEventListener(
    'afterprint',
    () => {
      cleanup();
      onClose();
    },
    {once: true}
  );
  doc.close();
  return cleanup;
}
