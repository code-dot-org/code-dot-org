# Argo CD Repo-Server Disk Fill Investigation

## Summary

We hit a recurring Argo CD `repo-server` disk exhaustion issue on the `codeai-k8s`
EKS/Fargate cluster. The immediate symptom was Argo failing to fetch from
`code-dot-org/k8s-gitops` with `No space left on device`, even though:

- the pod had already been given a much larger ephemeral storage request than the
  default,
- the visible files inside the container did not come close to accounting for the
  reported usage,
- and restarting the `repo-server` pod temporarily "fixed" the problem before the
  used space began climbing again.

This note records the debugging steps, what we proved, what we did not prove, and
the local tooling we built to watch the issue.

## Environment / context

- Cluster name: `codeai-k8s`
- Argo install path:
  - `/Users/seth/src/code-dot-org/k8s/tofu/codeai-k8s/eks-cluster-addons/argocd.tf`
- Cluster type:
  - EKS on Fargate
- Important repo-server config during most of this investigation:
  - `repoServer.resources.requests["ephemeral-storage"] = "100Gi"`

At one point, `df -h /` inside the live `repo-server` pod reported:

```text
Filesystem      Size  Used Avail Use% Mounted on
overlay         123G   20G   98G  17% /
```

So the pod root filesystem had substantial backing storage available, but it still
managed to fill enough to break Git operations.

## Initial symptom

The concrete user-facing Argo error was from `app-of-apps`, while trying to fetch
`k8s-gitops`:

```text
error generating params from git: error retrieving Git files: rpc error: code = Internal desc = unable to checkout git repo https://github.com/code-dot-org/k8s-gitops.git with revision 3ec8727311152d6f9bb3d8a38757f924a652d264 pattern apps/*/application.yaml: failed to initialize repository resources: rpc error: code = Internal desc = Failed to checkout revision 3ec8727311152d6f9bb3d8a38757f924a652d264: `git fetch origin 3ec8727311152d6f9bb3d8a38757f924a652d264 --tags --force --prune` failed exit status 128: error: unable to create temporary file: No space left on device fatal: failed to write object fatal: unpack-objects failed
```

We also saw `kubectl exec` fail against the same pod with no-space errors, which
is strong evidence that the pod's writable storage was genuinely full enough to
break normal operations.

## What we proved

We have high confidence in all of the following:

1. The `repo-server` pod's writable storage filled enough to break Git fetches.
2. Deleting the affected `repo-server` pod immediately cleared the condition.
3. After restart, the new pod had plenty of free space according to `df -h /`.
4. Over time, the reported used space on `/` climbed again.
5. The overwhelming majority of the bytes reported by `df` were not visible as
   normal files from inside the container, even after escalating to `uid 0`.
6. This was not explained by ordinary container logs.

What we did **not** prove:

- We did **not** prove Kubernetes node-level `DiskPressure` as a node condition.
- We did **not** prove that Argo was writing to immutable image lower layers.
- We did **not** find a single large visible directory such as `/tmp/_argocd-repo`
  that accounted for the missing space.

The best working hypothesis is:

- the pod was consuming writable storage backed by overlay/container runtime/Fargate
  storage that is counted by `df -h /`,
- but is not fully represented as ordinary files visible to `du` inside the
  container.

## Investigation timeline

### 1. Confirm the symptom and recover the immediate outage

- We observed the `No space left on device` failure from `app-of-apps`.
- We inspected the live `repo-server` pod.
- We deleted the full pod.
- The replacement pod came up healthy and Argo resumed functioning.

This established that:

- the problem was tied to pod-local writable storage state,
- and that restarting the pod reset the bad condition.

### 2. Check the live pod filesystem after restart

We ran:

- `df -h`
- `df -h /`
- `mount`
- `du -h`
- `du -x -h -d 1 /`

Important observations:

- `/` was an `overlay` filesystem.
- `/tmp` and `/helm-working-dir` were also writable overlay-backed mounts.
- `mount` showed overlay `upperdir=` paths in containerd snapshot storage.

This matters because it explains why `df` can account for bytes that do not show
up as ordinary files in the visible container filesystem.

### 3. Compare `df` usage to visible files

At one point we measured:

- `df -h /`: about `20G` used
- `du -x -B1 -d1 /`: about `514,617,344` bytes visible, about `0.48 GiB`

So there was a roughly `15-20 GiB` gap between:

- what `df` said was used, and
- what the container could enumerate with `du`

That gap persisted even after we ran the container as root.

### 4. Confirm it was not just log growth

We checked Argo pod logs over about 30 minutes:

- `repo-server`: about `344,608` bytes, `805` lines
- `application-controller`: about `143,121` bytes, `646` lines
- `applicationset-controller`: about `5,889` bytes, `53` lines

Total was only about `0.47 MB`, nowhere close to the multi-GB growth seen in
`df -h /`.

Conclusion:

- stdout/stderr logging was not the dominant source of disk growth.

### 5. Build a watcher to measure growth over time

We wrote a local helper script that repeatedly:

- found the current `argocd-repo-server` pod,
- ran `df -h /` inside `repo-server`,
- extracted only the `Used` and `Use%` fields,
- and printed one timestamped line every minute.

The script lives **outside the repo** on purpose:

- `/Users/seth/src/watch-argocd-repo-server-df.sh`

Usage:

```bash
/Users/seth/src/watch-argocd-repo-server-df.sh | tee /tmp/argocd-repo-server-df-live.log
```

The script:

- defaults to AWS profile `codeorg-admin`
- copies only that profile out of `~/.aws/config` into a temp AWS config
- appends a dummy `${AWS_PROFILE_NAME}_session` profile because the local AWS
  exec-helper expects it
- selects:
  - namespace: `argocd`
  - label selector: `app.kubernetes.io/name=argocd-repo-server`
- runs:
  - `kubectl exec ... df -h /`
- prints lines like:

```text
Fri Mar 20 2026 04:34 PM: 26G / 22% used
```

### 6. Measure growth from the watcher

Examples from the watcher log:

- before one restart:
  - start: `Fri Mar 20 2026 04:37 PM: 27G / 23% used`
  - end: `Fri Mar 20 2026 05:47 PM: 43G / 37% used`
  - delta: `16G` in `70m`
  - rough growth rate: about `0.2 GB/min`

- after another fresh repo-server restart:
  - baseline around `14G / 12% used`
  - quickly rose to around `16G / 14% used`

This confirmed that:

- the growth resumed after restart,
- and was not a one-time stale temporary-file incident.

## Attempts to gain more visibility

### A. Run repo-server as root

We temporarily changed `repoServer.containerSecurityContext` in
`argocd.tf` to:

- `runAsNonRoot = false`
- `runAsUser = 0`
- `allowPrivilegeEscalation = false`
- `readOnlyRootFilesystem = true`
- `capabilities.drop = ["ALL"]`
- `seccompProfile.type = "RuntimeDefault"`

This change **was applied** at least once successfully.

Effect:

- inside the live `repo-server` container, `id` showed:
  - `uid=0(root) gid=0(root)`
- but `/proc/1/status` still showed:
  - `CapEff: 0000000000000000`

This helped somewhat, but it did **not** make the hidden `df` usage appear as
ordinary files visible to `du`.

### B. Try Linux DAC capabilities

We then tried adding:

- `DAC_READ_SEARCH`
- `DAC_OVERRIDE`

to the container security context, hoping to bypass directory permission checks
and inspect anything still hidden.

This failed on Fargate.

The replacement repo-server pod stayed `Pending`, and the scheduler reported:

```text
Pod not supported on Fargate: invalid SecurityContext fields: Capabilities added: DAC_READ_SEARCH,Capabilities added: DAC_READ_SEARCH
```

So:

- Fargate rejected that capability addition,
- and we could not use that route to inspect further.

### C. Revert the capability experiment

Because the Helm release got wedged in `pending-upgrade` / `pending-rollback`
states while trying unsupported security context changes, we had to recover by:

- inspecting Helm history,
- rolling back,
- deleting stale Helm release secrets for the pending revisions,
- deleting bad pending `repo-server` pods,
- and at one point destroying and recreating Argo entirely.

The DAC capability attempt was removed from `argocd.tf` after that experiment.

## Temporary damage during debugging

The debugging itself caused a few operational problems:

1. Unsupported Fargate capabilities created stuck repo-server pods.
2. Helm got stuck in repeated `pending-upgrade` / `pending-rollback` states.
3. We eventually:
   - destroyed the Argo Helm release,
   - destroyed the `app-of-apps` bootstrap manifest,
   - then re-ran `tofu init` + `tofu apply` to bring Argo back.

At the end of this sequence:

- Argo was successfully reinstalled,
- `app-of-apps` came back,
- control-plane pods were healthy again.

## What the current repo config does

The current `argocd.tf` no longer includes the temporary root-user
`containerSecurityContext` experiment.

At the time of writing, the relevant repo-server config is back to just:

- an increased `ephemeral-storage` request:
  - `100Gi`

That means:

- the root / capabilities experiments were investigative only,
- they are not currently part of desired state.

## Remaining evidence / interpretation

The strongest remaining evidence points to:

- writable storage accounted for by overlay/container-runtime/Fargate backing
  storage,
- not normal visible files under `/tmp`, `/home`, `/var`, etc.

Reasons:

1. `df` reported large and growing usage.
2. `du` never came close to matching it.
3. Root access did not materially change that mismatch.
4. Ordinary logs were far too small.
5. The issue reset on pod restart, then re-accumulated over time.

## Open questions

1. What exact repo-server activity causes the hidden writable storage growth?
   - Git fetches?
   - Helm chart expansion?
   - OCI unpacking?
   - Some repo cache lifecycle bug?

2. Is the growth primarily in:
   - repo cache,
   - Helm working directories,
   - OCI/tar extraction,
   - or Fargate/container runtime overlay bookkeeping?

3. Would moving repo-server working storage onto explicitly managed volumes make
   the growth measurable and attributable?

## Suggested next steps

1. Reproduce with the external watcher script running from the beginning:

   ```bash
   /Users/seth/src/watch-argocd-repo-server-df.sh | tee /tmp/argocd-repo-server-df-live.log
   ```

2. When growth starts, sample:
   - `df -h /`
   - `mount`
   - `du -x -h -d 1 /`
   - `du -x -h -d 2 /tmp /helm-working-dir`

3. Focus on repo-server behavior around:
   - large Git fetches
   - Helm template operations
   - OCI source handling

4. Consider changing repo-server storage design instead of trying to infer host
   overlay usage from inside the pod:
   - explicitly mounted repo-server working volumes
   - clearer separation of `tmp`, helm cache, plugin/cache dirs

5. If another privilege experiment is needed:
   - avoid added Linux capabilities on Fargate
   - they are rejected by the scheduler

## Bottom line

The incident was real and reproducible enough to trust:

- repo-server storage fills over time,
- it can break Git operations with `No space left on device`,
- restart clears it temporarily,
- and the missing bytes are mostly not visible from inside the container as
  normal files.

We improved observability with the local watcher script, but we did **not**
fully identify the exact storage consumer yet.

## Debug script invocation

Run the watcher with:

```bash
/Users/seth/src/watch-argocd-repo-server-df.sh | tee /tmp/argocd-repo-server-df-live.log
```

## Debug script

```sh
#!/usr/bin/env bash
set -euo pipefail

AWS_PROFILE_NAME="${AWS_PROFILE_NAME:-codeorg-admin}"
AWS_CONFIG_SOURCE="${AWS_CONFIG_SOURCE:-$HOME/.aws/config}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-60}"
NAMESPACE="${NAMESPACE:-argocd}"
LABEL_SELECTOR="${LABEL_SELECTOR:-app.kubernetes.io/name=argocd-repo-server}"

tmp_aws_config="$(mktemp)"
cleanup() {
  rm -f "$tmp_aws_config"
}
trap cleanup EXIT

awk -v profile="[profile $AWS_PROFILE_NAME]" '
  $0 == profile {in_profile = 1}
  in_profile && $0 ~ /^\[/ && $0 != profile {exit}
  in_profile {print}
' "$AWS_CONFIG_SOURCE" > "$tmp_aws_config"

if [[ ! -s "$tmp_aws_config" ]]; then
  echo "Profile [profile $AWS_PROFILE_NAME] not found in $AWS_CONFIG_SOURCE" >&2
  exit 1
fi

cat >> "$tmp_aws_config" <<EOF

[profile ${AWS_PROFILE_NAME}_session]
aws_access_key_id = dummy
aws_secret_access_key = dummy
aws_session_token = dummy
EOF

while true; do
  timestamp="$(date +'%a %b %e %Y %I:%M %p')"
  pod="$(
    AWS_CONFIG_FILE="$tmp_aws_config" AWS_PROFILE="$AWS_PROFILE_NAME" \
      kubectl get pods -n "$NAMESPACE" -l "$LABEL_SELECTOR" -o jsonpath='{.items[0].metadata.name}'
  )"

  read -r used use_percent < <(
    AWS_CONFIG_FILE="$tmp_aws_config" AWS_PROFILE="$AWS_PROFILE_NAME" \
      kubectl exec -n "$NAMESPACE" -c repo-server "$pod" -- sh -c \
      "df -h / | awk 'NR==2 {print \$3, \$5}'" 2>/dev/null
  )

  printf '%s: \033[1m%s / %s used\033[0m\n' "$timestamp" "$used" "$use_percent"
  sleep "$INTERVAL_SECONDS"
done
```
