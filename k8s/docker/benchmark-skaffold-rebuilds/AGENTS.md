# benchmark-skaffold-rebuilds agent notes

- Read [`README.md`](/Users/seth/src/code-dot-org/k8s/docker/benchmark-skaffold-rebuilds/README.md) first. It is the primary doc for the workflow, generated artifacts, and command usage.
- Expect the initial skaffold warmup / warm-cache build to be slow. In the first real run of this tool, the warm-cache build took about 8.30 minutes before failing inside the underlying Docker build.
- Expect `day: 0` to also be slow, since it intentionally invalidates every tracked copy path.
- Expect per-day runs to also be potentially slow. This workflow is intentionally exercising real `skaffold build` behavior, including large Docker build contexts and expensive build steps.
- Do not assume long quiet periods mean the runner is hung. `skaffold build` can spend minutes in setup, context transfer, cache resolution, or image build steps before emitting more output.
- If a run fails, first distinguish whether the failure came from the benchmark runner itself or from the underlying `skaffold` / Docker build. The first real failure here was from the underlying `code-dot-org.dockerfile` build (`rbenv: bundle: command not found`), not from the benchmark scripts.
