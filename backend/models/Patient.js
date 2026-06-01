const mongoose=require('mongoose');
const patientSchema = new mongoose.Schema({
  fullName: { type: String, require: true, trim: true },
  dateOfBirth: { type: Date, require: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  address: { type: String },
  allergies: [{ type: String }],
  chronicDiseases: [{ type: String }],
  energencyContact: {
      name: {type: String},
      phone: {type:String}
  }
},{timestamps:true});
module.exports=mongoose.model('Patient',patientSchema);