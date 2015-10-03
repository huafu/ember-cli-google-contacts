import Ember from 'ember';
import parseNode from './parse-node';

function makeNodeParser(key, dstKey, transformers) {
  return function (node, contact) {
    contact[dstKey || key] = parseNode(node, key, transformers);
  };
}
function makeNodeArrayParser(key, dstKey, transformers) {
  var subKey;
  if (typeof transformers === 'string') {
    subKey = transformers;
    transformers = null;
  }
  return function (node, contact) {
    var array = contact[dstKey || key] = [];
    Ember.getWithDefault(node, key, []).forEach(function (item) {
      array.push(parseNode(item, subKey, transformers));
    });
  };
}
function parseJson(json) {
  return JSON.parse(json);
}

var PARSERS = [
  makeNodeParser('id'),
  makeNodeParser('updated', 'updatedAt'),
  makeNodeArrayParser('category', 'categories', 'term'),
  makeNodeParser('title'),
  makeNodeArrayParser('link', 'links'),
  makeNodeArrayParser('gd$email', 'emails', {})
];

/**
 * Parse one contact from the feed
 *
 * @function googleContactParseContact
 * @param {Object} contact
 * @return {Object}
 */
export default function googleContactParseContact(contact, owner) {
  var parsed = {};
  PARSERS.forEach(function (parser) {
    parser(contact, parsed);
  });
  parsed.owner = owner;
  return parsed;
}
