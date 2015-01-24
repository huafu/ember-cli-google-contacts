import GoogleContactBasicArrayTransform from './google-contact-basic-array';

/**
 * @class GoogleContactCategoriesTransform
 * @extends GoogleContactBasicArrayTransform
 */
export default GoogleContactBasicArrayTransform.extend({
  /**
   * @inheritDoc
   * @param item
   * @returns {*}
   */
  parser: function (item) {
    return item;
  }
});
