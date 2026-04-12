const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/Venue');

dotenv.config();

const newClassrooms = [
    {
        name: 'Classroom D-102',
        type: 'Classroom',
        capacity: 50,
        location: 'Block D',
        bookingPasskey: 'CLASS_2024',
        description: 'Spacious classroom with projector'
    },
    {
        name: 'Classroom E-201',
        type: 'Classroom',
        capacity: 45,
        location: 'Block E',
        bookingPasskey: 'CLASS_2024',
        description: 'Classroom with AC'
    },
    {
        name: 'Classroom F-305',
        type: 'Classroom',
        capacity: 55,
        location: 'Block F',
        bookingPasskey: 'CLASS_2024',
        description: 'Large classroom'
    },
    {
        name: 'Classroom G-110',
        type: 'Classroom',
        capacity: 50,
        location: 'Block G',
        bookingPasskey: 'CLASS_2024',
        description: 'Modern classroom'
    },
    {
        name: 'Classroom H-215',
        type: 'Classroom',
        capacity: 48,
        location: 'Block H',
        bookingPasskey: 'CLASS_2024',
        description: 'Classroom with multimedia setup'
    },
    {
        name: 'Classroom I-320',
        type: 'Classroom',
        capacity: 50,
        location: 'Block I',
        bookingPasskey: 'CLASS_2024',
        description: 'Standard classroom'
    },
    {
        name: 'Classroom J-105',
        type: 'Classroom',
        capacity: 45,
        location: 'Block J',
        bookingPasskey: 'CLASS_2024',
        description: 'Classroom with smart board'
    },
    {
        name: 'Classroom K-210',
        type: 'Classroom',
        capacity: 52,
        location: 'Block K',
        bookingPasskey: 'CLASS_2024',
        description: 'Larger classroom'
    }
];

const addClassrooms = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Insert new classrooms
        const createdVenues = await Venue.insertMany(newClassrooms);
        console.log(`✅ Successfully added ${createdVenues.length} classrooms`);

        // Show summary
        const venues = await Venue.find({}).lean();
        const classrooms = venues.filter(v => v.type === 'Classroom');
        console.log(`\nTotal classrooms in database: ${classrooms.length}`);
        
        classrooms.forEach(c => {
            console.log(`  - ${c.name} (${c.location}) - Capacity: ${c.capacity}`);
        });

        await mongoose.disconnect();
        console.log('\nClassrooms added successfully!');
    } catch (error) {
        console.error('Error adding classrooms:', error);
        process.exit(1);
    }
};

addClassrooms();
