# admin-haml-decommission tasks

## 1. Prerequisites

- [ ] 1.1 Confirm SPA admin surface reachable by admins in production
      (whatever mechanism resolved the frontend-studio prod story)
- [ ] 1.2 Confirm with support/ops: no external tooling POSTs to /admin
      URLs; answer the pd_progress.csv retention question
- [ ] 1.3 Per-tool usage check: access logs show legacy pages idle since
      their SPA link flip

## 2. Per-tool removal (one commit each, engineer console last)

- [ ] 2.1 Lookup/search tools: remove routes/actions/views, add 301s
- [ ] 2.2 Permissions (legacy GET revoke dies here), 301s + 410s
- [ ] 2.3 Lifecycle tools + mass delete (remove apps/ entry point and
      apps/src/templates/admin), 301s + 410s
- [ ] 2.4 StudioPerson + pilots + NPS, 301s + 410s
- [ ] 2.5 Reports (retain CSV endpoints), 301s
- [ ] 2.6 Engineer console (DCDO/Gatekeeper/feature_mode/dynamic_config)
      after break-glass sign-off, 301s + 410s

## 3. Final sweep

- [ ] 3.1 Remove log_admin_action and shared admin HAML scaffolding;
      grep for orphaned helpers/partials/ability references
- [ ] 3.2 /admin root 301 → SPA landing page; retained-endpoint
      inventory documented in routes comments

## 4. Verification

- [ ] 4.1 spring testunit affected suites; ./tools/hooks/pre-commit;
      apps/ build (webpack entry removal)
- [ ] 4.2 Manual: crawl the old directory page's link list — every URL
      301s to a working SPA page or is a documented retained endpoint;
      a legacy POST returns 410
