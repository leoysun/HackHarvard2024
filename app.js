require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const { Configuration, OpenAIApi } = require("openai");
const simpleGit = require("simple-git");
const fs = require("fs");

// OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API Key
});
const openai = new OpenAIApi(configuration);

// Function to generate code using OpenAI API
async function generateCode(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003", // or any other model
    prompt: prompt,
    max_tokens: 200,
  });
  return response.data.choices[0].text.trim();
}

// Function to write the generated code to a file
function writeToFile(filename, content) {
  fs.writeFileSync(filename, content, (err) => {
    if (err) throw err;
    console.log(`File ${filename} has been created.`);
  });
}

// Function to automatically commit and push changes to GitHub
async function pushToGit() {
  const git = simpleGit();
  await git.add("./*");
  await git.commit("Auto-generated code by OpenAI");
  await git.push("origin", "main");
  console.log("Code pushed to GitHub.");
}

// Main function to automate the entire process
async function automate() {
  const prompt = "Generate a simple Next.js page that displays 'Hello, World!'";
  const code = await generateCode(prompt);
  
  const filename = "pages/index.js";
  writeToFile(filename, code);

  await pushToGit();
}

// Run the automation
automate().catch(console.error);
