# Spec delta: teacher-dashboard-roster-data (from teacher-dashboard-manage-students)

## REMOVED Requirements

### Requirement: Package-encapsulated store with a one-way bridge
**Reason**: The bridge and package-scoped Redux store were transitional
scaffolding for the move-not-rewrite migration; once the roster state is
ported to TanStack Query (`roster-design-system-ui`), they are dead
architecture carrying a second state layer.
**Migration**: Roster server state moves to TanStack Query using the same
typed wrappers and MSW fixtures; cross-feature signals (student count →
section chrome refresh) become direct Query invalidations, covered by the
same section-switch and mutation-invalidation tests re-targeted at the
Query implementation.
