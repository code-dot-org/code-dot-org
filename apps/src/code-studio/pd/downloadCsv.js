import saveCsv from 'save-csv';
import _ from 'lodash';

/**
 * Sends data as a csv download
 * @param {Array<Object>} data - the data to send
 * @param {String} filename - for the download
 * @param {Object} mapping of keys to heading names in the CSV download
 *        These keys will be used as a column filter on each row in the data,
 *        and the values will be used as column headings.
 */
const downloadCsv = ({data, filename, headers}) => {
  const includedKeys = Object.keys(headers);
  const exportData = data.map(row => {
    row = _.pick(row, includedKeys);
    row = _.mapKeys(row, (_, key) => headers[key]);
    row = _.mapValues(row, value => value || ""); // replace null with empty string

    return row;
  });

  saveCsv(exportData, {filename});
};

export default downloadCsv;
