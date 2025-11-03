# Hour of AI 2025 Generation Scripts

## Music

The `generate_music` script will contact AI (gemini) to produce musiclab
psuedo-code for the various possible packs and choice combinations a student
might make during the activity.

There are a few types of 'adlib' prompts:

```
```

```
```

```
```

### Usage

To generate ALL prompts (yikes... it's like 20k AI responses and that will
cost a relative ton), use this command:

```
./bin/oneoff/hoai_2025/generate_music --produce-layers --produce-moods
```

Likely you'll want to generate just the prompts and save them where the
final items would ultimately go: (This is a great place to start because
it generates _something_ which prevents any _real_ runs from sending any
AI prompts)

Again, this does **not** send any prompts to actual AI agents.

```
./bin/oneoff/hoai_2025/generate_music --produce-layers --produce-moods --just-save-prompts
```

Once you generate prompts, it will not generate anything where there is
some output in the final `music_output` directory. Remove things from
that path to regenerate anything. To prevent generating output, use the
`--just-upload` directive, which goes to upload all valid generated
files only.

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
