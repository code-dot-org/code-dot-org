##########################################################################################
      _                _                                  _                     _
   __| | _____   _____| | ___  _ __  _ __ ___   ___ _ __ | |_    __ _  ___  ___| | _____
  / _` |/ _ \ \ / / _ \ |/ _ \| '_ \| '_ ` _ \ / _ \ '_ \| __|  / _` |/ _ \/ _ \ |/ / __|
 | (_| |  __/\ V /  __/ | (_) | |_) | | | | | |  __/ | | | |_  | (_| |  __/  __/   <\__ \
  \__,_|\___| \_/ \___|_|\___/| .__/|_| |_| |_|\___|_| |_|\__|  \__, |\___|\___|_|\_\___/
                              |_|                               |___/
##########################################################################################

##########################################################################################
##### Omega Theme
##########################################################################################
Informational:  http://himer.us/omega960
Documentation:  http://himer.us/omega-docs
Project Page:   http://drupal.org/project/omega
Issue Queue:    http://drupal.org/project/issues/omega
Usage Stats:    http://drupal.org/project/usage/omega
Twitter:        http://twitter.com/Omeglicon
Maintainer(s):  
                Jake Strawn 
                  http://himerus.com
                  http://developmentgeeks.com
                  http://facebook.com/developmentgeeks
                  http://drupal.org/user/159141
                  http://twitter.com/himerus
                Sebastian Siemssen
                  http://twitter.com/thefubhy
                  http://drupal.org/user/761344
##########################################################################################

Omega Theme Information
=======================
The Omega theme is the most powerful and flexible base theme available for Drupal 7.
Omega includes HTML5, CSS3 responsive layouts, customizable grids based on 960.gs, advanced 
preprocess functionality, and integration with Delta/Context modules to provide different 
layouts based on context.

Omega 3.x has been completely rewritten for performance enhancements and a host of new 
features. Every region/zone is now fully configurable in the theme settings UI, and can be 
placed anywhere you like on a page without having to edit/manipulate templates.

Additional 960gs/Omega Resources
================================
Documentation:  http://himer.us/omega-docs
Project Page:   http://drupal.org/project/omega
Issue Queue:    http://drupal.org/project/issues/omega

Creating your Omega Sub Theme (Automagically)
=============================================
@todo - rewrite this section

Creating your Omega Sub Theme (Manually)
========================================
* Copying the appropriate starterkit from omega/starterkits
  * move copy to /sites/all/themes
* Rename the folder
  * Rename the copied folder to YOUR_THEME
* Renaming the .info file
  * Rename the .info file to YOUR_THEME.info
* Renaming the appropriate responsive CSS files
  * Rename starterkit-omega-html5-alpha-default.css to YOUR-THEME-alpha-default.css
  * Rename starterkit-omega-html5-alpha-default-narrow.css to YOUR-THEME-alpha-default-narrow.css
  * Rename starterkit-omega-html5-alpha-default-normal.css to YOUR-THEME-alpha-default-normal.css
  * Rename starterkit-omega-html5-alpha-default-wide.css to YOUR-THEME-alpha-default-wide.css
* Editing the .info
  * Remove the following lines
    * hidden = TRUE
    * starterkit = TRUE
  * Change the following lines to suit your needs
    * name = My Custom Theme
    * description = My own custom Omega subtheme
* Turn on your subtheme
  * visit /admin/appearance
  * Click “Enable and set default” on the appropriate subtheme you’ve created.


Contributors
============
- himerus (Jake Strawn)
- fubhy (Sebastian Siemssen)
