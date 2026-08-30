const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema(
  {
    hostelBlock: {
      type: String,
      required: true, // e.g. "Aryabhatta Hall Block-A"
    },
    roomNumber: {
      type: String,
      required: true, // e.g. "304"
    },
    capacity: {
      type: Number,
      default: 2,
    },
    occupiedCount: {
      type: Number,
      default: 0,
    },
    roomType: {
      type: String,
      enum: ['AC Single', 'Non-AC Single', 'AC Double', 'Non-AC Double', 'Deluxe Triple'],
      default: 'Non-AC Double',
    },
    floor: {
      type: Number,
      default: 3,
    },
    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

hostelRoomSchema.index({ hostelBlock: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
