# ASU Team Forming Survey Google App Script

## Dev Setup

To develop for this project, `clasp` can be used to write code and push it to the sheet specified in the `.clasp.json` file. In order to get this ID, you can go to a sheet and go to the "Script Editor" window from "Tools" then copy the last part of the URL.

## Backlog

- Group Forming
   - [ ] Setup a way to compile the response data into a unified object
   - [ ] Find an algorithm that will work for this
- Testing
   - [x] Setup a testing file that can be used to test submissions from various students
   - [x] Setup a way to delete the attached form and unlink from the spreadsheet
- Config
   - Add part of the config that will allow hour increments to be chosen
   - Add part of the config that allows starting day and ending day to be chosen for the weeks.
- Form generation
   - [x] Make it so that the part that asks about choosing other students shows their asurite, followed by their full name in each option.
   - [x] Create a way to generate the times and dates automatically