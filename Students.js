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
