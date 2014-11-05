# How to update level builder
* `ssh levelbuilder.code.org`
* `cd levelbuilder`
* `git checkout -b levelbuilder`
* `git add .`
* `git commit -m "level builder changes"`
* `git push origin levelbuilder`
* `# handle the merge via git hub UI`
* `git checkout staging`
* `git pull`
* `rake build:dashboard`

These steps will:
* commit level builder changes
* push latest staging changes to levelbuilder.
