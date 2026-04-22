const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'FrozenDelights'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    autoApproveVendors: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
