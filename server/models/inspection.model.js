const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    inspectionType: {
      type: String,
      required: [true, 'Please select inspection type'],
      enum: ['Inspection', 'Meeting'],
    },
    designationOfficer: {
      type: String,
      required: [true, 'Please enter designation of officer'],
      enum: ['CE', 'SE', 'EE', 'SDE'],
    },
    inspectingOfficer: {
      type: String,
      required: [true, 'Please select inspecting officer'],
      enum: ['CE', 'SE', 'EE', 'SDE'],
    },
    nameOfOfficer: {
      type: String,
      required: [true, 'Please enter name of officer'],
      trim: true,
    },
    dateFrom: {
      type: Date,
      required: [true, 'Please enter start date'],
    },
    dateTo: {
      type: Date,
      required: [true, 'Please enter end date'],
    },
    inspectedOffice: {
      type: String,
      required: [true, 'Please select inspected office'],
      enum: ['FMDA'], // More can be added in the future
    },
    inspectedInstallation: {
      type: String,
      required: [true, 'Please enter inspected installation'],
      trim: true,
    },
    report: {
      type: String,
      required: [true, 'Please enter report details'],
      trim: true,
    },
    fileUploadRequired: {
      type: Boolean,
      default: false,
    },
    file: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    installationType: {
      type: String,
      enum: ['Water supply', 'Sewerage', 'Storm water', 'Other'],
      default: 'Other',
    },
  },
  { timestamps: true }
);

// Create index for faster searching
inspectionSchema.index({ inspectionType: 1, inspectingOfficer: 1, dateFrom: 1, dateTo: 1 });
inspectionSchema.index({ createdBy: 1 });
inspectionSchema.index({ installationType: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema); 