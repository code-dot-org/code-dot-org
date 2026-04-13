# argo-trace

## Purpose

### Purpose

`argo-trace` is a new tracer. It is separate from `bin/argo-trace-old`.

It exists to answer one question well:

Which Argo applications and Argo-tracked resources does Argo itself say are
currently being worked on?

The tracer must prefer Argo's own model over local reconstruction. It must be
fast enough to use in the apply/destroy loop. It must not grow back into a
second Argo controller.

This is intended to be a generic Argo tool, not a cluster-specific tool.

Do not hard-code assumptions from the current cluster, current apps, or current
repo layout into the implementation. The saved fixture set is proof data for
first implementation, not permission to specialize behavior to these app names.

The saved fixture set is one example only.

It is not a full state catalog. The implementation must handle the broader
range of Argo states that appear during apply/destroy, not just the exact
statuses, messages, and trees present in the fixture example.

### Direct Statement Of Goal

This tool should answer, with Argo's own data and in Argo's own terms:

What is Argo currently working on, and where in the RollingSync and sync-wave
tree is that work happening?

The human goal is glanceability during apply/destroy:

- what is Argo working on now
- what is blocking the current RollingSync step or sync wave
- which displayed leaf nodes are carrying that state

The canonical motivating example is the earlier `standard-envtypes` case from
the Argo UI:

- `standard-envtypes` itself showed pending deletion
- its child namespaces:
  - `levelbuilder`
  - `production`
  - `staging`
  - `test`
  each showed `Status: Synced`, `Health: Progressing`, and `Health Details:
  Pending deletion`
- sibling resources such as serviceaccounts and secret objects were already
  `Missing` and were not the active frontier anymore

The correct tree there is the namespace frontier, because Argo already exposes
those namespace resource nodes as the children carrying the live state.

This tool should make the same move generically:

- if a parent app or appset has many children
- and Argo already exposes which child apps or resource leaves are still
  carrying the live non-good state
- show those children directly
- do not replace them with a custom parent summary

## Constraints

### Constraints

1. Use Argo CLI first.
2. Use `kubectl` only after the Argo trace has already landed on a concrete
   non-app `status.resources[]` member.
3. Keep `kubectl` use bounded and parallel by default.
4. Share no code with `bin/argo-trace-old`.
5. Optimize from measured call costs, not guesswork.
6. Prefer broad batched calls, then maximally parallel enrichment calls.
7. Do not add complexity not proven to be needed.
8. Implement this tool in Ruby.

The ideal form of this tool is small:

- roughly a `500` LOC wrapper around Argo CLI, not a second Argo

That `500` LOC figure is a design goal, not a hard cap.

It is the intended decision pressure:

- prefer re-projecting Argo CLI data over inventing new derived models
- prefer smaller code over clever reconstruction
- prefer Argo-native UX over custom tracer semantics

This constraint is valuable twice:

1. it keeps implementation complexity down
2. it keeps the output legible to Argo CLI users

Implementation language is part of the contract:

- `bin/argo-trace` is a Ruby program
- `bin/watch-argo-trace` is a Ruby wrapper in the same style

Ruby style is part of the contract too:

- write elegant, idiomatic Ruby
- add comments where the behavior or decision is not obvious
- use classes or small helper objects when they improve clarity
- do not build a large framework or over-abstract the tool

This should still read like a shell script written in Ruby:

- direct
- compact
- procedural at the top level
- small enough to understand in one sitting

Prefer fewer lines of code when that keeps the program clearer.

Do not boil the ocean for speculative flexibility.

Do not do clever, compressed, or silly things just to save lines.

The goal is minimum code that still reads cleanly and solves the real problem.

Choose the most Argo CLI-native approach available at each decision point.

An Argo CLI user should be able to look at the rendered tree and immediately
recognize that it comes from Argo CLI data by the shape of the fields, the
status words, and the object relationships.

Do not invent new concepts, new rollups, or new labels when an Argo-native
field or structure is already available.

For first implementation, assume the information needed for the intended tree
comes from the exact Argo CLI call family already captured in:

- `test/argo-trace/fixtures/argo-cli-data/`

That fixture set is the working proof set for this spec:

- `argocd --core appset list -o yaml`
- `argocd --core appset get NAME -o yaml`
- `argocd --core --app-namespace argocd app list -o yaml`
- `argocd --core --app-namespace argocd app get <app-requiring-detail> -o yaml`

The implementation should assume this call family is sufficient for first
version unless proven otherwise during implementation.

If a requested spec feature cannot be satisfied from that call family, stop,
name the missing field, name the extra call, and ask before widening scope.

If a requested feature is possible only by adding substantial complexity, stop
work and offer an `80/20` alternative that stays closer to Argo CLI and keeps
the implementation smaller and more natural.

The main target use case is apply/destroy tracing, where latency matters more
than exhaustiveness. A trace that takes more than one minute is operationally
bad and should be treated as a design failure unless the user explicitly asks
for a slower, deeper mode.

This does not mean the implementation should narrow itself to the current
fixture example. It means it should use the generic Argo fields from this call
family to surface whichever apps, conditions, waves, resources, and messages
are active in a different cluster state.

## Command Contract

### CLI Interface

Default behavior is one-shot, no polling.

Required commands and flags:

- `bin/argo-trace`
  - one snapshot, then exit
- `bin/argo-trace --poll-every 30s`
  - repeat snapshots on a fixed cadence
- `bin/argo-trace --kubectl-details 1`
  - enable optional wave 3 kubectl detail expansion for highlighted resource
    leaves
- `bin/argo-trace --kubectl-details 0`
  - disable wave 3 kubectl detail expansion
- `bin/argo-trace --soft-wrap WIDTH`
  - soft-wrap tree lines at `WIDTH` columns
- `bin/argo-trace --no-wrap`
  - disable soft-wrapping
- `argocd --core appset list -o yaml`
  - batched ApplicationSet inventory
- `argocd --core appset get NAME -o yaml`
  - ApplicationSet detail and rollout status
- `argocd --core --app-namespace argocd app list -o yaml`
  - batched Application inventory
- `argocd --core --app-namespace argocd app get NAME -o yaml`
  - Application detail and resource status

The polling behavior should match `bin/argo-trace-old` in spirit:

- default: one-shot, no polling
- polling is opt-in
- each printed snapshot is separated clearly

The separator contract is exact:

- after each full snapshot, emit exactly three trailing newline characters
- do not add extra blank lines elsewhere just to visually pad the output

The implementation should also add:

- `bin/watch-argo-trace`

That wrapper can initially be a near-copy of the existing
`bin/watch-argo-trace-old`, pointed at `bin/argo-trace`.

### Soft-wrap behavior

Carry forward the wrap controls from `bin/argo-trace-old`:

- `--soft-wrap WIDTH`
- `--no-wrap`

Default behavior should improve on the old tracer:

1. if stdout is a real TTY, detect terminal width and use that as the wrap
   width
2. if stdout is not a TTY, default to soft-wrap width `150`
3. if `--soft-wrap WIDTH` is given, it wins over all automatic behavior
4. if `--no-wrap` is given, it wins over all automatic behavior

This wrap decision should be made once per snapshot render.

For avoidance of doubt, the expected first-version data source set is exactly
the command family listed above and exemplified by the saved fixture payloads
in `test/argo-trace/fixtures/argo-cli-data/`, including the `app-get-*.yaml`
files there.

### kubectl details flag

`--kubectl-details` is part of the interface contract.

Accepted values:

- `1`
- `0`
- `true`
- `false`

Default:

- `--kubectl-details=1`

Semantics:

- `1` / `true`: allow optional wave 3 kubectl detail fetches
- `0` / `false`: disable wave 3 kubectl detail fetches entirely

Wave 3 is not a generic kubectl graph walk.

It is a bounded Argo-led follow-up:

- only after waves 1 and 2 have already identified an emphasized non-app
  resource leaf
- only for resource leaves that came directly from Argo `status.resources[]`
- one hop only
- parallel like wave 2

### Startup Banner

Before the tree body, print a startup line in the same style as the current
tracer.

Required form:

```text
starting argo-trace @ 12:33p and 10s
```

Then emit the same blank-line separation style as the current tracer before the
rendered tree body.

After the startup line, also print the snapshot header line:

```text
# ArgoCD dependency tree @ 12:33p and 10s, argo-trace took 14s
```

Both lines are part of the interface contract.

This line is part of the human interface contract and should also appear in the
sample output in this spec.

### What Argo CLI Can And Cannot Do

#### Source reading summary

The local Argo CD source tree exists at:

`/Users/seth/src/argo-cd`

The relevant code paths are:

- [`cmd/argocd/commands/app.go`](/Users/seth/src/argo-cd/cmd/argocd/commands/app.go)
- [`cmd/argocd/commands/app_resources.go`](/Users/seth/src/argo-cd/cmd/argocd/commands/app_resources.go)
- [`server/application/application.go`](/Users/seth/src/argo-cd/server/application/application.go)

What that code says:

- `argocd app list` calls one batched `ApplicationService.List`.
- `argocd app get APPNAME` calls one `ApplicationService.Get` for one app.
- `argocd app resources APPNAME` calls one `ApplicationService.ResourceTree` for
  one app.
- `ResourceTree` and `ManagedResources` are per-app APIs. There is no multi-app
  resource-tree endpoint.

This is the design boundary.

There is no hidden batched `app get` or batched resource-tree call to unlock.

### Measured Call Costs

Measured on the live cluster, with `-o yaml`:

- `argocd --core --app-namespace argocd app list -o yaml`
  - typical: about `5.8s`
- `argocd --core --app-namespace argocd app get APPNAME -o yaml`
  - typical: about `9.2s`

Implication:

- one global list call is cheap enough
- unbounded serial `app get` is not
- the implementation should maximize parallel `app get` fanout by default

Measured two-wave run with the current selection rule:

```text
Wave 1 elapsed: 7.501s
  5.905s  argocd --core appset list -o yaml
  7.499s  argocd --core --app-namespace argocd app list -o yaml

Wave 2 elapsed: 18.228s
  appsets: app-of-apps, codeai
  apps_requiring_detail: app-of-apps, codeai, codeai-staging, codeai-test, infra, kargo
  8.903s  argocd --core appset get app-of-apps -o yaml
  16.283s  argocd --core appset get codeai -o yaml
  16.696s  argocd --core --app-namespace argocd app get app-of-apps -o yaml
  15.348s  argocd --core --app-namespace argocd app get codeai -o yaml
  10.924s  argocd --core --app-namespace argocd app get codeai-staging -o yaml
  14.138s  argocd --core --app-namespace argocd app get codeai-test -o yaml
  18.223s  argocd --core --app-namespace argocd app get infra -o yaml
  9.725s  argocd --core --app-namespace argocd app get kargo -o yaml

Overall elapsed: 25.767s
```

## Tree Construction

### Data Model

The tracer should build its tree from Argo-native layers in this order.

The implementation should be designed around a wave-oriented parallel call
plan.

Wave 1 is inventory:

- `argocd --core appset list -o yaml`
- `argocd --core --app-namespace argocd app list -o yaml`

Wave 2 is enrichment:

- `argocd --core appset get NAME -o yaml` for all appsets
- `argocd --core --app-namespace argocd app get NAME -o yaml` for selected
  apps

Wave 3 is optional kubectl detail:

- `kubectl` fetch for highlighted non-app resource leaves only

Wave 3 is enabled by default, but only activates when waves 1 and 2 have
already narrowed the live frontier to one or more concrete resource leaves from
Argo `status.resources[]`.

Do not add any fourth wave in first version.

If a requested feature would require a fourth wave, or recursion beyond the
bounded wave-3 live-object fetch, stop and ask before widening the design.

#### Layer 1: global app graph

Source:

```sh
argocd --core --app-namespace argocd app list -o yaml
```

Use this for:

- all Argo `Application` objects
- top-level sync status
- top-level health status
- app conditions
- app operation phase
- app metadata already present in the list payload
- child `Application` and `ApplicationSet` references already present in
  `status.resources[]`
- child `syncWave` values already present in `status.resources[]`

This call defines the broad graph and the candidate set for enrichment.

The parser must accept both of these YAML top-level shapes:

1. a top-level array of Application objects
2. an object containing `items: [...]`

The current live `argocd --core --app-namespace argocd app list -o yaml`
returns a top-level array.

The saved fixture payload confirms that this list call already contains enough
information to prune many later `app get` calls.

In the current fixture set, `app list -o yaml` already exposes:

- full app inventory, including leaf apps such as `codeai-staging` and
  `codeai-test`
- owner references for generated apps
- child `Application` and `ApplicationSet` references under parent apps
- sync-wave values for child app resources such as the `infra` wave children
- app-level sync, health, operation phase, and conditions

So first-version pruning should happen immediately after wave 1, before any
`app get` calls are started.

For first implementation, treat the saved files in
`test/argo-trace/fixtures/argo-cli-data/` as the concrete reference data
shape for these commands.

#### Layer 2: app-local rich status

Source:

```sh
argocd --core --app-namespace argocd app get APPNAME -o yaml
```

Use this for:

- `status.resources[]`
- per-resource `health.status`
- per-resource `health.message`
- per-resource `syncWave`
- app-level `status.conditions`
- richer app-level operation status
- app/appset metadata fields such as `metadata.creationTimestamp`,
  `metadata.deletionTimestamp`, and `metadata.finalizers` when present

This is the source of truth for Argo-native signals such as:

- `Pending deletion`
- resource-level `Progressing`
- `ComparisonError`
- other app conditions that are not reflected well enough in `app list`

`status.operationState.message`, when present, should be shown by default.

Initial rule:

- if `status.operationState.message` exists, render it
- do not add deduplication or suppression logic in the first version

#### Layer 3: optional bounded kubectl detail

Source:

- `kubectl get ... -o yaml` for the specific highlighted resource leaf

Use this for:

- highlighted live-resource `metadata.finalizers`
- highlighted live-resource `metadata.deletionTimestamp`
- a few high-signal status fields on the highlighted live object

Do not use wave 3 just to recover app/appset metadata fields already carried in
Argo wave-1 or wave-2 payloads.

Do not use this for:

- generic owner-ref graph walking
- generic `resourceRef` / `resourceRefs` recursion
- Crossplane `Usage` graph walking
- namespace descendant scans
- deep composed-resource graph spelunking

This layer exists only because some Argo `status.resources[]` leaves still need
live-object metadata or status detail.

Example:

- Argo may identify `Namespace/production` or an XR as the live frontier
- the operator may still need the live object's finalizers or deletion
  timestamp
- wave 3 may fetch that one live object and stop there

If a missing field still matters after this live-object fetch, name the field,
name the missing call, and ask before widening scope further.

### Enrichment Plan

#### Step 1: one batched call

Run exactly one global call first:

```sh
argocd --core --app-namespace argocd app list -o yaml
```

From that payload, construct:

- roots
- app/appset relationships
- ApplicationSet step membership
- initial display state for every app

#### Step 2: choose apps_requiring_detail

From the list payload, select only apps that justify `app get`.

`apps_requiring_detail` is the minimum application set whose `app get` payloads
are needed to render the current tree structure and the current active/problem
detail accurately.

High-level intent:

- keep `apps_requiring_detail` as small as possible
- but never so small that the current step, wave, active work, or blocking leaf
  detail becomes wrong or invisible

Prune before enrichment.

After wave 1, skip `app get` for any app when all of these are true:

- `sync.status=Synced`
- `health.status=Healthy`
- there are no non-good conditions
- the app is not a rendered root
- the app is not a wrapper app for an `ApplicationSet`
- the app is not needed to expose child app/appset structure already known from
  `status.resources[]`
- the app is not itself one of the currently interesting problem leaves

This pruning rule is generic.

Do not skip an app just because of its name, its source path, or its role in
the current cluster. Skip only by the field-based rule above.

An app such as `crossplane` is pruned only when its wave-1 fields satisfy the
generic skip rule. During apply/destroy, if that app is not healthy or carries
non-good conditions, it must remain in `apps_requiring_detail` like any other
app.

Initial selection rule:

- roots
- appsets that are not fully idle
- apps that are not `Synced/Healthy`
- apps whose conditions are non-empty
- apps that appear in the current ApplicationSet rollout frontier
- child apps already visible in wave 1 under a rendered parent app when those
  child apps are themselves non-idle

Selection order must be deterministic.

Preferred order:

1. selected roots
2. visible appsets
3. visible non-idle apps
4. visible apps with non-empty conditions
5. visible apps referenced by current rollout steps
6. visible child apps referenced under parent apps and already known from wave 1
   to be non-idle

`apps_requiring_detail` should stay minimal and deterministic, but execution of
those enrichment calls should be maximally parallel by default.

For ordinary parent apps, this should work the same way it works for appsets.

Example:

- `infra` is a parent `Application`
- `infra.status.resources[]` already tells us its child apps, including
  `networking`
- `app list -o yaml` already tells us whether `networking` is non-idle

So if `infra` is deleting and `networking` is the only non-idle child app under
it, the first wave already gives enough information to keep:

- `infra`
- `networking`

in `apps_requiring_detail`, without speculative extra queries.

#### Step 3: parallel app gets

Fetch the chosen apps in parallel:

```sh
argocd --core --app-namespace argocd app get APPNAME -o yaml
```

Use the enriched payload only to refine nodes already known from the global
 list call.

#### Step 4: optional parallel wave_3_kubectl_details

Only run this step when all of these are true:

- `--kubectl-details` is enabled
- the emphasized frontier contains one or more non-app resource leaves
- those leaves came directly from Argo `status.resources[]`

Do not run wave 3 just because a parent app is non-good.

Do not run wave 3 for app nodes or appset nodes.

Purpose:

- tell the operator a little more about the concrete Argo-named resource leaf
- not rebuild the full old tracer

Required behavior:

- run the selected kubectl fetches in parallel
- keep the selected resource set minimal and deterministic
- show finalizers and deletion timestamp when present

Not allowed in wave 3:

- recursive descent
- one-hop child expansion
- broad namespace scans
- generic owner-ref forest walking
- generic Crossplane graph walking

Use a fixed parallel-call cap in the first version.

Initial rule:

- if N app gets are selected for one snapshot, start up to 50 immediately
- if more than 50 are selected, queue the remainder and start the next call as
  soon as one in-flight call completes

#### Step 4: recurse only when Argo says it matters

If an enriched app payload shows child resources with:

- `health.message`
- `health.status=Progressing`
- active conditions
- sync-wave structure worth displaying

then recurse into child Argo apps in the same parallel style.

Do not recurse into healthy children just to prove they are healthy unless the
parent section is already being rendered.

Healthy subtree expansion must be explicit, not accidental.

Default rule:

- if a parent app is already being rendered in the tree, include its immediate
  healthy app children so the sync-wave or appset structure is complete
- do not recursively chase healthy grandchildren just because they exist

This is how the tool stays structurally complete without turning into a full
recursive dump of every healthy object in the cluster.

For `Application` discovery, assume `app list -o yaml` is the complete app
inventory unless proven otherwise.

On the current cluster this already includes leaf apps such as:

- `codeai-staging`
- `codeai-test`

So `app get` should be used for enrichment, not for discovering more
applications.

The initial implementation should therefore avoid recursion.

If, during implementation, a requested spec feature turns out to require
recursive fetches beyond this model, the implementation must stop and ask for
permission before adding them.

That explanation must include:

1. which requested feature cannot be satisfied without recursion
2. which extra calls recursion would add
3. the expected latency impact

There is one narrow accepted special case:

- Crossplane-heavy clusters often expose large CRD forests

The implementation may treat deep CRD recursion as optional and skipped by
default, even when the parent app is relevant, as a latency safeguard.

This is not permission for Crossplane-specific status logic. It is only
permission to stop recursion at CRD-heavy resource layers when perf would
otherwise make apply/destroy tracing useless.

### Remaining Mechanistic Rules

The implementation must not rely on taste for these decisions.

#### Root selection

1. collect all top-level `Application` objects not owned by another Argo
   `Application` or `ApplicationSet`
2. sort by name
3. render all of them

#### ApplicationSet discovery

Render all `ApplicationSet` objects returned by
`argocd --core appset list -o yaml`.

#### Wrapper applications

If both of these objects exist:

- a wrapper `Application`
- the `ApplicationSet` it points at

then render both.

This is required for cases such as:

- `codeai (Application)`
- `codeai (ApplicationSet)`

The wrapper app explains how the appset enters the root tree. The appset
explains rollout and generated children. Do not collapse either one away.

#### Relationship precedence

If multiple data sources suggest different parentage, use this precedence:

1. `metadata.ownerReferences` for `ApplicationSet -> Application`
2. parent `Application.status.resources[]` for `Application -> child Application`
3. `ApplicationSet.status.applicationStatus[]` for rollout metadata only, not
   topology by itself

If two sources disagree, keep the higher-precedence topology and surface the
lower-precedence data only as metadata if needed for explanation.

#### Child ordering

Within any node:

1. condition subtrees
2. rollout-status detail lines
3. sync-wave groups in numeric order
4. direct app/appset children without sync-wave, sorted by name
5. non-app resource leaves, sorted by kind then name

When sibling nodes would otherwise collide by `(kind,name)`, include namespace
in the rendered name for disambiguation.

#### Kind/name formatting

Render nodes as:

```text
<name> (<kind>) [<field summaries>]
```

Use lowercase `application` and `applicationset` kind labels in the rendered
tree for consistency with the current examples.

If preserving Argo's original kind case is trivial, prefer that instead.

#### Summary bracket content

Summary brackets must be assembled by type, not ad hoc.

For `Application`:

1. `sync.status=...` if present
2. `health.status=...` if present
3. `status.operationState.phase=...` if present
4. failing condition summaries such as `ComparisonError=True`

For appset-managed application rollup entries:

1. `step=...` if present
2. `status=...` if present

For `ApplicationSet`:

1. `all conditions good` when applicable
2. otherwise `<Type>=<Status>` for conditions

For `ApplicationSet` condition summaries:

1. `<Type>=<Status>` for all conditions

If every condition is known-good, prefer:

1. `all conditions good`

instead of dumping the full condition summary list in `[]`.

If any condition is unknown or non-good, do not use `all conditions good`.

#### Metadata lines

Metadata lines for `Application` and `ApplicationSet` nodes are part of the
default operator-facing output when present in the Argo payloads:

- `metadata.creationTimestamp`
- `metadata.deletionTimestamp`
- `metadata.finalizers`

These fields are cheap because they already come from waves 1 and 2.

Wave 3 must not be used to recover metadata fields for app/appset nodes.

For non-app resource leaves, metadata lines are wave-3-only and limited to the
small live-object set approved for that wave.

#### Suppress idle detail bullets

If a node is fully all-ok, and every descendant in its rendered subtree is also
fully all-ok, do not render detail bullets under that node.

Examples of detail bullets that should be suppressed for a fully all-ok
subtree:

- metadata lines
- rollout detail lines
- operationState message lines
- other non-structural detail bullets

Keep the structural tree:

- the node line itself
- RollingSync step nodes
- sync-wave nodes
- child node lines

But do not add bookkeeping bullets under a fully all-ok subtree just because
the fields exist.

This means a healthy wave child such as:

```text
- networking (Application) [sync.status=Synced, health.status=Healthy]
```

should stay a single line unless that node or some rendered descendant is not
all-ok.

#### Distinguishing appset rollup status from app object status

If both of these are shown for one application:

- appset-managed rollout fields such as `step=...` and `status=...`
- application object fields such as `sync.status=...`, `health.status=...`, or
  `status.operationState.phase=...`

then the source of each must stay explicit.

Use either:

- bracket summary plus prefixed detail lines

or:

- bracket summary with source-prefixed keys

Do not present two conflicting statuses without naming their source.

#### Timeouts

Per-call timeout for `app get` should be fixed but generous enough to tolerate
mass parallel slowdown.

Initial value:

- `60s`

There must also be a total render timeout.

Initial rule:

- total snapshot timeout: `90s`

If the total render timeout is hit:

1. print the partial tree already assembled
2. mark timed-out nodes explicitly
3. do not discard successful subresults

Timed-out node form:

```text
- <name> (<kind>) [timed out]
  - argo_trace.error: timed out after 60s
```

#### Error handling

If any Argo CLI call fails:

1. keep the rest of the tree
2. attach the failure to the node or inventory section that requested the call
3. show the exact command and the stderr summary
4. continue rendering other independent nodes

Error form:

```text
- <name> (<kind>) [error]
  - argo_trace.command: argocd --core --app-namespace argocd app get <name> -o yaml
  - argo_trace.stderr: <stderr summary>
```

## Rendering Contract

### Native Rendering Rules

The new tracer should show what Argo says, not what we infer.

#### Status words

Use Argo-native words where possible.

Examples:

- app `status.sync.status=Synced` and `status.health.status=Healthy`
- resource `health.message=Pending deletion`
- app `ComparisonError`
- app `status.health.status=Progressing` without a more specific message

Do not prefer a kind such as `Namespace` by heuristic. If a child is shown as
the frontier, it is because Argo marks it as the frontier in `app get -o yaml`.

Render field names explicitly. Prefer:

- `sync.status=Synced`
- `health.status=Healthy`
- `status.operationState.phase=Succeeded`

Do not collapse these into invented summary words such as `healthy`,
`blocked`, or `in progress` in the node label itself.

Those words may still be used as attention markers or in explanatory leaf
nodes, but the primary node label should stay close to the underlying Argo
field names.

#### What counts as "currently being worked on"

The tracer should prefer these Argo-native signals, in order:

1. resource `health.message`
2. resource `health.status`
3. app `status.conditions`
4. app `status.operationState.phase`
5. app `status.resources[].syncWave`
6. ApplicationSet rollout state

This is intentionally narrow. The tracer should stop inventing blocker logic.

#### RollingSync

Render RollingSync from persisted `ApplicationSet` status where present.

Use:

- `status.conditions[type=RolloutProgressing]`
- `status.applicationStatus[]`

The tracer should group child apps under their `step`.

#### Sync waves

Render sync waves from per-resource `status.resources[].syncWave`.

There is no Argo-wide persisted "current wave" field. The tracer must not
pretend there is one.

If a parent app has any child resources with explicit `syncWave`, group all
that parent's child app resources into sync-wave buckets.

Resources with no explicit `syncWave` under such a parent should be treated as
default wave `0` and rendered in the `sync-wave 0` bucket.

If a parent app has no child resources with explicit `syncWave`, do not invent
sync-wave buckets for that parent.

It is acceptable to show one note line in that case:

```text
- note: no sync waves defined; all resources default to wave 0
```

#### Highlighting

Highlight only nodes that Argo itself marks as active/problematic.

Good highlight candidates:

- resource `health.message=Pending deletion`
- resource `health.status=Progressing`
- app/resource `ComparisonError`
- app conditions that represent active failure

Do not highlight a whole ancestor path just because a descendant is active.

#### Conditions

Render conditions uniformly.

If an Argo object has `status.conditions`, show them as child nodes instead of
folding them into synthetic summary text.

Use this form:

```text
- status.conditions.<Type>
  - status: <Status>
  - reason: <Reason>
  - message: <Message>
```

Apply this rule to:

- `Application.status.conditions`
- `ApplicationSet.status.conditions`

Show all conditions by default, not just selected types such as
`ComparisonError` or `RolloutProgressing`.

If a condition omits a field such as `reason` or `message`, omit that line
rather than inventing a placeholder.

#### Condition summaries in node labels

Summarize conditions in the node label itself.

Preferred form:

```text
- app-of-apps (applicationset) [ErrorOccurred=False, ParametersGenerated=True, ResourcesUpToDate=True, RolloutProgressing=False]
```

For ordinary `Application` nodes, include:

- `sync.status=...`
- `health.status=...`
- `status.operationState.phase=...` when present

For `ApplicationSet` nodes, include condition summaries from
`status.conditions[]` in the form:

- `<Type>=<Status>`

For nodes with non-good conditions, it is acceptable to also include the
condition summary in the bracket list, for example:

```text
- codeai-staging (application) [sync.status=Unknown, health.status=Healthy, status.operationState.phase=Error, ComparisonError=True]
```

Detailed condition subtrees should only be shown for conditions that are not
"all good".

For this tracer, "all good" means:

- `status=True` for conditions whose true value is expected healthy progress,
  such as `ParametersGenerated` or `ResourcesUpToDate`
- `status=False` for conditions whose false value means absence of an error,
  such as `ErrorOccurred` or `RolloutProgressing=False` when rollout is
  complete

The implementation may use a small allowlist for this classification. It should
not invent new condition semantics outside the observed Argo types.

If all conditions on a node are known-good by that allowlist, the node label
may include:

- `all conditions good`

This should only be used when every condition/status pair on the node is
known-good.

Unknown condition types, or unknown condition/status pairs, must be treated as
non-good and surfaced.

Condition ordering must be deterministic.

Preferred order:

1. application sync/health/operation fields
2. application or applicationset condition summaries, in the order they appear
   in Argo status
3. step/status summaries for appset-managed applications

Do not sort conditions alphabetically if Argo already preserves a meaningful
order in status.

#### Attention markers

Use the arrow only as a presentation marker for the currently interesting bad
leaf nodes.

Formatting rules:

1. The arrow is `→`.
2. The arrow replaces one leading space so the text after the arrow stays
   column-aligned with non-arrow peers.
3. Emit ANSI control codes on their own lines, not prepended/appended to each
   rendered content line.
4. Do not bold ancestor lines just because a descendant has an arrow.
5. Do not put arrows on healthy siblings merely to preserve symmetry.
6. Arrow condition child lines and other leaf detail lines that are part of the
   same active bad chain should be styled together when possible.
7. Prefer style blocks over per-line styling.
8. Non-arrow lines should normally be emitted inside ANSI faint blocks:
   - start faint block: `\e[2m`
   - end faint block: `\e[22m`
9. Highlighted regions should normally be emitted inside ANSI bold blocks:
   - start bold block: `\e[1m`
   - end bold block: `\e[22m`
10. A bold block may include the bad leaf node line together with its attached
    highlighted detail lines.
11. Split style blocks only when the rendered style actually changes.
12. Arrowed lines must not appear inside a faint block.

Arrow selection must also be deterministic.

ApplicationSet children and Application children must use the same attention
mechanism after normalization.

The data sources differ:

- `ApplicationSet.status.applicationStatus[]`
- `Application.status.resources[]`

The operator-facing behavior must not.

If Argo exposes child work under a parent, whether that parent is an
`ApplicationSet` or an `Application`, normalize those children into one common
visible-child model, then apply one shared rule to decide which child lines and
attached detail lines are arrowed and bolded.

Do not keep two separate notions of:

- appset active child
- app active child

There should be one notion:

- visible child with non-good Argo-native state

That same rule must be able to highlight:

- `codeai-staging` under `codeai (ApplicationSet)`
- `networking` under `infra (Application)`
- a Kubernetes resource leaf under `networking` or `aws-resources` when the
  Argo `app get` payload already identifies that resource as carrying the live
  state

Preferred rule:

1. collect all visible leaf nodes whose Argo-native state is not good
2. if any visible leaf node has a failing condition or failing operation phase,
   arrow those leaves
3. else if any visible leaf node has `health.message`, arrow those leaves
4. else if any visible leaf node has `health.status=Progressing`, arrow those
   leaves

Do not invent a deeper blocker if Argo does not expose one.

For avoidance of doubt, this rule applies equally to:

- appset-generated child applications
- app child applications under sync-wave groups
- non-app Argo-tracked resource leaves from `Application.status.resources[]`

If `infra` is deleting, and its child app `networking` is the only child app in
non-good Argo state, the trace should make that obvious from waves 1 and 2
alone.

If `networking` itself is waiting on a specific resource from the already-fetched
`app get networking -o yaml` payload, the trace should show that resource leaf
too.

If that resource leaf still needs more context, wave 3 may fetch its live
object for finalizers, deletion timestamp, and a few high-signal status fields,
but must stop there.

This should not use weird heuristics. The data is already in the Argo YAML.

If an `Application` payload already contains:

- child `Application` resources
- child non-Application resource leaves
- per-resource `health.status`
- per-resource `health.message`

then the trace should project those nodes directly.

### Output Shape

Keep the current broad shape, but make the content Argo-native.

#### Minimum tested structure for `k8s-gitops`

This structure is based on reading the `k8s-gitops` source, not guessing from
live status alone.

Relevant files:

- [`apps/app-of-apps/bootstrap.yaml`](/Users/seth/src/k8s-gitops/apps/app-of-apps/bootstrap.yaml)
- [`apps/app-of-apps/app-of-apps.yaml`](/Users/seth/src/k8s-gitops/apps/app-of-apps/app-of-apps.yaml)
- [`apps/infra/application.yaml`](/Users/seth/src/k8s-gitops/apps/infra/application.yaml)
- [`apps/codeai/applicationset.yaml`](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml)
- [`apps/kargo/application.yaml`](/Users/seth/src/k8s-gitops/apps/kargo/application.yaml)
- [`apps/kargo/projects/codeai/application.yaml`](/Users/seth/src/k8s-gitops/apps/kargo/projects/codeai/application.yaml)

The minimum expected structure under this repo is:

```text
- app-of-apps (Application)
  - app-of-apps (ApplicationSet)
    - RollingSync step 1 (code.org/bootstrap-group In [infra])
      - infra (Application)
        - sync-wave 0
          - crossplane (Application)
        - sync-wave 2
          - aws-resources (Application)
        - sync-wave 3
          - networking (Application)
        - sync-wave 4
          - external-dns (Application)
        - sync-wave 20
          - external-secrets-operator (Application)
        - sync-wave 25
          - argocd (Application)
        - sync-wave 30
          - kargo-secrets (Application)
          - standard-envtypes (Application)
        - sync-wave 40
          - dex (Application)
    - RollingSync step 2 (code.org/bootstrap-group NotIn [infra])
      - codeai (Application)
        - codeai (ApplicationSet)
          - codeai-staging (Application)
          - codeai-test (Application)
          - codeai-levelbuilder (Application)
          - codeai-production (Application)
      - kargo (Application)
        - sync-wave 1
          - kargo-project-codeai (Application)
```

This does not contain all the details we want. It is only the minimum tested
shape.

The real output should add more detail inside this structure, not replace it.

In particular, when an app is not healthy or not idle, the tracer should show
deeper leaf nodes under that app for the Argo-tracked resources that are
actually carrying the active state. Examples:

- resource nodes with `health.message`
- resource nodes with `health.status=Progressing`
- app condition nodes from `status.conditions`
- resource nodes under a sync-wave that Argo marks as `Pending deletion`
- child applications under a sync-wave whose own Argo state is non-good

Concrete examples:

- `infra`
  - `networking`
    - resource leaf under `networking` with `health.message=Pending deletion`
- `standard-envtypes`
  - `levelbuilder (Namespace)`
  - `production (Namespace)`
  - `staging (Namespace)`
  - `test (Namespace)`

Those namespace/resource leaves are not optional decoration. They are the
operator-facing answer to "what is Argo waiting on right now?"

The first version should therefore treat these as the same rendering problem:

1. ApplicationSet child applications from `status.applicationStatus[]`
2. Application child applications from `status.resources[]`
3. non-Application Argo-tracked resource leaves from `status.resources[]`

All three should flow through one common child-selection and attention path,
even if the source payload fields differ.

The test expectation for `k8s-gitops` should therefore be:

1. the basic app/appset/RollingSync/sync-wave structure above is present
2. richer app/resource detail appears inside that structure where the selected
   `app get` payloads provide it

Authoritative example target:

- [`test/argo-trace/expected-output-from-argo-cli-given-data-responses.txt`](/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/cluster-infra-argocd/test/argo-trace/expected-output-from-argo-cli-given-data-responses.txt)

Do not maintain a second handwritten full-output block in this spec.

That fixture is the exact expected operator-facing output for the saved Argo CLI
dataset and must stay aligned with the executable path.

This sample is normative for formatting shape, not for exact live field values.

The point is not byte-for-byte identity with `bin/argo-trace-old`.

The point is:

- same rough tree
- less inference
- more Argo-native status words
- much lower latency

## Execution Contract

### Performance Target

Target on a normal live cluster:

- first useful tree in `<= 15s`
- steady-state typical run in `<= 25s`
- acceptable worst case in `<= 40s`
- still operationally acceptable with wave 3 in common apply/destroy cases
  where only a few highlighted resource leaves trigger kubectl detail fetches

If a field pushes the tracer past that target, the field must justify itself.

### Initial Scope

First version should support:

1. top-level app tree from `app list`
2. ApplicationSet RollingSync grouping
3. sync-wave grouping
4. parallel `app get` enrichment for `apps_requiring_detail`
5. optional parallel `wave_3_kubectl_details` for highlighted resource leaves
6. Argo-native `Pending deletion`
7. Argo-native condition rendering
8. bounded live-object kubectl detail only

It should not support:

1. old `argo-trace-old` Kubernetes owner-ref expansion
2. old `argo-trace-old` Crossplane graph walking
3. synthetic blocker diagnosis
4. recursive wave-3 descent

Crossplane-specific handling is limited to this:

1. do not recurse deeply through large Crossplane CRD/resource forests by
   default
2. do not add Crossplane-specific status interpretation
3. do not special-case Crossplane app names

### Implementation Notes

- Put the new tool at:
  - `bin/argo-trace`
- Do not import helper code from `bin/argo-trace-old`.
- Give it its own tests.
- Give it built-in timing output and per-call timing logs during development.
- Measure before and after each concurrency or selection change.

## Optional Data And Followups

### Fields To Treat As Optional

These fields are useful, but they are not free. Preserve them only if they are
already in the chosen Argo CLI payloads.

#### Cheap enough from `app list`

- app sync status
- app health status
- app conditions summary
- app/appset metadata lines when present

#### Cheap enough from chosen `app get`

- resource `health.message`
- resource `health.status`
- resource `syncWave`
- detailed app conditions

#### Not approved by default

- owner-reference walks outside the bounded wave-3 live-object rule
- deep resource manifest inspection
- events
- broad namespace scans
- generic graph recursion below wave-3 leaves

If the user wants one of these, the tool should name the exact extra call and
the measured cost.

### Questions For The User

These are the fields from the old tracer that may not be worth their cost in
the new one.

#### A. metadata lines

Decision for first version:

- not part of the default operator-facing output

If this is revisited later, treat it as an explicit output-scope change rather
than something implied by payload availability.

#### B. detailed app condition subtrees

Example:

- `status.conditions.ComparisonError: blocked`

Likely source:

- `app get -o yaml`

Cost:

- already included for enriched apps

#### C. exact app operation messages

Example:

- `Application resource became Healthy, updating status from Progressing to Healthy`

Likely source:

- `app get -o yaml`

Cost:

- already included for enriched apps

#### D. fully expanded healthy subtrees

Example:

- showing every healthy wave child even when idle

Cost:

- extra app gets and extra tree walking
- this may be the single largest optional cost in a healthy cluster

The user should explicitly confirm whether this is wanted in the default fast
path.

## Critique of argo-trace-old, why this is a clean rewrite

`bin/argo-trace-old` proved the operator problem is real.

It also proved what happens when a useful script is fed a steady diet of
"one more thing" until it turns into a ruby-shaped cursed artifact.

It grew into a `3934` line Ruby beast that tries to be:

- Argo tracer
- Kubernetes graph walker
- Crossplane graph walker
- event scraper
- profiler
- timing logger
- ownership inference engine
- regex blocker oracle
- ANSI painter
- soft-wrap formatter

That is not one tool. That is a yard sale with a profiler taped to it.

It drifted away from Argo and started writing fan fiction about Argo, except
the fan fiction is slower than the source material and less believable.

Instead of projecting Argo's own state, it now mixes in:

- `kubectl api-resources`
- owner-ref traversal
- Crossplane `Usage`
- live event scraping
- custom state buckets
- message regexes
- giant kind allowlists
- local opinions about what is "active" or "passive"

That is how you get things like:

- `PASSIVE_APPLICATION_CHILD_KINDS`
- `BRANCHY_SYNCED_APPLICATION_CHILD_KINDS`
- `APPLICATION_PROGRESSING_CONDITION_STATES`
- `APPLICATION_ACTIVE_CONDITION_STATES`

At some point the tracer stopped being a window into Argo and became a
home-made alternate universe where the tracer thinks it is the main character
and Argo is just a confusing supporting actor.

That is bad engineering here.

It made the tool:

1. slow
2. hard to trust
3. hard to change

Slow:

- one more "small useful detail" kept turning into one more network walk
- apply/destroy tracing, which should feel like glancing at a dashboard, turned
  into a pilgrimage
- the script now has the vibe of a Victorian machine that requires many belts,
  pulleys, and a worried assistant

Hard to trust:

- operators cannot instantly tell which parts are straight from Argo and which
  parts are the tracer doing improvised jazz
- custom words like `healthy`, `blocked`, and `in progress` drift away from
  Argo's own fields and into "trust me bro" territory

Hard to change:

- rendering, traversal, inference, heuristics, profiling, and performance all
  live in one giant file like a family of raccoons sharing a trench coat
- every new request risks touching everything because everything already knows
  too much about everything else

This is what happens when spec creep is allowed to pile up without anyone
pushing back on whether the feature still belongs in the tool, or whether the
tool has started collecting hobbies.

So `argo-trace` must avoid these failure modes:

1. do not rebuild Argo internals in Ruby
2. do not bolt Kubernetes archaeology onto an Argo status viewer
3. do not invent custom status words when Argo fields already exist
4. do not add giant allowlists and regex state machines unless there is no
   thinner path
5. do not let "one more useful detail" silently become "one more graph walk"
6. do not make operators learn a second private UX dialect
7. do not accept complexity just because the spec can describe it

If implementation starts heading back toward:

- deep recursive live-object graph walking
- bespoke Crossplane archaeology
- giant kind allowlists
- message regex state machines
- custom blocker fan fiction

stop.

That is the old failure mode returning in a fake mustache, carrying a regex,
and asking for one more tiny special case.
