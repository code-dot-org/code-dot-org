/**
 * CC client for 3rd party extension
 *
 */

export default class cc_client {
    constructor(port) {
        this.port = port;
        this.baseUrl = "http://localhost:";
        this.asyncCallback = undefined;
    }

    /**
     * Check the connection between Code Connection
     *
     * @param {callback} asyncCallback - callback to handle return value (true / false)
     * @param {number} timeout - timeout for async ajax
     *
     */
    connectionStatusUpdate(asyncCallback, timeout) {
        this.asyncCallback = asyncCallback;
        var that = this;
        $.ajax({
            type: "GET",
            url: `${this.baseUrl}${this.port}/connected`,
            timeout: timeout,
            success: function (data) {
                // cc responded
                that.asyncCallback(data);
                that.asyncCallback = undefined;
            },
            error: function (jqxhr, textStatus, error) {
                // TODO: handle net::ERR_CONNECTION_REFUSED error gracefully
                that.asyncCallback(false);
                that.asyncCallback = undefined;
            }
        });
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
        $.ajax({
            type: "GET",
            url: `${this.baseUrl}${this.port}/${command}`,
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
                callback(false);
            }
        });
    }
}
