const { db } = require('./index');
const { leads } = require('./schema');
const pool = require('../config/db');

const MOCK_LEADS = [
  {
    name: 'Tony Stark',
    email: 'tony@stark.industries',
    phone: '+1 (555) 382-0192',
    company: 'Stark Industries',
    status: 'Converted',
    source: 'Referral',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Purchased enterprise clean-energy grids package. Account converted successfully.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Bruce Wayne',
    email: 'bruce@wayne.corp',
    phone: '+1 (555) 911-3948',
    company: 'Wayne Enterprises',
    status: 'Converted',
    source: 'Referral',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Interested in bulk contract for defense gear. Transformed to won deal.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Clark Kent',
    email: 'clark@dailyplanet.press',
    phone: '+1 (555) 438-1920',
    company: 'Daily Planet',
    status: 'New',
    source: 'Web',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Inquired about digital subscription models and ad placements.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Diana Prince',
    email: 'diana@themyscira.org',
    phone: '+1 (555) 728-1039',
    company: 'Themyscira Museum',
    status: 'Qualified',
    source: 'Partner',
    gender: 'Female',
    notes: JSON.stringify([
      { text: 'Budget approved for historical preservation software suite.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Barry Allen',
    email: 'barry.speed@ccpd.gov',
    phone: '+1 (555) 283-9481',
    company: 'Central City Police Dept',
    status: 'Contacted',
    source: 'Social Media',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Demonstrated forensic tracking tool. Follow-up scheduled next Tuesday.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Sarah Connor',
    email: 'sarah@resistance.net',
    phone: '+1 (555) 198-4202',
    company: 'Cyberdyne Systems',
    status: 'Contacted',
    source: 'Web',
    gender: 'Female',
    notes: JSON.stringify([
      { text: 'Interested in structural security assessments and monitoring logs.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Peter Parker',
    email: 'peter@dailybugle.com',
    phone: '+1 (555) 739-1029',
    company: 'Daily Bugle',
    status: 'Lost',
    source: 'Web',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Pricing too high for freelance photojournalism tracking.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Hal Jordan',
    email: 'hal@ferris.aero',
    phone: '+1 (555) 392-1082',
    company: 'Ferris Aircraft',
    status: 'New',
    source: 'Partner',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Looking for flight testing logs management system.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Arthur Curry',
    email: 'arthur@atlantisshipping.net',
    phone: '+1 (555) 902-8347',
    company: 'Atlantis Shipping',
    status: 'Contacted',
    source: 'Cold-Call',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Sent quote for deep-sea navigation logs tracker.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Wanda Maximoff',
    email: 'wanda@westview.net',
    phone: '+1 (555) 293-1029',
    company: 'Westview Co',
    status: 'Qualified',
    source: 'Social Media',
    gender: 'Female',
    notes: JSON.stringify([
      { text: 'Wants integration with scheduling platforms.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Steve Rogers',
    email: 'steve@brooklynshields.org',
    phone: '+1 (555) 194-1194',
    company: 'Brooklyn Shields',
    status: 'Converted',
    source: 'Web',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Qualified and converted after historic archives integration demo.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Natasha Romanoff',
    email: 'natasha@blackwidow.io',
    phone: '+1 (555) 201-9872',
    company: 'Red Room Tech',
    status: 'Qualified',
    source: 'Partner',
    gender: 'Female',
    notes: JSON.stringify([
      { text: 'Requested customized encryption logs for security audits.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Thor Odinson',
    email: 'thor@asgardpower.net',
    phone: '+1 (555) 888-0012',
    company: 'Asgardian Power Grid',
    status: 'New',
    source: 'Cold-Call',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Inquired about lightning-fast high-voltage grid metrics.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Bruce Banner',
    email: 'banner@gamma-labs.org',
    phone: '+1 (555) 555-0800',
    company: 'Gamma Research Labs',
    status: 'Lost',
    source: 'Web',
    gender: 'Male',
    notes: JSON.stringify([
      { text: 'Lead lost due to project scope change. May re-engage next quarter.', date: new Date().toISOString() }
    ])
  },
  {
    name: 'Selina Kyle',
    email: 'selina@catburglar.org',
    phone: '+1 (555) 777-0099',
    company: 'Gotham Security',
    status: 'Contacted',
    source: 'Referral',
    gender: 'Female',
    notes: JSON.stringify([
      { text: 'Requested security camera logs integration proposal.', date: new Date().toISOString() }
    ])
  }
];

const seed = async () => {
  console.log('🌱 Starting database seeding script...');
  
  try {
    // Insert mock leads
    for (const lead of MOCK_LEADS) {
      try {
        await db.insert(leads).values(lead);
        console.log(`✅ Successfully seeded lead: ${lead.name} (${lead.email})`);
      } catch (err) {
        if (err.code === '23505') {
          console.warn(`⚠️ Skipped: ${lead.name} (${lead.email}) already exists in the database.`);
        } else {
          console.error(`❌ Failed to seed lead ${lead.name}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Database seeding operation completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    // Close the PostgreSQL pool to terminate the script cleanly
    await pool.end();
    console.log('🔌 Database pool disconnected.');
    process.exit(0);
  }
};

seed();
