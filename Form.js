/**
 * The details of an item stored in the survey. Sometimes the item actually
 * represents multiple items when those extra items are variable in quantity.
 *
 * @typedef FormItemDetails
 * @type {{
 *  itemName: string,
 *  multipleItems: boolean,
 *  addItemResponse: (data: ResponseCreationData) => void,
 * }}
 */

/**
 * Holds information that may be needed to create a response for any given
 * form item.
 *
 * @typedef ResponseCreationData
 * @type {{
 *  formResponse: GoogleAppsScript.Forms.FormResponse,
 *  asurite: string
 * }}
 */

/**
 * Holds the methods and properties pertaining to the Google Form that is, or
 * could be, attached to the Google Sheet for this script.
 */
const Form = {

  /**
   * The constant holding information and values for each item or set of items
   * in the form. These values are used for retrieval, storage, and processing,
   * but should not be manipulated.
   *
   * @type {{
   *  [itemName: string]: FormItemDetails
   * }}
   */
  ITEMS: {
    asuriteQuestion: {
      itemName: 'asuriteQuestion',
      multipleItems: false,
      addItemResponse(data) {
        const { formResponse, asurite } = data;
        const asuriteItem = Form.getItemsWithName(this.itemName)[0]
          .asListItem();
        const asuriteResponse = asuriteItem.createResponse(asurite);
        formResponse.withItemResponse(asuriteResponse);
      },
    },
    githubUsername: {
      itemName: 'githubUsername',
      multipleItems: false,
      addItemResponse(data) {
        const { formResponse, asurite } = data;
        const githubItem = Form.getItemsWithName(this.itemName)[0]
          .asTextItem();
        const githubResponse = githubItem.createResponse(asurite);
        formResponse.withItemResponse(githubResponse);
      },
    },
    taigaEmail: {
      itemName: 'taigaEmail',
      multipleItems: false,
      addItemResponse(data) {
        const { formResponse, asurite } = data;
        const taigaItem = Form.getItemsWithName(this.itemName)[0]
          .asTextItem();
        const taigaResponse = taigaItem.createResponse(`${asurite}@gmail.com`);
        formResponse.withItemResponse(taigaResponse);
      },
    },
    timeZone: {
      itemName: 'timeZone',
      multipleItems: false,
      addItemResponse(data) {
        const { formResponse } = data;
        const timeZoneItem = Form.getItemsWithName(this.itemName)[0]
          .asListItem();
        const randomTimeZone = DateUtil.getRandomUTCTimeZone();
        const timeZoneResponse = timeZoneItem.createResponse(randomTimeZone);
        formResponse.withItemResponse(timeZoneResponse);
      },
    },
    preferredStudents: {
      itemName: 'preferredStudents',
      multipleItems: true,
      addItemResponse(data) {
        const { formResponse, asurite } = data;
        const preferredStudentsItems = Form.getItemsWithName(this.itemName);
        const randomNumStudents = Util.getRandomInt(preferredStudentsItems.length);
        const randomAsuriteIds = Students
          .getRandomAsuriteNameCombos(asurite, randomNumStudents);
        for (let i = 0; i < randomNumStudents; i++) {
          const listItem = preferredStudentsItems[i].asListItem();
          const itemResponse = listItem.createResponse(randomAsuriteIds[i]);
          formResponse.withItemResponse(itemResponse);
        }
      },
    },
    dislikedStudents: {
      itemName: 'dislikedStudents',
      multipleItems: true,
      addItemResponse(data) {
        const { formResponse, asurite } = data;
        const dislikedStudentsItems = Form.getItemsWithName(this.itemName);
        const randomNumStudents = Util.getRandomInt(dislikedStudentsItems.length);
        const randomAsuriteIds = Students
          .getRandomAsuriteNameCombos(asurite, randomNumStudents);
        for (let i = 0; i < randomNumStudents; i++) {
          const listItem = dislikedStudentsItems[i].asListItem();
          const itemResponse = listItem.createResponse(randomAsuriteIds[i]);
          formResponse.withItemResponse(itemResponse);
        }
      },
    },
    proficiencyQuestions: {
      itemName: 'proficiencyQuestions',
      multipleItems: true,
      addItemResponse(data) {
        // Not implemented yet
      },
    },
    availability: {
      itemName: 'availability',
      multipleItems: false,
      addItemResponse(data) {
        const { formResponse } = data;
        const availabilityItem = Form.getItemsWithName(this.itemName)[0]
          .asCheckboxGridItem();
        const numColumns = availabilityItem.getColumns().length;
        const numRows = availabilityItem.getRows().length;
        const weekDays = DateUtil.getWeekdayStrings();
        const responseGrid = [];
        for (let row = 0; row < numRows; row++) {
          responseGrid[row] = [];
          for (let col = 0; col < numColumns; col++) {
            const coinFlip = Util.getRandomInt(2);
            if (coinFlip === 1) {
              responseGrid[row].push(weekDays[col]);
            }
          }
        }
        Logger.log(responseGrid);
        const itemResponse = availabilityItem.createResponse(responseGrid);
        formResponse.withItemResponse(itemResponse);
      },
    },
  },

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
    formHelper.addAvailabilityGrid(form);
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

  /**
   * Gets the form item/s with the given name. This might be a set of items
   * or a single item depending on the one chosen.
   *
   * @param {string} itemName the name of the item to retrieve. This should
   * be pulled in from the ITEMS object instead of manually.
   * @returns {GoogleAppsScript.Forms.Item[]} the set of items in an array
   */
  getItemsWithName(itemName) {
    const form = this.get();
    const itemIds = SpreadSheet.getFormItemIdWithName(itemName);
    if (itemIds.length === 0) {
      throw new Error(`No item ids found for ${itemName}`);
    }
    return itemIds.map((itemId) => form.getItemById(itemId));
  },

  /**
   * Permanently clears all responses from the form.
   */
  permanentlyClearResponses() {
    this.get().deleteAllResponses();
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

    SpreadSheet.addFormItemId('asuriteQuestion', listItem.getId());
  },

  /**
   * Adds the Github username question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addGithubUserNameQuestion(form) {
    const textItem = form.addTextItem()
      .setTitle('Please enter your Github username (NOT '
      + 'your email address)')
      .setRequired(true);

    SpreadSheet.addFormItemId('githubUsername', textItem.getId());
  },

  /**
   * Adds the Taiga email question to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the question to
   */
  addTaigaEmailAddressQuestion(form) {
    const textItem = form.addTextItem()
      .setTitle('Email address for us to invite you to the '
      + 'Taiga scrumboard')
      .setRequired(true);

    const emailValidation = FormApp.createTextValidation()
      .setHelpText('Text entered was not a valid email address')
      .requireTextIsEmail()
      .build();

    textItem.setValidation(emailValidation);
    SpreadSheet.addFormItemId('taigaEmail', textItem.getId());
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
    const preferredStudentItemIds = [];
    const asuriteNameComboStrings = Students.getAsuriteNameCombos();
    for (let i = 0; i < numPreferredStudents; i++) {
      const listItem = form.addListItem()
        .setTitle(`Preferred team member ${i + 1}`)
        .setChoiceValues(asuriteNameComboStrings);
      preferredStudentItemIds.push(listItem.getId());
    }
    SpreadSheet.addFormItemId('preferredStudents', preferredStudentItemIds.join(';'));
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
    const dislikedStudentItemIds = [];
    const asuriteNameComboStrings = Students.getAsuriteNameCombos();
    for (let i = 0; i < numDislikedStudents; i++) {
      const listItem = form.addListItem()
        .setTitle(`Non-preferred student ${i + 1}`)
        .setChoiceValues(asuriteNameComboStrings);
      dislikedStudentItemIds.push(listItem.getId());
    }
    SpreadSheet.addFormItemId('dislikedStudents', dislikedStudentItemIds.join(';'));
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

    const choices = DateUtil.getUTCTimeZoneStrings();

    listItem.setChoiceValues(choices)
      .setRequired(true);
    SpreadSheet.addFormItemId('timeZone', listItem.getId());
  },

  /**
   * Adds the proficiency questions to the form as specified in the config.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the questions to
   */
  addProficiencyQuestions(form) {
    const { proficiencyQuestions } = Config.getObj();
    const proficiencyItemIds = [];
    proficiencyQuestions.forEach((question) => {
      const scaleItem = form.addScaleItem()
        .setTitle(question)
        .setBounds(1, 5);
      proficiencyItemIds.push(scaleItem.getId());
    });
    SpreadSheet.addFormItemId('proficiencyQuestions', proficiencyItemIds.join(';'));
  },

  /**
   * Adds the availability grid to the form.
   *
   * @param {GoogleAppsScript.Forms.Form} form the form to add the questions to
   */
  addAvailabilityGrid(form) {
    const checkboxItem = form.addCheckboxGridItem()
      .setTitle('Please choose times that are good for your team to meet. '
      + 'Times are in the Phoenix, AZ time zone!')
      .setColumns(DateUtil.getWeekdayStrings())
      .setRows(DateUtil.generateTimeStrings(3));
    SpreadSheet.addFormItemId('availability', checkboxItem.getId());
  },
};
