import DS from 'ember-data';

/**
 * @class GoogleContactSerializer
 * @extends DS.JSONSerializer
 */
export default DS.JSONSerializer.extend({
  isNewSerializerAPI: true
});
