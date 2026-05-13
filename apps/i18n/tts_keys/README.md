## TTS Keys
This directory contains files with lab-related i18n string keys that require TTS (Text-to-Speech) generation.

## How it works
1. Create a CSV file with the lab name and a list of i18n string keys requiring TTS generation.
   Use the format `/app/i18n/tts_keys/{lab_name}.csv` corresponding to `/app/i18n/{lab_name}/{locale}.json`.
2. Run the script to upload the strings to TTS provider:
   [`bundle exec ./bin/i18n/resources/apps/text_to_speech/sync_out.rb`](../../../bin/i18n/resources/apps/text_to_speech/sync_out.rb)
