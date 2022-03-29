# ASU Team Forming Survey Google App Script

## Dev Setup

To develop for this project, the following steps can be taken:

- Run `yarn` to install packages
- Run `yarn clasp login` to login to your Google account if not done already with clasp. This should be done with the Google account that has access to the App Script being modified.

Whenever changes are done being made, feel free to run `yarn push` which will push the changes up to the remote Google Apps Script.

Here is a [link to the folder with the Google Apps Scripts templates](https://drive.google.com/drive/folders/1eAC6Vg6lrjgYQsVWtL7pcjJbpYVhz2zk). Correct permissions are needed to access this folder.

### What is `clasp`?

`clasp` is used to write code and push it to the sheet specified in the `.clasp.json` file. This makes development faster than copy and pasting into the Google Apps Script manually. In order to get this ID, you can go to a sheet and go to the "Script Editor" window from "Tools" then copy the last part of the URL.

## Backlog

- Group Forming
  - [x] Setup a way to compile the response data into a unified object
  - [x] Think of a way to format the data so that it will be easier to form students into groups
- Testing
  - [x] Setup a testing file that can be used to test submissions from various students
  - [x] Setup a way to delete the attached form and unlink from the spreadsheet
- Config
  - Add part of the config that will allow hour increments to be chosen
  - Add part of the config that allows starting day and ending day to be chosen for the weeks.
- Form generation
  - [x] Make it so that the part that asks about choosing other students shows their asurite, followed by their full name in each option.
  - [x] Create a way to generate the times and dates automatically
