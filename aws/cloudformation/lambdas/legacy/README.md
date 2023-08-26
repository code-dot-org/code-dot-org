# Legacy Lambdas

Previously, this code lived in aws/cloudformation, and it was a little messy. We are either moving towards individual lambda directories, with their own package.json files, or to a more consistent shared lambda dev folder. This "legacy" folder contains the lambdas simply moved from their previous location.

## Local Development

```bash
nvm use # should pick up Node 18
npm install
```
## Next Steps

Migrate these lambdas to standalone directories, or bundle them as appropriate.
