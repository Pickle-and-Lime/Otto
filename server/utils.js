var Q = require('q');

/**
* Provides general utility methods
* @module utils
* @requires Q
*/
/** 
* Provides general utility methods
* @class utils
* @static
*/

module.exports = {
  /**
  * Iterates over an array, mapping the returned value from the iterator
  * function to an array using promises. This allows us to use .then after
  * the mapping function completes
  *
  * @method promiseMap
  * @param arr {Array}
  * The array to iterate over
  * @param func {Function}
  * The function to call on each element in the array
  * @return {Promise}
  * A promise, which the first argument supplied will be the mapped array
  */  
  promiseMap : function(arr, func) {
    return Q().then(function () {
      return arr.map(function (el) { return func(el); });
    }).all();
  }
};