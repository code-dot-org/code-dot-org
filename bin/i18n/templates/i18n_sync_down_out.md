# I18n Sync Down & Out

This PR contains all changes to translations made since the last sync (usually a week).

## To Review:

Look through the changes in each of the commits and verify that all changes are expected. Note that **it is not necessary to review every single "dashboard i18n update" commit.** These commits are batched by language to make it easier to review just a couple commits in this category.

### Things to Note:

- We expect translation changes to come in on a regular basis; new strings will be translated, existing translations will be updated, and source string removals will result in translations for those strings also being removed.

- We expect translations to arrive in large batches, so don't worry if you see a large group of changes in a specific language.

- We _do not_ usually expect to see a large number of formatting changes, or batches of changes that apply to strings in every single language. If you see this, it usually means either that a code change went in or that something broke.

## Known Issues:

- If the CI unit tests fail at the `grunt messages:all` step, they will typically fail with a message like:

  ```
  [2019-10-04 02:38:57] Running "messages:all" (messages) task
  [2019-10-04 02:39:00] Warning: Error processing localization file i18n/common/zh_tw.json: SyntaxError: Expected [0-9a-zA-Z$_] but "\u8A0A" found. Use --force to continue. 
  ```

  This usually means that a translator has translated one of the [MessageFormat variables](https://messageformat.github.io/messageformat/guide/#variables). In this case, you should find and fix the offending translation in crowdin, and then manually update the associated strings in `i18n/locales` and `apps/i18n`.

  See https://github.com/code-dot-org/code-dot-org/pull/31098/commits/ab3e5d1d740869a880f2e9da5cf0a4348886915e and https://github.com/code-dot-org/code-dot-org/pull/31098/commits/0fca37658cacaaff55d9adfc9d04c40b37cc5e2d for an example.

## To Deploy:

Once one or two people have reviewed and approved this change and the tests are passing, ship it!

It's not necessary to wait for everyone on the team to review.
