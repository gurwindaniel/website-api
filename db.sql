CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon BYTEA NOT NULL, -- store the image as binary data
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userid int references users(id),
    approved BOOLEAN DEFAULT FALSE
);

-- ALTER TABLE programs
-- ADD COLUMN userid INT REFERENCES users(id),
-- ADD COLUMN approved BOOLEAN DEFAULT FALSE;

create table roles(
    roleid serial primary key,
    rolename varchar(100) not null unique
);
insert into roles(rolename) values ('admin'),('user');
create table users (
    id serial primary key,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role_id int references roles(roleid)
);