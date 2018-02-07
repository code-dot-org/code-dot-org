import $ from 'jquery';

/**
 * CC client for 3rd party extension
 *
 */

const baseUrl = "http://localhost:";
export default class cc_client {

    callbackRef = null;
    keyRef = null;

    constructor(port) {
      this.port = port;
      if (window.ipcRenderer !== undefined) {
        window.ipcRenderer.on('responseFromApp', (event, jsonResponse) =>{
          let response = JSON.parse(jsonResponse);
          if (response.api === 'basic') {
            if (this.keyRef !== null) {
              this.callbackRef(response [this.keyRef]);
            } else {
              this.callbackRef();
            }
          }
        });
      }
    }

    /**
     * Check the connection between Code Connection
     *
     * @param {callback} asyncCallback - callback to handle return value (true / false)
     * @param {number} timeout - timeout for async ajax
     *
     */
    connectionStatusUpdate(asyncCallback, timeout = 200) {
      if (window.ipcRenderer !== undefined) {
        asyncCallback(window.ipcRenderer !== undefined);
      } else {
        $.ajax({
          type: "GET",
          url: `${baseUrl}${this.port}/connected`,
          timeout: timeout,
          success: function (data) {
            // cc responded
            asyncCallback(data);
          },
          error: function (jqxhr, textStatus, error) {
            // TODO: handle net::ERR_CONNECTION_REFUSED error gracefully
            asyncCallback(false);
          }
        });
      }
    }
    /**
     * Asynchronous command that calls callback with return value later
     *
     * @param {string} command - command name
     * @param {function} callback - callback to handle return value
     * @param {string} key - key of the return value in returned json
     *
     */
    async_command(command, callback, key) {
      //before ajax
      if (window.ipcRenderer !== undefined) {
        window.ipcRenderer.sendToHost('sendToApp', {
          'api': 'basic',
          'url': `${baseUrl}${this.port}/${command}`
        });
        this.callbackRef = callback;
        this.keyRef = key;
      } else {
        $.ajax({
          type: "GET",
          url: `${baseUrl}${this.port}/${command}`,
          success: function (data) {
            console.log(`Command : ${command} success result : ${data.toString()}`);
            if (key !== null) {
              callback(JSON.parse(data)[key]);
            } else {
              callback();
            }
          },
          error: function (jqxhr, textStatus, error) {
            console.log(`Command : ${command} fail`, error);
            callback();
          }
        });
      }
    }
}
