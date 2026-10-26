# Spike: can a rule demonstrate itself?

The rule import dialog would be better if choosing a rule showed the rule DOING
something — the way the effect picker shows a still and animates the row you are
looking at. Before building that pipeline, two things were worth knowing:

1. **How long does a demo world take to author?** Twenty-three rules is a lot of
   little worlds, and they have to stay honest as the rules change.
2. **Is a still worth anything for a rule**, or does a rule only read in motion?
   The effect picker's design rests on the still being the feature and the
   motion being an enhancement. If that is false here, this is a more expensive
   feature than it looks.

Run it, then open `out/`:

```
npx vitest --run --config vitest.spike.config.ts
DUMP=rules/steering npx vitest --run --config vitest.spike.config.ts
```

`spikes/**` is excluded from the suite, so a spike needs its own config to be
found at all — a positional filter narrows the include set rather than widening
it.

## What is here

- `compile.tsx` — turns a stock `.rule` into a running module with no browser:
  the headless generator under jsdom, then each generated module rewritten into
  a function body with the engine injected and siblings read from what was
  compiled before it. Fragile in the way a spike may be, and it buys the REAL
  rules running rather than reimplementations that would drift.
- `svg.ts` — a recording as one self-contained animated SVG, and the single
  frame a still would use. Boxes, not sprites: enough to answer the question,
  not enough to be mistaken for the feature.
- `renderDemos.test.tsx` — three demo worlds: gravity, steering, collection.

## What it found

**Gravity and Collection demo well.** The ball falls and lands; the collector
walks through three coins and each vanishes as it is taken. Both read clearly in
motion. Both stills are ambiguous — a ball above ground could be falling, risen
or stationary, and a still of the collector is a walker beside some coins.

**Steering does not run at all.** `distance from ⟨a⟩ to ⟨b⟩` is a rule query
whose body does `b.get(PositionProperty)`, and the chase step calls it with
`actor.get(ActorToChaseProperty)` — which is a LIST, because `Traited.coerce`
stores an `actor`-typed property as one. So `b.get` is not a function, and a
chaser crashes the moment it has something to chase.

The call site is generated without the `WorldLab.one(…)` wrapper that a built-in
getter would have used, so this is not specific to Steering: any rule passing a
property-held actor into its own query or action parameter has it. Camera Follow
escapes only because it reads position through a built-in getter, which wraps.

## What it says about the feature

- **A still is not enough for a rule.** Two of three demos are ambiguous frozen,
  and the third only reads because something is missing from it. Where the
  effect picker can treat motion as an enhancement, a rule picker cannot.
- **Authoring a demo is not free.** Each world needs to know the rule's trait
  dependencies — the first Collection demo never moved, because a collector
  that does not also elect `Can Move` never reaches a coin.
- **Running the real rules is worth it.** The reimplementation route would have
  demoed a Steering that works, and shipped one that does not.
