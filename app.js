require('dotenv').config(); // Load environment variables from .env file

const OpenAI = require("openai"); // Import OpenAI API client
const simpleGit = require("simple-git"); // Import simple-git for Git operations
const fs = require("fs"); // Import fs for file system operations

// Retrieve the OpenAI API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Error: OPENAI_API_KEY is not set in the .env file.");
  process.exit(1); // Exit if the API key is not set
}

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: apiKey, // Use the retrieved API Key
});

// Function to generate code using OpenAI API
async function generateCode(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo", // Model for code generalization
      prompt: prompt,
      max_tokens: 200, // Limit token count
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating code:", error);
  }
}

// Function to write the generated code to a file
function writeToFile(filename, content) {
  try {
    if (!fs.existsSync('pages')) {
      fs.mkdirSync('pages'); // Create pages directory if it doesn't exist
    }
    fs.writeFileSync(filename, content); // Write content to the file
    console.log(`File ${filename} has been created.`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

// Function to automatically commit and push changes to GitHub
async function pushToGit() {
  try {
    const git = simpleGit();
    await git.add("./*"); // Stage all changes
    await git.commit("Auto-generated code by OpenAI"); // Commit with message
    await git.push("origin", "main"); // Push to the main branch
    console.log("Code pushed to GitHub.");
  } catch (error) {
    console.error("Error pushing to Git:", error);
  }
}

// Main function to automate the entire process
async function automate() {
  const prompt = "Generate a simple Next.js page that displays 'Hello, World!'";
  const code = await generateCode(prompt); // Generate the code
  if (code) {
    const filename = "pages/index.js"; // Specify the file name and path
    writeToFile(filename, code); // Write the code to the file
    await pushToGit(); // Push changes to GitHub
  } else {
    console.error("No code was generated.");
  }
}

// Run the automation process
automate().catch(console.error);
