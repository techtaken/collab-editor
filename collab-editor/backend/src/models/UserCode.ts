import mongoose from 'mongoose';

const UserCodeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  code: { type: String, required: true },
}, { timestamps: true });

const UserCode = mongoose.model('UserCode', UserCodeSchema);

export default UserCode;