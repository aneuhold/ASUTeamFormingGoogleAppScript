/**
 * This file is used for housing the main functions that the sheet will run
 * through button presses.
 */

/**
 * Updates the form set in the config with the `formId` with the questions for
 * each student.
 */
function updateForm() {
  const form = Form.get();
  const { formDescription } = Config.getObj();
  form.setDescription(formDescription);

  const studentsObj = Students.getAll();

  // create multiple choice box which later on holds team names
  const teamMultiChoice = form.addMultipleChoiceItem();
  teamMultiChoice.setTitle(teamQuestionTitle)
    .setRequired(true);
  const teamSections = []; // array of sections
  const teamChoices = []; // array of team choices

  const grid = [];
  // Now create each team's section
  Object.values(teamsObj).forEach((teamObj, i) => {
    teamSections[i] = form.addPageBreakItem()
      .setTitle(`Peer review: ${teamObj.teamName}`)
      // set that at the end of section it should be submitted
      .setGoToPage(FormApp.PageNavigationType.SUBMIT);
    // sets that the choice in multiple choice box decides where to go
    teamChoices[i] = teamMultiChoice.createChoice(teamObj.teamName, teamSections[i]);

    // Add ASUrite question
    const studentDropDown = form.addListItem()
      .setTitle(getConfig().asuIdQuestionTitle)
      .setRequired(true);
    const studentChoices = [];
    const currentTeamAsuIds = teamObj.asuIDs;
    currentTeamAsuIds.forEach((asuId) => {
      studentChoices.push(studentDropDown.createChoice(asuId));
    });
    studentDropDown.setChoices(studentChoices);

    // Add group questions
    const { groupQuestions } = getConfig();
    groupQuestions.forEach((groupQuestion) => {
      form.addParagraphTextItem()
        .setTitle(groupQuestion);
    });

    // Add working with team again question
    form.addMultipleChoiceItem()
      .setTitle('If given the choice, would you choose to work with this team again??')
      .setChoiceValues(['yes', 'no']);

    // Add the additional info textbox
    form.addParagraphTextItem()
      .setTitle('Please provide an explanation for your response above.');

    // creating this awful grid thing
    const gridSection = [];
    currentTeamAsuIds.forEach((asuId) => {
      const newGridItem = form.addGridItem()
        .setRequired(true); // Create grid item

      newGridItem.setTitle(createTitleFromStudentName(studentsObj[asuId].fullName))
        .setRows(getConfig().peerQuestions)
        .setColumns(['A+', 'A', 'B', 'C', 'D']);

      // Add the additional info for each member
      form.addParagraphTextItem()
        .setTitle(`Please provide an explanation for your response above for ${
          studentsObj[asuId].fullName}`);

      gridSection.push(newGridItem);
    });

    // Save the grid for this team
    grid[i] = gridSection;
  });

  // populate the multiple choice with the array data
  teamMultiChoice.setChoices(teamChoices); // populates the multiple choice one correctly
}
