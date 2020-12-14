/**
 * Changes here should be reflected in the `ConfigKey` type.
 *
 * @typedef ConfigObj
 * @type {{
 *  formTitle: string,
 *  formId: string
 * }}
 */

/**
 * Changes here should be reflected in the `ConfigObj` type.
 *
 * @typedef ConfigKey
 * @type {'formTitle' | 'formId'}
 */

function testConfig() {
  Logger.log(Config.getObj());
}

/**
 * Houses the methods and properties associated with the config for these
 * scripts.
 */
const Config = {
  /**
   * Gets the complete config object, populated with values from the "Config"
   * sheet, among other locations as well.
   *
   * @returns {ConfigObj} the complete config object
   */
  getObj() {
    if (configHelper.configObj !== null) {
      return configHelper.configObj;
    }
    configHelper.createConfigObj();
    return configHelper.configObj;
  },

  /**
   * Sets the value for the given config key. If the given config key exists
   * on the "Config" sheet, then that is updated too.
   *
   * @param {ConfigKey} configKey the config key name. For example `formId`.
   * @param {any} newValue the new value for the config item
   */
  setValue(configKey, newValue) {
    if (configHelper.configObj === null) {
      configHelper.createConfigObj();
    }
    configHelper.configObj[configKey] = newValue;
  },

  /**
   * Clears the "Config" sheet of set values.
   */
  clear() {
    const configSheet = SpreadSheet.getConfigSheet();
    const namedRanges = configSheet.getNamedRanges();
    namedRanges.forEach((namedRange) => {
      namedRange.getRange().clearContent();
    });
  },
};

/**
 * Contains methods and properties that should only be accessed or used by
 * functions within the `Config.js` file.
 */
const configHelper = {
  /**
   * @type {ConfigObj}
   */
  configObj: null,

  /**
   * Creates the `configObj` in the `configHelper` object. This pulls
   * information from the "Config" sheet to do that.
   */
  createConfigObj() {
    const configSheet = SpreadSheet.getConfigSheet();
    const namedRanges = configSheet.getNamedRanges();
    this.configObj = {};

    namedRanges.forEach((namedRange) => {
      // For all other cases
      const cellValue = namedRange.getRange().getValue();
      this.configObj[namedRange.getName()] = cellValue;
    });
  },
};
