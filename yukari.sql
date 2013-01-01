create table if not exists log (
	id integer primary key autoincrement,
	username not null,
	channel not null,
	hostmask not null,
	time integer not null,
	message not null
);

create table if not exists quotes (
	id integer primary key autoincrement,
	username not null,
	time integer not null,
	message not null
);

create table if not exists users (
	id integer primary key autoincrement,
	type integer not null,
	username not null,
	time integer not null
);

create table if not exists user_hashes (
	id integer primary key autoincrement,
	userId integer not null,
	hash not null
);
