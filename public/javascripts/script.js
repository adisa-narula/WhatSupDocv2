function addMedication() {
  var newDiv = document.createElement('div');
  newDiv.className = "new-medication";
  newDiv.appendChild(newField("med_name", "Name"));
  newDiv.appendChild(newField("dosage", "Dosage (i.e. 250 mg)"));
  newDiv.appendChild(newField("frequency", "Frequency (i.e. Twice a day)"));

  // add line
  var line = document.createElement('hr');
  line.className = "styleline-long";

  newDiv.appendChild(line);
  document.getElementById("medication-form").appendChild(newDiv);
}

function newField(fieldName, innerHTML) {

  var medDiv = document.createElement('div');
  medDiv.className = "mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-upgraded";

  var inputMed = document.createElement('input');
  inputMed.className = "mdl-textfield__input";
  inputMed.id = fieldName;
  inputMed.name = fieldName;

  var labelMed = document.createElement('label');
  labelMed.className = "mdl-textfield__label";
  labelMed.for = fieldName;
  labelMed.innerHTML = innerHTML;

  medDiv.appendChild(inputMed);
  medDiv.appendChild(labelMed);

  return medDiv;
}
