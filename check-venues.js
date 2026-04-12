const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/Venue');

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const venues = await Venue.find({}).lean();
    console.log('venues count', venues.length);
    const byType = venues.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});
    console.log(JSON.stringify(byType, null, 2));
    venues.forEach(v => console.log(v.type, v.name, v.location));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();