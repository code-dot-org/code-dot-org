// Stand-in for a screenshot of the student's project, rendered live in a
// scaled-down iframe until real project thumbnails exist.

export const SAMPLE_PROJECT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Georgia, serif; color: #3b2a1a; background: #fff8ee; }
      header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: #f4c95d; }
      .brand { font-weight: bold; font-size: 20px; }
      nav a { margin-left: 20px; color: #3b2a1a; text-decoration: none; }
      .hero { padding: 72px 32px; text-align: center; background: linear-gradient(180deg, #f4c95d 0%, #fff8ee 100%); }
      .hero h1 { font-size: 44px; margin: 0 0 12px; }
      .button { display: inline-block; margin-top: 16px; padding: 12px 24px; border-radius: 999px; background: #3b2a1a; color: #fff8ee; }
      .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 32px; }
      .cards article { padding: 24px; border-radius: 12px; background: #fff; box-shadow: 0 4px 16px rgba(59, 42, 26, 0.08); }
      .cards h2 { margin-top: 0; }
    </style>
  </head>
  <body>
    <header>
      <div class="brand">My Website</div>
      <nav><a>Menu</a><a>Our Story</a><a>Visit</a></nav>
    </header>
    <section class="hero">
      <h1>Fresh every morning.</h1>
      <p>Sourdough, croissants, and cinnamon rolls baked before sunrise.</p>
      <span class="button">See the menu</span>
    </section>
    <section class="cards">
      <article><h2>Sourdough</h2><p>A 24-hour rise and a crackling crust.</p></article>
      <article><h2>Croissants</h2><p>Butter, folded 27 times.</p></article>
      <article><h2>Cinnamon Rolls</h2><p>Still warm at 7am. Gone by 9.</p></article>
    </section>
  </body>
</html>`;

export const DEFAULT_PROJECT_TITLE = 'My Website';
export const DEFAULT_PROJECT_DESCRIPTION =
  'Add details about your project vision here!';
