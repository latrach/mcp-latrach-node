#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = process.env.TEST_MCP_URL || 'http://localhost:8080';

async function testHealth() {
  const res = await axios.get(`${BASE_URL}/health`);
  console.log('Health:', res.data);
}

async function testToolsList() {
  const res = await axios.get(`${BASE_URL}/tools`);
  console.log('Tools:', res.data.tools.map(t => t.name));
  return res.data.tools;
}

async function testTool(toolName, args) {
  try {
    const res = await axios.post(`${BASE_URL}/tools/${toolName}`, args);
    console.log(`Tool '${toolName}' result:`, res.data);
  } catch (err) {
    if (err.response) {
      console.log(`Tool '${toolName}' error:`, err.response.data);
    } else {
      console.error(err);
    }
  }
}

async function main() {
  await testHealth();
  const tools = await testToolsList();
  for (const tool of tools) {
    if (tool.name === 'greet') {
      await testTool('greet', { name: 'Alice' });
    }
    if (tool.name === 'calculate') {
      await testTool('calculate', { expression: '5 + 7 * 2' });
    }
  }
}

main();
