- with Chef workstation installed, run `eval "$(chef shell-init bash)"` from a
  directory outside of our repo (or possibly just outside of the cookbooks
  directory?) to active the correct Ruby environment.
- Then, can run the standard kitchen commands. Looks like Ubuntu 18 doesn't work, so we'll need to update everything to at least 20.
- See docs at https://kitchen.ci/
