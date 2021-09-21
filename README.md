# CCI2

second CCI repo

To dump the database use Jarvis_Schema_pg_dump_cmd_line arguments with dbeaver.  This will create just the necessary structure without all the data.  To migrate the database with data used standard pg_dump procedures.

To recreate the schema run dump-ornlbsd.sql as the cesium user.

We assume you have already created a database call ornlbsd with a user called cesium. 

The extensions postgis, uuid-osp, and pgrouting, tablefunc and pgsql must be installed and active on the database. 

from psql \dx shows extensions.

Install them if you have not done so already
, eg. 

apt install postgresql-12-pgrouting;
apt install postgresql-contrib-12;



drop database ornlbsd;
create database ornlbsd;
\c ornlbsd;
create extension postgis;
create extension "uuid-ossp";
create extension pgrouting;
create extension tablefunc;

do everything as postgres user

clear all old data and schemas from your old database before running the dump-ornlbsd.sql script from psql
\i /path/dump-ornlbsd.sql, using the postgres superuser while connected to the ornlbsd database

