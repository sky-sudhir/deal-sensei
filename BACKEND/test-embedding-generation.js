import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Test the embedding generation endpoint
async function testEmbeddingGeneration() {
  try {
    // You'll need to replace this with a valid JWT token for an admin user
    const token = 'your-auth-token'; // Replace with a valid JWT token
    
    // Test generating embeddings for deals
    const dealResponse = await fetch('http://localhost:3000/api/v1/ai/generate-embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity_type: 'deal',
        limit: 50
      })
    });
    
    const dealData = await dealResponse.json();
    console.log('Deal Embedding Generation Response:', JSON.stringify(dealData, null, 2));
    
    // Test generating embeddings for contacts
    const contactResponse = await fetch('http://localhost:3000/api/v1/ai/generate-embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity_type: 'contact',
        limit: 50
      })
    });
    
    const contactData = await contactResponse.json();
    console.log('Contact Embedding Generation Response:', JSON.stringify(contactData, null, 2));
    
    // Test generating embeddings for activities
    const activityResponse = await fetch('http://localhost:3000/api/v1/ai/generate-embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity_type: 'activity',
        limit: 50
      })
    });
    
    const activityData = await activityResponse.json();
    console.log('Activity Embedding Generation Response:', JSON.stringify(activityData, null, 2));
    
    return {
      deals: dealData,
      contacts: contactData,
      activities: activityData
    };
  } catch (error) {
    console.error('Error testing embedding generation:', error);
    return null;
  }
}

// Run the test
testEmbeddingGeneration()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err));
