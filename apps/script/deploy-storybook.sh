#!/bin/bash
set -e # Exit on error

echo "Going to build and deploy storybook to cdo-styleguide gh-pages repo"

DIR_TO_DEPLOY=storybook-deploy
if [ -z "$CDO_STYLEGUIDE_REPO_TOKEN" ]
then
    REPO="git@github.com:code-dot-org/cdo-styleguide.git"
else
    REPO="https://${CDO_STYLEGUIDE_REPO_TOKEN}@github.com/code-dot-org/cdo-styleguide.git"
fi
SHA=`git rev-parse --verify HEAD`

# get rid of old build if it is still around for some reason
rm -rf $DIR_TO_DEPLOY

# fetch most recent version of compiled css (application.css)
# and file that loads fonts (font-awesome.css) that are generated by rails
echo "Compiling application.css using rails asset pipeline"
pushd ../dashboard
bundle install
bundle exec rake assets:precompile
MOST_RECENT_APPLICATION_CSS=$(ls -t public/assets/application-*.css | head -1)
MOST_RECENT_FONT_AWESOME_CSS=$(ls -t public/assets/font-awesome-*.css | head -1)
cp $MOST_RECENT_APPLICATION_CSS ../apps/build/package/css/application.css
cp $MOST_RECENT_FONT_AWESOME_CSS ../apps/build/package/css/font-awesome.css
popd

# build the static storybook site
echo "Building the static storybook site"
NODE_OPTIONS="--max-old-space-size=4096" npx build-storybook -o $DIR_TO_DEPLOY

# manually copy over static files
echo "Copying static files"
mkdir -p $DIR_TO_DEPLOY/js
cp -R build/package/css $DIR_TO_DEPLOY
cp -R build/package/js/en_us $DIR_TO_DEPLOY/js

echo "Pushing to github... cloning gh-pages branch"
# Clone the gh-pages branch to /tmp/pages
rm -rf /tmp/pages
git clone --branch gh-pages --single-branch --depth 1 -- $REPO /tmp/pages

# Delete the old release
rm -rf /tmp/pages/*
# Copy in the new release
cp -R $DIR_TO_DEPLOY/* /tmp/pages
pushd /tmp/pages
# Quit if nothing has changed in this branch
CHANGED_FILES=`git status --porcelain`
if [ -z "$CHANGED_FILES" ]; then
  echo "No changes to push; skipping deploy."
  exit 0
fi

# Commit the changes to the gh-pages branch
git config user.name "Circle CI"
git config user.email "dev@code.org"
git add --all
git commit -m "Update GitHub Pages: $SHA"
# Push our updated gh-pages branch
echo "Pushing to github... pushing new gh-pages branch"
git push $REPO gh-pages

echo "cleaning up!"
# clean up after ourselves
popd
rm -rf $DIR_TO_DEPLOY

echo "if everything worked, your changes should be up on https://code-dot-org.github.io/cdo-styleguide/"
