const mysql = require("mysql2");
const inquirer = require("inquirer");


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Chickennugget10!",
  database: "employee_db"
});


connection.connect(function (err) {
  if (err) throw err;

  initialPrompt();
});


function initialPrompt() {

  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Would you like to do?",
      choices: [
        "View Employees",
        "View Department",
        "Add Department",
        "Add Employee",
        "View Employees by Department",
        "Remove Employees",
        "Update Employee role",
        "Add role",
        "View role",
        "End"]
    })
    .then(function ({ task }) {
      switch (task) {
        case "View Employees":
          viewWorkers();
          break;
        case "View Employees by Department":
          viewWorkersByDepartment();
          break;
        case "View Department":
          viewDepartment();
          break;
          case "Add Department":
            addDepartment();
          break;      
        case "Add Employee":
          addEmployee();
          break;
        case "Remove Employees":
          removeEmployees();
          break;
          case "View role":
          viewrole();
          break;
        case "Update Employee role":
          updateEmployeerole();
          break;
        case "Add role":
          addrole();
          break;
        case "End":
          connection.end();
          break;
      }
    });
}

function viewrole() {
  

  var query =
    `select * from role`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    initialPrompt();
  });
  
}

function viewDepartment() {

  var query =
    `select * from department`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
   

    initialPrompt();
  });

}

function viewWorkers() {
 

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
   

    initialPrompt();
  });
 
}

function viewWorkersByDepartment() {
 

  var query =
    `SELECT d.id, d.name, r.salary AS budget
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const departmentChoice = res.map(data => ({
      value: data.id, name: data.name
    }));

    console.table(res);
   

    promptDepartment(departmentChoice);
  });

}



function promptDepartment(departmentChoice) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which department would you choose?",
        choices: departmentChoice
      }
    ])
    .then(function (answer) {
     

      var query =
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  WHERE d.id = ?`

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
      

        initialPrompt();
      });
    });
}



function addEmployee() {


  var query =
    `SELECT r.id, r.title, r.salary 
      FROM role r`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));

    console.table(res);
   

    promptInsert(roleChoices);
  });
}

function addDepartment(){
  inquirer.prompt ({
    type:"input",
    message:"What is the name of the department you would like to add?",
    name:"newDep"
      }) .then(answers => {
        connection.query(`insert into department(name) values("${answers.newDep}")`, function(err, res){
          if (err)throw err
          console.table(res);
          initialPrompt()
        })
      })
} 

function promptInsert(roleChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?"
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
      },
  
    ])
    .then(function (answer) {
      

      var query = `INSERT INTO employee SET ?`
      // when finished prompting, insert a new item into the db with that info
      connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);

          initialPrompt();
        });
    
    });
}



function removeEmployees() {
  

  var query =
    `SELECT e.id, e.first_name, e.last_name
      FROM employee e`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${id} ${first_name} ${last_name}`
    }));

    console.table(res);
    

    promptDelete(deleteEmployeeChoices);
  });
}



function promptDelete(deleteEmployeeChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeChoices
      }
    ])
    .then(function (answer) {

      var query = `DELETE FROM employee WHERE ?`;
      
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        

        initialPrompt();
      });
      
    });
}



function updateEmployeerole() { 
  employeeArray();

}

function employeeArray() {


  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));

    console.table(res);
    

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {
  

  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    console.table(res);

    promptEmployeerole(employeeChoices, roleChoices);
  });
}

function promptEmployeerole(employeeChoices, roleChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices
      },
    ])
    .then(function (answer) {

      var query = `UPDATE employee SET role_id = ? WHERE id = ?`
      
      connection.query(query,
        [ answer.roleId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) throw err;

          console.table(res);
        

          initialPrompt();
        });
     
    });
}





function addrole() {

  var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

 
    const departmentChoice = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
   

    promptAddrole(departmentChoice);
  });
}

function promptAddrole(departmentChoice) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "role title?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "role Salary"
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoice
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
        

          initialPrompt();
        });

    });
}

