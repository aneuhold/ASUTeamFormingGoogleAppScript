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
   * @returns {GoogleAppsScript.Forms.Form} the form with the ID
   * specified in the config
   * @throws {Error} if no form ID is specified in the config
   */
  get() {
    const { formId } = Config.getObj();

    if (formId === '' || formId === undefined) {
      throw new Error('No form ID specified in the config');
    }

    return FormApp.openById(formId);
  },

  /**
   * Updates the form set in the config with the `formId` with the questions
   * used to form teams.
   */
  updateForm() {
    const form = this.get();
    const { formDescription } = Config.getObj();
    form.setDescription(formDescription);

    formHelper.addAsuriteQuestion(form);
    formHelper.addGithubUserNameQuestion(form);
    formHelper.addTaigaEmailAddressQuestion(form);
    formHelper.addTimeZonesQuestion(form);
    // Add available times question
    formHelper.addProficiencyQuestions(form);
    formHelper.addPreferredStudentsSection(form);
    formHelper.addDislikedStudentsSection(form);
  },

  /**
   * Deletes the form attached to the spreadsheet for this script if there is
   * one. It also unlinks, and removes the sheet associated with it.
   */
  delete() {
    const form = this.get();

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

  /**
   * Deletes all items (questions and sections) on the form.
   */
  deleteAllItems() {
    const form = this.get();
    const formItems = form.getItems();
    // Doing in reverse because the index shrinks as things are deleted.
    for (let i = formItems.length - 1; i >= 0; i--) {
      form.deleteItem(i);
    }
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

  /**
   * Adds the Github username question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addGithubUserNameQuestion(form) {
    form.addTextItem().setTitle('Please enter your Github username (NOT '
    + 'your email address)')
      .setRequired(true);
  },

  /**
   * Adds the Taiga email question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addTaigaEmailAddressQuestion(form) {
    form.addTextItem().setTitle('Email address for us to invite you to the '
    + 'Taiga scrumboard')
      .setRequired(true);
  },

  /**
   * Adds the preferred students section which will populate with the number
   * of preferred students allowed as specified in the config.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the section to
   */
  addPreferredStudentsSection(form) {
    form.addPageBreakItem().setTitle('Preferred Teammates')
      .setHelpText('Are there fellow students you would prefer to work'
      + ' with?');

    // Build the options for each one
    const { numPreferredStudents } = Config.getObj();
    const asuriteNameComboStrings = Students.getAsuriteNameCombos();
    for (let i = 0; i < numPreferredStudents; i++) {
      form.addListItem()
        .setTitle(`Preferred team member ${i + 1}`)
        .setChoiceValues(asuriteNameComboStrings);
    }
  },

  /**
   * Adds the disliked students section which will populate with the number
   * of disliked students allowed as specified in the config.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the section to
   */
  addDislikedStudentsSection(form) {
    form.addPageBreakItem().setTitle('Teammates NOT Preferred')
      .setHelpText('Are there fellow students you would prefer NOT to work'
      + ' with?');

    // Build the options for each one
    const { numDislikedStudents } = Config.getObj();
    const asuriteNameComboStrings = Students.getAsuriteNameCombos();
    for (let i = 0; i < numDislikedStudents; i++) {
      form.addListItem()
        .setTitle(`Non-preferred student ${i + 1}`)
        .setChoiceValues(asuriteNameComboStrings);
    }
  },

  /**
   * Adds the time zone question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addTimeZonesQuestion(form) {
    const listItem = form.addListItem()
      .setTitle('In what time zone do you live or will you be during the'
      + ' session? Please use UTC so we can match it easier.');

    const choices = [];

    // Generate UTC timezones choices
    for (let i = -11; i <= 12; i++) {
      choices.push(`UTC ${i < 0 ? '' : '+'}${i}`);
    }

    listItem.setChoiceValues(choices)
      .setRequired(true);
  },

  /**
   * Adds the proficiency questions to the form as specified in the config.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the questions to
   */
  addProficiencyQuestions(form) {
    const { proficiencyQuestions } = Config.getObj();
    proficiencyQuestions.forEach((question) => {
      form.addScaleItem()
        .setTitle(question)
        .setBounds(1, 5);
    });
  },
};
