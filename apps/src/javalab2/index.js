// Lazy entry. The webpack dynamic import in entrypoint.ts targets this file
// rather than the .tsx directly because our TS config requires the JS shim.
export {default as Javalab2View} from './Javalab2View';
