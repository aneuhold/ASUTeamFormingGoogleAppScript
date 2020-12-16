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
    Logger.log('The formID range was set to the new form ID');
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
};
