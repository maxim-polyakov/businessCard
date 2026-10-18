import json
import re
from html import escape
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlsplit


PREVIEW_FILE = Path(__file__).with_name("businesscard-previews.json")
LANG_QUERY = re.compile(r"(?:^|[?&])lang=([^&#?]+)", re.IGNORECASE)
RTL_LANGUAGES = {"ar", "he", "fa", "ur", "yi"}


def load_previews() -> dict[str, dict[str, str]]:
    with PREVIEW_FILE.open(encoding="utf-8") as source:
        previews = json.load(source)["previews"]
    if "en" not in previews:
        raise RuntimeError("English business-card preview is missing")
    return previews


def normalize_language(value: str | None, supported: set[str]) -> str | None:
    raw = (value or "").strip().replace("_", "-")
    if not raw:
        return None
    if raw in supported:
        return raw
    lower = raw.lower()
    if lower in {"zh-tw", "zh-hk", "zh-mo"} or "hant" in lower:
        return "zh-TW" if "zh-TW" in supported else None
    if lower in supported:
        return lower
    base = lower.split("-", 1)[0]
    return base if base in supported else None


def language_from_uri(uri: str | None) -> str | None:
    if not uri:
        return None
    query = urlsplit(unquote(uri)).query
    return parse_qs(query).get("lang", [None])[0]


def resolve_language(previews: dict[str, object], *candidates: str | None) -> str:
    supported = set(previews)
    for candidate in candidates:
        for item in (candidate or "").split(","):
            language = normalize_language(item.split(";", 1)[0], supported)
            if language:
                return language
    return "en"


def target_url(original_uri: str | None, language: str) -> str:
    path = unquote(original_uri or "").strip()
    if (
        not path.startswith("/")
        or path.startswith("//")
        or ".." in path
        or "://" in path
        or len(path) > 2048
    ):
        path = "/"
    if not LANG_QUERY.search(path):
        path += ("&" if "?" in path else "?") + f"lang={quote(language)}"
    return f"https://baxic.ru{path}"


def render_preview(
    language: str,
    preview: dict[str, str],
    page_url: str,
) -> str:
    title = escape(preview["title"], quote=True)
    description = escape(preview["description"], quote=True)
    page = escape(page_url, quote=True)
    image = "https://baxic.ru/businesscard-logo-preview.jpg"
    direction = "rtl" if language in RTL_LANGUAGES else "ltr"
    html_language = "zh-CN" if language == "zh" else language
    return f"""<!doctype html>
<html lang="{html_language}" dir="{direction}">
<head>
  <meta charset="utf-8">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="BAXIC.DEV">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{page}">
  <meta property="og:image" content="{image}">
  <meta property="og:image:secure_url" content="{image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1536">
  <meta property="og:image:height" content="864">
  <meta property="og:image:alt" content="{title}">
  <meta name="description" content="{description}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">
  <link rel="canonical" href="{page}">
  <link rel="image_src" href="{image}">
  <meta http-equiv="refresh" content="0;url={page}">
  <title>{title}</title>
</head>
<body><a href="{page}">{title}</a></body>
</html>"""
