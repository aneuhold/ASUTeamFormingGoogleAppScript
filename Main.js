/**
 * This file is used for housing the main functions that the sheet will run
 * through button presses.
 *
 * Link to the github repo for these scripts:
 * https://github.com/aneuhold/ASUTeamFormingGoogleAppScript
 */

/**
 * Updates the form set in the config with the `formId`, with the questions for
 * each student.
 */
function updateForm() {
  Form.updateForm();
}

/**
 * Creates a new form.
 */
function createForm() {
  Form.create();
}

/**
 * Deletes the form attached to the spreadsheet, disconnects the responses
 * sheet, and deletes that sheet as well.
 */
function deleteForm() {
  Form.delete();
}

/**
 * Clears the form attached to the spreadsheet of all questions.
 */
function clearForm() {
  Form.deleteAllItems();
}

/**
 * Generates results from the recieved student responses.
 */
function generateResults() {
  Results.generateResultsSheet();
}

/**
 * Adds a single test response to the attached form.
 */
function addTestResponse() {
  Test.submitTestResponsesForStudent('aneuhold');
}

/**
 * Adds test responses for every student listed in the students sheet.
 */
function addTestResponses() {
  Test.submitTestResponsesForAllStudents();
}

/**
 * Permanently clears all responses from the attached form.
 */
function permanentlyClearResponses() {
  Form.permanentlyClearResponses();
}

/**
 * Adds a row to the proficiencyQuestions named range.
 */
function addRowToProficiencyQuestions() {
  SpreadSheet.addRowToNamedRange('proficiencyQuestions');
}

/**
 * Removes a row from the proficiencyQuestions named range.
 */
function removeRowFromProficiencyQuestions() {
  SpreadSheet.removeRowFromNamedRange('proficiencyQuestions');
}
