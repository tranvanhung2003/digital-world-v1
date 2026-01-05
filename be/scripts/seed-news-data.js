const path = require('path');
require('dotenv').config();
const { News, User } = require('../src/models');

const SAMPLE_NEWS = [];

async function seedNews() {
  console.log('--- Starting News Seeding ---');
  try {
    // Check if there is an admin user to assign the news to
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error(
        'Error: No admin user found. Please create an admin user first.',
      );
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const data of SAMPLE_NEWS) {
      const [news, created] = await News.findOrCreate({
        where: { slug: data.slug },
        defaults: {
          ...data,
          userId: adminUser.id,
        },
      });

      if (created) {
        createdCount++;
        console.log(`- Created: ${data.title}`);
      } else {
        skippedCount++;
        console.log(`- Skipped (Already exists): ${data.title}`);
      }
    }

    console.log('------------------------------');
    console.log(`Summary: Created ${createdCount}, Skipped ${skippedCount}`);
    console.log('News seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding news data:', error);
    process.exit(1);
  }
}

seedNews();
