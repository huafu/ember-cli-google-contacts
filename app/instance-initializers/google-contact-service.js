import Ember from 'ember';
import ENV from '../config/environment';

export function initialize(application) {
  if (Ember.getWithDefault(ENV, 'social.google.autoLoad', true)) {
    application.container.lookup('service:google-contact').load();
  }
}

export default {
  name:       'google-contact-service',
  initialize: initialize
};
