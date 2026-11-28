# docs

Topical guides that do not belong to a single subdirectory. Docs about one
part of the tree live next to it (e.g. `apps/docs/`, `dashboard/test/ui/`).

## Reference

- [build-assets-on-adhoc.md](build-assets-on-adhoc.md): how the CI build produces assets on adhoc and other daemon servers, and how to debug a failed build.
- [jwks.md](jwks.md): the `/oauth/jwks` endpoint, and generating and rotating its signing keys.
- [logging.md](logging.md): inventory of platform logs: what emits them, where they go, how to read them.
- [log-formats.md](log-formats.md): field-by-field reference for each log format.
- [reset-password-manually.md](reset-password-manually.md): sending a password reset from the Rails console.
- [server-sessions.md](server-sessions.md): shell access and port forwarding to servers through AWS Session Manager.
- [testing-production-locally.md](testing-production-locally.md): running dashboard locally in production mode.
- [testing-with-applitools-eyes.md](testing-with-applitools-eyes.md): writing and running Applitools Eyes visual UI tests.
- [update-levelbuilder.md](update-levelbuilder.md): merging `test` into `levelbuilder` and levelbuilder content into `staging`, and known breakages.
- [weblab-preview-domain-migration.md](weblab-preview-domain-migration.md): runbook for moving the Web Lab 2 and Python Lab preview origin to `codeaiprojects.org`.
- [youtube-fallback.md](youtube-fallback.md): the fallback video player for schools that block YouTube, and its network requirements.

## Historical

Design docs kept for background. They describe the system as planned at the
time and are not maintained.

- [how-sharing-and-feedback-work.md](how-sharing-and-feedback-work.md) (2014): diagram of project sharing and feedback.
- [projects-data-model.md](projects-data-model.md) (2015): original data model for saved user projects.
- [plc/survey-summary-design.md](plc/survey-summary-design.md) (2019): design proposal for the workshop survey summary pipeline.
