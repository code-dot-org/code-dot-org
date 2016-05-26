/** @file Import chai and configure it for our own test style. */
import chai from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
chai.includeStack = true;
export default chai;
export const assert = chai.assert;
export const expect = chai.expect;
