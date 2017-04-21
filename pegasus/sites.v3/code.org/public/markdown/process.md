---
title: Content Editing Process
theme: responsive
nav: markdown_nav
---

# Content editing process
Here is a quick overview of the editing process that you should follow. For more information, [visit our wiki](http://wiki.code.org/display/PROD/How+to+add+website+content+via+Dropbox+or+Gsheets).

1. Make sure you have access to Code.org's Dropbox folders in order to create new or edit existing pages. You can edit your pages using a Markdown preview tool like [Mou](http://25.io/mou/).
2. Every page needs to have the following metadata at the top of the page

	`---`<br>
	`title: Your page title`<br>
	`theme: responsive`<br>
	`---`<br>

	There are other kinds of metadata that you can include on your page:
	* If you are on a page that has a few related pages, you'll want a side navigation menu that can be included with `nav: markdown_nav`. You can use a nav that already exists, otherwise you'll need an engineer to create a new nav.
	* If you don't have a side nav but want a skinnier page layout, you can use both `nav: blank` and `rightbar: blank`
	* Social media tags for Facebook and Twitter. [See how to here](/markdown/more).
	* If you are embedding a YouTube video, you'll need `video_player: true`. [See how to here](/markdown/advanced).
	* If you are using a Google Chart, you'll need `chart: true`. [See how to here](/markdown/advanced).

3. Review the markdown guides to format your page content. When ready, save to Dropbox and check that your page appears correctly on staging.code.org/your-page.
4. At the top of the next hour, check the #broken-links Slack channel to see if your page has any broken links.
5. After 48 hours, check your page on production: code.org/your-page.
