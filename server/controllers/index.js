// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const { Cat } = models;
const { Dog } = models;

// Function to handle rendering the index page.
const hostIndex = async (req, res) => {
  // Start with the name as unknown
  let name = 'unknown';

  try {
    const doc = await Cat.findOne({}, {}, {
      sort: { 'createdDate': 'descending' },
    }).lean().exec();

    if (doc) {
      name = doc.name;
    }
  } catch (err) {
    console.log(err);
  }
  res.render('index', {
    currentName: name,
    title: 'Home',
    pageName: 'Home Page',
  });
};
const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();
    return res.render('page1', { cats: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();
    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find dogs.' });
  }
};


const getName = async (req, res) => {
  try {
    const doc = await Cat.findOne({}).sort({ 'createdDate': 'descending' }).lean().exec();
    if (doc) {
      return res.json({ name: doc.name });
    }
    return res.status(404).json({ error: 'No cat found' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong contacting the database' });
  }
};

const getDog = async (req, res) => {
  try {
    const doc = await Dog.findOne({}).sort({ 'createdDate': 'descending' }).lean().exec();
    if (doc) {
      return res.json({ name: doc.name });
    }
    return res.status(404).json({ error: 'No dog found' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong contacting the database' });
  }
};

const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };
  const newCat = new Cat(catData);
  try {
    await newCat.save();
    return res.status(201).json({
      name: newCat.name,
      beds: newCat.bedsOwned,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

const setDog = async (req, res) => {
  console.log(req.body.name);
  if (!req.body.name || !req.body.breed || !req.body.age) {
    // If they are missing data, send back an error.
    return res.status(400).json({ error: 'firstname, breed and age are all required' });
  }

  const DogData = {
    name: `${req.body.name}`,
    breed: `${req.body.breed}`,
    age: req.body.age ,
  };
  const newDog = new Dog(DogData);
  try {
    await newDog.save();
    return res.status(201).json({
      name: newDog.name,
      breed: newDog.breed,
      age: newDog.age,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};

// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }
  let doc;
  try {
    doc = await Cat.findOne({ name: req.query.name }).exec();
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  if (!doc) {
    return res.status(404).json({ error: 'No cats found' });
  }
  return res.json({ name: doc.name, beds: doc.bedsOwned });
};

const searchDog = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }
  let doc;
  try {
    doc = await Dog.findOne({ name: req.query.name }).exec();
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }

  if (!doc) {
    return res.status(404).json({ error: 'No dogs found' });
  }
  return res.json({ name: doc.name, breed: doc.breed, age: doc.age, });
};

const updateLast = (req, res) => {
  const updatePromise = Cat.findOneAndUpdate({}, { $inc: { 'bedsOwned': 1 } }, {
    returnDocument: 'after', // Populates doc in the .then() with the version after update
    sort: { 'createdDate': 'descending' },
  }).lean().exec();

  updatePromise.then((doc) => res.json({
    name: doc.name,
    beds: doc.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  updatePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  getDog,
  setName,
  setDog,
  updateLast,
  searchName,
  searchDog,
  notFound,
};
