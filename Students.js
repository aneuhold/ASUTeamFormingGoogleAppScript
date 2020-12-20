/**
 * @typedef StudentObj
 * @type {{
 *  fullName: string,
 *  asuId: string,
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
      .map((studentObj) => `${studentObj.asuId} - ${studentObj.fullName}`)
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
    // Get a copy of the asurite IDs and take the one to skip out
    const studentsObjCopy = { ...this.getAll() };
    delete studentsObjCopy[asuriteToSkip];

    // Create the array of values to choose from
    const studentsArr = Object.values(studentsObjCopy);

    const asuIds = [];
    for (let i = 0; i < numIds; i++) {
      const randomIdIndex = Util.getRandomInt(studentsArr.length);
      asuIds.push(studentsArr.splice(randomIdIndex, 1)[0]);
    }
    return asuIds;
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
   * Creates a Students Object by pulling information from the "Students" sheet.
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
      };
    }

    this.studentsObj = studentsObj;
    return this.studentsObj;
  },

};
