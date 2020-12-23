/**
 * @typedef StudentObj
 * @type {{
 *  fullName: string,
 *  asuId: string,
 *  preferredStudents: string[],
 *  dislikedStudents: string[],
 *  proficiencies: Number[],
 *  utcTimeZone: Number,
 *  taigaEmail: string,
 *  githubUsername: string
 * }}
 */

/**
 * @typedef StudentsObj
 * @type {{
 *  [asuId: string]: StudentObj
 * }}
 */

/**
 * Contains operations relating to the students in the course.
 */
const Students = {
  getById(asuId) {
    throw new Error('getById not implemented yet');
  },

  /**
   * Gets the StudentsObj by pulling information from the students sheet and
   * from the responses. If the object has already been created, then that is
   * returned instead.
   *
   * @returns {StudentsObj} the completed set of StudentObj objects
   * @throws if a student doesn't have an asurite ID on the students
   * sheet
   */
  getAll() {
    if (studentsHelper.studentsObj !== null) {
      return studentsHelper.studentsObj;
    }
    studentsHelper.studentsObj = studentsHelper.createStudentsObj();
    return studentsHelper.studentsObj;
  },

  /**
   * Gets the ASURITE IDs sorted alphabetically as an array.
   *
   * @returns {string[]} the sorted array of ASURITE IDs
   */
  getAsuriteIdsSorted() {
    const studentsObj = this.getAll();
    return Object.values(studentsObj)
      .map((studentObj) => studentObj.asuId)
      .sort();
  },

  /**
   * Gets the set of strings for each student holding their asurite then their
   * full name. For example: "aneuhold - Anton Neuhold".
   *
   * @returns {string[]} the set of asurite name combos for each student in the
   * class sorted alphabetically
   */
  getAsuriteNameCombos() {
    if (studentsHelper.asuriteNameComboStrings !== null) {
      return studentsHelper.asuriteNameComboStrings;
    }
    const studentsObj = this.getAll();
    studentsHelper.asuriteNameComboStrings = Object.values(studentsObj)
      .map((studentObj) => studentsHelper
        .createIdNameComboString(studentObj.asuId, studentObj.fullName))
      .sort();
    return studentsHelper.asuriteNameComboStrings;
  },

  /**
   * Gets a random asurite ID that is not the one provided.
   *
   * @param {string} asuriteToSkip the asurite ID to skip
   * @param {Number} numIds the number of IDs to get. These will be unique,
   * and there will not be duplicates.
   * @returns {string[]} the random asurite IDs
   */
  getRandomAsurites(asuriteToSkip, numIds) {
    if (numIds === 0) {
      return [];
    }

    // Get a copy of the asurite IDs and take the one to skip out
    const studentsObjCopy = { ...this.getAll() };
    delete studentsObjCopy[asuriteToSkip];

    // Create the array of values to choose from
    const studentsObjArr = Object.values(studentsObjCopy);

    const asuIds = [];
    for (let i = 0; i < numIds; i++) {
      const randomIdIndex = Util.getRandomInt(studentsObjArr.length);
      asuIds.push(studentsObjArr.splice(randomIdIndex, 1)[0].asuId);
    }
    return asuIds;
  },

  /**
   * Gets a set of random asurite ID, name combos that are not the one provided.
   *
   * @param {string} asuriteToSkip the asurite ID to skip
   * @param {Number} numIds the number of IDs to get. These will be unique,
   * and there will not be duplicates.
   * @returns {string[]} the random asurite ID, name combos
   */
  getRandomAsuriteNameCombos(asuriteToSkip, numIds) {
    const studentsObj = this.getAll();
    const randomIds = this.getRandomAsurites(asuriteToSkip, numIds);
    return randomIds.map((asuriteId) => studentsHelper
      .createIdNameComboString(studentsObj[asuriteId].asuId,
        studentsObj[asuriteId].fullName));
  },
};

/**
 * Contains methods and properties that should only be accessed or used by
 * functions within the `Students.js` file.
 */
const studentsHelper = {
  /**
   * Holds information on each student.
   *
   * @type {StudentsObj | null}
   */
  studentsObj: null,

  /**
   * Holds the strings for each student which starts with their asurite, and
   * ends with their full name. For example: "aneuhold - Anton Neuhold".
   *
   * @type {string[]}
   */
  asuriteNameComboStrings: null,

  /**
   * Creates a Students Object by pulling information from the "Students" sheet,
   * and from the responses if they exist.
   *
   * @returns {StudentsObj} the completed students object
   */
  createStudentsObj() {
    const studentsObj = {};

    // Go through the students sheet for data
    const allStudentsSheetValues = SpreadSheet.getAllStudentsSheetValues();
    for (let row = 0; row < allStudentsSheetValues.length; row++) {
      const currentRow = allStudentsSheetValues[row];
      const asuId = currentRow[1].trim().toLowerCase(); // Second column has ASURite ID
      const fullName = currentRow[0]; // First column has the student's name

      // If the ID is empty
      if (asuId === '') {
        throw new Error(`ID for ${fullName} was empty.`);
      }

      // If the ID has already been entered into the objects
      if (studentsObj[asuId] !== undefined) {
        Logger.log(`ERROR (getStudentsObj): Asu ID of ${asuId} has already been entered into studentsObj.`,
          `Currently this is row ${row + 1} being processed`);
      }

      studentsObj[asuId] = {
        asuId,
        fullName,
        preferredStudents: [],
        dislikedStudents: [],
      };
    }

    const form = Form.get();
    const responses = form.getResponses();
    if (responses.length === 0) {
      this.studentsObj = studentsObj;
      return this.studentsObj;
    }

    // Pull information from the responses
    responses.forEach((response) => {
      this.extractDataFromResponse(studentsObj, response);
    });

    Logger.log(JSON.stringify(studentsObj, null, 2));

    this.studentsObj = studentsObj;
    return this.studentsObj;
  },

  /**
   * Extracts the data from a response into the provided studentsObj.
   *
   * @param {StudentsObj} studentsObj the studentsObj to put the extracted
   * data into
   * @param {GoogleAppsScript.Forms.FormResponse} formResponse the response to
   * extract data from
   */
  extractDataFromResponse(studentsObj, formResponse) {
    const { ITEMS } = Form;
    const asuriteItem = Form.getItemsWithName(ITEMS.asuriteQuestion.itemName)[0];
    const asurite = formResponse.getResponseForItem(asuriteItem).getResponse();
    if (studentsObj[asurite] === undefined) {
      throw new Error(`asurite of ${asurite} was not defined in the `
      + ' studentsObj');
    }

    // Preferred students
    this.extractTeammatePreferences(ITEMS.preferredStudents.itemName,
      formResponse, studentsObj, asurite);

    // Disliked students
    this.extractTeammatePreferences(ITEMS.dislikedStudents.itemName,
      formResponse, studentsObj, asurite);
  },

  /**
   * Gets the teammate preferences and puts it into the provided `studentsObj`
   * depending on which `itemName` is given. This can be used with preferred
   * students or disliked students.
   *
   * @param {string} itemName the name of the form item to get the preference
   * for. For example `preferredStudents`.
   * @param {GoogleAppsScript.Forms.FormResponse} formResponse
   * @param {StudentObj} studentsObj
   * @param {string} asurite the asurite of the student to give the teammate
   * preferences to
   */
  extractTeammatePreferences(itemName, formResponse, studentsObj, asurite) {
    const studentsItems = Form.getItemsWithName(itemName);
    studentsItems.forEach((studentItem) => {
      const studentString = this.getResponseFromItem(formResponse, studentItem);
      if (studentString !== null) {
        const studentId = this.getIdFromNameComboString(studentString);
        studentsObj[asurite][itemName].push(studentId);
      }
    });
  },

  /**
   * Gets the response data for the given item from the given form response
   * object. Returns null if no response exists for that item.
   *
   * @param {GoogleAppsScript.Forms.FormResponse} formResponse
   * @param {GoogleAppsScript.Forms.Item} formItem
   * @returns {null | string | string[] | string[][]} null if no response and
   * one of the different types of reponse data that can be returned
   */
  getResponseFromItem(formResponse, formItem) {
    const itemResponse = formResponse.getResponseForItem(formItem);
    if (itemResponse === null) {
      return null;
    }
    return itemResponse.getResponse();
  },

  /**
   * Creates the asurite ID, name combo string. For example
   * `aneuhold - Anton Neuhold`. This is just to standardize the format so if
   * it changes here, it changes everywhere.
   *
   * @param {string} asuriteId the ID to create the string for
   * @returns {string} the asurite ID, name combo string
   */
  createIdNameComboString(asuId, fullName) {
    return `${asuId} - ${fullName}`;
  },

  /**
   * Pulls the ID out of an already assembled name-combo string.
   *
   * See `createIdNameComboString`
   *
   * @param {string} str the name-combo string to pull the asurite ID out of
   * @returns {string} the asurite ID
   */
  getIdFromNameComboString(str) {
    return str.split(' ')[0];
  },
};
