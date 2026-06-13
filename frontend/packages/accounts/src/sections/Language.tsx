import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {
  localization,
  useLocalization,
} from '@code-dot-org/core/plugins/localization';

import Section from './Section';

// Wired to the existing locale mechanism: core's localization singleton owns
// the option list (`localization.locales`) and applies a change immediately via
// its setter (the same path LocalizeJS uses). No save-bar batching — the locale
// is not part of the profile PATCH.
export default function LanguageSection() {
  const locale = useLocalization();
  const items = localization.locales.map(language => ({
    value: language.value,
    text: language.text,
  }));

  return (
    <Section id="language" title="Language">
      <SimpleDropdown
        name="locale"
        labelText="Preferred language"
        items={items}
        selectedValue={locale}
        onChange={event => {
          localization.locale = event.target.value;
        }}
      />
    </Section>
  );
}
