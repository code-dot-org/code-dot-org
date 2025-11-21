# Hour of AI 2025 Generation Scripts

These scripts facilitate the generated music content for the Hour of AI
"Mix and Move" activity.

## Quick overview

The script generates content that will ultimately be stored in the curriculum
S3 bucket. This content is opportunistically fetched during the activity based
on the user-provided terms given in two of the levels via a "Madlib"-style
prompt with dropdowns with a very constrained set of options. (See descriptions
of each type below.)

Based on the options provided, it consistently forms a name of a file that will
contain a type of pseudo-code representation of a music lab project. It is this
file it fetches.

The object of this script is to generate all of the possible combinations of
options and store them with the same consistent names as files in that bucket.

The general flow is to:

1. Generate all of the content with the `--produce-layers` and `--produce-moods` options representing the two different types of adlibs.
2. Check the output in the `music_output` path relative to the script.
3. Then ultimately upload it via `--no-dry-run` flag and then carefully, with appropriate AWS credentials, the `--production` flag.

## Usage

The `generate_music` script will contact AI (gemini) to produce musiclab
psuedo-code for the various possible packs and choice combinations a student
might make during the activity.

There are two types of 'adlib' prompts:

```
Code a music mix that layers {layer1} and {layer2} together.
```

Where `layer\d` are one of the following (including duplicates): beats,
vocals, leads, bass. These correspond to the sound types that exist within
music lab packs. The scripts also can handle a third layer and a length
which was an early version of this prompt (see `:use_full_layers` option
hard-coded in the script)

```
Code a {mood} music mix with a {length} length, using {drums} drums.
```

Where the 'mood' is either simple, creative, or wild and the drums correspond
to the various provided packs and a 'default' option which uses the drums of
the current pack (song) which a student selects when first viewing the level.

### Usage

To generate ALL prompts (yikes... it's like 20k AI responses and that will
cost a relative ton), use this command:

```
./bin/oneoff/hoai_2025/generate_music --produce-layers --produce-moods
```

Likely you'll want to generate just the prompts and save them where the
final items would ultimately go: (This is a great place to start because
it generates _something_ which prevents any _real_ runs from sending any
AI prompts since it will have an output saved to the final location.)

Then, one can check a few of the prompts to see if the data is being
appropriately supplied from the pack manifest. Check the manifest file
(cached as `manifest.json`) if something has gone wrong to make sure
it has the content you expect. Remove that file if it is stale or
corrupted in any way.

Again, this does **not** send any prompts to actual AI agents.

```
./bin/oneoff/hoai_2025/generate_music --produce-layers --produce-moods --just-save-prompts
```

Once you generate prompts, it will not generate anything where there is
some output in the final `music_output` directory. Remove things from
that path to regenerate anything. To prevent generating output, use the
`--just-upload` directive, which goes to upload all valid generated
files only and skips using the AI.

### Filtering

You can use the `--filter` option to just run the script on packs that
match the given simple filter. To see the names of packs that are known,
use the `--list-packs` option.

```
./bin/oneoff/hoai_2025/generate_music --list-packs
```

To see what your filter would cover without generating or uploading:

```
./bin/oneoff/hoai_2025/generate_music --list-packs --filter="katy_perry"
```

To use the filter to generate just the prompts for a particular artist and
just the mood adlibs:

```
./bin/oneoff/hoai_2025/generate_music --filter="katy_perry" --no-produce-layers --produce-moods --just-save-prompt
```

### Uploading to S3

The `--dry-run` option is on by default. This means, it looks at uploading
but does not actually try to copy to S3. Specify `--no-dry-run` to enable
the uploading to S3.

By default it will go to the non-production bucket `cdo-curriculum-devel`.
Specify `--production` to ensure it goes to the live `cdo-curriculum`
bucket. There's no warning and this **WILL** overwrite live content.

If you only want to upload certain files:

1. Ensure only those files exist in the `music_output` directory.
2. Run with `--just-upload` to not generate anything new.
3. Run with `--no-dry-run` and see if the proper content gets to the devel bucket.
4. Run with `--no-dry-run --production` when you are certain.

### Validating

You can run the `validate_music` file to validate all items in the uploaded
directory (`music_output`). This process is also used before uploading to
ensure invalid output does not make it to production.

To automatically delete the offending files, specify the `--delete` flag
when using this script. After doing this, the `generate_music` script can
be invoked another time to generate any missing content.
