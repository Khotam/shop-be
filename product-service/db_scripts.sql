create extension if not exists "uuid-ossp";
create table products (
	id uuid primary key default uuid_generate_v4(),
	title text not null,
    description text,
    price integer not null
);
create table stocks (
	id uuid primary key default uuid_generate_v4(),
	product_id uuid,
	count integer not null default 0,
	foreign key ("product_id") references "products" ("id") on delete cascade
);

insert into products (title, description, price) values 
	('Iphone 12 Pro Max', 'the best apple phone', 1500),
	('Samsung Galaxy S21+', 'the best samsung phone', 1400),
	('Redmi 10T', 'the best xiaomi phone', 790);

insert into stocks (product_id, count) values 
	('ae21f236-ccb2-4b9f-8057-5788c6eb58ca', 1),
	('495fcd6f-4b8b-4d1c-b4f3-e35245e54b9a', 2),
	('61f5b524-519b-44c2-8901-b204a17e12c6', 3);