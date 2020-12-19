/**
 * This file is used for housing the main functions that the sheet will run
 * through button presses.
 */

/**
 * Updates the form set in the config with the `formId` with the questions for
 * each student.
 */
function updateForm() {
  Form.updateForm();
}

function createForm() {
  Form.create();
}

function deleteForm() {
  Form.delete();
}

function clearForm() {
  Form.deleteAllItems();
}

function addTestResponses() {
  Test.submitTestResponsesForStudent('aneuhold');
}

function permanentlyClearResponses() {
  Form.permanentlyClearResponses();
}
