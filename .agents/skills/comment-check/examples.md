# Examples

Comments from this repo that a reviewer flagged, or that a cold read caught before review. Each shows the test it failed and what replaced it. The first six are from one review, on #77132.

## Delete

A doc on a callback prop that describes the caller. Reviewer: "unnecessary comment".

```ts
/** Called when a generation onGenerate announced ends with no picture,
    unless it was refused for safety. */
onGenerateFailed?: () => void;
```

Removed. The prop's name says when it is called.

A comment that says what the `if` under it says. Reviewer: "unnecessary comment".

```ts
// A picture that was not saved is not an image of the project, so
// there is nothing to show or rate: the student generates again.
if (!saved) {
  onGenerateFailed?.();
  setMode('edit');
  return;
}
```

Removed.

A comment that restates the declarations under it.

```scss
// A label too long for a narrow header is cut short with an ellipsis.
.label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

Removed.

## Unclear

An actor and a verb the reader has never met. Reviewer: "what is 'before the host holds it back'?"

```ts
// The picture is stored before the host holds it back, so that
// leaving the page during the wait does not lose it.
const saved = await persist(entry, null);
```

Better, naming the thing in the code that waits:

```ts
// Save before `onReady`, which can wait before the picture is shown,
// so the picture is not lost if the student leaves the page during
// that wait.
```

A pointing phrase. Reviewer: "confusing comment (especially second sentence)".

```ts
// The student has left this drawing, so it has no canvas to try
// again from. The flags above belong to the drawing open now.
```

Better:

```ts
// This failed save was for a drawing that is no longer open, so
// there is nothing to retry.
```

Words left out until the sentence does not parse.

```ts
// The tools open one frame of a character set, and all of anything else.
```

Better:

```ts
// The paint tools open one frame of a character set, and the whole
// picture otherwise.
```

A comment that can be read two ways.

```scss
// The panel is the color of the lab's other dialogs in the dark theme.
background-color: var(--background-neutral-primary);
```

Better, saying what is overridden and where it applies:

```scss
// chrome.panel is a lighter gray in the dark theme. This matches the
// lab's other dialogs, and changes nothing in the light theme.
```

## History

Reviewer: "comment that refers to old behavior".

```ts
// A picture is saved as a file the project points at, never inside the
// project itself, so a file that cannot be uploaded is a failed save.
const upload = useCallback(...
```

Removed. "Never inside the project itself" is there only because an earlier version did save it inside the project. That belongs in the PR description.

## Rename

Neither the comment nor the name says what happens. Reviewer: "this comment plus function name are really hard to parse".

```ts
// A generation that made no picture is not one of the level's.
const returnGeneration = useCallback(
  () => setGenerationCount(count => Math.max(count - 1, 0)),
  []
);
```

Better:

```ts
// A failed generation does not count toward the level's limit.
const subtractFailedGeneration = useCallback(
```

The first replacement name was `uncountFailedGeneration`. "Uncount" is not a word, and it was changed again. Use dictionary words.

A name coined in the session, with a comment to explain it.

```ts
// The variants found most recently in one folder, oldest first.
let heldBack: {folder: string; variants: number[]} | undefined;
```

Better. The comment already had the right words:

```ts
let recentlyFound: {folder: string; variants: number[]} | undefined;
```

## A rewording that made it worse

The first fix for a doc the reviewer had questioned:

```ts
/** False updates the picture on screen and skips the file upload, which
    a later save makes. A new image is uploaded regardless, since it has
    no file yet. */
upload?: boolean;
```

"Which a later save makes" is awkward, and the second sentence seems to contradict the first. Better, with the default first and the exception stated as an exception:

```ts
/** Whether this save uploads the picture's file. Defaults to true. False
    is for an image that already has a file: the picture on screen
    changes, and the file is uploaded by a later save. A new image has no
    file yet, so false is ignored for it. */
```
