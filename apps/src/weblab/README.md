# Weblab

## Background

Weblab is a tool built to teach users how to build websites. It is used as both a standalone tool and in our CSD curriculum.

In our case, the websites are static -- users can write HTML/CSS and upload image assets. JavaScript is disabled (even though the editor, [Bramble](https://github.com/code-dot-org/bramble), allows it) because our curriculum doesn't teach JavaScript and Bramble does not allow us to control JS content in the way we can in other Labs to ensure users aren't abusing others or our tools.

## Basic Features

Users can create HTML and CSS files and upload image assets to their Weblab projects. Much of the functionality for this tool comes from the editor itself, Bramble, and the code within this repository is a wrapper that allows for configuring Bramble, saving/deleting projects, managing image assets, and error handling. More information about editor-specific features can be found in [our fork of Bramble](https://github.com/code-dot-org/bramble).

Notable features managed by this repository include:

- Autosaving. Projects are autosaved on a timer basis and when the user tries to navigate away with unsaved changes.
- Version history. On each save, a new version of the project is created, and the user can rollback to any previous version.
- Remixing. Like many of our apps, a user can remix a project to create their own version.
- Disallowed HTML elements. For security reasons, we disallow users from using certain HTML elements and attributes in their projects. If a disallowed element is used, it is removed from the project on change, and the server will not save the project if it contains disallowed elements.
- Maximum project size. Projects have a project size limit (20MB at the time of writing), and users must delete from assets their project (likely image assets as they tend to take up most of the project space) when they reach that limit. This is technically managed by Bramble, but is configured within this repository.

## Technical Overview

Because Weblab is largely controlled by its editor, Bramble, much of the tool is built around it, and this makes its technical setup different from most of our other Labs.

### Weblab Architecture

When Weblab is loaded (via `/projects/weblab/:channel_id` or a curriculum level that uses Weblab), the following series of events happens:

1. The WebLab class is initialized in [WebLab.init](https://github.com/code-dot-org/code-dot-org/blob/debdc4b7ad07d82d626b6683f2f1d10884c87aeb/apps/src/weblab/WebLab.js#L74). This sets up the configuration options for the app (based on the app type, level, and/or user), loads starter and user code, and renders [`<WebLabView/>`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/weblab/WebLabView.jsx).
2. `<WebLabView/>` hosts all of the UI for Weblab. Much of this UI is the Bramble editor, which must be loaded in an <iframe>. The `src` for this <iframe> points to an endpoint on our server ([`/weblab/host`](https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/controllers/weblab_host_controller.rb#L7)) that loads [brambleHost.js](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/weblab/brambleHost.js).
3. brambleHost.js loads Bramble (which we host on S3) and is the connection between the WebLab class and [CdoBramble](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/weblab/CdoBramble.js). CdoBramble sets up callbacks for Bramble events (like loading, mounting, project changes, etc.), manages the user's project filesystem, tracks local changes and syncs those changes with our servers, handles errors, and changes state in redux that `<WebLabView/>` can react to.

### Project Architecture

A Weblab project consists of 3 parts:

1. A channel entry, accessed via `/v3/channels/:channel_id`, which is stored in the Pegasus database's `storage_apps` table. This entry contains metadata about the channel -- channel ID, project name, project type, and timestamps.
2. A `manifest.json` file that contains metadata about the files in the project -- file names, the current version, the file type, and timestamps. This is stored in the `cdo-v3-files` S3 bucket.
3. The project files themselves (i.e., HTML/CSS code and image assets), also stored in the `cdo-v3-files` alongside the project's `manifest.json`.

Example: If my project contains an `index.html` file and a `style.css` file, then the `cdo-v3-files` S3 entry for my project would contain 3 files: `manifest.json` (with my project's metadata), `index.html` (with my HTML code), and `style.css` (with my CSS code). There would also be a corresponding record in the Pegasus `storage_apps` table.

All of the pieces above use S3's versioning system, which allows us to use our version history feature to point to any version previously saved in S3.

### Disallowing HTML Tags, Attributes, and/or Values

We use a `DCDO` flag to disallow any HTML tag, attribute, and/or value in Weblab. This means we can update this flag on production and see the resulting change immediately without a code change or deploy. This also means that the list of disallowed HTML elements is environment-specific.

The flag is named `disallowed_html_tags`. Example usage:

```bash
# View currently disallowed tags.
DCDO.get('disallowed_html_tags', [])

# Set currently disallowed tags to not allow the <div> tag.
DCDO.set('disallowed_html_tags', ['div'])
```

Usage rules for this flag:

- Every value in the "disallowed_html_tags" array must be a string.
- A tag is disallowed by its name. Examples: `"div"`, `"script"`, `"span"`
- A single attribute is disallowed by `"tag[attr]"`. Examples: `"div[id]"`, `"script[src]"`
- A single value of an attribute is disallowed by `"tag[attr='value']"`. Examples: `"div[id='do-not-use']"`, `"script[src='/disallowed/path']"`
