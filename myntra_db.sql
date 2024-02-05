create table products 
(id int auto_increment PRIMARY KEY, name VARCHAR(255), category VARCHAR(100), 
description TEXT, price float, gender VARCHAR(10), brand VARCHAR(255), 
size_id INT, color VARCHAR(50), 
material VARCHAR(50), image_URL VARCHAR(255),
foreign key (size_id) references sizes(id), 
is_active BOOLEAN DEFAULT 1,
created_at datetime DEFAULT CURRENT_TIMESTAMP,
updated_at datetime ON UPDATE CURRENT_TIMESTAMP );

create table sizes
(id int auto_increment PRIMARY KEY,
name VARCHAR(20),
is_active BOOLEAN DEFAULT 1);

create table users
(id int auto_increment PRIMARY KEY, name VARCHAR(255), email VARCHAR(255),
password VARCHAR(255),
is_active BOOLEAN DEFAULT 1,
created_at datetime DEFAULT CURRENT_TIMESTAMP,
updated_at datetime ON UPDATE CURRENT_TIMESTAMP);

create table wishlist
(id int auto_increment PRIMARY KEY, quantity INT, product_id INT, user_id INT, 
foreign key (product_id) references products(id),
foreign key (user_id) references users(id),
is_active BOOLEAN DEFAULT 1,
created_at datetime DEFAULT CURRENT_TIMESTAMP,
updated_at datetime ON UPDATE CURRENT_TIMESTAMP);

-- use myntra;
-- show tables;
-- desc products;
-- drop tables products, users, sizes, wishlist;