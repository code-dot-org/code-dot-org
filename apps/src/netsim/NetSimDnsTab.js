/**
 * @overview UI controller for the DNS tab in the left column.
 */
import $ from 'jquery';
import markup from './NetSimDnsTab.html.ejs';
import {DnsMode} from './NetSimConstants';
import NetSimDnsModeControl from './NetSimDnsModeControl';
import NetSimDnsManualControl from './NetSimDnsManualControl';
import NetSimDnsTable from './NetSimDnsTable';
import NetSimGlobals from './NetSimGlobals';

/**
 * Generator and controller for "DNS" tab.
 * @param {jQuery} rootDiv
 * @param {function} dnsModeChangeCallback
 * @param {function} becomeDnsCallback
 * @constructor
 */
export default function NetSimDnsTab(
  rootDiv,
  dnsModeChangeCallback,
  becomeDnsCallback
) {
  /**
   * Component root, which we fill whenever we call render()
   * @type {jQuery}
   * @private
   */
  this.rootDiv_ = rootDiv;

  /**
   * @type {function}
   * @private
   */
  this.dnsModeChangeCallback_ = dnsModeChangeCallback;

  /**
   * @type {function}
   * @private
   */
  this.becomeDnsCallback_ = becomeDnsCallback;

  /**
   * @type {NetSimDnsModeControl}
   * @private
   */
  this.dnsModeControl_ = null;

  /**
   * @type {NetSimDnsManualControl}
   * @private
   */
  this.dnsManualControl_ = null;

  /**
   * @type {NetSimDnsTable}
   * @private
   */
  this.dnsTable_ = null;

  this.render();
}

/**
 * Fill the root div with new elements reflecting the current state
 */
NetSimDnsTab.prototype.render = function () {
  var levelConfig = NetSimGlobals.getLevelConfig();

  var renderedMarkup = $(
    markup({
      level: levelConfig,
    })
  );
  this.rootDiv_.html(renderedMarkup);

  if (levelConfig.showDnsModeControl) {
    this.dnsModeControl_ = new NetSimDnsModeControl(
      this.rootDiv_.find('.dns_mode'),
      this.dnsModeChangeCallback_
    );
  }

  this.dnsManualControl_ = new NetSimDnsManualControl(
    this.rootDiv_.find('.dns_manual_control'),
    this.becomeDnsCallback_
  );

  this.dnsTable_ = new NetSimDnsTable(this.rootDiv_.find('.dns_table'));
};

/**
 * @param {DnsMode} newDnsMode
 */
NetSimDnsTab.prototype.setDnsMode = function (newDnsMode) {
  if (this.dnsModeControl_) {
    this.dnsModeControl_.setDnsMode(newDnsMode);
  }

  this.dnsTable_.setDnsMode(newDnsMode);
  this.rootDiv_
    .find('.dns_manual_control')
    .toggle(newDnsMode === DnsMode.MANUAL);
  this.rootDiv_.find('.dns-notes').toggle(newDnsMode !== DnsMode.NONE);
};

/**
 * @param {boolean} isDnsNode
 */
NetSimDnsTab.prototype.setIsDnsNode = function (isDnsNode) {
  this.dnsManualControl_.setIsDnsNode(isDnsNode);
};

/**
 * @param {Array} tableContents
 */
NetSimDnsTab.prototype.setDnsTableContents = function (tableContents) {
  this.dnsTable_.setDnsTableContents(tableContents);
};
