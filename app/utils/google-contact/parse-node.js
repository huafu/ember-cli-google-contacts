import Ember from 'ember';

/**
 * Extract the text our of a string if it has # in it
 *
 * @function attrValue
 * @param {string} value
 * @return {string}
 */
function attrValue(value) {
  if (typeof value === 'string') {
    if (value.indexOf('#') !== -1) {
      value = value.split('#').pop();
    }
    return decodeURIComponent(value);
  }
  return value;
}

/**
 * Parse a google contacts feed's node
 *
 * @function googleContactParseNode
 * @param {Object} node
 * @param {string} key
 * @param {Object} transformers
 * @param {*} [defaultValue]
 * @return {string|Object}
 */
export default function googleContactParseNode(node, key, transformers, defaultValue) {
  var value = key ? Ember.get(node, key) : node;
  if (value) {
    if (typeof value === 'object') {
      if (value.$t) {
        value = attrValue(value.$t);
      }
      else {
        if (value.rel) {
          value.rel = attrValue(value.rel);
        }
        if (transformers) {
          Ember.EnumerableUtils.forEach(transformers, function (transformer, key) {
            if (value[key] !== undefined) {
              value[key] = transformer(value[key]);
            }
          });
        }
      }
    }
    else if (typeof value === 'string') {
      value = attrValue(value);
    }
  }
  if (value === undefined) {
    value = defaultValue;
  }
  return value;
}
