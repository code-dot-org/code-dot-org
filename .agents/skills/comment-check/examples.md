# Examples

Comments from this repo that were flagged, grouped by verdict, with what replaced each. The ones with a "Reviewer:" line come from one review, on #77132. The others were flagged by a reader before review.

## DELETE

A comment that says what the lines under it say. Reviewer: "unnecessary comment".

```ts
// A picture that was not saved is not an image of the project, so
// there is nothing to show or rate: the student generates again.
if (!saved) {
  onGenerateFailed?.();
  setMode('edit');
  return;
}
```

Removed. `saved`, `onGenerateFailed` and `setMode('edit')` already say that the picture was not saved and the scene goes back to editing.

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

## UNCLEAR

A name for something the file never introduces, and a figure of speech. Reviewer: "what is 'before the host holds it back'?"

```ts
// The picture is stored before the host holds it back, so that
// leaving the page during the wait does not lose it.
const saved = await persist(entry, null);
...
await onReady?.(entry.result);
```

Better. It names the call that waits:

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

Better. The second sentence is gone, because nothing under the comment needed it:

```ts
// This failed save was for a drawing that is no longer open, so
// there is nothing to retry.
```

A vague phrase standing in for the thing it means.

```ts
// The tools open one frame of a character set, and all of anything else.
```

Better:

```ts
// The paint tools open one frame of a character set, and the whole
// picture otherwise.
```

## HISTORY

Reviewer: "comment that refers to old behavior".

```ts
// A picture is saved as a file the project points at, never inside the
// project itself, so a file that cannot be uploaded is a failed save.
const upload = useCallback(
  (filename: string, bytes: Uint8Array, mediaType: string) => {
    if (!uploadImage) {
      throw new Error('no uploader for this project');
    }
    return uploadImage(filename, bytes, mediaType);
  },
  [uploadImage]
);
```

Removed. "Never inside the project itself" says what the code does not do. It was there because an earlier version did save the picture inside the project, and that belongs in the PR description. The `throw` shows that a failed upload fails the save.

## RENAME

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

The first replacement was `uncountFailedGeneration`. "Uncount" is not a word, and the name was changed a second time.

A made-up name, with a comment to explain it.

```ts
// The variants found most recently in one folder, oldest first. A variant
// found in another folder replaces the whole entry.
let heldBack: {folder: string; variants: number[]} | undefined;
```

Better. The name takes its words from the comment, and the comment stays for the two facts the name does not give:

```ts
// The variants found most recently in one folder, oldest first. Finding a
// variant in another folder starts the list again.
let recentlyFound: {folder: string; variants: number[]} | undefined;
```

## RULE

"Don't describe callers or call sites" (`apps/src/AGENTS.md`). Reviewer: "unnecessary comment".

```ts
/** Called when a generation onGenerate announced ends with no picture,
    unless it was refused for safety. */
onGenerateFailed?: () => void;
```

Removed. The name says when it is called. The exception for a safety refusal is visible at the one place that calls it.

## Checking a rewording

A doc that a reviewer had questioned:

```ts
/** False updates the picture on screen without uploading the file, so
    the saved project still points at the last file uploaded; a new image
    is always uploaded, since it has no file yet. */
upload?: boolean;
```

The first rewording:

```ts
/** False updates the picture on screen and skips the file upload, which
    a later save makes. A new image is uploaded regardless, since it has
    no file yet. */
```

"Which a later save makes" is awkward, and the second sentence reads as a contradiction of the first. The second rewording puts the default first and states the exception as an exception:

```ts
/** Whether this save uploads the picture's file. Defaults to true. False
    is for an image that already has a file: the picture on screen
    changes, and the file is uploaded by a later save. A new image has no
    file yet, so false is ignored for it. */
```
