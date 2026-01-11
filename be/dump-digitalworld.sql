--
-- PostgreSQL database dump
--

\restrict AYepcoQ1dJiY1qeErFydxg0fIaaOsVqKEYE3lwuIvQZpstb1qZWkVB3PXc1ENNU

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-11 19:04:58

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE digitalworld;
--
-- TOC entry 5327 (class 1262 OID 45375)
-- Name: digitalworld; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE digitalworld WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Vietnamese_Vietnam.1252';


\unrestrict AYepcoQ1dJiY1qeErFydxg0fIaaOsVqKEYE3lwuIvQZpstb1qZWkVB3PXc1ENNU
\connect digitalworld
\restrict AYepcoQ1dJiY1qeErFydxg0fIaaOsVqKEYE3lwuIvQZpstb1qZWkVB3PXc1ENNU

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 926 (class 1247 OID 45703)
-- Name: enum_don_hang_trang_thai; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_don_hang_trang_thai AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


--
-- TOC entry 929 (class 1247 OID 45714)
-- Name: enum_don_hang_trang_thai_thanh_toan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_don_hang_trang_thai_thanh_toan AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


--
-- TOC entry 917 (class 1247 OID 45649)
-- Name: enum_gio_hang_trang_thai; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gio_hang_trang_thai AS ENUM (
    'active',
    'merged',
    'converted',
    'abandoned'
);


--
-- TOC entry 956 (class 1247 OID 45923)
-- Name: enum_hinh_anh_danh_muc; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_hinh_anh_danh_muc AS ENUM (
    'product',
    'thumbnail',
    'user',
    'review'
);


--
-- TOC entry 965 (class 1247 OID 45989)
-- Name: enum_nguoi_dang_ky_ban_tin_trang_thai; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_nguoi_dang_ky_ban_tin_trang_thai AS ENUM (
    'active',
    'unsubscribed'
);


--
-- TOC entry 875 (class 1247 OID 45377)
-- Name: enum_nguoi_dung_vai_tro; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_nguoi_dung_vai_tro AS ENUM (
    'customer',
    'admin',
    'manager'
);


--
-- TOC entry 971 (class 1247 OID 46006)
-- Name: enum_phan_hoi_trang_thai; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_phan_hoi_trang_thai AS ENUM (
    'pending',
    'reviewed',
    'resolved'
);


--
-- TOC entry 890 (class 1247 OID 45456)
-- Name: enum_san_pham_tinh_trang; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_san_pham_tinh_trang AS ENUM (
    'new',
    'like-new',
    'used',
    'refurbished'
);


--
-- TOC entry 887 (class 1247 OID 45449)
-- Name: enum_san_pham_trang_thai; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_san_pham_trang_thai AS ENUM (
    'active',
    'inactive',
    'draft'
);


--
-- TOC entry 899 (class 1247 OID 45519)
-- Name: enum_thuoc_tinh_loai_thuoc_tinh; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_thuoc_tinh_loai_thuoc_tinh AS ENUM (
    'color',
    'size',
    'material',
    'custom'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 45550)
-- Name: bien_the; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bien_the (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    ten_bien_the character varying(255) NOT NULL,
    ma_sku character varying(255),
    thuoc_tinh jsonb DEFAULT '{}'::jsonb NOT NULL,
    thuoc_tinh_phan_cap jsonb DEFAULT '{}'::jsonb NOT NULL,
    gia numeric(12,2) NOT NULL,
    so_luong_ton_kho integer DEFAULT 0,
    hinh_anh character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    ten_hien_thi character varying(255),
    thu_tu_hien_thi integer DEFAULT 0,
    mac_dinh boolean DEFAULT false,
    kha_dung boolean DEFAULT true,
    gia_so_sanh numeric(12,2),
    thong_so_ky_thuat jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 45764)
-- Name: chi_tiet_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chi_tiet_don_hang (
    id uuid NOT NULL,
    don_hang_id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    bien_the_id uuid,
    ten_san_pham character varying(255) NOT NULL,
    ma_sku character varying(255),
    gia numeric(19,2) NOT NULL,
    so_luong integer NOT NULL,
    tong_phu numeric(19,2) NOT NULL,
    hinh_anh character varying(255),
    thuoc_tinh jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 45671)
-- Name: chi_tiet_gio_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chi_tiet_gio_hang (
    id uuid NOT NULL,
    gio_hang_id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    bien_the_id uuid,
    so_luong integer DEFAULT 1 NOT NULL,
    gia numeric(19,2) NOT NULL,
    goi_bao_hanh_ids uuid[] DEFAULT ARRAY[]::uuid[],
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 45598)
-- Name: danh_gia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danh_gia (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    nguoi_dung_id uuid NOT NULL,
    muc_danh_gia integer NOT NULL,
    tieu_de character varying(255),
    noi_dung text NOT NULL,
    da_xac_minh boolean DEFAULT false,
    luot_thich integer DEFAULT 0,
    luot_khong_thich integer DEFAULT 0,
    hinh_anh character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 45626)
-- Name: danh_gia_phan_hoi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danh_gia_phan_hoi (
    id uuid NOT NULL,
    danh_gia_id uuid NOT NULL,
    nguoi_dung_id uuid NOT NULL,
    co_huu_ich boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 45426)
-- Name: danh_muc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danh_muc (
    id uuid NOT NULL,
    ten_danh_muc character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    mo_ta text,
    hinh_anh character varying(255),
    danh_muc_cha_id uuid,
    cap_do integer DEFAULT 1,
    dang_hoat_dong boolean DEFAULT true,
    thu_tu_hien_thi integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 45402)
-- Name: dia_chi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dia_chi (
    id uuid NOT NULL,
    nguoi_dung_id uuid NOT NULL,
    ten_nguoi_nhan character varying(255),
    ten character varying(255) NOT NULL,
    ho character varying(255) NOT NULL,
    cong_ty character varying(255),
    dia_chi_1 character varying(255) NOT NULL,
    dia_chi_2 character varying(255),
    quan_huyen character varying(255) NOT NULL,
    tinh_thanh character varying(255) NOT NULL,
    ma_buu_dien character varying(255) NOT NULL,
    quoc_gia character varying(255) NOT NULL,
    so_dien_thoai character varying(255),
    mac_dinh boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 45723)
-- Name: don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.don_hang (
    id uuid NOT NULL,
    ma_don_hang character varying(255) NOT NULL,
    nguoi_dung_id uuid NOT NULL,
    trang_thai public.enum_don_hang_trang_thai DEFAULT 'pending'::public.enum_don_hang_trang_thai,
    ten_nguoi_nhan character varying(255) NOT NULL,
    ho_nguoi_nhan character varying(255) NOT NULL,
    cong_ty_nguoi_nhan character varying(255),
    dia_chi_nguoi_nhan_1 character varying(255) NOT NULL,
    dia_chi_nguoi_nhan_2 character varying(255),
    quan_huyen_nguoi_nhan character varying(255) NOT NULL,
    tinh_thanh_nguoi_nhan character varying(255) NOT NULL,
    ma_buu_dien_nguoi_nhan character varying(255) NOT NULL,
    quoc_gia_nguoi_nhan character varying(255) NOT NULL,
    so_dien_thoai_nguoi_nhan character varying(255),
    ten_nguoi_thanh_toan character varying(255) NOT NULL,
    ho_nguoi_thanh_toan character varying(255) NOT NULL,
    cong_ty_nguoi_thanh_toan character varying(255),
    dia_chi_nguoi_thanh_toan_1 character varying(255) NOT NULL,
    dia_chi_nguoi_thanh_toan_2 character varying(255),
    quan_huyen_nguoi_thanh_toan character varying(255) NOT NULL,
    tinh_thanh_nguoi_thanh_toan character varying(255) NOT NULL,
    ma_buu_dien_nguoi_thanh_toan character varying(255) NOT NULL,
    quoc_gia_nguoi_thanh_toan character varying(255) NOT NULL,
    so_dien_thoai_nguoi_thanh_toan character varying(255),
    phuong_thuc_thanh_toan character varying(255) NOT NULL,
    trang_thai_thanh_toan public.enum_don_hang_trang_thai_thanh_toan DEFAULT 'pending'::public.enum_don_hang_trang_thai_thanh_toan,
    ma_giao_dich_thanh_toan character varying(255),
    nha_cung_cap_thanh_toan character varying(255),
    tong_phu numeric(19,2) NOT NULL,
    thue numeric(19,2) NOT NULL,
    phi_van_chuyen numeric(19,2) NOT NULL,
    giam_gia numeric(19,2) DEFAULT 0,
    tong_tien numeric(19,2) NOT NULL,
    ghi_chu text,
    ma_theo_doi character varying(255),
    nha_cung_cap_van_chuyen character varying(255),
    ngay_giao_du_kien timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 45876)
-- Name: gia_tri_thuoc_tinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gia_tri_thuoc_tinh (
    id uuid NOT NULL,
    nhom_thuoc_tinh_id uuid NOT NULL,
    ten_gia_tri_thuoc_tinh character varying(255) NOT NULL,
    gia_tri_thuoc_tinh character varying(255) NOT NULL,
    ma_mau character varying(255),
    url_hinh_anh text,
    chinh_sua_gia numeric(12,2) DEFAULT 0,
    thu_tu_hien_thi integer DEFAULT 0,
    dang_hoat_dong boolean DEFAULT true,
    anh_huong_ten_san_pham boolean DEFAULT false,
    mau_ten_san_pham character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN gia_tri_thuoc_tinh.mau_ten_san_pham; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gia_tri_thuoc_tinh.mau_ten_san_pham IS 'Template for product name (e.g., "I9", "RTX 4080", "32GB")';


--
-- TOC entry 229 (class 1259 OID 45657)
-- Name: gio_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gio_hang (
    id uuid NOT NULL,
    nguoi_dung_id uuid,
    session_id character varying(255),
    trang_thai public.enum_gio_hang_trang_thai DEFAULT 'active'::public.enum_gio_hang_trang_thai,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 45819)
-- Name: goi_bao_hanh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goi_bao_hanh (
    id uuid NOT NULL,
    ten_goi_bao_hanh character varying(255) NOT NULL,
    mo_ta text,
    so_thang_bao_hanh integer NOT NULL,
    gia numeric(12,2) DEFAULT 0 NOT NULL,
    dieu_khoan jsonb DEFAULT '{}'::jsonb,
    pham_vi_bao_hanh character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    dang_hoat_dong boolean DEFAULT true,
    thu_tu_hien_thi integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 45931)
-- Name: hinh_anh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hinh_anh (
    id uuid NOT NULL,
    ten_goc character varying(255) NOT NULL,
    ten_file character varying(255) NOT NULL,
    duong_dan_file character varying(500) NOT NULL,
    kich_thuoc_file integer NOT NULL,
    loai_mime character varying(100) NOT NULL,
    chieu_rong integer,
    chieu_cao integer,
    danh_muc public.enum_hinh_anh_danh_muc DEFAULT 'product'::public.enum_hinh_anh_danh_muc NOT NULL,
    san_pham_id uuid,
    nguoi_dung_id uuid,
    dang_hoat_dong boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 45993)
-- Name: nguoi_dang_ky_ban_tin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nguoi_dang_ky_ban_tin (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    trang_thai public.enum_nguoi_dang_ky_ban_tin_trang_thai DEFAULT 'active'::public.enum_nguoi_dang_ky_ban_tin_trang_thai,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 45383)
-- Name: nguoi_dung; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nguoi_dung (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    mat_khau character varying(255) NOT NULL,
    ten_nguoi_dung character varying(255) NOT NULL,
    ho_nguoi_dung character varying(255) NOT NULL,
    so_dien_thoai character varying(255),
    anh_dai_dien character varying(255),
    vai_tro public.enum_nguoi_dung_vai_tro DEFAULT 'customer'::public.enum_nguoi_dung_vai_tro,
    da_xac_minh_email boolean DEFAULT false,
    dang_hoat_dong boolean DEFAULT true,
    ma_xac_minh_email character varying(255),
    ma_dat_lai_mat_khau character varying(255),
    het_han_dat_lai_mat_khau timestamp with time zone,
    khach_hang_stripe_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 45860)
-- Name: nhom_thuoc_tinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nhom_thuoc_tinh (
    id uuid NOT NULL,
    ten_nhom_thuoc_tinh character varying(255) NOT NULL,
    mo_ta text,
    loai_thuoc_tinh character varying(255) DEFAULT 'custom'::character varying NOT NULL,
    bat_buoc boolean DEFAULT false,
    thu_tu_hien_thi integer DEFAULT 0,
    dang_hoat_dong boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 46013)
-- Name: phan_hoi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phan_hoi (
    id uuid NOT NULL,
    ten_nguoi_gui character varying(255) NOT NULL,
    email_nguoi_gui character varying(255) NOT NULL,
    so_dien_thoai character varying(255),
    tieu_de character varying(255) NOT NULL,
    noi_dung text NOT NULL,
    trang_thai public.enum_phan_hoi_trang_thai DEFAULT 'pending'::public.enum_phan_hoi_trang_thai,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 45465)
-- Name: san_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham (
    id uuid NOT NULL,
    ten_san_pham text NOT NULL,
    slug text NOT NULL,
    mo_ta text NOT NULL,
    mo_ta_ngan text NOT NULL,
    gia numeric(12,2) NOT NULL,
    gia_goc numeric(12,2),
    anh_san_pham text DEFAULT '[]'::text,
    thumbnail text,
    con_hang boolean DEFAULT true,
    so_luong_ton_kho integer DEFAULT 0,
    ma_sku text,
    trang_thai public.enum_san_pham_trang_thai DEFAULT 'active'::public.enum_san_pham_trang_thai,
    noi_bat boolean DEFAULT false,
    tu_khoa_tim_kiem text DEFAULT '[]'::text,
    tieu_de_seo text,
    mo_ta_seo text,
    tu_khoa_seo text DEFAULT '[]'::text,
    thong_so_ky_thuat text DEFAULT '[]'::text,
    tinh_trang public.enum_san_pham_tinh_trang DEFAULT 'new'::public.enum_san_pham_tinh_trang,
    ten_co_so text,
    la_san_pham_co_bien_the boolean DEFAULT false,
    cau_hoi_thuong_gap text DEFAULT '[]'::text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 45495)
-- Name: san_pham_danh_muc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham_danh_muc (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    danh_muc_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 45837)
-- Name: san_pham_goi_bao_hanh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham_goi_bao_hanh (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    goi_bao_hanh_id uuid NOT NULL,
    mac_dinh boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 45898)
-- Name: san_pham_nhom_thuoc_tinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham_nhom_thuoc_tinh (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    nhom_thuoc_tinh_id uuid NOT NULL,
    bat_buoc boolean DEFAULT false,
    thu_tu_hien_thi integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 45578)
-- Name: san_pham_thong_so_ky_thuat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham_thong_so_ky_thuat (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    ten_thong_so_ky_thuat character varying(255) NOT NULL,
    gia_tri_thong_so_ky_thuat text NOT NULL,
    danh_muc character varying(255) DEFAULT 'General'::character varying,
    thu_tu_hien_thi integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 45796)
-- Name: san_pham_yeu_thich; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.san_pham_yeu_thich (
    id uuid NOT NULL,
    nguoi_dung_id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 45527)
-- Name: thuoc_tinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thuoc_tinh (
    id uuid NOT NULL,
    san_pham_id uuid NOT NULL,
    ten_thuoc_tinh character varying(255) NOT NULL,
    loai_thuoc_tinh public.enum_thuoc_tinh_loai_thuoc_tinh DEFAULT 'custom'::public.enum_thuoc_tinh_loai_thuoc_tinh NOT NULL,
    gia_tri_thuoc_tinh jsonb DEFAULT '[]'::jsonb NOT NULL,
    bat_buoc boolean DEFAULT false,
    thu_tu_hien_thi integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 45965)
-- Name: tin_tuc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tin_tuc (
    id uuid NOT NULL,
    tieu_de character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    noi_dung text NOT NULL,
    thumbnail character varying(255),
    mo_ta text,
    danh_muc character varying(255) DEFAULT 'Tin tức'::character varying,
    luot_xem integer DEFAULT 0,
    tu_khoa character varying(255),
    da_xuat_ban boolean DEFAULT true,
    nguoi_dung_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- TOC entry 5304 (class 0 OID 45550)
-- Dependencies: 225
-- Data for Name: bien_the; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5311 (class 0 OID 45764)
-- Dependencies: 232
-- Data for Name: chi_tiet_don_hang; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5309 (class 0 OID 45671)
-- Dependencies: 230
-- Data for Name: chi_tiet_gio_hang; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5306 (class 0 OID 45598)
-- Dependencies: 227
-- Data for Name: danh_gia; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5307 (class 0 OID 45626)
-- Dependencies: 228
-- Data for Name: danh_gia_phan_hoi; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5300 (class 0 OID 45426)
-- Dependencies: 221
-- Data for Name: danh_muc; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5299 (class 0 OID 45402)
-- Dependencies: 220
-- Data for Name: dia_chi; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5310 (class 0 OID 45723)
-- Dependencies: 231
-- Data for Name: don_hang; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5316 (class 0 OID 45876)
-- Dependencies: 237
-- Data for Name: gia_tri_thuoc_tinh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5308 (class 0 OID 45657)
-- Dependencies: 229
-- Data for Name: gio_hang; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5313 (class 0 OID 45819)
-- Dependencies: 234
-- Data for Name: goi_bao_hanh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5318 (class 0 OID 45931)
-- Dependencies: 239
-- Data for Name: hinh_anh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5320 (class 0 OID 45993)
-- Dependencies: 241
-- Data for Name: nguoi_dang_ky_ban_tin; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5298 (class 0 OID 45383)
-- Dependencies: 219
-- Data for Name: nguoi_dung; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5315 (class 0 OID 45860)
-- Dependencies: 236
-- Data for Name: nhom_thuoc_tinh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5321 (class 0 OID 46013)
-- Dependencies: 242
-- Data for Name: phan_hoi; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5301 (class 0 OID 45465)
-- Dependencies: 222
-- Data for Name: san_pham; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5302 (class 0 OID 45495)
-- Dependencies: 223
-- Data for Name: san_pham_danh_muc; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5314 (class 0 OID 45837)
-- Dependencies: 235
-- Data for Name: san_pham_goi_bao_hanh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5317 (class 0 OID 45898)
-- Dependencies: 238
-- Data for Name: san_pham_nhom_thuoc_tinh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5305 (class 0 OID 45578)
-- Dependencies: 226
-- Data for Name: san_pham_thong_so_ky_thuat; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5312 (class 0 OID 45796)
-- Dependencies: 233
-- Data for Name: san_pham_yeu_thich; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5303 (class 0 OID 45527)
-- Dependencies: 224
-- Data for Name: thuoc_tinh; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5319 (class 0 OID 45965)
-- Dependencies: 240
-- Data for Name: tin_tuc; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5067 (class 2606 OID 45572)
-- Name: bien_the bien_the_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bien_the
    ADD CONSTRAINT bien_the_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 45780)
-- Name: chi_tiet_don_hang chi_tiet_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_don_hang
    ADD CONSTRAINT chi_tiet_don_hang_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 45686)
-- Name: chi_tiet_gio_hang chi_tiet_gio_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_gio_hang
    ADD CONSTRAINT chi_tiet_gio_hang_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 45636)
-- Name: danh_gia_phan_hoi danh_gia_phan_hoi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia_phan_hoi
    ADD CONSTRAINT danh_gia_phan_hoi_pkey PRIMARY KEY (id);


--
-- TOC entry 5071 (class 2606 OID 45615)
-- Name: danh_gia danh_gia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia
    ADD CONSTRAINT danh_gia_pkey PRIMARY KEY (id);


--
-- TOC entry 5050 (class 2606 OID 45440)
-- Name: danh_muc danh_muc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_muc
    ADD CONSTRAINT danh_muc_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 45442)
-- Name: danh_muc danh_muc_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_muc
    ADD CONSTRAINT danh_muc_slug_key UNIQUE (slug);


--
-- TOC entry 5048 (class 2606 OID 45420)
-- Name: dia_chi dia_chi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dia_chi
    ADD CONSTRAINT dia_chi_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 45758)
-- Name: don_hang don_hang_ma_don_hang_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.don_hang
    ADD CONSTRAINT don_hang_ma_don_hang_key UNIQUE (ma_don_hang);


--
-- TOC entry 5082 (class 2606 OID 45756)
-- Name: don_hang don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.don_hang
    ADD CONSTRAINT don_hang_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 45892)
-- Name: gia_tri_thuoc_tinh gia_tri_thuoc_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gia_tri_thuoc_tinh
    ADD CONSTRAINT gia_tri_thuoc_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 5076 (class 2606 OID 45665)
-- Name: gio_hang gio_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gio_hang
    ADD CONSTRAINT gio_hang_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 45836)
-- Name: goi_bao_hanh goi_bao_hanh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goi_bao_hanh
    ADD CONSTRAINT goi_bao_hanh_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 45948)
-- Name: hinh_anh hinh_anh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hinh_anh
    ADD CONSTRAINT hinh_anh_pkey PRIMARY KEY (id);


--
-- TOC entry 5111 (class 2606 OID 45950)
-- Name: hinh_anh hinh_anh_ten_file_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hinh_anh
    ADD CONSTRAINT hinh_anh_ten_file_key UNIQUE (ten_file);


--
-- TOC entry 5117 (class 2606 OID 46004)
-- Name: nguoi_dang_ky_ban_tin nguoi_dang_ky_ban_tin_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nguoi_dang_ky_ban_tin
    ADD CONSTRAINT nguoi_dang_ky_ban_tin_email_key UNIQUE (email);


--
-- TOC entry 5119 (class 2606 OID 46002)
-- Name: nguoi_dang_ky_ban_tin nguoi_dang_ky_ban_tin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nguoi_dang_ky_ban_tin
    ADD CONSTRAINT nguoi_dang_ky_ban_tin_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 2606 OID 45401)
-- Name: nguoi_dung nguoi_dung_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nguoi_dung
    ADD CONSTRAINT nguoi_dung_email_key UNIQUE (email);


--
-- TOC entry 5046 (class 2606 OID 45399)
-- Name: nguoi_dung nguoi_dung_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nguoi_dung
    ADD CONSTRAINT nguoi_dung_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 45875)
-- Name: nhom_thuoc_tinh nhom_thuoc_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhom_thuoc_tinh
    ADD CONSTRAINT nhom_thuoc_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 5121 (class 2606 OID 46027)
-- Name: phan_hoi phan_hoi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phan_hoi
    ADD CONSTRAINT phan_hoi_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 45504)
-- Name: san_pham_danh_muc san_pham_danh_muc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_danh_muc
    ADD CONSTRAINT san_pham_danh_muc_pkey PRIMARY KEY (id);


--
-- TOC entry 5063 (class 2606 OID 45506)
-- Name: san_pham_danh_muc san_pham_danh_muc_san_pham_id_danh_muc_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_danh_muc
    ADD CONSTRAINT san_pham_danh_muc_san_pham_id_danh_muc_id_key UNIQUE (san_pham_id, danh_muc_id);


--
-- TOC entry 5093 (class 2606 OID 45847)
-- Name: san_pham_goi_bao_hanh san_pham_goi_bao_hanh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_goi_bao_hanh
    ADD CONSTRAINT san_pham_goi_bao_hanh_pkey PRIMARY KEY (id);


--
-- TOC entry 5095 (class 2606 OID 45849)
-- Name: san_pham_goi_bao_hanh san_pham_goi_bao_hanh_san_pham_id_goi_bao_hanh_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_goi_bao_hanh
    ADD CONSTRAINT san_pham_goi_bao_hanh_san_pham_id_goi_bao_hanh_id_key UNIQUE (san_pham_id, goi_bao_hanh_id);


--
-- TOC entry 5054 (class 2606 OID 45494)
-- Name: san_pham san_pham_ma_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham
    ADD CONSTRAINT san_pham_ma_sku_key UNIQUE (ma_sku);


--
-- TOC entry 5101 (class 2606 OID 45909)
-- Name: san_pham_nhom_thuoc_tinh san_pham_nhom_thuoc_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_nhom_thuoc_tinh
    ADD CONSTRAINT san_pham_nhom_thuoc_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 5103 (class 2606 OID 45911)
-- Name: san_pham_nhom_thuoc_tinh san_pham_nhom_thuoc_tinh_san_pham_id_nhom_thuoc_tinh_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_nhom_thuoc_tinh
    ADD CONSTRAINT san_pham_nhom_thuoc_tinh_san_pham_id_nhom_thuoc_tinh_id_key UNIQUE (san_pham_id, nhom_thuoc_tinh_id);


--
-- TOC entry 5056 (class 2606 OID 45490)
-- Name: san_pham san_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham
    ADD CONSTRAINT san_pham_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 45492)
-- Name: san_pham san_pham_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham
    ADD CONSTRAINT san_pham_slug_key UNIQUE (slug);


--
-- TOC entry 5069 (class 2606 OID 45592)
-- Name: san_pham_thong_so_ky_thuat san_pham_thong_so_ky_thuat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_thong_so_ky_thuat
    ADD CONSTRAINT san_pham_thong_so_ky_thuat_pkey PRIMARY KEY (id);


--
-- TOC entry 5087 (class 2606 OID 45807)
-- Name: san_pham_yeu_thich san_pham_yeu_thich_nguoi_dung_id_san_pham_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_yeu_thich
    ADD CONSTRAINT san_pham_yeu_thich_nguoi_dung_id_san_pham_id_key UNIQUE (nguoi_dung_id, san_pham_id);


--
-- TOC entry 5089 (class 2606 OID 45805)
-- Name: san_pham_yeu_thich san_pham_yeu_thich_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_yeu_thich
    ADD CONSTRAINT san_pham_yeu_thich_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 45544)
-- Name: thuoc_tinh thuoc_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoc_tinh
    ADD CONSTRAINT thuoc_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 5113 (class 2606 OID 45980)
-- Name: tin_tuc tin_tuc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tin_tuc
    ADD CONSTRAINT tin_tuc_pkey PRIMARY KEY (id);


--
-- TOC entry 5115 (class 2606 OID 45982)
-- Name: tin_tuc tin_tuc_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tin_tuc
    ADD CONSTRAINT tin_tuc_slug_key UNIQUE (slug);


--
-- TOC entry 5072 (class 1259 OID 45647)
-- Name: danh_gia_phan_hoi_danh_gia_id_nguoi_dung_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX danh_gia_phan_hoi_danh_gia_id_nguoi_dung_id ON public.danh_gia_phan_hoi USING btree (danh_gia_id, nguoi_dung_id);


--
-- TOC entry 5104 (class 1259 OID 45964)
-- Name: hinh_anh_dang_hoat_dong; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hinh_anh_dang_hoat_dong ON public.hinh_anh USING btree (dang_hoat_dong);


--
-- TOC entry 5105 (class 1259 OID 45963)
-- Name: hinh_anh_danh_muc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hinh_anh_danh_muc ON public.hinh_anh USING btree (danh_muc);


--
-- TOC entry 5106 (class 1259 OID 45962)
-- Name: hinh_anh_nguoi_dung_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hinh_anh_nguoi_dung_id ON public.hinh_anh USING btree (nguoi_dung_id);


--
-- TOC entry 5109 (class 1259 OID 45961)
-- Name: hinh_anh_san_pham_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hinh_anh_san_pham_id ON public.hinh_anh USING btree (san_pham_id);


--
-- TOC entry 5061 (class 1259 OID 45517)
-- Name: san_pham_danh_muc_san_pham_id_danh_muc_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX san_pham_danh_muc_san_pham_id_danh_muc_id ON public.san_pham_danh_muc USING btree (san_pham_id, danh_muc_id);


--
-- TOC entry 5085 (class 1259 OID 45818)
-- Name: san_pham_yeu_thich_nguoi_dung_id_san_pham_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX san_pham_yeu_thich_nguoi_dung_id_san_pham_id ON public.san_pham_yeu_thich USING btree (nguoi_dung_id, san_pham_id);


--
-- TOC entry 5127 (class 2606 OID 45573)
-- Name: bien_the bien_the_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bien_the
    ADD CONSTRAINT bien_the_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5138 (class 2606 OID 45791)
-- Name: chi_tiet_don_hang chi_tiet_don_hang_bien_the_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_don_hang
    ADD CONSTRAINT chi_tiet_don_hang_bien_the_id_fkey FOREIGN KEY (bien_the_id) REFERENCES public.bien_the(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5139 (class 2606 OID 45781)
-- Name: chi_tiet_don_hang chi_tiet_don_hang_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_don_hang
    ADD CONSTRAINT chi_tiet_don_hang_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.don_hang(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5140 (class 2606 OID 45786)
-- Name: chi_tiet_don_hang chi_tiet_don_hang_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_don_hang
    ADD CONSTRAINT chi_tiet_don_hang_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 45697)
-- Name: chi_tiet_gio_hang chi_tiet_gio_hang_bien_the_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_gio_hang
    ADD CONSTRAINT chi_tiet_gio_hang_bien_the_id_fkey FOREIGN KEY (bien_the_id) REFERENCES public.bien_the(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5135 (class 2606 OID 45687)
-- Name: chi_tiet_gio_hang chi_tiet_gio_hang_gio_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_gio_hang
    ADD CONSTRAINT chi_tiet_gio_hang_gio_hang_id_fkey FOREIGN KEY (gio_hang_id) REFERENCES public.gio_hang(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5136 (class 2606 OID 45692)
-- Name: chi_tiet_gio_hang chi_tiet_gio_hang_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chi_tiet_gio_hang
    ADD CONSTRAINT chi_tiet_gio_hang_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 45621)
-- Name: danh_gia danh_gia_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia
    ADD CONSTRAINT danh_gia_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5131 (class 2606 OID 45637)
-- Name: danh_gia_phan_hoi danh_gia_phan_hoi_danh_gia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia_phan_hoi
    ADD CONSTRAINT danh_gia_phan_hoi_danh_gia_id_fkey FOREIGN KEY (danh_gia_id) REFERENCES public.danh_gia(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5132 (class 2606 OID 45642)
-- Name: danh_gia_phan_hoi danh_gia_phan_hoi_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia_phan_hoi
    ADD CONSTRAINT danh_gia_phan_hoi_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5130 (class 2606 OID 45616)
-- Name: danh_gia danh_gia_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_gia
    ADD CONSTRAINT danh_gia_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 45443)
-- Name: danh_muc danh_muc_danh_muc_cha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danh_muc
    ADD CONSTRAINT danh_muc_danh_muc_cha_id_fkey FOREIGN KEY (danh_muc_cha_id) REFERENCES public.danh_muc(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5122 (class 2606 OID 45421)
-- Name: dia_chi dia_chi_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dia_chi
    ADD CONSTRAINT dia_chi_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 45759)
-- Name: don_hang don_hang_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.don_hang
    ADD CONSTRAINT don_hang_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5145 (class 2606 OID 45893)
-- Name: gia_tri_thuoc_tinh gia_tri_thuoc_tinh_nhom_thuoc_tinh_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gia_tri_thuoc_tinh
    ADD CONSTRAINT gia_tri_thuoc_tinh_nhom_thuoc_tinh_id_fkey FOREIGN KEY (nhom_thuoc_tinh_id) REFERENCES public.nhom_thuoc_tinh(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5133 (class 2606 OID 45666)
-- Name: gio_hang gio_hang_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gio_hang
    ADD CONSTRAINT gio_hang_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5148 (class 2606 OID 45956)
-- Name: hinh_anh hinh_anh_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hinh_anh
    ADD CONSTRAINT hinh_anh_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5149 (class 2606 OID 45951)
-- Name: hinh_anh hinh_anh_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hinh_anh
    ADD CONSTRAINT hinh_anh_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5124 (class 2606 OID 45512)
-- Name: san_pham_danh_muc san_pham_danh_muc_danh_muc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_danh_muc
    ADD CONSTRAINT san_pham_danh_muc_danh_muc_id_fkey FOREIGN KEY (danh_muc_id) REFERENCES public.danh_muc(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 45507)
-- Name: san_pham_danh_muc san_pham_danh_muc_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_danh_muc
    ADD CONSTRAINT san_pham_danh_muc_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5143 (class 2606 OID 45855)
-- Name: san_pham_goi_bao_hanh san_pham_goi_bao_hanh_goi_bao_hanh_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_goi_bao_hanh
    ADD CONSTRAINT san_pham_goi_bao_hanh_goi_bao_hanh_id_fkey FOREIGN KEY (goi_bao_hanh_id) REFERENCES public.goi_bao_hanh(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5144 (class 2606 OID 45850)
-- Name: san_pham_goi_bao_hanh san_pham_goi_bao_hanh_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_goi_bao_hanh
    ADD CONSTRAINT san_pham_goi_bao_hanh_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5146 (class 2606 OID 45917)
-- Name: san_pham_nhom_thuoc_tinh san_pham_nhom_thuoc_tinh_nhom_thuoc_tinh_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_nhom_thuoc_tinh
    ADD CONSTRAINT san_pham_nhom_thuoc_tinh_nhom_thuoc_tinh_id_fkey FOREIGN KEY (nhom_thuoc_tinh_id) REFERENCES public.nhom_thuoc_tinh(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5147 (class 2606 OID 45912)
-- Name: san_pham_nhom_thuoc_tinh san_pham_nhom_thuoc_tinh_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_nhom_thuoc_tinh
    ADD CONSTRAINT san_pham_nhom_thuoc_tinh_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 45593)
-- Name: san_pham_thong_so_ky_thuat san_pham_thong_so_ky_thuat_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_thong_so_ky_thuat
    ADD CONSTRAINT san_pham_thong_so_ky_thuat_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5141 (class 2606 OID 45808)
-- Name: san_pham_yeu_thich san_pham_yeu_thich_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_yeu_thich
    ADD CONSTRAINT san_pham_yeu_thich_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5142 (class 2606 OID 45813)
-- Name: san_pham_yeu_thich san_pham_yeu_thich_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.san_pham_yeu_thich
    ADD CONSTRAINT san_pham_yeu_thich_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 45545)
-- Name: thuoc_tinh thuoc_tinh_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoc_tinh
    ADD CONSTRAINT thuoc_tinh_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.san_pham(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5150 (class 2606 OID 45983)
-- Name: tin_tuc tin_tuc_nguoi_dung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tin_tuc
    ADD CONSTRAINT tin_tuc_nguoi_dung_id_fkey FOREIGN KEY (nguoi_dung_id) REFERENCES public.nguoi_dung(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-01-11 19:04:58

--
-- PostgreSQL database dump complete
--

\unrestrict AYepcoQ1dJiY1qeErFydxg0fIaaOsVqKEYE3lwuIvQZpstb1qZWkVB3PXc1ENNU

