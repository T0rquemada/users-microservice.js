const mongoose = require('mongoose');

const mongoURI = "";

class Database {
  constructor() {
    this._connect();
  }

  async _connect() {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }

  async create(Model, data) {
    try {
      const result = await Model.create(data);
      return result;
    } catch (err) {
      console.error('Create operation failed:', err);
      throw err;
    }
  }

  async find(Model, query) {
    try {
      const result = await Model.findOne(query);
      return result;
    } catch (err) {
      console.error('Find operation failed:', err);
      throw err;
    }
  }

  async findById(Model, id) {
    try {
      const result = await Model.findById(id);
      return result;
    } catch (err) {
      console.error('FindById operation failed:', err);
      throw err;
    }
  }

  async updateUsername(Model, id, newUsername) {
    try {
      const result = await Model.findByIdAndUpdate(
        id,
        { username: newUsername }, 
        { new: true } 
      );
      return result;
    } catch (err) {
      console.error('UpdateUsername operation failed:', err);
      throw err;
    }
  }

  async updateEmail(Model, id, newEmail) {
    try {
      const result = await Model.findByIdAndUpdate(
        id,
        { email: newEmail }, 
        { new: true } 
      );
      return result;
    } catch (err) {
      console.error('updateEmail operation failed:', err);
      throw err;
    }
  }

  async delete(Model, id) {
    try {
      const result = await Model.findByIdAndDelete(id);
      return result;
    } catch (err) {
      console.error('Delete operation failed:', err);
      throw err;
    }
  }
}

module.exports = new Database();