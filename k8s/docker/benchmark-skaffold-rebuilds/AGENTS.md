# benchmark-skaffold-rebuilds

- Read [README.md](/Users/seth/src/code-dot-org/k8s/docker/benchmark-skaffold-rebuilds/README.md) first. It is the source of truth for setup, commands, and how to interpret results.
- Expect day 0 of to take about 15 minutes
- Do not assume long quiet periods mean the runner is hung. `skaffold build` can spend minutes in setup, context transfer, cache resolution, or image build steps before emitting more output.
- While monitoring a live `skaffold build`, prefer very short status lines to preserve context. Only expand beyond that when a day starts, a day finishes, or something unusual happens.
