import DS from 'ember-data';
import Ember from 'ember';

/**
 * @class GoogleContact
 * @extends DS.Model
 *
 * @property {GoogleContactService} googleContactService
 */
export default DS.Model.extend({
  /**
   * Owner of the contact
   * @property owner
   * @type {string}
   */
  owner: DS.attr('string'),

  /**
   * The auth token used to grab this contact
   * @property authToken
   * @type {string}
   */
  authToken: Ember.computed(
    'googleContactService.authTokenOwner', 'googleContactService.authToken', 'owner', function () {
      if (this.get('googleContactService.authTokenOwner') === this.get('owner')) {
        return this.get('googleContactService.authToken');
      }
    }).readOnly(),

  /**
   * Update date
   * @property updatedAt
   * @type {Date}
   */
  updatedAt: DS.attr('date'),

  /**
   * Categories
   * @property categories
   * @type {Array.<string>}
   */
  categories: DS.attr('google-contact-categories'),

  /**
   * Title
   * @property title
   * @type {string}
   */
  title: DS.attr('string'),

  /**
   * Links
   * @property links
   * @type {Array.<{rel: string, type: string, href: string}>}
   */
  links: DS.attr('google-contact-links'),

  /**
   * Email addresses
   * @property emails
   * @type {Array.<{rel: string, address: string, primary: boolean}>}
   */
  emails: DS.attr('google-contact-emails'),

  /**
   * Primary or any email
   * @property anyEmail
   * @type {string}
   */
  anyEmail: Ember.computed('emails.@each', function () {
    var emails = this.get('emails');
    return emails.findBy('primary') || emails.findBy('address');
  }).readOnly(),

  /**
   * First available photo URL
   * @property anyPhotoUrl
   * @type {}
   */
  anyPhotoUrl: Ember.computed('links.@each', function () {
    var links, photo, authToken;
    authToken = this.get('authToken');
    if (authToken) {
      links = this.get('links');
      photo = links.findBy('rel', 'edit-photo') || links.findBy('rel', 'photo');
      if (photo) {
        return photo.get('href') + '?access_token=' + authToken;
      }
    }
  }).readOnly()

});
