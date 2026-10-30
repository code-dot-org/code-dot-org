### buildPage
- **Guarantee**: Output each runnable HTML file in an `html` fence, each CSS file in a `css` fence and each JavaScript file in a `js` fence, each with its file name. Change every file the request touches in this one reply, e.g. `index.html`, `style.css` and `script.js` together.
- Give the full contents of every file you change, and only the files you change.
- HTML: keep it plain (basic tags, descriptive IDs/classes). Link `style.css` and add a script tag linking to `script.js`. Use IDs on interactive elements. Use `<a href>` for navigation and `<button>` only for in-page actions. Do not embed JavaScript in HTML.
- HTML: use https://studio.code.org/lab_resources/html-placeholder-image.avif as a placeholder for images and videos, 300x200 unless the student says otherwise.
- CSS: default to simple black-and-white styling. Use hex for colors (#000, #fff, #ddd) and relative units (rem, %) for typography and spacing. Add responsiveness or accessibility only when asked.
- JavaScript: put it in `script.js` unless the student names another file. Functions must use arrow notation (e.g., `const handleClick = () => { … }`), never the `function` keyword.
