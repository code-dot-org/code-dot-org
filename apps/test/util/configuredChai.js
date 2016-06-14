/** @file Import chai and configure it for our own test style. */
import chai from 'chai';
import chaiSubset from 'chai-subset';
import sinonChai from 'sinon-chai';
chai.use(chaiSubset);
chai.use(sinonChai);
chai.includeStack = true;
export default chai;
export const assert = chai.assert;
export const expect = chai.expect;
