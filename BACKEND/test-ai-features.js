import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Test the Deal Coach AI feature
async function testDealCoach() {
  try {
    // You'll need to replace these values with actual data from your database
    const dealId = '6473a9c1e4b0b0e5f0e5f0e5'; // Replace with an actual deal ID
    const token = 'your-auth-token'; // Replace with a valid JWT token
    
    const response = await fetch(`http://localhost:3000/api/v1/ai/deal-coach/${dealId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Deal Coach Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing Deal Coach:', error);
    return null;
  }
}

// Test the Persona Builder AI feature
async function testPersonaBuilder() {
  try {
    // You'll need to replace these values with actual data from your database
    const contactId = '6473a9c1e4b0b0e5f0e5f0e6'; // Replace with an actual contact ID
    const token = 'your-auth-token'; // Replace with a valid JWT token
    
    const response = await fetch(`http://localhost:3000/api/v1/ai/persona-builder/${contactId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Persona Builder Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing Persona Builder:', error);
    return null;
  }
}

// Test the Objection Handler AI feature
async function testObjectionHandler() {
  try {
    // You'll need to replace these values with actual data from your database
    const token = 'your-auth-token'; // Replace with a valid JWT token
    
    const response = await fetch('http://localhost:3000/api/v1/ai/objection-handler', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        objection_text: 'Your product is too expensive for what it offers',
        deal_id: '6473a9c1e4b0b0e5f0e5f0e5' // Optional, replace with actual deal ID if needed
      })
    });
    
    const data = await response.json();
    console.log('Objection Handler Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing Objection Handler:', error);
    return null;
  }
}

// Test the Win-Loss Explainer AI feature
async function testWinLossExplainer() {
  try {
    // You'll need to replace these values with actual data from your database
    const dealId = '6473a9c1e4b0b0e5f0e5f0e5'; // Replace with an actual closed deal ID
    const token = 'your-auth-token'; // Replace with a valid JWT token
    
    const response = await fetch(`http://localhost:3000/api/v1/ai/win-loss-explainer/${dealId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Win-Loss Explainer Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing Win-Loss Explainer:', error);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Testing AI Features ===');
  
  console.log('\n1. Testing Deal Coach:');
  await testDealCoach();
  
  console.log('\n2. Testing Persona Builder:');
  await testPersonaBuilder();
  
  console.log('\n3. Testing Objection Handler:');
  await testObjectionHandler();
  
  console.log('\n4. Testing Win-Loss Explainer:');
  await testWinLossExplainer();
  
  console.log('\n=== Tests Completed ===');
}

// Run the tests
runTests();
