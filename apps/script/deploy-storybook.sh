#!/bin/bash
set -e # Exit on error

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
# Remove these files manually copied over above
# so they are not retained in our staging apps build package.
rm ./build/package/css/application.css
rm ./build/package/css/font-awesome.css

echo "if everything worked, your changes should be up on https://code-dot-org.github.io/cdo-styleguide/"
