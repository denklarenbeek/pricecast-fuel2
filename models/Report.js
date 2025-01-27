const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Products = {
    productId: Number,
    name: {
        type: String
    },
    benchmarkId: Number,
    volume: {
        value: String,
        state: String
    },
    volumeLY: {
        value: String,
        state: String
    },
    volumePP: {
        value: String,
        state: String
    },
    volumeDifference: {
        value: String,
        state: String
    },
    volumeDifferencePercentage: {
        value: String,
        state: String
    },
    volumePerDay: {
        value: String,
        state: String
    },
    volumePerDayLY: {
        value: String,
        state: String
    },
    volumePerDayPP: {
        value: String,
        state: String
    },
    volumePerDayDifference: {
        value: String,
        state: String
    },
    margin: {
        value: String,
        state: String
    },
    marginLY: {
        value: String,
        state: String
    },
    marginPP: {
        value: String,
        state: String
    },
    marginDifference: {
        value: String,
        state: String,
    },
    unitMargin: {
        value: String,
        state: String
    },
    unitMarginLY: {
        value: String,
        state: String
    },
    unitMarginPP: {
        value: String,
        state: String
    },
    unitMarginDifference: {
        value: String,
        state: String
    },
    countTransactions: {
        value: Number,
        state: String
    },
    countTransactionsLY: {
        value: Number,
        state: String
    },
    countTransactionsPP: {
        value: Number,
        state: String
    },
    countTransactionsDifference: {
        value: Number,
        state: String
    },
    strategy: {},
    benchmark: {},
    pricesuggestions: [],
}

const ReportSchema = new Schema({
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    requested: {
        type: Object
    },
    status: String,
    name: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    sharedWith: [
        {
            type: mongoose.Schema.ObjectId, ref: 'User'
        }
    ],
    reportId: String,
    customer: String,
    dates: {},
    locations: [
        {
            stationId: Number,
            name: String,
            products: [Products]
        }
    ],
    fileSize: String
});

ReportSchema.index({sharedWith: 1 });
ReportSchema.index({reportId: 1 });
ReportSchema.index({createdAt: 1 });

const Report = mongoose.model('Report', ReportSchema);


module.exports = Report;