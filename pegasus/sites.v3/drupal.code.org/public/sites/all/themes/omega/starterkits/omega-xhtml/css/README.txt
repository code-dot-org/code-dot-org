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
##########################################################################################
##### CSS Files
##########################################################################################

Any custom CSS files should be placed in this folder.

Five CSS files are provided by default. These files will be loaded according to the 
media queries established in your theme's settings. The default values are provided below.

To use these stylesheets, rename the files and YOURTHEME with the name of your theme.
For example, if your theme is named beta, the files would be named:
  global.css (this file does not get renamed)
  beta-alpha-default.css  
  beta-alpha-default-narrow.css  
  beta-alpha-default-normal.css
  beta-alpha-default-wide.css

global.css 
  * Loaded all for all layouts, including mobile.
  * Default media query: n/a. Always applied.
  * By default, this is the only stylesheet loaded for the mobile version of your site.
  * This layout does not use the 960gs for its layout. It provides a linearized 
    view of your site's content. 

YOURTHEME-alpha-default.css
  * Loaded for all layouts using the alpha grid (i.e. not the mobile layout).
  * Default media query: n/a. Applied to all layouts using the alpha grid.
  * By default the alpha grid is applied when the device width is at least 
    740px wide.

YOURTHEME-alpha-default-narrow.css  
  * Loaded for all layouts using the alpha grid. Styles will "cascade" to 
    wider layouts. You may overwrite any styles in the normal or wide 
    layout-specific CSS files if you wish.
  * Default media query for the narrow layout is: 
      all and (min-width: 740px) and (min-device-width: 740px), 
      (max-device-width: 800px) and (min-width: 740px) 
      and (orientation:landscape)

YOURTHEME-alpha-default-normal.css
  * By default this style sheet will be loaded for the normal and wide layouts 
  * Styles will "cascade" to the wide layout as well. 
  * Default media query for the normal layout is: 
      all and (min-width: 980px) and (min-device-width: 980px), 
      all and (max-device-width: 1024px) and (min-width: 1024px) 
      and (orientation:landscape)

YOURTHEME-alpha-default-wide.css
  * By default this style sheet will apply only to the widescreen layout.
  * Default media query for the wide layout is: 
      all and (min-width: 1220px)

