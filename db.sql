create schema inventory collate utf8mb4_general_ci;
use inventory;

create table categories
(
    id          int auto_increment
        primary key,
    title       varchar(255) not null,
    description text         null
);

create table places
(
    id          int auto_increment
        primary key,
    title       varchar(255) not null,
    description text         null
);

create table items
(
    id          int auto_increment
        primary key,
    category_id int                                not null,
    place_id    int                                not null,
    title       varchar(255)                       not null,
    description text                               null,
    image       varchar(255)                       null,
    created_at  datetime default CURRENT_TIMESTAMP null,
    constraint items_categories_id_fk
        foreign key (category_id) references categories (id),
    constraint items_places_id_fk
            foreign key (place_id) references places (id)
);

insert into categories (id, title, description)
values  (1, 'Мебель', 'Диваны, стулья, столы, шкафы'),
        (2, 'Компьютерное оборудование', 'Компьютеры, ноутбуки, сканеры, клавиатуры и мышки'),
        (3, 'Другая техника', 'Кулер, кофемашина'),
        (4, 'Другое', 'Теннисный стол, ракетки, литература');

insert into places (id, title, description)
values  (1, 'Кухня', '2 этаж'),
        (2, 'Айти-отдел', 'Там, где сидят айтишники лол. Второй этаж, 205 кабинет'),
        (3, 'Бухгалтерия', null),
        (4, 'Лаунж-зона', '3 этаж, большой зал');

insert into items (id, category_id, place_id, title, description, image, created_at)
values  (1, 1, 1, 'Кухонный гарнитур', null, null, '2024-08-20 13:26:29'),
        (2, 4, 4, 'Теннисный стол', 'Для развлечения', '3.jpg', '2024-08-20 14:28:44'),
        (3, 2, 4, 'Компьютер', 'Комп главного бухгалтера', '55.jpg', '2024-08-20 15:28:50');