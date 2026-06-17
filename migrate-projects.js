/**
 * Migration Script: Add new fields to existing projects
 * 
 * This script adds the following fields to all existing projects in MongoDB:
 * - website_url: Set to empty string (backward compatibility)
 * - demo_url: Left undefined/null
 * - thumbnail: Left undefined (to be populated during image upload)
 * - image_alt: Generated from project title
 * - is_featured: Set to false
 * - tags: Set to empty array
 * 
 * Usage: node migrate-projects.js
 * 
 * ROLLBACK PROCEDURE:
 * If you need to rollback this migration, run:
 * 
 *   db.projects.updateMany({}, {
 *     $unset: {
 *       website_url: "",
 *       demo_url: "",
 *       thumbnail: "",
 *       image_alt: "",
 *       is_featured: "",
 *       tags: ""
 *     }
 *   })
 * 
 * This removes all new fields from all projects.
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://raju:raju2105@cluster0.dsttruk.mongodb.net/root2005?appName=Cluster0';
const DATABASE_NAME = 'root2005';
const COLLECTION_NAME = 'projects';

/**
 * Generate alt text from project title
 * @param {string} title - Project title
 * @returns {string} Alt text
 */
function generateImageAlt(title) {
  return `${title} project image`;
}

/**
 * Main migration function
 */
async function migrateProjects() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Count existing projects
    const totalProjects = await collection.countDocuments();
    console.log(`\nFound ${totalProjects} projects to migrate`);
    
    if (totalProjects === 0) {
      console.log('No projects to migrate.');
      return;
    }
    
    // Fetch all projects to process them
    const projects = await collection.find({}).toArray();
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each project
    for (const project of projects) {
      try {
        const updateDoc = {
          $set: {
            website_url: project.website_url || '', // Preserve existing or set to empty
            demo_url: project.demo_url || null, // Optional field
            image_alt: project.image_alt || generateImageAlt(project.title),
            is_featured: project.is_featured || false,
            tags: project.tags || [],
            // thumbnail left undefined to be populated during image upload
          }
        };
        
        // Only update if thumbnail doesn't already exist
        if (!project.thumbnail) {
          updateDoc.$set.thumbnail = null;
        }
        
        const result = await collection.updateOne(
          { _id: project._id },
          updateDoc
        );
        
        if (result.modifiedCount > 0) {
          successCount++;
          console.log(`  ✓ Updated: ${project.title}`);
        } else {
          console.log(`  - Skipped: ${project.title} (already has new fields)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Failed to update ${project.title}:`, error.message);
      }
    }
    
    console.log(`\n=== Migration Summary ===`);
    console.log(`Total projects: ${totalProjects}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errorCount === 0 && successCount > 0) {
      console.log('\n✓ Migration completed successfully!');
      console.log('\nNew fields added to all projects:');
      console.log('  - website_url: "" (empty string for backward compatibility)');
      console.log('  - demo_url: null (optional)');
      console.log('  - thumbnail: null (to be populated during image upload)');
      console.log('  - image_alt: Generated from project title');
      console.log('  - is_featured: false');
      console.log('  - tags: [] (empty array)');
    } else if (errorCount === 0) {
      console.log('\n✓ All projects already have new fields.');
    } else {
      console.log('\n⚠ Migration completed with errors. Please review above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run migration
migrateProjects();
