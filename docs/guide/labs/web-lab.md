---
title: Web Lab
description: Reference for the Web Lab workspace — the file tree, code editor, preview pane, and file management.
type: reference
---

Web Lab is an HTML and CSS editor for building web pages. The workspace has a file tree on the left, a code editor in the center, and a live preview pane on the right. Student code runs in a sandboxed iframe on a separate domain from the main site, so it cannot access session cookies.

For tasks common to all levels, see [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/).

## File tree

The file tree lists the project's HTML, CSS, and image files. Select a file to open it in the code editor. The tree always contains at least `index.html`.

### Adding files

Select the **Add File** button above the file tree to create a new HTML file, a new CSS file, or upload an image. Uploaded images appear in the tree and can be referenced by `src` in `<img>` tags.

### Renaming and deleting files

Right-click a file in the tree (or use the context menu) to rename or delete it. Deleting a file removes it permanently from the project. Renaming a file does not update references to it in your code.

## Code editor

The code editor provides syntax highlighting for HTML and CSS. There is no autocomplete or block mode — all code is typed as text. The editor supports undo (Ctrl+Z / Cmd+Z) and redo.

## Preview pane

Select **Refresh** above the preview pane to render the current files. The preview loads `index.html` as the entry point. Links (`<a href="...">`) between pages in the project work inside the preview.

The preview is served from a sandboxed subdomain (`*.preview.codeprojects.org` or `*.preview.codeaiprojects.org` depending on configuration). This isolation means student HTML and JavaScript cannot read or write data on `studio.code.org`.

## Version History

![The Version History button in the workspace header](images/web-lab-version-history-button.png)

Select **Version History** to see a list of saved snapshots. Each snapshot is created automatically when you run. You can restore an earlier snapshot to undo changes.

## Troubleshooting

### The preview is blank

Check `index.html` for unclosed tags. A missing `</body>` or `</html>` can prevent the browser from rendering the page.

### An image does not appear

Confirm the filename in `src` matches the uploaded file exactly, including capitalization. The image must be in the project's file tree.

### CSS changes do not show

Confirm the `<link>` tag in your HTML references the correct CSS filename and is inside `<head>`.

## Further reading

- [Working on a level](/guide/labs/working-in-a-level/working-on-a-level/)
- [Sharing and publishing a project](/guide/projects/sharing-and-publishing/)
- [Labs overview](/guide/labs/)
