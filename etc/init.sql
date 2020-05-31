CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(120) NOT NULL,
    title_seo character varying(100) NOT NULL,
    content character varying(3000) NOT NULL,
    summary character varying(300) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    featured_image_name character varying(200) NOT NULL,
    tags character varying(100) NOT NULL
);

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-01-02', '2020-01-02', 'post 1', 'post-1', 'this is the content', 'the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-01-02', '2020-01-02', 'post 2', 'post-2', 'this is the content','the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-01-02', '2020-01-02', 'post 3', 'post-3', 'this is the content','the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')
