# Using Honeybadger

Everything in Honeybadger should be assigned to someone, which is equivalent to "I've looked at it, doesn't need to be fixed right away". Every actual bug should be a pivotal item — Honeybadger things are bugs like any other bug so should be tracked in pivotal (there's not a perfect 1-1 mapping from honeybadger to pivotal because honeybadger is not perfect about determining whether an item is a duplicate).

First steps: (only need to do this once)

- Add your pivotal key in <https://www.honeybadger.io/users/edit>
- Configure notifications in <https://www.honeybadger.io/projects/3240#notifications>

Views:

- Default view (all unresolved):
<https://www.honeybadger.io/projects/3240/faults?resolved=f>
- Unresolved bugs assigned to nobody:
<https://www.honeybadger.io/projects/3240/faults?resolved=f&user=unassigned>

When looking at a new honeybadger item:

- If it's a new fault
  - If it's urgent
    - Fix it
  - If it's not urgent
    - Create a pivotal item (can do this with one click from honeybadger)
    - Assign the pivotal item to a person
    - Assign the honeybadger item to the same person
  - If it's a dupe of another honeybadger item or already tracked in pivotal
    - Assign the honeybadger item to the person who the dupe is already assigned to
    - Comment on the honeybadger item if it's not obvious what/why it's a dupe
- If it's an existing thing that is assigned to you
  - Look at it and verify that it hasn't changed the priority/urgency of the bug
- If it's an existing thing that is assigned to someone else
  - You don't need to do anything, they will take care of it
- If you are sure the right thing to do is to ignore the bug
  - Choose Ignore in honeybadger<br/>
  **Note!** most of the time the right thing to do is handle it in the code. you should leave it unresolved and track it if it's something that should be handled in code but is low priority

When you fix something:

- Resolve the honeybadger item when your fix is on production (if there's a pivotal item track it as any other pivotal item). Resolve basically says "I think this is fixed -- notify me if it happens again",  so you should resolve it when production is fixed, not e.g. when you are done with the work.
