import React from 'react';
import ReactDOM from 'react-dom';

import {default as GlobalEditionLocaleDropdown} from '@cdo/apps/templates/globalEdition/LocaleDropdown';
import {default as GlobalEditionRegionDropdown} from '@cdo/apps/templates/globalEdition/RegionDropdown';

document.addEventListener('DOMContentLoaded', () => {
  // Get the existing regions from the existing dropdown
  const container = document.getElementById(
    'global-edition-region-dropdown-container'
  );
  const formElement = container.querySelector('#regionForm');
  const selectElement = formElement.querySelector('select');
  const options = Array.from(selectElement.querySelectorAll('option')).map(
    el => ({
      name: el.textContent,
      flag: el.getAttribute('data-flag'),
      globalName: el.getAttribute('data-globalname'),
      region: el.value,
    })
  );
  const csrfToken = formElement.querySelector(
    'input[name="authenticity_token"]'
  ).value;
  const localeFormElement = container.querySelector('#localeForm');
  const localeSelectElement = localeFormElement.querySelector('select');
  const locales = Array.from(
    localeSelectElement.querySelectorAll('option')
  ).map(el => ({
    value: el.value,
    text: el.textContent,
  }));
  console.log('footer stuff', container, selectElement, options);

  ReactDOM.render(
    <>
      <GlobalEditionRegionDropdown
        options={options}
        initialRegion={selectElement.value}
        url={formElement.action}
        csrfToken={csrfToken}
      />
      <GlobalEditionLocaleDropdown
        options={locales}
        initialLocale={localeSelectElement.value}
        url={localeFormElement.action}
        csrfToken={csrfToken}
      />
    </>,
    document.getElementById('global-edition-region-dropdown')
  );
});
