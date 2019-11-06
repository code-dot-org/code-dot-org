# I18n Sync In & Up

This PR contains all changes to internationalization source strings made since the last sync (usually a week).

## To Review:

1. Look through the changes in each of the commits and verify that all changes are expected

   - We expect content changes to come in on a regular basis; individual strings will get updated, added, and deleted.

   - We _do not_ usually expect to see "comprehensive" changes - or changes that apply to large numbers of strings or whole categories of strings all at once - unless we have made specific code changes.

2. Notify the International Partners team about any changes that might appear to manifest as "lost translations"

   - For example: https://github.com/code-dot-org/code-dot-org/pull/31031/files#diff-aa1910a8cf8f9290ae3baf7e39dbae3eL397-R398

     This is a change that added new strings (with both new keys and new content) and simultaneously removed some very similar old ones; we can reasonably infer that the intent here was to swap the new strings out for the old ones. Unfortunately, because the swap also included a content change to the strings the crowdin duplication system won't automatically apply translations to the new strings and so they will need to be manually re-translated.

## To Deploy:

Once one or two people have reviewed and approved this change and the tests are passing, ship it!

It's not necessary to wait for everyone on the team to review.
