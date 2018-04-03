import saveCsv from 'save-csv';

/**
 * Sends data as a csv download
 * @param {Array<Object>} data - the data to send
 * @param {String} filename - for the download
 * @param {Object} mapping of keys to heading names in the CSV download
 *        These keys will be used as a column filter on each row in the data,
 *        and the values will be used as column headings.
 */
const downloadCsv = ({data, filename, headers}) => {
  const exportData = data.map(row => {
    const exportRow = {};

    for (const key in headers) {
      let value = row[key];
      if (Array.isArray(value)) {
        value = `[${value.join(", ")}]`;
      } else if (!value) {
        value = ""; // replace null with empty string
      }

      exportRow[headers[key]] = value;
    }

    return exportRow;
  });

  saveCsv(exportData, {filename});
};

export default downloadCsv;
