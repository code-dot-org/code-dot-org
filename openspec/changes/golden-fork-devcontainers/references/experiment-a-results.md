# MySQL 8.0 bake-into-image spike — results

Host: 32-core Linux, docker 29.5.3 / buildx 0.17.1, overlay2 storage driver,
kernel 7.0.11-200.fc44.x86_64. Dataset baked: `spike.t` (InnoDB), 2^22
(4,194,304) rows, ~986MB table data, ~2.1-2.2GB total datadir including
redo/undo/binlog overhead.

All containers/images/volumes prefixed `cdo-spike-a-` per safety rules;
all removed at end of run. A concurrent unrelated experiment (`cdo-spike-b-*`)
was running on the same host throughout — confirmed untouched.

## Scenario results

| Scenario | run→ping | run→SELECT | notes |
|---|---|---|---|
| 1. VOLUME trap (data baked at default `/var/lib/mysql`, declared VOLUME) | 4.37s / 17.81s / 3.43s (3 runs) | 4.57s / 18.05s / 3.67s | `docker run` itself blocks 2.1s-16.5s (highly variable) copying the ~2.2GB image layer into a fresh anonymous volume before the container even starts. This copy happens **every time**, on every fresh container — it does not get cached or reused across containers. |
| 2. Non-VOLUME (data baked at `/opt/mysql-data`, custom datadir, clean shutdown) | 4.50s / 1.94s (2 runs) | 4.97s / 2.27s | `docker run` returns in 0.3-0.5s (no data volume to populate — the base image's `/var/lib/mysql` anon volume is still created but is empty, so its populate-copy is instant). Remaining ping-latency is normal mysqld startup, not data-loading. Write test (5000-row INSERT) completed in 0.029s with no overlayfs/O_DIRECT errors. |
| 3. Dirty shutdown (kill -9 during build, same non-VOLUME datadir) | 6.96s / 4.44s (2 runs) | 7.29s / 4.76s | InnoDB "initialization" phase (crash recovery + redo replay) took **4.56s** vs **0.61s** for the clean-shutdown image — direct, isolated measurement from mysqld log timestamps, same dataset. XA crash recovery log lines appear only in the dirty case. |
| 4. Parallel (3x non-VOLUME clean image) | all 3 ready in 2.22s total | isolation confirmed | Wrote to par1 only (`INSERT ... n=999`); par2/par3 row counts unchanged and marker row absent — confirms independent overlayfs COW layers per container, no shared mutable state. |

## VOLUME-copy penalty

- ~2.2GB baked datadir → anonymous-volume populate copy measured at 2.1s-16.5s
  across 3 runs on the same host/same warm page cache. This is a same-disk,
  warm-cache measurement (build just ran, so the data was in page cache);
  a cold-cache pull-then-run scenario (typical real devcontainer boot) would
  add registry pull + layer extraction *and* this copy, likely worse and
  more consistently slow.
- Confirmed the copy is **not idempotent/cached**: 3 fresh containers from
  the same image each paid a full copy, with no apparent speedup on repeat.
- Scales with data size (linear expectation, not independently re-verified
  at multiple sizes here — the ~2.2GB single data point plus the near-zero
  non-VOLUME case is the load-bearing contrast).

## Overlayfs / O_DIRECT

No errors of any kind writing to the non-VOLUME `/opt/mysql-data` path on
overlayfs. Explicitly tested `--innodb-flush-method=O_DIRECT` on this same
host/kernel — started clean, `SHOW VARIABLES` confirmed O_DIRECT active, no
errors logged. Caveat: this depends on kernel + backing filesystem under
overlay2 (older kernels / some CI backing stores have historically rejected
O_DIRECT opens on overlayfs); the current default MySQL flush method is
`fsync`, which sidesteps the question entirely unless explicitly overridden.

## Dirty vs clean shutdown delta

Same ~2.2GB dataset, same non-VOLUME datadir:
- Clean shutdown (`mysqladmin shutdown`, waited for socket to disappear):
  InnoDB init phase = 0.61s.
- Dirty shutdown (`kill -9` mid-build): InnoDB init phase = 4.56s (includes
  "Starting XA crash recovery" / "XA crash recovery finished" log lines
  absent in the clean case).
- ~4s crash-recovery tax for this data volume and this many uncheckpointed
  redo bytes; scales with how much redo log was outstanding at kill time,
  not simply with data size — a deliberately dirty build right after a big
  write burst (like ours) is close to a worst case.

## Per-instance RAM (3 parallel containers, default my.cnf + baked buffer pool)

- Default settings (`innodb_buffer_pool_size` = 128MB): ~465-468MB RSS per
  container (docker stats), consistent across all 3.
- Tuned-down settings (`--innodb-buffer-pool-size=32M
  --innodb-buffer-pool-instances=1 --performance-schema=OFF
  --table-open-cache=64 --max-connections=20`): ~143MB RSS — a >3x
  reduction, verified with a live query still working (`SELECT COUNT(*)`
  returned the correct 4,194,304).

## Recommended bake recipe for ephemeral per-container dev DBs

1. **Datadir path**: never bake into `/var/lib/mysql` (or any path an
   ancestor Dockerfile `VOLUME`-declares). Use a custom path, e.g.
   `/opt/mysql-data`, with `--datadir=/opt/mysql-data` on both the build-time
   `mysqld --initialize-insecure` invocation and every runtime `CMD`/my.cnf.
   Overlayfs COW is what actually gives "instant + isolated" — the
   VOLUME mechanism actively defeats it here, it doesn't help it.
2. **Shutdown procedure**: always `mysqladmin shutdown` at the end of the
   RUN step and poll for the socket file to disappear (or `wait "$pid"`)
   before letting the layer close. A dirty bake costs ~4s+ of avoidable
   crash recovery on every single container start, forever, since every
   container replays from the same baked-dirty checkpoint.
3. **my.cnf / CMD flags for ephemeral dev containers** (data is disposable,
   durability across host crashes is not a goal):
   - `--innodb-flush-log-at-trx-commit=0` (skip per-commit fsync)
   - `--skip-innodb-doublewrite` (valid flag in 8.0; halves write I/O)
   - `--innodb-buffer-pool-size=<small, e.g. 128-256M>` sized to the working
     set, not the full dataset — tune down further (32M) if running many
     instances concurrently and RAM-constrained
   - `--innodb-buffer-pool-instances=1` for small pools (avoids needless
     per-instance overhead below the ~1GB threshold where multiple
     instances help)
   - `--performance-schema=OFF`, lower `--table-open-cache`,
     `--max-connections` if concurrency needs are low — this is most of the
     >3x RAM win observed above
   - Leave `innodb_flush_method` at default (`fsync`) unless you've verified
     O_DIRECT behaves on the target overlay backing store; it worked here,
     but it's environment-dependent enough to not blanket-recommend.
4. Do **not** rely on the base image's `VOLUME /var/lib/mysql` declaration
   being harmless just because you don't write there — it's still declared,
   so every fresh container still gets an (empty, cheap) anonymous volume
   mounted over that path. Harmless when empty, but worth knowing it's
   there if anything ever writes to it by accident (e.g. a stray tool that
   hardcodes `/var/lib/mysql`).
