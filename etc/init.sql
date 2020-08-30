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

CREATE TABLE search_terms (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    term character varying(120) NOT NULL,
    term_seo character varying(100) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    related_posts_csv character varying(100),
    CONSTRAINT term_unique UNIQUE (term),
    CONSTRAINT term_seo_unique UNIQUE (term_seo)
);

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-06-02', '2020-06-02', 'post 1', 'post-1', 'this is the content', 'the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-06-02', '2020-06-02', 'post 2', 'post-2', 'this is the content','the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')

insert into posts ( created_at, updated_at, title, title_seo, "content", summary, active, featured_image_name, tags)
values('2020-06-02', '2020-06-02', 'post 3', 'post-3', 'this is the content','the summary', true, 'vladislav-klapin-symzoee8qua-unsplash.jpg', 'tag1,tag2,tag3')

TRUNCATE public.search_terms

INSERT INTO public.search_terms
(created_at, updated_at, term, term_seo, active, related_posts_csv)
VALUES
('2020-06-02', '2020-06-02', 'how to build sitemap', 'how-to-build-sitemap', true, '1,2,3'),
('2020-06-02', '2020-06-02', 'how to sitemap', 'how-to-sitemap', true, '1,2,3'),
('2020-06-02', '2020-06-02', 'express js', 'express-js', true, ''),
('2020-06-02', '2020-06-02', 'express sitemap', 'express-sitemap', true, ''),
('2020-06-02', '2020-06-02', 'build sitemap', 'build-sitemap', true, ''),
('2020-06-02', '2020-06-02', 'nodejs sitemap', 'nodejs-sitemap', true, ''),
('2020-06-02', '2020-06-02', 'better-queue', 'better-queue', true, '')
