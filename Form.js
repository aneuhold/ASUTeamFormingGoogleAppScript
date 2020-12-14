/**
 * Holds the methods and properties pertaining to the Google Form that is, or
 * could be, attached to the Google Sheet for this script.
 */
const Form = {

  /**
   * Creates a new form and assigns the form ID to the appropriate location
   * in the config.
   */
  create() {
    const { formTitle } = getConfig();
    const { formId } = getConfig();

    // If a form ID is already specified, do not create a new form.
    if (typeof formId === 'string' && formId !== '') {
      throw new Error('Form ID already specified in config. Please delete that'
      + 'form ID first before creating a form');
    }

    const newForm = FormApp.create(formTitle);
    Logger.log('New form was created');
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    newForm.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
    Logger.log('The new destination for the form was set');
    editConfigValue('formID', newForm.getId());
    Logger.log('The formID range was set to the new form ID');
  },
};
