/**
 * Contains the methods and properties related to testing the form and the
 * scripts.
 */
const Test = {
  submitTestResponsesForStudent(asurite) {
    const form = Form.get();
    const formResponse = form.createResponse();
    const formItems = Form.ITEMS;
    const responseCreationData = {
      asurite,
      formResponse,
    };
    Object.values(formItems).forEach((formItemDetails) => {
      formItemDetails.addItemResponse(responseCreationData);
    });
    formResponse.submit();
  },

  submitTestResponsesForAllStudents() {
    const asuriteIds = Students.getAsuriteIdsSorted();
    asuriteIds.forEach((id) => {
      this.submitTestResponsesForStudent(id);
    });
  },
};
