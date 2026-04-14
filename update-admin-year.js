const mongoose = require('mongoose');
const User = require('./models/User');

async function updateAdminYear() {
    try {
        // Connect to MongoDB using the same method as the app
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event_management');

        console.log('Connected to MongoDB');

        // Find all users to see what's in the database
        const allUsers = await User.find({}, 'name email role year branch');
        console.log('All users in database:');
        allUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Year: ${user.year}, Branch: ${user.branch}`);
        });

        // Find admin user
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.log('No admin user found with role "admin"');
            return;
        }

        console.log('Current admin user:', {
            name: adminUser.name,
            email: adminUser.email,
            year: adminUser.year,
            branch: adminUser.branch
        });

        // Update year to 'Administrative' and set branch if not set
        const updateData = { year: 'Administrative' };
        if (!adminUser.branch) {
            updateData.branch = 'Administration';
        }

        const result = await User.updateOne(
            { role: 'admin' },
            { $set: updateData }
        );

        console.log('Update result:', result);

        if (result.modifiedCount > 0) {
            console.log('Admin profile updated successfully');
        } else {
            console.log('Admin profile was already up to date');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error updating admin year:', error);
        process.exit(1);
    }
}

updateAdminYear();
