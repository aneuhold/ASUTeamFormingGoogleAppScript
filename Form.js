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
    const { formTitle, formId } = Config.getObj();

    // If a form ID is already specified, do not create a new form.
    if (typeof formId === 'string' && formId !== '') {
      throw new Error('Form ID already specified in config. Please delete that'
      + 'form ID first before creating a form');
    }

    const newForm = FormApp.create(formTitle);
    Logger.log('New form was created');
    const spreadsheet = SpreadSheet.get();
    newForm.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
    Logger.log('The new destination for the form was set');
    Config.setValue('formId', newForm.getId());
    Logger.log('The formId range was set to the new form ID');
  },

  /**
   * Gets the form that should be used to update and collect data from once
   * responses are submitted.
   *
   * @returns {GoogleAppsScript.Forms.Form | null} the form with the ID
   * specified in the config or `null` if no form ID is specified in the config
   */
  get() {
    const { formId } = Config.getObj();

    if (formId === '' || formId === undefined) {
      Logger.log('form ID must be specified to get the form');
      return null;
    }

    return FormApp.openById(formId);
  },

  /**
   * Updates the form set in the config with the `formId` with the questions
   * used to form teams.
   */
  updateForm() {
    const form = Form.get();
    const { formDescription } = Config.getObj();
    form.setDescription(formDescription);

    formHelper.addAsuriteQuestion(form);
  },

  /**
   * Deletes the form attached to the spreadsheet for this script if there is
   * one. It also unlinks, and removes the sheet associated with it.
   */
  delete() {
    const form = this.get();
    if (form === null) {
      throw new Error('No form ID specified in the config');
    }

    // Unlink the form
    form.removeDestination();

    // Put the form in the trash
    DriveApp.getFileById(form.getId()).setTrashed(true);

    // Find the name of the sheet with the responses
    const spreadsheet = SpreadSheet.get();
    const sheets = spreadsheet.getSheets();
    let responsesSheetName = '';
    let i = 0;
    while (responsesSheetName === '' && i < sheets.length) {
      const currentSheetName = sheets[i].getName();
      if (currentSheetName.includes('Form Responses')) {
        responsesSheetName = currentSheetName;
      }
      i++;
    }

    // Remove the sheet with the name "Form Responses"
    const responseSheet = spreadsheet.getSheetByName(responsesSheetName);
    spreadsheet.deleteSheet(responseSheet);

    // Remove the config value
    Config.setValue('formId', '');
  },
};

/**
 * Contains methods and properties that should only be accessed or used by
 * functions within the `Form.js` file.
 */
const formHelper = {

  /**
   * Adds the ASURITE ID question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addAsuriteQuestion(form) {
    const listItem = form.addListItem()
      .setTitle('Please select your ASURITE ID');
    const choices = Students.getAsuriteIdsSorted();
    listItem.setChoiceValues(choices)
      .setRequired(true);
  },
};
