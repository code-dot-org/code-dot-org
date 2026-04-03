# ESO defaulted `spec` fields causing permanent Argo drift

## Problem

On 2026-04-03, during the `cluster-infra-argocd` deep-clean and rebootstrap,
several apps would sync successfully, go `Healthy`, and still remain
`OutOfSync`.

The affected class was not arbitrary. It was `ExternalSecret` and
`ClusterExternalSecret` resources rendered without fields that the
external-secrets operator writes back into `spec`.

Argo then compared:

- desired object from Git
- live object from the API server after ESO had defaulted fields

and stayed `OutOfSync` forever.

This was seen in:

- `dex`
- `kargo-secrets`
- `standard-envtypes`

`networking` also had drift at the same time, but that was a separate AWS load
balancer controller webhook-cert problem, not this one.

## Example

Real object:

- `ExternalSecret/dex/dex-google-client-secret-env`

Template, before:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: dex-google-client-secret-env
  namespace: dex
spec:
  refreshInterval: 5m
  secretStoreRef:
    kind: SecretStore
    name: aws-secrets-manager-store-dex
  target:
    name: dex-google-client-secret-env
    creationPolicy: Owner
    template:
      type: Opaque
  data:
    - secretKey: GOOGLE_CLIENT_SECRET
      remoteRef:
        key: "k8s/tofu/codeai-k8s/dex_google_client_secret"
```

Live object, after ESO had reconciled it:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: dex-google-client-secret-env
  namespace: dex
spec:
  refreshInterval: 5m
  secretStoreRef:
    kind: SecretStore
    name: aws-secrets-manager-store-dex
  target:
    name: dex-google-client-secret-env
    creationPolicy: Owner
    deletionPolicy: Retain
    template:
      engineVersion: v2
      mergePolicy: Replace
      type: Opaque
  data:
    - secretKey: GOOGLE_CLIENT_SECRET
      remoteRef:
        conversionStrategy: Default
        decodingStrategy: None
        key: "k8s/tofu/codeai-k8s/dex_google_client_secret"
        metadataPolicy: None
```

Argo was comparing those two shapes. It was not a transient mismatch. It was a
stable spec difference caused by server-side defaulting.

## Fields observed

These were the fields ESO was defaulting into `spec` and that Argo then saw:

- `spec.target.deletionPolicy: Retain`
- `spec.target.template.engineVersion: v2`
- `spec.target.template.mergePolicy: Replace`
- `spec.data[].remoteRef.conversionStrategy: Default`
- `spec.data[].remoteRef.decodingStrategy: None`
- `spec.data[].remoteRef.metadataPolicy: None`

For `find`-based resources, the same pattern showed up under:

- `spec.dataFrom[].find.conversionStrategy: Default`
- `spec.dataFrom[].find.decodingStrategy: None`

## How it showed up

The path was:

1. bootstrap or sync an app that renders `ExternalSecret` objects without those
   fields
2. let ESO reconcile them
3. check the app in Argo
4. see `Healthy` plus `OutOfSync`
5. inspect the app resource list and see the `ExternalSecret` /
   `ClusterExternalSecret` objects as the only remaining drift

Useful commands:

```sh
kubectl -n argocd get application dex -o json \
  | jq -r '.status.resources[]? | select(.status != "Synced")'
```

```sh
kubectl -n dex get externalsecret dex-google-client-secret-env -o yaml
```

Then compare that live object with the chart output:

```sh
helm template dex ./apps/infra/dex/chart \
  -f ./apps/infra/codeai-cluster-config.values.yaml
```

## Fix used here

The fix used in this repo was blunt but correct:

- render those defaulted fields explicitly in Git

That makes the desired object shape match the live object shape after ESO
reconcile, which is what Argo needs.

This was applied to:

- `apps/infra/dex/chart/templates/*external-secret*.yaml`
- `apps/infra/kargo-secrets/chart/templates/*/external-secret.yaml`
- `apps/infra/charts/eso-per-env/templates/_envtype.tpl`

and mirrored into the legacy `cluster-infra-argocd/infra/*` charts for parity.

## One extra trap

`standard-envtypes` had a second problem.

Its `Chart.yaml` had been changed to use the shared local dependency:

- `file://../../charts/eso-per-env`

but the chart still had a stale vendored package sitting in:

- `standard-envtypes/chart/charts/eso-per-envtype-0.1.0.tgz`

That stale tarball shadowed the shared chart. The fix was:

1. remove the stale tarball
2. rebuild the dependency package
3. commit the rebuilt package

Without that, the shared chart fix existed on disk but was not the thing Helm
was actually rendering.

## Less ugly alternatives

Possible alternatives, in roughly descending order of respectability:

1. Centralize `ExternalSecret` rendering behind one helper or shared chart, and
   always render the full defaulted shape on purpose.
   This is the best answer. It keeps drift logic in one place.

2. Upstream the same change into any local chart that renders `ExternalSecret`
   resources, so no chart relies on server defaults Argo will compare.
   This is basically what was done here.

3. Add Argo `ignoreDifferences` rules for the defaulted ESO fields.
   This works, but it is a worse answer. It hides real drift in the same parts
   of the object where we actually do care about drift.

4. Hope ESO changes its writeback/defaulting behavior.
   This is not a plan.

## Repro conditions

This is easiest to reproduce when:

- bootstrapping or rebootstraping a cluster from empty
- Argo is doing the syncs
- ESO comes up and reconciles immediately afterward
- you are staring at Argo app status closely enough to notice `Healthy` and
  `OutOfSync` at the same time

It is not specific to bootstrap, though. Any app that renders an
`ExternalSecret` with omitted fields that ESO persists can hit the same problem.
