// Script to test schema-level embedding generation
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DealModel } from '../src/feature/deal/deal.schema.js';
import { ContactModel } from '../src/feature/contact/contact.schema.js';
import { ActivityModel } from '../src/feature/activity/activity.schema.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test function to create and update entities
async function testSchemaEmbedding() {
  try {
    // Get a company ID for testing
    const companyId = process.argv[2];
    if (!companyId) {
      console.error('Please provide a company ID as the first argument');
      process.exit(1);
    }

    // Get a user ID for testing
    const userId = process.argv[3];
    if (!userId) {
      console.error('Please provide a user ID as the second argument');
      process.exit(1);
    }

    console.log(`Testing with company ID: ${companyId}, user ID: ${userId}`);

    // Test Deal Schema Embedding
    console.log('\n--- Testing Deal Schema Embedding ---');
    const deal = new DealModel({
      title: 'Test Schema Embedding Deal',
      value: 10000,
      stage: 'Proposal',
      pipeline_id: new mongoose.Types.ObjectId(),
      owner_id: userId,
      company_id: companyId,
      status: 'open',
      notes: 'This is a test deal to verify schema-level embedding generation works'
    });

    // Save the deal - this should trigger the pre-save hook
    console.log('Creating new deal...');
    const savedDeal = await deal.save();
    console.log(`Deal created with ID: ${savedDeal._id}`);
    console.log(`Embedding generated: ${savedDeal.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${savedDeal.ai_embedding.length}`);

    // Update the deal - this should trigger the pre-findOneAndUpdate hook
    console.log('\nUpdating deal...');
    const updatedDeal = await DealModel.findByIdAndUpdate(
      savedDeal._id, 
      { title: 'Updated Test Deal', notes: 'Updated notes for testing' },
      { new: true }
    );
    console.log(`Deal updated with ID: ${updatedDeal._id}`);
    console.log(`Embedding still present: ${updatedDeal.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${updatedDeal.ai_embedding.length}`);

    // Test Contact Schema Embedding
    console.log('\n--- Testing Contact Schema Embedding ---');
    const contact = new ContactModel({
      name: 'Test Contact',
      email: `test-${Date.now()}@example.com`,
      phone: '123-456-7890',
      notes: 'This is a test contact to verify schema-level embedding generation works',
      owner_id: userId,
      company_id: companyId
    });

    // Save the contact - this should trigger the pre-save hook
    console.log('Creating new contact...');
    const savedContact = await contact.save();
    console.log(`Contact created with ID: ${savedContact._id}`);
    console.log(`Embedding generated: ${savedContact.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${savedContact.ai_embedding.length}`);

    // Update the contact - this should trigger the pre-findOneAndUpdate hook
    console.log('\nUpdating contact...');
    const updatedContact = await ContactModel.findByIdAndUpdate(
      savedContact._id, 
      { name: 'Updated Test Contact', notes: 'Updated notes for testing' },
      { new: true }
    );
    console.log(`Contact updated with ID: ${updatedContact._id}`);
    console.log(`Embedding still present: ${updatedContact.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${updatedContact.ai_embedding.length}`);

    // Test Activity Schema Embedding
    console.log('\n--- Testing Activity Schema Embedding ---');
    const activity = new ActivityModel({
      type: 'note',
      content: 'This is a test activity to verify schema-level embedding generation works',
      subject: 'Test Activity',
      user_id: userId,
      company_id: companyId,
      next_steps: 'Follow up next week'
    });

    // Save the activity - this should trigger the pre-save hook
    console.log('Creating new activity...');
    const savedActivity = await activity.save();
    console.log(`Activity created with ID: ${savedActivity._id}`);
    console.log(`Embedding generated: ${savedActivity.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${savedActivity.ai_embedding.length}`);

    // Update the activity - this should trigger the pre-findOneAndUpdate hook
    console.log('\nUpdating activity...');
    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      savedActivity._id, 
      { content: 'Updated test activity content', next_steps: 'Updated next steps' },
      { new: true }
    );
    console.log(`Activity updated with ID: ${updatedActivity._id}`);
    console.log(`Embedding still present: ${updatedActivity.ai_embedding.length > 0 ? 'Yes' : 'No'}`);
    console.log(`Embedding length: ${updatedActivity.ai_embedding.length}`);

    console.log('\n--- All Tests Completed Successfully ---');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testSchemaEmbedding();
