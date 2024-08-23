## Updating FontAwesome Files

If you are looking to update the FontAwesome files in `font.scss`, you'll need to do the following:
1. **Download css and webfont files from FontAwesome.**
   Sign in with our shared dev account, find our "Code.org Kit", then click "Download Web Files" from the "Self-Host on the Web" option.
   This should produce a download of a superset of files you'll need to upload to S3 (we only use the css and webfont directories).
2. **Use "Host Yourself - Webfonts" instructions** [here](https://fontawesome.com/docs/web/setup/host-yourself/webfonts).
   Supplement with the "Version 4 Compatibility" instructions listed there as well. [link](https://fontawesome.com/docs/web/setup/host-yourself/webfonts#version-4-compatibility)
3. Once you've downloaded the kit, **updated relative paths**
   for font files listed in CSS to be absolute paths to URLs storing font files, and uploaded them to a S3 bucket where we can access them. 
   I've timestamped the folder location in S3 such that a developer can upload an updated set of files without affecting production.
4. **Updated CORS configuration on `cdo-dsco` bucket**
   to allow fetching of these files across code.org, studio.code.org, and hourofcode.com.
   More documentation on those changes are in [this Slack thread](https://codedotorg.slack.com/archives/C03CK49G9/p1681500978173639).

At time of writing, these files were referenced in the following places:

**Hard coded strings**
- Applab Exporter: apps/src/applab/Exporter.js
- shared: shared/css/font.scss (shared strings defined here)

**Usages of shared strings**
- dashboard: dashboard/app/stylesheets/application.scss

