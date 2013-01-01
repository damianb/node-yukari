create table if not exists log (
	id integer primary key autoincrement,
	username not null,
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

/*
create table if not exists hashes (
	id integer primary key autoincrement,
	hash not null,
	time not null
);

create table if not exists personas (
	id integer primary key autoincrement,
	ownerId integer not null,
	type integer not null,
	name not null,
	email not null
);

create table if not exists messages (
	id integer primary key autoincrement,
	type integer not null,
	authorId integer not null,
	time integer not null,
	inReplyToId integer not null,
	replyAuthorId integer not null,
	content
);
*/
