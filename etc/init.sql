CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(120) NOT NULL,
    title_seo character varying(100) NOT NULL,
    content character varying(500) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    featured_image_name character varying(40) NOT NULL,
    tags character varying(100) NOT NULL
);