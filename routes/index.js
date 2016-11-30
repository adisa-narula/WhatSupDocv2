var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Doctor = mongoose.model('Doctor'),
    Patient = mongoose.model('Patient'),
    Medication = mongoose.model('Medication');
    Question = mongoose.model('Question');
    Survey = mongoose.model('Survey');

/* GET home page. */
router.get('/', function(req, res) {
  var user = req.session.username;
  if(user){
    res.redirect('/dashboard')
  }else{
    res.render('index', {user: req.session.username, noMenuButton: true});
  }
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
        req.session.username = req.body.username;
        res.redirect('/dashboard');
      });
    } else {
      res.render('login', {unsuccesful: true});
    }
  })(req, res, next);
});

router.get('/register', function(req, res) {
  res.render('register', {user:req.session.username});
});

router.post('/register', function(req, res) {
  req.session.username = req.body.username;
  User.findOne({username: req.session.username}, function(err, user, count) {
    if(!user) {
      var doctor = new Doctor({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        hospital: req.body.hospital,
        doctorType: req.body.speciality
      });
      doctor.save(function(err, doctor, count) {
        if(err) {
          console.log("Error saving user profile: " , err);
          res.render('register',{register:true});
        } else {
          //Authenticate
          User.register(new User({username:req.body.username}), req.body.password, function(err, user){
            if(err) {
              res.render('register', {register:true});
            } else {
              passport.authenticate('local')(req, res,function() {
                    res.redirect('/dashboard'); //success
              });
            }
          });
        }
      });
    }
  });
});

router.get('/dashboard', function(req, res){
  //Get the current user profile
  var user = req.session.username;
  if(!user) {
    res.redirect('/login');
  }
  Doctor.findOne({username:user}, function(err, doctor, count){
    if(err) {
      console.log(err);
      res.redirect('/');
    } else {
      console.log("where da slugs at : " , doctor);
      res.render('dashboard', {user:doctor});
    }
  });
});

router.get('/register-patient', function(req, res) {
  var user = req.session.username;
  if(!user) {
    res.redirect('/login');
  }
  res.render('register-patient');
});

router.post('/register-patient', function(req, res) {
  // create new patient object
  var meds = [];
  var med_names = [];
  var dosages = [];
  var freqs = [];

  med_names.push(req.body.med_name);
  dosages.push(req.body.dosage);
  freqs.push(req.body.frequency);

  for (var i = 0; i < med_names.length; i++) {
    var med = new Medication({
      name: med_names[i],
      dosage: dosages[i],
      frequency: freqs[i] // dropdown (day, week, ...)
    });
    meds.push(med);
  }

  var patient = new Patient({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    condition: req.body.condition,
    age: req.body.age,
    weight: req.body.weight,
    height: req.body.height,
    gender: req.body.gender.toLowerCase(),
    medications: meds
  });

  patient.save(function(err, patient, count) {
    if(err) {
      console.log("Error saving new patient" , err);
      res.redirect('/dashboard');
    } else {
      console.log("patient's slug: " , patient.slug);
      // push it into the doctor's patients list
      Doctor.findOne({username:req.session.username}, function(err, doctor, count) {
        if(err) {
          console.log("Error finding doctor: ", err);
        } else {
          doctor.patients.push(patient);
          doctor.save(function(saveErr, saveDoc, saveCount) {
            if(saveErr) {
              console.log("Error saving doctor: ", saveErr);
            } else {
              res.redirect('/dashboard');
            }
          });
        }
      });
    }
  });
});

router.get('/patient/:slug', function(req, res) {
  console.log('in : ', req.params.slug);
  Patient.findOne({slug: req.params.slug}, function(err, patient, count) {
    res.render('patient', {patient:patient, message:req.query.message});
  });
});

router.get('/patient/:slug/create-survey', function(req, res){
  var defaultQuestion = "Do you feel fully recovered? (Scale 1-10)";
  Patient.findOne({slug: req.params.slug}, function(err, patient, count) {
    res.render('create-survey', {defaultQuestion: defaultQuestion, patient:patient});

  });
});

router.post('/patient/:slug/create-survey', function(req, res){
  var rand = function(){
    return Math.random().toString(36).substr(2);
  };
  var token = rand()+rand();
  var questions = [];
  for(var i = 0; i < req.body.myInputs.length; i++){
    questions.push(req.body.myInputs[i]);
  }

  var array_of_question_objects = []
  for(var i = 0; i < questions.length; i++){
    question = {}
    question.surveyId = token;
    question.question = questions[i];
    array_of_question_objects.push(question);
  }
  Question.create(array_of_question_objects, function (err) {
    if (err){
      console.log(err);
      res.send(err);
    }else{
      var questions = Question.find({surveyId: token}, function(err, allQuestions){
        var survey = new Survey({
          id: token,
          questions: allQuestions,
          answered: false,
        }).save(function(err, currentSurvey, count){
          if(err) {
            res.send(err);
          } else{
            console.log(currentSurvey);
            Patient.findOne({slug: req.params.slug}, function(err, patient, count) {
              if(!err){
                patient.surveys.push(currentSurvey);
                patient.save();
                var redirectURL = '/patient/' + req.params.slug + "/" + "?message=created_survey";
                res.redirect(redirectURL);
              }else{
                res.send('patient not found');
              }
            });
          };
        });
      });
    }
  });
});

router.get('/answerSurvey/:slug', function(req, res){
  Survey.findOne({id: req.params.slug}, function(err, survey, count) {
    var defaultQuestion = "Do you feel fully recovered? (Scale 1-10)";
    res.render('answer-survey', {survey:survey, defaultQuestion:defaultQuestion});
  });
});

router.post('/answerSurvey/:slug', function(req, res){
  var answeredQuestions = req.body;
  var painLevel = req.body.painLevel;
  console.log("the slug is below");
  console.log(req.params.slug)
  Survey.findOneAndUpdate({id: req.params.slug}, { $set: { painLevel: parseInt(painLevel) }}, { new: true }, function (err, s) {
    console.log(s);
  });

  delete answeredQuestions.painLevel

  for(key in answeredQuestions){
    Question.findByIdAndUpdate(key, { $set: { answer: answeredQuestions[key] }}, { new: true }, function (err, q) {
      console.log(q)
    });
  }

  res.send(req.body);
});

router.get('/logout', function(req,res) {
  req.session.destroy();
  req.logout();
  res.redirect('/');
})

module.exports = router;
