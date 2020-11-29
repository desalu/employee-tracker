INSERT INTO department (name) VALUES ('Engineering');

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Toks', 'Desalu', 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('Karin', 'Davis', 2, 1);

INSERT INTO role (title, salary, department_id) VALUES ("Manager", 95000.34, 1);
INSERT INTO role (title, salary, department_id) VALUES ("Serectary", 34000, 1);
