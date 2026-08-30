const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    hostelBlock: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electrical', 'Plumbing', 'Carpentry', 'Cleanliness', 'Air Conditioning', 'WiFi / Network', 'Other'],
      default: 'Electrical',
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

maintenanceTicketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
