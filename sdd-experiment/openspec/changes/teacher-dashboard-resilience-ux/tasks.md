# Tasks: teacher-dashboard-resilience-ux

Depends on teacher-dashboard-shell; homepage/roster adopt as they land.

## 1. Shared components

- [ ] 1.1 Error-state component (DSCO alert + MUI Button retry) in the
      package; unit + axe tests
- [ ] 1.2 Skeleton idiom (MUI Skeleton) for section list, chrome, roster
      table; shared mask id for the harness

## 2. Feature adoption

- [ ] 2.1 Shell: bootstrap + selected-section queries render error/skeleton
      states; MSW `error` scenario exercises them
- [ ] 2.2 Homepage: home-scalars and drawer queries adopt; scenario-list
      deviation entries recorded
- [ ] 2.3 Roster: students query adopts; deviation entries recorded

## 3. Access-denied messaging

- [ ] 3.1 Obtain and record the product ruling on copy (blocker for this
      group only)
- [ ] 3.2 Wire the message through the flash/toast channel on the redirect
      destination; behavior test

## 4. Verification

- [ ] 4.1 Visual harness masks verified (unmasked skeleton/error frame
      fails); `yarn release:dryrun`; live check of error + retry on
      `http://localhost-studio.code.org:9000/frontend-studio/teacher_dashboard/home`
      with Rails stopped mid-session (or MSW error scenario standalone)
