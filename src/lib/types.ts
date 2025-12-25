// OTruyen API Types

export interface Comic {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  content: string;
  status: string;
  thumb_url: string;
  sub_docquyen: boolean;
  category: Category[];
  updatedAt: string;
  chaptersLatest?: ChapterLatest[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ChapterLatest {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}

export interface Chapter {
  server_name: string;
  server_data: ChapterItem[];
}

export interface ChapterItem {
  filename: string;
  chapter_name: string;
  chapter_title: string;
  chapter_api_data: string;
}

export interface ComicDetail extends Comic {
  author: string[];
  chapters: Chapter[];
}

export interface HomeData {
  status: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb: BreadCrumb[];
    titlePage: string;
    items: Comic[];
    params: Params;
    type_list: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface ComicDetailResponse {
  status: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb: BreadCrumb[];
    item: ComicDetail;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface GenresResponse {
  status: string;
  data: {
    items: Category[];
  };
}

export interface SearchResponse {
  status: string;
  data: {
    seoOnPage: SeoOnPage;
    breadCrumb: BreadCrumb[];
    titlePage: string;
    items: Comic[];
    params: Params;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface ChapterDataResponse {
  status: string;
  data: {
    seoOnPage: SeoOnPage;
    item: {
      _id: string;
      comic_name: string;
      chapter_name: string;
      chapter_title: string;
      chapter_path: string;
      chapter_image: ChapterImage[];
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface ChapterImage {
  image_page: number;
  image_file: string;
}

interface SeoOnPage {
  og_type: string;
  titleHead: string;
  descriptionHead: string;
  og_image: string[];
  og_url: string;
}

interface BreadCrumb {
  name: string;
  slug?: string;
  isCurrent: boolean;
  position: number;
}

interface Params {
  type_slug: string;
  filterCategory: string[];
  sortField: string;
  sortType: string;
  itemsUpdateInDay?: number;
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    pageRanges: number;
  };
}
