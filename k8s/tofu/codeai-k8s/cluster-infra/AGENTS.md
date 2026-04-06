# cluster-infra agent notes

If you are trying to update [`infra/external-dns/external-dns.tf`](./infra/external-dns/external-dns.tf) or [`infra/networking/aws-load-balancer-controller.tf`](./infra/networking/aws-load-balancer-controller.tf) to look like newer addon versions, read [`deriving-from-addons.md`](./deriving-from-addons.md) first.

Do not derive from version constraints, registry docs, or memory. Derive from the exact initialized module source in `.terraform/modules/`, then compare the regenerated result to the current configuration and current state so you understand every planned delta before changing live infrastructure.
