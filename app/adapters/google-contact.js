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
  find: function (store, type, id) {
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
  findQuery: function (store, type, query/*, recordArray*/) {
    return this.googleContactService.fetchContacts(query);
  }
});
