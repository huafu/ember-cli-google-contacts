/* globals gapi */
import Ember from 'ember';
import ENV from '../config/environment';
import parseContact from '../utils/google-contact/parse-contact';
import parseNode from '../utils/google-contact/parse-node';

/**
 * @class GoogleContactService
 * @extends Ember.Object
 * @uses Ember.Evented
 */
export default Ember.Object.extend(Ember.Evented, {
  /**
   * Google auth token
   * @property authToken
   * @type {string}
   */
  authToken: null,

  /**
   * The owner of the token
   * @property authTokenOwner
   * @type {string}
   */
  authTokenOwner: null,


  /**
   * Whether the authentication has been done already or not
   * @property isAuthenticated
   * @type {boolean}
   */
  isAuthenticated: Ember.computed.bool('authToken'),

  /**
   * Load the service (get it ready)
   *
   * @method load
   * @return {Promise}
   */
  load: function () {
    var _this = this;
    return this._injectScript()
      .then(function () {
        return _this._getConfig();
      })
      .then(function (config) {
        if (config.apiKey) {
          return new Ember.RSVP.Promise(function (resolve/*, reject*/) {
            gapi.client.setApiKey(config.apiKey);
            Ember.run.next(function () {
              _this._authorize(true).then(resolve).catch(resolve);
            });
          });
        }
        return _this._authorize(true).catch(Ember.K);
      });
  },


  /**
   * Get authorization from the client
   *
   * @method authorize
   * @param {boolean} [reuse=false]
   * @return {Promise}
   */
  authorize: function (reuse) {
    if (reuse && this.get('authToken')) {
      return Ember.RSVP.resolve(this);
    }
    return this._authorize();
  },

  /**
   * Sign out of google
   *
   * @method signOut
   * @returns {Promise}
   */
  signOut: function () {
    var _this = this;
    return this._getConfig().then(function () {
      /*return new Ember.RSVP.Promise(function (resolve, reject) {
       _this.one('didError', Ember.run.bind(null, reject));
       _this.one('didSignOut', Ember.run.bind(null, resolve));
       gapi.auth.signOut();
       });*/
      gapi.auth.signOut();
      _this.setProperties({
        authToken:      null,
        authTokenOwner: null
      });
      _this.trigger('didSignOut');
      return _this;
    });
  },


  /**
   * Fetch contacts
   *
   * @method fetchContacts
   * @param {string} [contactId]
   * @return {Promise}
   */
  fetchContacts: function (contactId) {
    var url = 'https://www.google.com/m8/feeds/contacts/default/full';
    var _this = this;
    if (contactId) {
      if (typeof contactId === 'string') {
        url += '/' + encodeURIComponent(contactId);
      }
      else {
        url += Ember.$.param(contactId);
        contactId = null;
      }
    }
    return this.authorize(true).then(function (service) {
      var authToken = service.get('authToken');
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
          url:      url + '?access_token=' + authToken + '&alt=json',
          dataType: 'jsonp',
          success:  Ember.run.bind(null, function (data) {
            var owner = parseNode(data.feed.id);
            _this.set('authTokenOwner', owner);
            if (contactId) {
              resolve(parseContact(data.feed.entry, owner));
            }
            else {
              resolve(Ember.EnumerableUtils.map(data.feed.entry, function (entry) {
                return parseContact(entry, owner);
              }));
            }
          }),
          error:    Ember.run.bind(null, reject)
        });
      });
    });
  },

  /**
   * Inject the google client library
   *
   * @returns {Promise}
   * @private
   */
  _injectScript: function () {
    var _this = this;
    if (typeof gapi !== 'undefined') {
      return Ember.RSVP.resolve(this);
    }
    return new Ember.RSVP.Promise(function (resolve, reject) {
      window._emberCliGoogleContactLoaded = Ember.run.bind(null, function () {
        resolve(_this);
      });
      Ember.$.getScript('https://apis.google.com/js/client.js?onload=_emberCliGoogleContactLoaded')
        .fail(Ember.run.bind(null, reject));
    });
  },

  /**
   * Get the configuration as a promise
   *
   * @method _getConfig
   * @param {Array.<string>} [keys]
   * @return {Promise}
   * @private
   */
  _getConfig: function (keys) {
    var config = Ember.getWithDefault(ENV, 'social.google', {});
    if (typeof gapi === 'undefined') {
      return Ember.RSVP.reject(new Error('Unable to find google contacts API library. You must load the service yourself with `#load()` async method first if you defined `social.google.autoLoad` to `false` in your `config/environment.js`'));
    }
    if (config.clientId) {
      config = Ember.merge({
        scope:     'https://www.google.com/m8/feeds',
        client_id: config.clientId
      }, config);
      return Ember.RSVP.resolve(keys ? Ember.getProperties(config, keys) : config);
    }
    else {
      return Ember.RSVP.reject(new Error('You must define `social.google.clientId` in your `config/environment.js`.'));
    }
  },


  /**
   * Authorize wrapper
   *
   * @method _authorize
   * @param {boolean} [immediate=false]
   * @return {Promise}
   */
  _authorize: function (immediate) {
    var _this = this;
    return this._getConfig(['client_id', 'scope']).then(function (config) {
      if (immediate) {
        config.immediate = true;
      }
      return new Ember.RSVP.Promise(function (resolve, reject) {
        _this.one('didError', Ember.run.bind(null, reject));
        _this.one('didAuthorize', Ember.run.bind(null, resolve));
        // ask for authorization
        gapi.auth.authorize(config, _this.get('_authorizationHandler'));
      });
    });
  },


  /**
   * Used to handle google authorization/signout responses
   *
   * @method _authorizationHandler
   * @param {{access_token: string, error: string, expires_in: string, state: string}} oauth2Token
   * @private
   */
  _authorizationHandler: Ember.computed(function () {
    return Ember.run.bind(this, function (oauth2Token) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      if (oauth2Token.error) {
        // error
        if (oauth2Token.error === 'user_signed_out') {
          this.set('authToken', null);
          this.set('authTokenOwner', null);
          this.trigger('didSignOut');
        }
        else {
          this.trigger('didError', new Error(oauth2Token.error));
        }
      }
      else {
        // resolve with our service
        this.set('authToken', oauth2Token.access_token);
        this.set('authTokenOwner', null);
        this.trigger('didAuthorize', oauth2Token);
      }
    });
  }).readOnly()


});