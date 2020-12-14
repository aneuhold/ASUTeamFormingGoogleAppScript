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
    const ss = SpreadsheetApp.getActive();
    return ss.getSheetByName('Students'); // name of the sheet to read
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
};
