var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var URLSlugs = require('mongoose-url-slugs');

var UserSchema = new mongoose.Schema({ });

var Medication = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String, // dropdown (day, week, ...)
});

var Question = new mongoose.Schema({
  surveyId: String,
  question: String,
  answer: String,
});

var Survey = new mongoose.Schema({
  id: String,
  recoveryLevel: Number,
  questions: [Question],
  answered: Boolean,
});

var Patient = new mongoose.Schema ({
  email: {type : String, unique:true, dropDups:true},
  firstName: String,
  lastName: String,
  medications: [Medication],
  surveys: [Survey],
  condition: String, //what the patient is being treated for
  age: Number,
  weight: Number,
  height: Number,
  gender: String, // dropdown
  slug:String,
});

var Doctor = new mongoose.Schema({
  username: {type: String, unique:true, require:[true, 'Email is required']},
  firstName: String,
  lastName: String,
  hospital: String,
  doctorType: String,
  patients: [Patient]
});

Patient.plugin(URLSlugs('lastName'));
UserSchema.plugin(passportLocalMongoose);
mongoose.model('User', UserSchema);
mongoose.model('Medication', Medication);
mongoose.model('Survey', Survey);
mongoose.model('Question', Question);
mongoose.model('Patient', Patient);
mongoose.model('Doctor', Doctor);
mongoose.connect('mongodb://localhost/doctordb');
