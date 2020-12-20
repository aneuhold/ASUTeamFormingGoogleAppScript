/**
 * Holds the methods and properties pertaining to functions that aren't better
 * held anywhere else.
 */
const Util = {
  /**
   * Gets a random number from 0 to the given max (exclusive).
   *
   * @param {Number} max
   */
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
};
