/* eslint-disable import/order */
const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export default escapeRegExp;
