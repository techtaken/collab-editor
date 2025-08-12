import mongoose from 'mongoose';

const CollabCodeSchema = new mongoose.Schema({
  username: { type: String, required: true },
  collabCode: { type: String, required: true },
}, { timestamps: true });

const CollabCode = mongoose.model('CollabCode', CollabCodeSchema);

export default CollabCode;