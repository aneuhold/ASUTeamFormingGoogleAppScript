/**
 * Contains operations relating to the final results and analysis of the
 * responses.
 */
const Results = {
  generateResultsSheet() {
    const date = new Date();
    const newSheetName = `Results - ${date.toDateString()} ${date.getHours()}`
      + `:${date.getMinutes()}`;
    const resultsSheet = SpreadsheetApp.getActiveSpreadsheet()
      .insertSheet(newSheetName);
    resultsHelper.createHeaders(resultsSheet);
    resultsHelper.populateWithStudentResults(resultsSheet);
  },
};

/**
 * @typedef ColumnObj
 * @type {{
 *  title: string,
 *  studentObjKey: string,
 *  studentObjArrIndex: null | Number
 * }}
 */

/**
 * @typedef ColumnsArr
 * @type {ColumnObj[]}
 */

/**
 * Contains methods and properties that should only be accessed or used by
 * functions within the `Results.js` file.
 */
const resultsHelper = {

  /**
   * @type {ColumnsArr}
   */
  columns: null,

  /**
   * Gets the columns array that holds each column object which gives the
   * details of the column.
   *
   * @returns {ColumnsArr} the completed columns array
   */
  getColumnsArr() {
    if (this.columns !== null) {
      return this.columns;
    }
    this.createColumnsArr();
    return this.columns;
  },

  /**
   * Creates the columns array.
   *
   * @returns {void}
   */
  createColumnsArr() {
    this.columns = [
      {
        title: 'ASUrite ID',
        studentObjKey: 'asuId',
        studentObjArrIndex: null,
      },
      {
        title: 'Full Name',
        studentObjKey: 'fullName',
        studentObjArrIndex: null,
      },
      {
        title: 'Github Username',
        studentObjKey: 'githubUsername',
        studentObjArrIndex: null,
      },
      {
        title: 'Taiga Email',
        studentObjKey: 'taigaEmail',
        studentObjArrIndex: null,
      },
      {
        title: 'Timezone',
        studentObjKey: 'utcTimeZone',
        studentObjArrIndex: null,
      },
    ];
    const config = Config.getObj();
    config.proficiencyQuestions.forEach((question, i) => {
      this.columns.push({
        title: question,
        studentObjKey: 'proficiencies',
        studentObjArrIndex: i,
      });
    });
    for (let i = 0; i < config.numPreferredStudents; i++) {
      this.columns.push({
        title: `Preferred Student ${i + 1}`,
        studentObjKey: 'preferredStudents',
        studentObjArrIndex: i,
      });
    }
    for (let i = 0; i < config.numDislikedStudents; i++) {
      this.columns.push({
        title: `Disliked Student ${i + 1}`,
        studentObjKey: 'dislikedStudents',
        studentObjArrIndex: i,
      });
    }
  },

  /**
   * Creates the headers for the results sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to build the
   * headers on
   * @returns {void}
   */
  createHeaders(sheet) {
    this.getColumnsArr().forEach((columnObj, i) => {
      sheet.getRange(1, i + 1).setValue(columnObj.title);
      if (columnObj.studentObjKey === 'proficiencies') {
        this.applyGradientConditionalFormatting(sheet, i + 1);
      }
    });
  },

  /**
   * Applies gradient conditional formatting to the provided column number of
   * 1-5 where 1 is red and 5 is green.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to add the
   * conditional formatting to
   * @param {Number} columnNum the 1-based column number which should be
   * conditionally formatted
   * @returns {void}
   */
  applyGradientConditionalFormatting(sheet, columnNum) {
    // Arbitrary 200 rows to apply the formatting to
    const range = sheet.getRange(2, columnNum, 200, 1);
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .setGradientMaxpointWithValue('#3ECD35', SpreadsheetApp.InterpolationType.NUMBER, '5')
      .setGradientMinpointWithValue('#FF1515', SpreadsheetApp.InterpolationType.NUMBER, '1')
      .setRanges([range])
      .build();
    const rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  },

  /**
   * Populates the results from each student into the given sheet.
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet the sheet to put the
   * results into
   * @returns {void}
   */
  populateWithStudentResults(sheet) {
    const studentsObj = Students.getAll();
    const columnsArr = this.getColumnsArr();
    Object.values(studentsObj).forEach((studentObj, studentIndex) => {
      columnsArr.forEach((columnObj, columnIndex) => {
        const { studentObjKey, studentObjArrIndex } = columnObj;
        // If the columnObj has an array value
        if (studentObjArrIndex === null) {
          sheet.getRange(studentIndex + 2, columnIndex + 1)
            .setValue(studentObj[studentObjKey]);
        } else if (studentObj[studentObjKey][studentObjArrIndex] !== undefined) {
          sheet.getRange(studentIndex + 2, columnIndex + 1)
            .setValue(studentObj[studentObjKey][studentObjArrIndex]);
        }
      });
    });
  },
};
