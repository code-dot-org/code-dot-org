This directory contains TypeScript scripts for updating the Gen AI CloudWatch dashboard and alarms.
To run the scripts:
- Run from this directory (`monitoring`): `npm install`.
- Then go to the `README` in the subdirectory (`alarms` or `dashboard`) for further instructions.

TODO in a follow-up:
- Remove dependency to `modelDescriptions.json` in `apps` and replace with `shared_constants`.
- Add an option to deploy in `test` environment for alarms.
- Set up Student Learning SNS topic.
- Create two different alarms of each type (low v high) for different urgency levels.
