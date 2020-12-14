/**
 * Used for the config variable.
 *
 * @typedef ConfigObj
 * @type {{
 *  formTitle: string,
 *  formId: string,
 * }}
 */

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
};

const configHelper = {
  /**
   * @type {ConfigObj}
   */
  configObj: null,
  createConfigObj() {

  },
};
