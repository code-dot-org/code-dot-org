/** @file Import chai and configure it for our own test style.
 * This file is deprecated because chai-enzyme is deprecated.
 * Please use reconfiguredChai.js instead.
 * */
import chai from 'chai';
import chaiSubset from 'chai-subset';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiXml from 'chai-xml';

chai.use(sinonChai);
chai.use(chaiEnzyme());
chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(chaiXml);
chai.includeStack = true;
chai.config.truncateThreshold = 0;
export default chai;
export const assert = chai.assert;
export const expect = chai.expect;
