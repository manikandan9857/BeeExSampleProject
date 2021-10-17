const mongoose = require('mongoose')
const AttendanceSchema = new mongoose.Schema(
        {

                name: { type: String, required: true, unique: true },
                email: { type: String, required: true },
                mobile: { type: String, required: true },
                department: { type: String, required: true },
                status: { type: String, required: true }

        },
        { collection: 'attendance' }
)

const model = mongoose.model('AttendanceSchema', AttendanceSchema)

module.exports = model
