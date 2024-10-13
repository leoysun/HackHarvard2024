// Import required modules
const fs = require('fs');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

// Load environment variables from .env file
dotenv.config();

// Initialize the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a system prompt that sets the context for the conversation
// To be prompt engineered
const systemPrompt = ("You are a website builder and git pusher. That is, the user will give directions and details about a website they would like you to build, as well as instructions for a git command. Please return the code and run the git command.");

// Initialize an array to keep track of the conversation messages
const messages = []; 

// Add the system prompt to the messages array with the role 'system'
messages.push({ role: 'system', content: systemPrompt });

// Function to read user input (you may need to install 'readline-sync' or similar package)
const readline = require('readline-sync');

// Define an asynchronous function to handle the conversation logic
async function runChat() {
  while (true) {
    // Prompt the user for input
    const userPrompt = readline.question('User: ');

    // Append the user's message to the conversation with the role 'user'
    messages.push({ role: 'user', content: userPrompt });

    try {
      // Request a chat completion from the OpenAI API based on the conversation so far
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',  // gpt-4o, ideally
        messages: messages,
        temperature: 0.2,
        stream: true, // Enable streaming for long-running completions
      });

      // Prepare to print the assistant's response incrementally
      process.stdout.write('Assistant: ');

      // Initialize a variable to accumulate the response text
      let responseText = '';

      // Listen to the stream for incoming data
      for await (const part of response) {
        // Extract text content from the current part; fallback to an empty string if none
        const delta = part.choices[0].delta.content || '';

        // Accumulate the response text
        responseText += delta;

        // Print the current part of the response, without adding a new line
        process.stdout.write(delta);
      }

      // Append the assistant's response to the conversation
      messages.push({ role: 'assistant', content: responseText });
      console.log(); // Print a newline once the entire response has been streamed
    } catch (error) {
      console.error('Error generating completion:', error);
    }
  }
}

// Run the chat logic
runChat();
