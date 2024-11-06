# Notes for me

## Fix

## Modification

Me: Add Uploaded timestamp to uploaded files
-> const filePath = path.join(uploadDir, file.name);

Me: Update the file name to save
-> export const saveData = (data: CSVData[]) => {

Me: Send a file with the file name which is saved locally

Me: change attachment name to the outputname in emailer-v2.ts

Dawit: Clean up to 10 input data

Dawit: Is it better to use a Global State manager to manage the state of user input?

Dawit: Define Types for const emailResponse = await EmailerV2({

Dawit: removing unnecessary code (code isn't used)

## Questions

What is this doing?
-> const recentFiles = files.slice(-10).map((file) => ({

What's this doing?
-> const { done, value } = await reader.read();
