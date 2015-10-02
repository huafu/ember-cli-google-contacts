import Ember from 'ember';

export function initialize(registry, application) {
  application.inject('route', 'googleContactService', 'service:google-contact');
  application.inject('controller', 'googleContactService', 'service:google-contact');
  application.inject('adapter:google-contact', 'googleContactService', 'service:google-contact');
  application.inject('model:google-contact', 'googleContactService', 'service:google-contact');
}

export default {
  name:       'google-contact-service',
  before:     'store',
  initialize: initialize
};
