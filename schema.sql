CREATE DATABASE teman_semester;
USE teman_semester;

CREATE TABLE users (
	username varchar(255) NOT NULL UNIQUE,
    nama varchar(255) NOT NULL,
	email varchar(255) NOT NULL UNIQUE,
    password varchar (255) NOT NULL,
    primary key(username)
);

CREATE TABLE auth_token(
	token varchar (255) NOT NULL,
	user varchar(255) NOT NULL UNIQUE,
    PRIMARY KEY (token),
    foreign key (user) references users(username)
);
