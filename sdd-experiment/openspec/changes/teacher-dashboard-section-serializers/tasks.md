# Tasks: teacher-dashboard-section-serializers

Sequenced after teacher-dashboard-shell is implemented (its
field-equivalence tests are the safety net).

## 1. Survey and fixtures

- [ ] 1.1 Survey `dashboard/app/serializers` for the prevailing idiom;
      record the choice
- [ ] 1.2 Build the fixture matrix (six login types, archived, co-taught,
      PL, null-curriculum, age-gated) and capture legacy method output per
      shape

## 2. Extract, one shape per commit

- [ ] 2.1 Concise serializer + byte-diff tests + delegation
- [ ] 2.2 Selected serializer + byte-diff tests + delegation
- [ ] 2.3 Summarize serializer (+ include_students variant decision) +
      byte-diff tests + delegation

## 3. Pin the contracts

- [ ] 3.1 Key-set, overlap-set, and both-merge-precedence tests
- [ ] 3.2 Serializer docs: the three shapes, their consumers, the merge
      paths

## 4. Verification

- [ ] 4.1 Full dashboard test suite green; shell field-equivalence tests
      green; `./tools/hooks/pre-commit`
