/**
 * @typedef FormItemsObj
 * @type {{
 *  [formItemName: string]: {
 *    id: string,
 *    rowNum: Number
 *  }
 * }}
 */

/**
 * Contains operations relating to the main spreadsheet attached to this script.
 */
const SpreadSheet = {
  /**
   * Gets the Google Spreadsheet attached to this script.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} the Spreadsheet
   */
  get() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  /**
   * Gets the sheet where the students are.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} the sheet labeled "Students"
   */
  getStudentsSheet() {
    return this.get().getSheetByName('Students');
  },

  /**
   * Gets the "Config" sheet.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} the sheet labeled "Config"
   */
  getConfigSheet() {
    return this.get().getSheetByName('Config');
  },

  /**
   * Gets the 2d array of values representing all the values on the "Students"
   * sheet.
   *
   * @returns {string[][]} the 2d array of cell values
   */
  getAllStudentsSheetValues() {
    const studentsSheet = this.getStudentsSheet();

    // Skip the first row because of the titles of the columns
    return studentsSheet.getRange(2, 1,
      studentsSheet.getLastRow() - 1,
      studentsSheet.getLastColumn()).getValues();
  },

  /**
   * Gets the item ID associated with an item name for a form. This information
   * is held in a hidden sheet called "*formItemIds". The item ID can be used
   * to retrieve an item from the form attached to the spreadsheet.
   *
   * @param {FormItemName} itemName the name of the item to retrieve.
   * @returns {string} the ID of the item with the given itemName
   */
  getFormItemIdWithName(itemName) {
    const formItems = spreadSheetHelper.getFormItems();
    if (formItems[itemName] !== undefined) {
      return formItems[itemName].id;
    }
    throw new Error(`Form item with name ${itemName} has not been stored`);
  },

  /**
   * Adds an ID for the given form item to the hidden Google sheet. If the same
   * name already exists, it overwrites it.
   *
   * @param {FormItemName} itemName the name of the item to enter an ID for
   * @param {string} itemId the ID from item.getId()
   */
  addFormItemId(itemName, itemId) {
    const formItemIdSheet = spreadSheetHelper.getFormItemIdsSheet();
    const formItems = spreadSheetHelper.getFormItems();

    // If the item already exists
    if (formItems[itemName] !== undefined) {
      const { rowNum } = formItems[itemName];
      spreadSheetHelper.formItems[itemName] = {
        id: itemId,
        rowNum,
      };
      // Set the cell value of the associated ID
      formItemIdSheet.getRange(rowNum, 2, 1, 1).setValue(itemId);
      return;
    }

    const newRowNum = formItemIdSheet.getLastRow() + 1;
    spreadSheetHelper.formItems[itemName] = {
      id: itemId,
      rowNum: newRowNum,
    };
    formItemIdSheet.getRange(newRowNum, 1, 1, 2).setValues([[itemName, itemId]]);
  },
};

/**
 * Contains methods and properties that should only be accessed or used by
 * functions within the `SpreadSheet.js` file.
 */
const spreadSheetHelper = {

  /**
   * Holds the key value pairs for form item names and their associated IDs.
   * This mirrors the one held in the hidden sheet for these values.
   *
   * @type {FormItemsObj}
   */
  formItems: null,

  /**
   * Gets the formItems object or creates it if it hasn't already been made.
   *
   * @returns {FormItemsObj} the completed formItems object
   */
  getFormItems() {
    if (this.formItems === null) {
      this.createFormItemsObj();
    }
    return this.formItems;
  },

  /**
   * Gets the sheet that holds the form items and their associated IDs.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  getFormItemIdsSheet() {
    return SpreadSheet.get().getSheetByName('*formItemIds');
  },

  /**
   * Creates the formItems object by pulling information from the formItemIds
   * sheet.
   */
  createFormItemsObj() {
    this.formItems = {};
    const formItemSheet = this.getFormItemIdsSheet();
    const lastRow = formItemSheet.getLastRow();
    if (lastRow === 0) {
      return;
    }
    const formItemsRange = formItemSheet.getRange(1, 1,
      lastRow,
      formItemSheet.getLastColumn());
    const formItems = formItemsRange.getValues();

    formItems.forEach((row, index) => {
      // First column is the name, second is the ID 😁
      const [formName, formId] = row;
      this.formItems[formName] = {
        id: formId,
        rowNum: index + 1,
      };
    });
  },
};
