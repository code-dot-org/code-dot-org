# Authored product tours

Product tours that levelbuilders write in the lab itself, as opposed to the
tours in `../productToursPerLab.ts`, which are written in code. Each lab has
one library of tours, a JSON file per tour in
`dashboard/config/product_tours/<lab>/`. A level uses a tour by listing it in
its `tour_references` property, which also says whether the tour starts on
its own.

The student resources tab lists the tours the level references. It also
lists, on every level of the lab, the tours named in
`ListedAuthoredToursPerLab`; those are the lab's product tours, as opposed to
tours written for a lesson.

## Making a lab tourable

A step can point only at an element the lab has marked as an anchor:

```tsx
<Button data-tour-anchor="train-button" data-tour-label="Train model button">
```

`data-tour-anchor` is the name saved in tours. Treat it like an API: renaming
or removing it breaks the tours that use it. `data-tour-label` is what the
levelbuilder sees in the editor; without it the editor falls back to
`aria-label`, then to the name.

Mark what a student clicks and the regions a tour would describe. A name
must not depend on level content, such as a dataset or column: a tour is
shared by levels with different content. Repeated elements share one name
("tree-node", "column-header"); a step points at the first one on the page,
and a click on any of them meets a click requirement.

Design system components such as `Tabs` and `SegmentedButtons` do not pass
the attributes through to the elements they draw. List those parts by
selector in the lab's file beside `tourAnchors.ts` (see
`ailabTourAnchors.ts`).

When a student action is not a click, such as training a model, add an event
in `tourEvents.ts` and call `reportTourEvent` from the lab when it happens.

## Editing tours

From a level's edit page, follow "Edit tours in the lab". That opens
`/levels/<id>/edit_blocks/authored_tours`, where the editor runs beside the
lab. "This level" lists the library tours the level uses; "Library" lists
every tour of the lab. A tour opens read-only; "Edit tour" in its menu enters
edit mode. An edit reaches every level that uses the tour, so the editor
offers a copy when other levels use it. The levelbuilder Save button in the
page header saves the level and the library together. A tour that another
level uses cannot be deleted.
