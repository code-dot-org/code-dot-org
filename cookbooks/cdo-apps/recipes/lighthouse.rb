# Installs Lighthouse npm package and Google Chrome dependency.

include_recipe 'cdo-apps::google_chrome'
nodejs_npm 'lighthouse'
