import React from 'react';

import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

export interface DeepLinkingSettings {
  [key: string]: unknown;
}

interface LtiDeepLinkingContentSelectionProps {
  deepLinkingSettings?: DeepLinkingSettings | null;
}

const CONTENT_ITEMS = [
  {id: 'selected_item_music_lab', label: 'Music Lab', value: '0'},
  {
    id: 'selected_item_ai_foundations',
    label: 'AI Foundations 2025',
    value: '1',
  },
];

export default function LtiDeepLinkingContentSelection({
  deepLinkingSettings,
}: LtiDeepLinkingContentSelectionProps) {
  const hasSettings = !!deepLinkingSettings;
  const deepLinkingSettingsJson = hasSettings
    ? JSON.stringify(deepLinkingSettings)
    : '';

  return (
    <div>
      <h1>Deep Linking</h1>
      {hasSettings ? (
        <>
          <div>{deepLinkingSettingsJson}</div>
          <form method="post" action="/lti/v1/deep_linking/submit">
            <RailsAuthenticityToken />
            {CONTENT_ITEMS.map(item => (
              <div key={item.id}>
                <input
                  type="checkbox"
                  id={item.id}
                  name="selected_items[]"
                  value={item.value}
                />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
            <input
              type="hidden"
              name="deep_linking_settings"
              value={deepLinkingSettingsJson}
            />
            <button type="submit">Submit Selected Items</button>
          </form>
        </>
      ) : (
        <p>No `deep_linking_settings` parameter provided.</p>
      )}
    </div>
  );
}
