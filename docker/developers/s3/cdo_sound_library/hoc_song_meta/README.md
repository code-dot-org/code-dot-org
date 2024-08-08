# Dance Party - Song Metadata

This holds the Dance Party metadata files that describe the available songs. This
is generally held in the cdo-sound-library S3 bucket.

We populate this directory by looking at the manifest file and then pulling down
each song's metadata.

Since these songs are "restricted" via copyright, we populate this test directory
with fake songs instead. This is done via the `populate.rb` script in this path.
