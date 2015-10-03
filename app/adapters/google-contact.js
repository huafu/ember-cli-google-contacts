import DS from 'ember-data';
import Ember from 'ember';

function notImplementedError(feature) {
  return new Error('GoogleContactAdapter.' + feature + ' is not yet implemented.');
}

/**
 * @class GoogleContactAdapter
 * @extends DS.Adapter
 *
 * @property {GoogleContactService} googleContactService
 */
export default DS.Adapter.extend({
  /**
   * @inheritDoc
   */
  findRecord: function (store, type, id) {
    return this.googleContactService.fetchContacts(id);
  },

  /**
   * @inheritDoc
   */
  createRecord: function (/*store, type, record*/) {
    return Ember.RSVP.reject(notImplementedError('createRecord'));
  },

  /**
   * @inheritDoc
   */
  updateRecord: function (/*store, type, record*/) {
    return Ember.RSVP.reject(notImplementedError('updateRecord'));
  },

  /**
   * @inheritDoc
   */
  deleteRecord: function (/*store, type, record*/) {
    return Ember.RSVP.reject(notImplementedError('deleteRecord'));
  },

  /**
   * @inheritDoc
   */
  findAll: function (/*store, type, sinceToken*/) {
    return this.googleContactService.fetchContacts();
  },

  /**
   * @inheritDoc
   */
  query: function (store, type, query/*, recordArray*/) {
    return this.googleContactService.fetchContacts(query);
  },

  /**
   * Overriding for ember 1.13 to inherit new default reload behavior in prep for Ember 2
   */
   shouldReloadAll: function( store, snapshot) {
     return !snapshot.length;
  }
});
