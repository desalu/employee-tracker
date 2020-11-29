const inquirer = require('inquirer');
const mysql = require('mysql');
const {printTable} = require('console-table-printer');
const { start } = require('repl');
const { last } = require('lodash');
const { query, response } = require('express');
const { async } = require('rxjs');
const { ifError } = require('assert');

var managers = [];

//////Connect to database//////////
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "12345678",
  database: "cms"
});
  
connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
  runProgram(); 
  
});

//////Action functions////////
async function viewDepartment() {
  let grabQuery = 'SELECT * FROM department';
  connection.query(grabQuery, await function (err, data) {
    printTable(data)
    runProgram();
  })
}

async function viewRole() {
  connection.query('SELECT * FROM role', await function (err, data) {
    if(err) throw err;
    printTable(data);
    runProgram();

  })
}

async function viewEmployee() {
  connection.query('SELECT * FROM employee', await function (err, data) {
    if(err) throw err;
    printTable(data);
    runProgram();

  })
}

async function addDepartment() {
  await inquirer
    .prompt(
      {
        type: "input",
        message: "Enter the name of Department",
        name: "deptTitle"
      }
    ).then(answer => {
      let query4 = "INSERT department (name) VALUES (?)"
      connection.query(query4, [answer.deptTitle], function (err, res) {
        if (err) throw err;
        console.log(`Department ${answer.deptTitle} is now in the system`);
        runProgram();
      })
    });
    
}

async function addRole() {
  let deptList = [];
  let query5 = "SELECT * FROM department";
  connection.query(query5, function (err, data) {
    if (err) throw err;
    for (let i = 0; i < data.length; i++) { 
      deptList.push(data[i].name)
    }
  })

  let questions =  [
    {
      type: "input",
        message: "Enter the position Title: ",
        name: "role"
    },
    {
      type: "input",
      message: "Enter the salary for this position",
      name: "salary",
    },
    {
      type: "rawlist",
      message: "And in which Department?",
      name: "deptList",
      choices: deptList
    }
  ];

  await inquirer
    .prompt(questions)
    .then(answers => {
      let deptID;
      connection.query(query5, function (err, data) {
        if (err) throw err;
        for (let i = 0; i < data.length; i++) { 
          if (answers.deptList === data[i].name) {
            deptID = data[i].id;
          }
        }
      })

      let query4 = "INSERT role (title, salary, department_id) VALUES (?, ?, ?)"
      connection.query(query4, [answers.role, answers.salary, deptID], function (err, res) {
        if (err) throw err;
        console.log(`Department ${answers.role} is now in the system`);
        runProgram();
      })
    });
}

async function addEmployee () {
  let newEmployee = [];
  
  const questions = [
    {
      type: "input",
      message: "Enter employee first name",
      name: "first_name"
    },
    {
      type: "input",
      message: "Enter employee last name",
      name: "last_name"
    }
  ]
  await inquirer
    .prompt(questions)
    .then(answers => {
      newEmployee.push(answers.first_name, answers.last_name);
    });
  
  console.log(newEmployee);

  let roleList = [];

  let query = "SELEcT * FROM role";
   await connection.query(query, async function (err, data) {
    if (err) throw err;
   
    for (let i = 0; i < data.length; i ++) {

      roleList.push(data[i].title)
      
    };
    await inquirer
    .prompt({
      type: "rawlist",
      message: "Choose Employee Roles",
      name: 'roles',
      choices: roleList
    }).then(answer => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].title === answer.roles){
          newEmployee.push(data[i].id)
        }
        console.log(newEmployee);
      }

      let managerList = [];

    let query2 = "SELECT * FROM employee WHERE manager_id IS NULL";
    connection.query(query2, async function (err, data) {
    if (err) throw err;
    managerList.push('None');
    for (let i = 0; i < data.length; i ++) {

      managerList.push(data[i].first_name + " " + data[i].last_name)
      
    };
    await inquirer
    .prompt({
      type: "rawlist",
      message: "Choose Employee's manager (if any)",
      name: 'managers',
      choices: managerList
    }).then(answer => {
      let name = answer.managers.split(" ");
      for (let i = 0; i < data.length; i++) {
        if (data[i].first_name === name[0] && data[i].last_name === name[1]){
          newEmployee.push(data[i].id)
        }
        console.log(newEmployee);
      }
      let query3 = "INSERT employee (first_name, last_name, role_id, manager_id) VALUES (?)"
      connection.query(query3, [newEmployee], function (err, res) {
        if (err) throw err;
        console.log("Insertation completed");
        runProgram();
      })
    })

  })
      
    })
    
    connection.end;
  });

  

  

  
  

  

  
  

  // let roles = await connection.query('SELECT id, title FROM role', function (err, data) {
  //   return data;
  // });

  // console.log(roles);

  // let managers = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
  // managers.unshift({ id: null, Manager: "None" });

  
};

async function updateManager() {
  connection.query('SELECT * FROM employee WHERE manager_id IS NULL', function (err, data) {
    printTable(data);
    inquirer
    .prompt(
      {
        type: "input",
        name: "updateID",
        message: "Which employee would like to update? (Enter the id number)"
      },
      
    ).then(answer => {
      
      for (let i = 0; i < data.length; i++) {
        
        if ( parseInt(answer.updateID) === data[i].id) {
          const question = [
            {
              type: "rawlist",
              name: "selection",
              message: `Which item do you wnat to update?`,
              choices: ['first_name', 'last_name', 'role_id', 'manager_id']
            },
            {
              type: "input",
              name: "newItem",
              message: `Change to : `,
            },
          ]
          inquirer
          .prompt(question)
          .then(answers => {
            console.log();
            connection.query(`UPDATE cms.employee SET ${answers.selection} = "${answers.newItem}" WHERE id = ${parseInt(answer.updateID)}`, function (err, res) {
              if (err) throw err;
              console.log("Changes is completed");
              runProgram();

            });
            
          })
          
        }
        
      }
    })
  })
}

async function updateEmployee() {
  connection.query('SELECT * FROM employee', function (err, data) {
    printTable(data);
    inquirer
    .prompt(
      {
        type: "input",
        name: "updateID",
        message: "Which employee would like to update? (Enter the id number)"
      },
      
    ).then(answer => {
      
      for (let i = 0; i < data.length; i++) {
        
        if ( parseInt(answer.updateID) === data[i].id) {
          const question = [
            {
              type: "rawlist",
              name: "selection",
              message: `Which item do you wnat to update?`,
              choices: ['first_name', 'last_name', 'role_id', 'manager_id']
            },
            {
              type: "input",
              name: "newItem",
              message: `Change to : `,
            },
          ]
          inquirer
          .prompt(question)
          .then(answers => {
            console.log();
            connection.query(`UPDATE cms.employee SET ${answers.selection} = "${answers.newItem}" WHERE id = ${parseInt(answer.updateID)}`, function (err, res) {
              if (err) throw err;
              console.log("Changes is completed");
              runProgram();

            });
            
          })
          
        }
        
      }
    })
  })
}

async function viewEmployeeByManager() {
  connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, data) {
    let mgrList = [];
    printTable(data);
    for (let i = 0; i < data.length; i++){
      mgrList.push(data[i].first_name + " " + data[i].last_name)
    }
    inquirer
    .prompt(
      {
        type: "rawlist",
        name: "mgrEmpList",
        message: "Select the manager to see the employees under that manager",
        choices: mgrList
      }
    ).then(answer => {
      let listByID;
      for (let i = 0; i < data.length; i++){
        let name2 = answer.mgrEmpList.split(" ");
      for (let i = 0; i < data.length; i++) {
        if (data[i].first_name === name2[0] && data[i].last_name === name2[1]){
          listByID = parseInt(data[i].id);
        }

        
      }
      }
      connection.query(`SELECT * FROM cms.employee WHERE manager_id = ${listByID}`, function (err, res) {
        printTable(res);
        connection.end;
        runProgram();
      })
    })
  })

  // connection.query('SELECT * FROM role', await function (err, data) {
  //   if(err) throw err;
  //   printTable(data);
  //   runProgram();

  // }) 
}

async function deleteDepartment() {
  connection.query("SELECT * FROM cms.department", function (err, data) {
    if (err) throw err;
    let deptList = []
    for (let i = 0; i < data.length; i++) {
      deptList.push(data[i].name)
    }
    inquirer
    .prompt(
      {
        type: "rawlist",
        name: "list",
        message: "Which department you want to delete?",
        choices: deptList
      }
    ).then(answer => {
      connection.query(`DELETE FROM cms.department WHERE name = "${answer.list}"`, function (err, res) {
        if (err) throw err;
        connection.end;
      });
      console.log('Success!');
      runProgram();
    })
  })
}

async function deleteRole() {
  connection.query("SELECT * FROM cms.role", function (err, data) {
    if (err) throw err;
    let roleList = []
    for (let i = 0; i < data.length; i++) {
      roleList.push(data[i].title)
    }
    inquirer
    .prompt(
      {
        type: "rawlist",
        name: "list",
        message: "Which role you want to delete?",
        choices: roleList
      }
    ).then(answer => {
      connection.query(`DELETE FROM cms.role WHERE title = "${answer.list}"`, function (err, res) {
        if (err) throw err;
        connection.end;
      });
      console.log('Success!');
      runProgram();
    })
  })
}

async function deleteEmployee() {
  connection.query("SELECT * FROM cms.employee", function (err, data) {
    if (err) throw err;
    printTable(data);

    inquirer
    .prompt(
      {
        type: "input",
        name: "removeID",
        message: "Which employee would like to update? (Enter the id number)"
      }
    ).then(answer => {
    
      connection.query(`DELETE FROM cms.employee WHERE id = "${answer.removeID}"`, function (err, res) {
        if (err) throw err;
        connection.end;
      });
      console.log('Success!');
      runProgram();
    })
  })
};

async function exitProgram() {
  process.exit(1);
}

//Start the program which asks the first Question
const runProgram = async() => {
  inquirer
  .prompt(
    {
      type: 'list',
      name: "action",
      message: 'Welcome to this Content Management System. What would you like to do?',
      choices: ['Add department', 'Add role', 'Add employees', 'View department', 'View roles', 'View employees', 'Update managers', 'Update employees', 'View employees by manager', 'Delete departments', 'Delete Roles', 'Delete employees', 'Exit Program']
    }
  )
  .then((answer) => {
    switch (answer.action) {
      case 'View department':
        viewDepartment();
        break;

      case 'View roles':
        viewRole();
        break;

      case 'View employees':
        viewEmployee();
        break;

      case 'Add department':
         addDepartment();
        break;

      case 'Add role':
         addRole();
        break;

      case 'Add employees':
        addEmployee();
        break;
        
      case 'Update managers':
        updateManager();
        break;

      case 'Update employees':
        updateEmployee();
        break;
      
      case 'View employees by manager':
        viewEmployeeByManager();
        break;

      case 'Delete Roles':
        deleteRole();
        break;

      case 'Delete departments':
        deleteDepartment();
        break;

      case 'Delete employees':
        deleteEmployee();
        break;

      case 'Exit Program':
        exitProgram();
        break;
        
    
      default:
        break;
    }
  })
};

