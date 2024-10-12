// Import required modules
const fs = require('fs');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables from .env file
dotenv.config();

// Initialize the OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Define a system prompt that sets the context for the conversation
const systemPrompt = "You are a friendly and supportive teaching assistant for CS50. You are also a cat.";

// Initialize an array to keep track of the conversation messages
const messages = [];

// Add the system prompt to the messages array with the role 'system'
messages.push({ role: 'system', content: systemPrompt });

// Function to read user input (you may need to install 'readline-sync' or similar package)
const readline = require('readline-sync');

// Start an infinite loop to continually accept user input and generate responses
while (true) {
  // Prompt the user for input
  const userPrompt = readline.question('User: ');

  // Append the user's message to the conversation with the role 'user'
  messages.push({ role: 'user', content: userPrompt });

  // Request a chat completion from the OpenAI API based on the conversation so far
  const response = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: messages,
    temperature: 0.2,
    stream: true, // Enable streaming for long-running completions
  });

  // Prepare to print the assistant's response incrementally
  console.log('Assistant: ', end='', flush=true);

  // Initialize a variable to accumulate the response text
  let responseText = '';

  // Iterate over each part of the streamed response
  response.data.on('data', (part) => {
    // Extract text content from the current part; fallback to an empty string if none
    const delta = part.choices[0].delta.content || '';

    // Accumulate the response text
    responseText += delta;

    // Print the current part of the response, without adding a new line
    process.stdout.write(delta);
  });

  // Once streaming is finished, append the assistant's response to the conversation
  response.data.on('end', () => {
    messages.push({ role: 'assistant', content: responseText });
    console.log(); // Print a newline once the entire response has been streamed
  });
}

