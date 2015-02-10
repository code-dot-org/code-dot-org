// ****************
//  IMPORTANT NOTE
// ****************
//
// This file contains proof-of-concept code (though it's safe for production)
// - UIComponent is an example React implementation
// - UIStore is an example Flux implementation
// - UIRouter is a really simple router
//
// These classes (and the derived ones) look pretty 'bulky' as they are written today.
// If we begin using React, this file will shrink to less than half of its current size.
// With CoffeeScript it'll shrink at least another half.
// There's really not that much "logic" here, it's just boilerplate that can be eliminated!

// New private scope -- a lot of this is boilerplate for class structures, taken from coffeescript
(function() {
  var
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };


  // class UIComponent: this is a lightweight inheritable class modeled after React
  var UIComponent = (function() {

    function UIComponent($el, props) {
      this.onClick = __bind(this.onClick, this);
      this.onUpdate = __bind(this.onUpdate, this);
      this.onDestroy = __bind(this.onDestroy, this);

      this.$el = $el;
      this.$el.on('click', this.onClick);
      this.$el.on('destroyed', this.onDestroy);

      this.props = props || $el.data();
      this.isMounting = true;

      // Set the initial state
      this.replaceState( this.getInitialState() || {} );
    }

    // Destroy a UI component
    UIComponent.prototype.onDestroy = function() {
      // Don't do anything if already not mounted
      if (!this.isMounted())
        return;

      this.componentWillUnmount();

      // Remove any event handlers
      var $el = this.$el;
      this.$el = null;
      $el.off('click', this.onClick);
      $el.on('destroyed', this.onDestroy);

      this.componentDidUnmount();
    }

    // Return a default state for this component
    UIComponent.prototype.getInitialState = function() { }

    // Extend/merge my state and possibly re-render
    UIComponent.prototype.setState = function(state) {
      if (!this.isUpdating) {
        // Allow things to settle - no need to call more than once per execution
        this.isUpdating = setTimeout( this.onUpdate, 1 );
      }

      // Merge this into our state
      for (var key in state) {
        if (__hasProp.call(state, key))
          this.state[key] = state[key];
      }
    }

    // Replace my state and possibly re-render
    UIComponent.prototype.replaceState = function(state) {
      if (!this.isUpdating) {
        // Allow things to settle - no need to call more than once per execution
        this.isUpdating = setTimeout( this.onUpdate, 1 );
      }

      this.state = state || {};
    }

    // My state has been changed, and we've let all other processes yield, so we know
    // there are no more changes coming.  Time to update the DOM.
    UIComponent.prototype.onUpdate = function(ev) {
      // Don't do anything if no longer mounted
      if (!this.isMounted())
        return;

      this.isMounting ? this.componentWillMount() : this.componentWillUpdate();

      this.render();
      delete this.isUpdating;

      this.isMounting ? this.componentDidMount() : this.componentDidUpdate();
      delete this.isMounting;
    }

    // Render into this element, given some state
    // There is no default rendering
    UIComponent.prototype.render = function() { }

    // Handle a click
    // There is no default click behavior
    UIComponent.prototype.onClick = function(ev) { }

    // Mount/unmount notifications
    UIComponent.prototype.componentWillMount = function() { }
    UIComponent.prototype.componentDidMount = function() { }
    UIComponent.prototype.componentWillUnmount = function() { }
    UIComponent.prototype.componentDidUnmount = function() { }
    UIComponent.prototype.componentWillUpdate = function() { }
    UIComponent.prototype.componentDidUpdate = function() { }
    UIComponent.prototype.isMounted = function() {
      return this.$el !== null;
    }

    return UIComponent;
  })();





  // class UIRouter: this is an incredibly simple router with our routes baked into it.
  // This will be completely replaced when we choose a router.
  UIRouter = (function() {

    function UIRouter() { }

    UIRouter.prototype.route = function() {
      var re, parts,
        url = window.location.pathname;

      // s/:script_id/level/:level_id
      // (only applies to the 20-hour course)
      re = /\/s\/\d+\/level\/(\d+)$/i;
      parts = url.match(re);
      if (parts) {
        window.headerProgress = new HeaderProgress( $('.header-wrapper'), {
          script_name: '20-hour',
          level_id: parts[1]
        });
        return;
      }

      // s/:script_name/stage/:stage_id/level/:level_id
      re = /\/s\/(.+)\/stage\/(\d+)\/puzzle\/(\d+)$/i;
      parts = url.match(re);
      if (parts) {
        window.headerProgress = new HeaderProgress( $('.header-wrapper'), {
          script_name: parts[1],
          stage_id: parts[2],
          level_id: parts[3]
        });
        return;
      }

      // Unknown route
      return null;
    }


    return UIRouter;
  })();




  // class UIStore: this is a lightweight inheritable *ABSTRACT* class modeled after Flux
  // UIStore is "offline-aware", meaning that it will load assets in a different way when
  // it knows that there is no network connection.
  var UIStore = (function() {

    function UIStore() {
      this.save = __bind(this.save, this);
      this.onAjaxFailure = __bind(this.onAjaxFailure, this);

      this.value = null; // Empty store
    }

    // Get the value of this store
    UIStore.prototype.value = function() { return this.value; }

    // When this store changes, notify via callback(data)
    // TODO: Maintain a list of callbacks
    UIStore.prototype.notify = function(callback) {
      this.notificationCallback = callback;
    }

    // Internal call to process any data that's being saved
    UIStore.prototype.process = function(data) { return data; }

    // Set the value of this store and notify the dependent
    UIStore.prototype.save = function(data) {
      this.value = this.process(data);

      // Note: Flux uses emitters...
      if (this.notificationCallback)
        this.notificationCallback(this.value);
    }

    // Resolve a dynamic asset by combining the base asset filename + a serialized version of the args
    // MUST override this.  It's okay to use args and dataType to determine the URL.
    UIStore.prototype.resolveUrl = function(args, dataType) {
      throw new Error("This store has not specified its URL.");
    }

    // Resolve a static asset by combining the base asset filename + a serialized version of the args
    // MUST override this if you want to support offline access.
    // Example: return "/data/file_" + args.id + "." + dataType;
    UIStore.prototype.resolveFilename = function(args, dataType) {
      throw new Error("This store does not support offline mode.");
    }

    // Resolve the AJAX parameters for a dynamic request
    // Okay to override this to, for instance, move some of the args into the URL, etc.
    UIStore.prototype.resolve = function(args, dataType) {
      return {
        url: this.resolveUrl(args, dataType),
        data: args
      };
    }

    // What are the AJAX parameters for this callback?
    // If you override this, the override should be offline-aware.
    UIStore.prototype.resolveAjax = function(args, dataType) {
      var ajax;

      if (!this.offline)
        return this.resolve(args);

      // Offline case
      return {
        url: this.resolveFilename(args, dataType)
      };
    }

    UIStore.prototype.onAjaxFailure = function(xhr, status, message) {
      // TODO
    }

    // Load data into this store
    UIStore.prototype.$load = function(args, dataType, fnSave) {
      dataType = dataType || "json";

      // Set up the AJAX call to request the asset and then store the data, or raise an error.
      var ajax = this.resolveAjax(args, dataType);
      ajax.dataType = dataType;
      ajax.success = fnSave || this.save;
      ajax.error = this.onAjaxError;

      return $.ajax(ajax);
    }

    // Load JSON data into this store.
    UIStore.prototype.load = function(args) {
      return this.$load(args, "json");
    }

    // Helper: Load XML and return it as a JSON structure
    UIStore.prototype.loadXML = function(args) {
      return this.$load(args, "xml");
    }

    // Helper: Load HTML into this store, as a string
    UIStore.prototype.loadHTML = function(args) {
      return this.$load(args, "html");
    }

    return UIStore;
  })();



  // class Application
  var Application = (function() {

    function Application() {
      this.router = new UIRouter();
    }

    Application.prototype.init = function() {
      this.router.route();
    }

    return Application;
  })();




  // Exports:
  window.UIStore = UIStore;
  window.UIComponent = UIComponent;
  window.UIRouter = UIRouter;
  window.App = new Application();

  $(document).ready(function() {
    window.App.init();
  });

}).call(this);
