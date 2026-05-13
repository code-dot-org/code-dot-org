# Localization

This module will give information about the current locale and will, if dynamic
translation is available, translate source strings into their target strings.

Currently this is hidden behind an experiment and a shim that only turns on this
service for select courses when the experiment flag is enabled. Much of this
library will fallback to the legacy behavior and sources of truth for the current
locale in the case that the experiment is off.

## Dynamic Translation

Our system uses LocalizeJS as a third-party localization service. This service
stores a dictionary of strings for a particular set of pages and requests them
on the first page load. The strings are then dynamically swapped out when content
on the page is rendered. It compares the English source strings with those in the
dictionary and swaps them out.

When the language is switched, the dynamic localization engine will swap out the
strings on the page to the new language instantly without a page load.

## New Translations

To provide a new translation, one only needs to add the language into LocalizeJS
for the relevant project. Then, the translation team can approve new translations
and perhaps schedule machine translation for the strings.

When newly translated strings are approved, they are immediately available to the
page. The next time somebody visits that page and pulls down a new dictionary,
they will see the newly translated content. There is no need to synchronize the
localized strings to the code repository itself.

## Usage

Typically, you don't need to do anything! Just write your components as though
they were in English and let the widget do the heavy lifting. You'll only need
to deal with this library directly when you need to manually alter strings.

You can alter the default behavior of the localization crawler in various ways.

### Turn off automatic translation

To turn off the crawler and its automatic swapping out of strings, just use the
`notranslate` class or add the `data-notranslate` attribute. Just the presence
of these attributes is enough (even if their value is blank or false).

This is useful for areas of the site that are rendering user-generated content
that might coincidentally be translated and also areas that are rendering any
other user handles. We do not send up such strings to the third-party service
even if they were crawled as a precaution, but they can still render in strange
ways if not careful.

## Manually Supplying Strings

Sometimes, the automatic ingest of strings on the page can be problematic. For
instance, with Blockly blocks (which powers many of our learning labs), when the
language changes, the block text would change under the widget, but the graphic
outline the block would not redraw. This will cause blocks to be mishapen
relative to their text.

In these cases, you can 'manually' translate the strings in a more traditional
way. First, you would mark the area or element involved with either a
`notranslate` class or a `data-notranslate` attribute. This will tell the widget
to ignore it when it sees it. It will not send the string up for translation nor
swap it out with any available translation.

Then, you can programmatically ask the localization engine for a translation for
the relevant string using:

```typescript
import localization from '@cdo/apps/localization';

localization.on('change', (info) => {
  console.log("updating the language to", info.locale, "rtl?" info.rtl);
  const myLocalizedString: string = localization.translate("my english string");
});
```

We wrap it in the event handler so that we re-localize when a different language
is chosen.

## Manual Strings in React

If you are using a React component, and really need to do manual translation, we
can simplify things by using the `useLocalization` hook:

**Note**: Just because you are possibly generating dynamic strings does not mean
you have to use manual translation! You can, in staging, generate them so that the
system picks them up. As long as there are known translations, the system will see
them and swap them out as your component updates!

```typescript
import React from 'react'
import localization, {useLocalization} from '@cdo/apps/localization';

const MyComponent: React.FunctionComponent = () => {
  const locale = useLocalization();

  const myLocalizedString = localization.translate("my english string");

  return (
    <span>The current language code is: {locale} and the localized message is {myLocalizedString}</span>
  );
};
```

This will cause a re-render when the language changes where the new language
code is given as `locale`. If you want to know whether or not the new language
is right-to-left, you can just pull that from the `Localization.rtl` property.
