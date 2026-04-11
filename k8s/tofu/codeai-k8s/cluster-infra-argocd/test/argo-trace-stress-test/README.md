# argo-trace stress harness

This directory holds the live stress harness for `bin/argo-trace`.

The harness is intentionally separate from the fast unit tests in
`argocd_progress_trace_test.rb`. Those unit tests are good at shaping precise
inputs. This harness is for the ugly live states that matter in practice:

- Argo roots and nested `ApplicationSet` ownership
- hook Jobs that are really in progress
- workload failures that really bottom out in Pod state and events
- delete stalls that really involve finalizers
- real Crossplane XR/composed-resource graphs without touching AWS

The runner is `run.rb`. It writes each captured `argo-trace` output under:

- `logs/argo-trace-stress-test/<timestamp>/`

## Usage

Before running the harness, make sure the stress tree changes are pushed to
`k8s-gitops` `main`, then run:

```sh
ruby /Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/cluster-infra-argocd/test/argo-trace-stress-test/run.rb
```

The runner will:

- clean up any old stress roots
- bootstrap the secondary root first for quiet-root checks
- bootstrap the primary root for active scenarios
- capture one-shot `bin/argo-trace` output at key checkpoints
- delete the primary root to exercise delete-time tracing
- clear the synthetic finalizers it created so cleanup can finish

If a new live failure shape shows up, add a scenario here instead of relying on
memory.

One important constraint is deliberate: the runner does **not** use rootless
`bin/argo-trace` on this shared dev cluster. Rootless tracing is supposed to
walk every top-level Argo root it can discover, which would pull real cluster
roots into the stress run. Multi-root inference is still covered in the fast
unit tests; the live harness sticks to explicit stress roots.
