const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/Venue');

dotenv.config();

const newVenues = [
    {
        name: 'Main Auditorium',
        type: 'Auditorium',
        capacity: 500,
        location: 'Block A',
        bookingPasskey: 'AUDIT_2024',
        description: 'Large auditorium for major events and conferences'
    },
    {
        name: 'Auditorium Hall',
        type: 'Auditorium',
        capacity: 300,
        location: 'Block C',
        bookingPasskey: 'AUDIT_2024',
        description: 'Medium auditorium with projector and sound system'
    },
    {
        name: 'Seminar Hall 1',
        type: 'Seminar Hall',
        capacity: 150,
        location: 'Block A',
        bookingPasskey: 'SEMINAR_2024',
        description: 'Seminar hall with modern AV equipment'
    },
    {
        name: 'Seminar Hall 2',
        type: 'Seminar Hall',
        capacity: 120,
        location: 'Block B',
        bookingPasskey: 'SEMINAR_2024',
        description: 'Second seminar hall'
    },
    {
        name: 'Conference Room A',
        type: 'Conference Room',
        capacity: 50,
        location: 'Block A',
        bookingPasskey: 'CONF_2024',
        description: 'Professional conference room'
    },
    {
        name: 'Conference Room B',
        type: 'Conference Room',
        capacity: 40,
        location: 'Block C',
        bookingPasskey: 'CONF_2024',
        description: 'Small conference room'
    },
    {
        name: 'Central Ground',
        type: 'Open Ground',
        capacity: 1000,
        location: 'Main Courtyard',
        bookingPasskey: 'GROUND_2024',
        description: 'Large open ground for outdoor events'
    },
    {
        name: 'Sports Ground',
        type: 'Open Ground',
        capacity: 800,
        location: 'Sports Complex',
        bookingPasskey: 'GROUND_2024',
        description: 'Sports ground for athletic events'
    },
    {
        name: 'Computer Lab 1',
        type: 'Lab',
        capacity: 60,
        location: 'Block D',
        bookingPasskey: 'LAB_2024',
        description: 'Computer lab with 60 workstations'
    },
    {
        name: 'Classroom A-101',
        type: 'Classroom',
        capacity: 50,
        location: 'Block A',
        bookingPasskey: 'CLASS_2024',
        description: 'Standard classroom'
    },
    {
        name: 'Classroom B-205',
        type: 'Classroom',
        capacity: 45,
        location: 'Block B',
        bookingPasskey: 'CLASS_2024',
        description: 'Standard classroom with AC'
    },
    {
        name: 'Classroom C-301',
        type: 'Classroom',
        capacity: 50,
        location: 'Block C',
        bookingPasskey: 'CLASS_2024',
        description: 'Large classroom'
    }
];

const seedVenues = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing venues
        await Venue.deleteMany({});
        console.log('Cleared existing venues');

        // Insert new venues
        const createdVenues = await Venue.insertMany(newVenues);
        console.log(`âœ… Successfully added ${createdVenues.length} venues`);

        // Show summary
        const venues = await Venue.find({}).lean();
        const byType = venues.reduce((acc, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
        }, {});

        console.log('\nVenue Summary:');
        console.log(JSON.stringify(byType, null, 2));

        await mongoose.disconnect();
        console.log('\nDatabase seeding completed!');
    } catch (error) {
        console.error('Error seeding venues:', error);
        process.exit(1);
    }
};

seedVenues();

