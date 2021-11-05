const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "hospital",
});
app.post("/makereport", (req, res) => {
  const REPORT_IP = `SELECT StartDate, EndDate, Result, Price AS medication_price
                      FROM TREATMENT JOIN medication ON treatment.Medication = medication.Code
                      WHERE treatment.Patient = '${req.body.patientID}'`;
  const REPORT_OP = `SELECT examination.DateExam, diagnosis, fee, price AS medication_price
                      FROM examination JOIN medication ON examination.Medication = medication.Code
                      WHERE patient = '${req.body.patientID}'`;
  if (req.body.patientID[0] == "I")
    db.query(REPORT_IP, (err, result) => {
      if (err) res.send(err);
      else res.send(result);
    });
  else
    db.query(REPORT_OP, (err, result) => {
      if (err) res.send(err);
      else res.send(result);
    });
});
app.post("/searchpatientinfo", (req, res) => {
  console.log(req.body.patientID);
  const SEARCH_QUERY1 = `With patientinfo
                        AS(
                        SELECT Patient.code, First_name, LAst_name,examination.DateExam, diagnosis
                        FROM patient JOIN examination on patient.code = examination.patient 
                        ),
                        patient_phone_info AS
                        (
                        SELECT Code, group_concat(Phone_num) AS patient_phone
                        FROM patient_phone
                        GROUP BY Code
                        )
                        SELECT First_name, Last_name, DateExam, diagnosis, patient_phone_info.patient_phone
                        FROM patientinfo LEFT OUTER JOIN patient_phone_info ON patientinfo.code = patient_phone_info.code
                        WHERE patientinfo.code = '${req.body.patientID}'`;
  const SEARCH_QUERY2 = `With patientinfo
                          AS(
                          SELECT Patient.code, First_name, LAst_name, StartDate, EndDate, Result
                          FROM patient JOIN treatment on patient.code = treatment.patient 
                          ),
                          patient_phone_info AS
                          (
                          SELECT Code, group_concat(Phone_num) AS patient_phone
                          FROM patient_phone
                          GROUP BY Code
                          )
                          SELECT First_name, Last_name, StartDate, EndDate, Result, patient_phone_info.patient_phone
                          FROM patientinfo LEFT OUTER JOIN patient_phone_info ON patientinfo.code = patient_phone_info.code
                          WHERE patientinfo.code = '${req.body.patientID}'`;

  if (req.body.patientID[0] == "I")
    db.query(SEARCH_QUERY2, (err, result) => {
      if (err) res.send(err);
      else res.send(result);
    });
  else
    db.query(SEARCH_QUERY1, (err, result) => {
      if (err) res.send(err);
      else res.send(result);
    });
});
app.post("/register", (req, res) => {
  const username = req.body.userReg;
  const password = req.body.passwordReg;
  console.log(username);
  console.log(password);
  const ADD_QUERY = `INSERT INTO hospital.userdata VALUES   ('${username}','${password}')`;
  db.query(ADD_QUERY, (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    } else res.send("Task has been added");
  });
});
app.post("/addnewpatient", (req, res) => {
  const ADD_PATIENT_QUERY = `INSERT INTO patient VALUES ('${req.body.newID}', '${req.body.newFname}', '${req.body.newLname}', STR_TO_DATE('${req.body.newDOB}','%Y-%m-%d'),'${req.body.newGender}','${req.body.newAddress}')`;
  db.query(ADD_PATIENT_QUERY, (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    } else res.send("Patient has been added");
  });
});
app.post("/listpatient", (req, res) => {
  const LIST_PATIENT = `WITH patientID (ID) AS
                        (
                        SELECT DISTINCT out_patient.Code 
                        FROM out_patient
                        WHERE Exam_Doctor = '${req.body.doctorID}'
                        UNION
                        SELECT DISTINCT treatment.Patient
                        FROM treatment
                        WHERE treatment.Doctor = '${req.body.doctorID}'
                        )
                        SELECT First_Name, Last_Name, DoB, Gender
                        FROM patientID JOIN patient ON patientID.ID = patient.code`;
  db.query(LIST_PATIENT, (err, result) => {
    if (err) res.send(err);
    else res.send(result);
  });
});
app.post("/login", (req, res) => {
  const username = req.body.userlog;
  const password = req.body.passwordlog;
  console.log(username);
  console.log(password);
  const SELECT_QUERY = `SELECT * FROM userdata WHERE username = '${username}' AND password = '${password}'`;
  db.query(SELECT_QUERY, (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length > 0) {
      res.send(result);
    } else res.send({ message: "Wrong username or password!" });
  });
});
app.listen(4000, () => {
  console.log("Running on port 4000");
});
