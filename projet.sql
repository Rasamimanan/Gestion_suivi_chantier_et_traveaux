--
-- PostgreSQL database dump
--

\restrict OC9goQ9njEXkCrKqiYcVoQqlpSdVvRgsC6hJXSNqvxVPFOX0weT5DzofopOjo90

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

-- Started on 2026-06-11 12:59:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 106747)
-- Name: chantiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chantiers (
    id integer NOT NULL,
    nom character varying(255) NOT NULL,
    adresse text,
    date_debut date,
    date_fin_prevue date,
    statut character varying(50) DEFAULT 'en_cours'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chantiers OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 106746)
-- Name: chantiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chantiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chantiers_id_seq OWNER TO postgres;

--
-- TOC entry 3472 (class 0 OID 0)
-- Dependencies: 214
-- Name: chantiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chantiers_id_seq OWNED BY public.chantiers.id;


--
-- TOC entry 225 (class 1259 OID 106819)
-- Name: commentaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commentaires (
    id integer NOT NULL,
    etape_id integer NOT NULL,
    intervenant_id integer,
    texte text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.commentaires OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 106818)
-- Name: commentaires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commentaires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commentaires_id_seq OWNER TO postgres;

--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 224
-- Name: commentaires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commentaires_id_seq OWNED BY public.commentaires.id;


--
-- TOC entry 233 (class 1259 OID 106894)
-- Name: connexions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connexions (
    id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    ip_address character varying(45),
    user_agent text,
    date_connexion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.connexions OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 106893)
-- Name: connexions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.connexions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.connexions_id_seq OWNER TO postgres;

--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 232
-- Name: connexions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.connexions_id_seq OWNED BY public.connexions.id;


--
-- TOC entry 227 (class 1259 OID 106840)
-- Name: depenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depenses (
    id integer NOT NULL,
    chantier_id integer NOT NULL,
    etape_id integer,
    description character varying(255),
    montant numeric(10,2) NOT NULL,
    categorie character varying(100) DEFAULT 'autre'::character varying,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.depenses OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 106839)
-- Name: depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.depenses_id_seq OWNER TO postgres;

--
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 226
-- Name: depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depenses_id_seq OWNED BY public.depenses.id;


--
-- TOC entry 223 (class 1259 OID 106799)
-- Name: etape_intervenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etape_intervenants (
    id integer NOT NULL,
    etape_id integer,
    intervenant_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.etape_intervenants OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 106798)
-- Name: etape_intervenants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etape_intervenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.etape_intervenants_id_seq OWNER TO postgres;

--
-- TOC entry 3476 (class 0 OID 0)
-- Dependencies: 222
-- Name: etape_intervenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etape_intervenants_id_seq OWNED BY public.etape_intervenants.id;


--
-- TOC entry 219 (class 1259 OID 106768)
-- Name: etapes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etapes (
    id integer NOT NULL,
    chantier_id integer,
    titre character varying(255) NOT NULL,
    description text,
    date_debut date,
    date_fin date,
    statut character varying(50) DEFAULT 'non_commence'::character varying,
    ordre integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.etapes OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 106767)
-- Name: etapes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.etapes_id_seq OWNER TO postgres;

--
-- TOC entry 3477 (class 0 OID 0)
-- Dependencies: 218
-- Name: etapes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etapes_id_seq OWNED BY public.etapes.id;


--
-- TOC entry 217 (class 1259 OID 106758)
-- Name: intervenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.intervenants (
    id integer NOT NULL,
    nom character varying(255) NOT NULL,
    prenom character varying(255),
    role character varying(100),
    telephone character varying(20),
    email character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.intervenants OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 106757)
-- Name: intervenants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.intervenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.intervenants_id_seq OWNER TO postgres;

--
-- TOC entry 3478 (class 0 OID 0)
-- Dependencies: 216
-- Name: intervenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.intervenants_id_seq OWNED BY public.intervenants.id;


--
-- TOC entry 229 (class 1259 OID 106860)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying(255),
    type character varying(50),
    titre character varying(255) NOT NULL,
    message text,
    lien character varying(255),
    lue boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 106859)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 3479 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 221 (class 1259 OID 106784)
-- Name: photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    etape_id integer,
    url text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.photos OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 106783)
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.photos_id_seq OWNER TO postgres;

--
-- TOC entry 3480 (class 0 OID 0)
-- Dependencies: 220
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- TOC entry 235 (class 1259 OID 106909)
-- Name: tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    token character varying(500) NOT NULL,
    expire_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tokens OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 106908)
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tokens_id_seq OWNER TO postgres;

--
-- TOC entry 3481 (class 0 OID 0)
-- Dependencies: 234
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- TOC entry 231 (class 1259 OID 106878)
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateurs (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    nom character varying(255),
    prenom character varying(255),
    role character varying(50) DEFAULT 'utilisateur'::character varying,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    code_validation character varying(6),
    email_verifie boolean DEFAULT false,
    date_validation date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.utilisateurs OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 106877)
-- Name: utilisateurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.utilisateurs_id_seq OWNER TO postgres;

--
-- TOC entry 3482 (class 0 OID 0)
-- Dependencies: 230
-- Name: utilisateurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateurs_id_seq OWNED BY public.utilisateurs.id;


--
-- TOC entry 3223 (class 2604 OID 106750)
-- Name: chantiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chantiers ALTER COLUMN id SET DEFAULT nextval('public.chantiers_id_seq'::regclass);


--
-- TOC entry 3235 (class 2604 OID 106822)
-- Name: commentaires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaires ALTER COLUMN id SET DEFAULT nextval('public.commentaires_id_seq'::regclass);


--
-- TOC entry 3251 (class 2604 OID 106897)
-- Name: connexions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connexions ALTER COLUMN id SET DEFAULT nextval('public.connexions_id_seq'::regclass);


--
-- TOC entry 3238 (class 2604 OID 106843)
-- Name: depenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depenses ALTER COLUMN id SET DEFAULT nextval('public.depenses_id_seq'::regclass);


--
-- TOC entry 3233 (class 2604 OID 106802)
-- Name: etape_intervenants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etape_intervenants ALTER COLUMN id SET DEFAULT nextval('public.etape_intervenants_id_seq'::regclass);


--
-- TOC entry 3228 (class 2604 OID 106771)
-- Name: etapes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes ALTER COLUMN id SET DEFAULT nextval('public.etapes_id_seq'::regclass);


--
-- TOC entry 3226 (class 2604 OID 106761)
-- Name: intervenants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervenants ALTER COLUMN id SET DEFAULT nextval('public.intervenants_id_seq'::regclass);


--
-- TOC entry 3242 (class 2604 OID 106863)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3231 (class 2604 OID 106787)
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- TOC entry 3253 (class 2604 OID 106912)
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- TOC entry 3245 (class 2604 OID 106881)
-- Name: utilisateurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN id SET DEFAULT nextval('public.utilisateurs_id_seq'::regclass);


--
-- TOC entry 3446 (class 0 OID 106747)
-- Dependencies: 215
-- Data for Name: chantiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chantiers (id, nom, adresse, date_debut, date_fin_prevue, statut, created_at) FROM stdin;
1	Construction Maison Familiale	123 Rue Principale, Antananarivo	2024-01-15	\N	en_cours	2026-06-11 10:09:26.942213
2	Rénovation Bureau	45 Avenue de l'Indépendance	2024-02-01	\N	en_cours	2026-06-11 10:09:26.942213
3	Extension École	789 Boulevard Université, Antananarivo	2023-10-01	\N	termine	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3456 (class 0 OID 106819)
-- Dependencies: 225
-- Data for Name: commentaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commentaires (id, etape_id, intervenant_id, texte, created_at, updated_at) FROM stdin;
1	1	1	Fondations coulées sans problème. Prêt pour étape 2.	2026-06-11 10:09:26.942213	2026-06-11 10:09:26.942213
2	2	2	Murs montés à 50%. Pas de problème détecté.	2026-06-11 10:09:26.942213	2026-06-11 10:09:26.942213
3	4	3	Démolition terminée. Bon travail de l'équipe.	2026-06-11 10:09:26.942213	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3464 (class 0 OID 106894)
-- Dependencies: 233
-- Data for Name: connexions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.connexions (id, utilisateur_id, ip_address, user_agent, date_connexion) FROM stdin;
\.


--
-- TOC entry 3458 (class 0 OID 106840)
-- Dependencies: 227
-- Data for Name: depenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depenses (id, chantier_id, etape_id, description, montant, categorie, date, created_at) FROM stdin;
1	1	1	Ciment et béton	5000000.00	Matériaux	2024-01-20	2026-06-11 10:09:26.942213
2	1	1	Main d'œuvre fondations	2000000.00	Main-d'œuvre	2024-02-10	2026-06-11 10:09:26.942213
3	1	2	Briques et mortier	8000000.00	Matériaux	2024-03-01	2026-06-11 10:09:26.942213
4	2	4	Évacuation débris	1500000.00	Autres	2024-02-15	2026-06-11 10:09:26.942213
5	2	5	Peinture	2000000.00	Matériaux	2024-03-05	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3454 (class 0 OID 106799)
-- Dependencies: 223
-- Data for Name: etape_intervenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etape_intervenants (id, etape_id, intervenant_id, created_at) FROM stdin;
\.


--
-- TOC entry 3450 (class 0 OID 106768)
-- Dependencies: 219
-- Data for Name: etapes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etapes (id, chantier_id, titre, description, date_debut, date_fin, statut, ordre, created_at) FROM stdin;
1	1	Fondations	Coulage des fondations en béton armé	2024-01-15	2024-02-15	termine	1	2026-06-11 10:09:26.942213
2	1	Murs	Construction des murs de la maison	2024-02-16	2024-04-16	en_cours	2	2026-06-11 10:09:26.942213
3	1	Électricité	Installation électrique complète	2024-04-17	2024-05-17	non_commence	3	2026-06-11 10:09:26.942213
4	2	Démolition	Enlèvement des anciennes installations	2024-02-01	2024-02-28	termine	1	2026-06-11 10:09:26.942213
5	2	Rénovation murs	Peinture et revêtement des murs	2024-03-01	2024-03-31	en_cours	2	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3448 (class 0 OID 106758)
-- Dependencies: 217
-- Data for Name: intervenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.intervenants (id, nom, prenom, role, telephone, email, created_at) FROM stdin;
1	Rakoto	Jean	Maçon	034 12 345 67	jean.rakoto@email.com	2026-06-11 10:09:26.942213
2	Rasoa	Marie	Électricien	033 98 765 43	marie.rasoa@email.com	2026-06-11 10:09:26.942213
3	Andry	Paul	Plombier	032 11 222 33	paul.andry@email.com	2026-06-11 10:09:26.942213
4	Ranjohn	Sophie	Chef de chantier	034 55 666 77	sophie.ranjohn@email.com	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3460 (class 0 OID 106860)
-- Dependencies: 229
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, titre, message, lien, lue, created_at) FROM stdin;
1	user1	etape	Étape terminée	Fondations de la Maison est terminée	/etape/1	f	2026-06-11 10:09:26.942213
2	user2	depense	Nouvelle dépense	Dépense de 5 000 000 FMG enregistrée	/depenses	f	2026-06-11 10:09:26.942213
3	user1	commentaire	Nouveau commentaire	Un commentaire a été ajouté à Murs	/etape/2	f	2026-06-11 10:09:26.942213
\.


--
-- TOC entry 3452 (class 0 OID 106784)
-- Dependencies: 221
-- Data for Name: photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.photos (id, etape_id, url, description, created_at) FROM stdin;
\.


--
-- TOC entry 3466 (class 0 OID 106909)
-- Dependencies: 235
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens (id, utilisateur_id, token, expire_at, created_at) FROM stdin;
\.


--
-- TOC entry 3462 (class 0 OID 106878)
-- Dependencies: 231
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateurs (id, email, password, nom, prenom, role, statut, code_validation, email_verifie, date_validation, created_at, updated_at) FROM stdin;
1	admin@example.com	$2b$10$YJPh6YcbK8M5qVvvvvvvvO3j2.5YK2K8K8K8K8K8K8K8K8K8K8K8	Admin	Super	admin	actif	\N	t	\N	2026-06-11 10:17:17.576237	2026-06-11 10:17:17.576237
2	user@example.com	$2b$10$YJPh6YcbK8M5qVvvvvvvO3j2.5YK2K8K8K8K8K8K8K8K8K8K8K8K8	User	Test	utilisateur	actif	\N	t	\N	2026-06-11 10:17:17.576237	2026-06-11 10:17:17.576237
3	nouveau@example.com	$2b$10$YJPh6YcbK8M5qVvvvvvvO3j2.5YK2K8K8K8K8K8K8K8K8K8K8K8K8	Nouveau	Utilisateur	utilisateur	en_attente	123456	f	\N	2026-06-11 10:17:17.576237	2026-06-11 10:17:17.576237
\.


--
-- TOC entry 3483 (class 0 OID 0)
-- Dependencies: 214
-- Name: chantiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chantiers_id_seq', 3, true);


--
-- TOC entry 3484 (class 0 OID 0)
-- Dependencies: 224
-- Name: commentaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commentaires_id_seq', 3, true);


--
-- TOC entry 3485 (class 0 OID 0)
-- Dependencies: 232
-- Name: connexions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.connexions_id_seq', 1, false);


--
-- TOC entry 3486 (class 0 OID 0)
-- Dependencies: 226
-- Name: depenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depenses_id_seq', 5, true);


--
-- TOC entry 3487 (class 0 OID 0)
-- Dependencies: 222
-- Name: etape_intervenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etape_intervenants_id_seq', 1, false);


--
-- TOC entry 3488 (class 0 OID 0)
-- Dependencies: 218
-- Name: etapes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etapes_id_seq', 5, true);


--
-- TOC entry 3489 (class 0 OID 0)
-- Dependencies: 216
-- Name: intervenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.intervenants_id_seq', 4, true);


--
-- TOC entry 3490 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 3, true);


--
-- TOC entry 3491 (class 0 OID 0)
-- Dependencies: 220
-- Name: photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.photos_id_seq', 1, false);


--
-- TOC entry 3492 (class 0 OID 0)
-- Dependencies: 234
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tokens_id_seq', 1, false);


--
-- TOC entry 3493 (class 0 OID 0)
-- Dependencies: 230
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 3, true);


--
-- TOC entry 3256 (class 2606 OID 106756)
-- Name: chantiers chantiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chantiers
    ADD CONSTRAINT chantiers_pkey PRIMARY KEY (id);


--
-- TOC entry 3272 (class 2606 OID 106828)
-- Name: commentaires commentaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaires
    ADD CONSTRAINT commentaires_pkey PRIMARY KEY (id);


--
-- TOC entry 3288 (class 2606 OID 106902)
-- Name: connexions connexions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connexions
    ADD CONSTRAINT connexions_pkey PRIMARY KEY (id);


--
-- TOC entry 3275 (class 2606 OID 106848)
-- Name: depenses depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_pkey PRIMARY KEY (id);


--
-- TOC entry 3268 (class 2606 OID 106807)
-- Name: etape_intervenants etape_intervenants_etape_id_intervenant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etape_intervenants
    ADD CONSTRAINT etape_intervenants_etape_id_intervenant_id_key UNIQUE (etape_id, intervenant_id);


--
-- TOC entry 3270 (class 2606 OID 106805)
-- Name: etape_intervenants etape_intervenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etape_intervenants
    ADD CONSTRAINT etape_intervenants_pkey PRIMARY KEY (id);


--
-- TOC entry 3261 (class 2606 OID 106777)
-- Name: etapes etapes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes
    ADD CONSTRAINT etapes_pkey PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 106766)
-- Name: intervenants intervenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.intervenants
    ADD CONSTRAINT intervenants_pkey PRIMARY KEY (id);


--
-- TOC entry 3279 (class 2606 OID 106869)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3266 (class 2606 OID 106792)
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- TOC entry 3292 (class 2606 OID 106917)
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3284 (class 2606 OID 106892)
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- TOC entry 3286 (class 2606 OID 106890)
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- TOC entry 3257 (class 1259 OID 106870)
-- Name: idx_chantiers_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chantiers_statut ON public.chantiers USING btree (statut);


--
-- TOC entry 3273 (class 1259 OID 106874)
-- Name: idx_commentaires_etape; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_commentaires_etape ON public.commentaires USING btree (etape_id);


--
-- TOC entry 3289 (class 1259 OID 106926)
-- Name: idx_connexions_utilisateur; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_connexions_utilisateur ON public.connexions USING btree (utilisateur_id);


--
-- TOC entry 3276 (class 1259 OID 106875)
-- Name: idx_depenses_chantier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_depenses_chantier ON public.depenses USING btree (chantier_id);


--
-- TOC entry 3262 (class 1259 OID 106871)
-- Name: idx_etapes_chantier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_etapes_chantier ON public.etapes USING btree (chantier_id);


--
-- TOC entry 3263 (class 1259 OID 106872)
-- Name: idx_etapes_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_etapes_statut ON public.etapes USING btree (statut);


--
-- TOC entry 3277 (class 1259 OID 106876)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 3264 (class 1259 OID 106873)
-- Name: idx_photos_etape; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_photos_etape ON public.photos USING btree (etape_id);


--
-- TOC entry 3290 (class 1259 OID 106927)
-- Name: idx_tokens_utilisateur; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tokens_utilisateur ON public.tokens USING btree (utilisateur_id);


--
-- TOC entry 3280 (class 1259 OID 106923)
-- Name: idx_utilisateurs_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_utilisateurs_email ON public.utilisateurs USING btree (email);


--
-- TOC entry 3281 (class 1259 OID 106924)
-- Name: idx_utilisateurs_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_utilisateurs_role ON public.utilisateurs USING btree (role);


--
-- TOC entry 3282 (class 1259 OID 106925)
-- Name: idx_utilisateurs_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_utilisateurs_statut ON public.utilisateurs USING btree (statut);


--
-- TOC entry 3297 (class 2606 OID 106829)
-- Name: commentaires commentaires_etape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaires
    ADD CONSTRAINT commentaires_etape_id_fkey FOREIGN KEY (etape_id) REFERENCES public.etapes(id) ON DELETE CASCADE;


--
-- TOC entry 3298 (class 2606 OID 106834)
-- Name: commentaires commentaires_intervenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commentaires
    ADD CONSTRAINT commentaires_intervenant_id_fkey FOREIGN KEY (intervenant_id) REFERENCES public.intervenants(id) ON DELETE SET NULL;


--
-- TOC entry 3301 (class 2606 OID 106903)
-- Name: connexions connexions_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connexions
    ADD CONSTRAINT connexions_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- TOC entry 3299 (class 2606 OID 106849)
-- Name: depenses depenses_chantier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_chantier_id_fkey FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE CASCADE;


--
-- TOC entry 3300 (class 2606 OID 106854)
-- Name: depenses depenses_etape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_etape_id_fkey FOREIGN KEY (etape_id) REFERENCES public.etapes(id) ON DELETE SET NULL;


--
-- TOC entry 3295 (class 2606 OID 106808)
-- Name: etape_intervenants etape_intervenants_etape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etape_intervenants
    ADD CONSTRAINT etape_intervenants_etape_id_fkey FOREIGN KEY (etape_id) REFERENCES public.etapes(id) ON DELETE CASCADE;


--
-- TOC entry 3296 (class 2606 OID 106813)
-- Name: etape_intervenants etape_intervenants_intervenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etape_intervenants
    ADD CONSTRAINT etape_intervenants_intervenant_id_fkey FOREIGN KEY (intervenant_id) REFERENCES public.intervenants(id) ON DELETE CASCADE;


--
-- TOC entry 3293 (class 2606 OID 106778)
-- Name: etapes etapes_chantier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes
    ADD CONSTRAINT etapes_chantier_id_fkey FOREIGN KEY (chantier_id) REFERENCES public.chantiers(id) ON DELETE CASCADE;


--
-- TOC entry 3294 (class 2606 OID 106793)
-- Name: photos photos_etape_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_etape_id_fkey FOREIGN KEY (etape_id) REFERENCES public.etapes(id) ON DELETE CASCADE;


--
-- TOC entry 3302 (class 2606 OID 106918)
-- Name: tokens tokens_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


-- Completed on 2026-06-11 12:59:06

--
-- PostgreSQL database dump complete
--

\unrestrict OC9goQ9njEXkCrKqiYcVoQqlpSdVvRgsC6hJXSNqvxVPFOX0weT5DzofopOjo90

