import styles from './worldPreview.module.css';

/**
 * The World Lab preview pane.
 *
 * This is a scaffold placeholder. The finished preview renders the student's
 * project as a web-based iframe running a Phaser 4 game world — much like
 * web-lab's `HTMLPreview`, and with the same origin-isolation concern: student
 * code must not run on the lab's own origin, where it could reach the lab's
 * cookies or session.
 *
 * The next increment wires this up:
 *
 *  1. Read the current project's sources from the Codebridge shell.
 *  2. Serve them to an iframe on a separate preview origin (web-lab does this
 *     with a service worker; the same machinery, or a variant, applies here).
 *  3. Boot the Phaser 4 game inside that iframe from the project's entry file.
 *
 * Until then this renders an inert placeholder iframe so the layout — the
 * editor/preview split, the resize handles, the view-mode buttons — is real and
 * can be built against.
 */
const PLACEHOLDER = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, sans-serif;
        color: #667;
        background: #f5f6f8;
      }
      p { max-width: 22rem; text-align: center; line-height: 1.5; }
    </style>
  </head>
  <body>
    <p>World preview &mdash; the Phaser&nbsp;4 game world will render here.</p>
  </body>
</html>`;

export const WorldPreview = () => (
  <iframe
    className={styles.preview}
    title="World preview"
    // Placeholder content, served inline. The real preview will point this at a
    // separate preview origin serving the student's project (see the file
    // header). `sandbox` keeps even the placeholder from touching this origin.
    sandbox=""
    srcDoc={PLACEHOLDER}
  />
);
