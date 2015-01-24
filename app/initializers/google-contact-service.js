import Ember from 'ember';
import ENV from '../config/environment';

export function initialize(container, application) {
  application.inject('route', 'googleContactService', 'service:google-contact');
  application.inject('controller', 'googleContactService', 'service:google-contact');
  application.inject('adapter:google-contact', 'googleContactService', 'service:google-contact');
  application.inject('model:google-contact', 'googleContactService', 'service:google-contact');

  if (Ember.getWithDefault(ENV, 'social.google.autoLoad', true)) {
    application.deferReadiness();
    container.lookup('service:google-contact').load().then(Ember.run(function () {
      application.advanceReadiness();
    }));
  }
}

export default {
  name:       'google-contact-service',
  before:     'store',
  initialize: initialize
};
