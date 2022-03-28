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
   * The color of a cell which indicates that data should be entered into it.
   */
  INFO_ENTRY_CELL_COLOR: '#fbbc04',

  /**
   * The color which indicates that the range is empty without actually deleting
   * the range.
   *
   * This is red.
   */
  EMPTY_RANGE_COLOR: '#ff0000',

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
   * Gets the item ID/s associated with an item name for a form. This
   * information is held in a hidden sheet called "*formItemIds". The item ID
   * can be used to retrieve an item from the form attached to the spreadsheet.
   *
   * @param {string} itemName the name of the item to pull IDs for
   * @returns {string[]} the IDs of the item/s associated with the given
   * itemName
   */
  getFormItemIdWithName(itemName) {
    const formItems = spreadSheetHelper.getFormItems();
    let formItemId = formItems[itemName].id;
    if (formItemId !== undefined) {
      formItemId = formItemId.toString();
      if (formItemId.includes(';')) {
        return formItemId.split(';');
      }
      return [formItemId];
    }
    throw new Error(`Form item with name ${itemName} has not been stored`);
  },

  /**
   * Adds an ID for the given form item to the hidden Google sheet. If the same
   * name already exists, it overwrites it.
   *
   * @param {string} itemName the name of the item to add the form ID for
   * @param {string} itemId the ID or IDs from item.getId(). If multiple IDs
   * are being added, then use a `;` to deliniate them.
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

  /**
   * Get the object holding the different form items and their Ids.
   *
   * @returns {FormItemsObj} the complete formItemsObj
   */
  getFormItemsObj() {
    return spreadSheetHelper.getFormItems();
  },

  /**
   * Adds a single cell to the given named range after the last one in the
   * column.
   *
   * @param {string} namedRangeName the name of the named range to add a cell
   * after
   * @returns {void}
   */
  addCellToNamedRange(namedRangeName) {
    const namedRange = this.get().getRangeByName(namedRangeName);
    const sheet = namedRange.getSheet();

    // If the range is already red (means empty), then just update the color
    if (namedRange.getBackground() === this.EMPTY_RANGE_COLOR) {
      namedRange.setBackground(this.INFO_ENTRY_CELL_COLOR);
      return;
    }

    // Update the range so it includes the new cell
    const newRange = sheet.getRange(namedRange.getRow(), namedRange.getColumn(),
      namedRange.getNumRows() + 1, namedRange.getNumColumns());

    // Update the color
    newRange.setBackground(this.INFO_ENTRY_CELL_COLOR);

    // Set the updated range to the named range
    this.get().setNamedRange(namedRangeName, newRange);
  },

  /**
   * Removes a cell from the given named range.
   *
   * If only one cell is left, it changes the background of the final cell to
   * red.
   *
   * @param {string} namedRangeName the name of the range to remove a cell from.
   */
  removeCellFromNamedRange(namedRangeName) {
    const namedRange = this.get().getRangeByName(namedRangeName);
    const sheet = namedRange.getSheet();

    // If the background of the cell is already red, then don't do anything
    if (namedRange.getBackground() === this.EMPTY_RANGE_COLOR) {
      return;

    // If there is only one cell left, then remove the text and change the
    // background to red
    } if (namedRange.getNumRows() === 1) {
      namedRange.setValue('');
      namedRange.setBackground(this.EMPTY_RANGE_COLOR);
    } else {
      // Reset the last cell in the named range
      namedRange.getCell(namedRange.getNumRows(), namedRange.getNumColumns())
        .setBackground('white').setValue('');

      // Create a new range without the last cell
      const newRange = sheet.getRange(namedRange.getRow(), namedRange.getColumn(),
        namedRange.getNumRows() - 1, namedRange.getNumColumns());

      // Set the updated range to the named range
      this.get().setNamedRange(namedRangeName, newRange);
    }
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
