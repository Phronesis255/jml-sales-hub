/* Portable brand books. Files are saved locally; referenced assets are not fetched. */
(function(root) {
  'use strict';
  const MAX_BYTES = 1024 * 1024;
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' && !!value.trim();
  function validate(book) {
    if (!object(book) || book.schemaVersion !== 1) throw Error('Use a brand book with schemaVersion: 1. Download the sample JSON below.');
    if (!object(book.colors) || !['primary','secondary'].every(key => /^#[0-9a-f]{6}$/i.test(book.colors[key]))) throw Error('Set colors.primary and colors.secondary to six-digit hex colors, such as #21405d.');
    if (!object(book.brandVoice) || !text(book.brandVoice.description)) throw Error('Add a brandVoice.description explaining how this brand should sound.');
    if (book.name !== undefined && !text(book.name)) throw Error('The brand book name must be text.');
    if (book.logo !== undefined && (!object(book.logo) || !text(book.logo.path) || (book.logo.alt !== undefined && typeof book.logo.alt !== 'string'))) throw Error('Use logo.path for the logo URL or file path, and optional logo.alt for its description.');
    if (book.typography !== undefined && (!object(book.typography) || ['heading','body'].some(key => book.typography[key] !== undefined && !text(book.typography[key])))) throw Error('Use font family names for typography.heading and typography.body.');
    return book;
  }
  function parse(source) {
    let book;
    try { book = JSON.parse(source.replace(/^\uFEFF/,'')); }
    catch { throw Error('This file is not valid JSON. Check commas and quotation marks, or start with the sample.'); }
    return validate(book);
  }
  async function read(file) {
    if (!file || !file.size) throw Error('Choose a brand book JSON file.');
    if (file.size > MAX_BYTES) throw Error('Use a brand book smaller than 1 MB. Reference logos by URL or path instead of embedding them.');
    return parse(await file.text());
  }
  function apply(brand, book, filename, foundation) {
    validate(book);
    brand.brandBook = JSON.parse(JSON.stringify(book));
    brand.brandBookFile = filename;
    brand.primary = book.colors.primary;
    brand.accent = book.colors.secondary;
    foundation.brandVoice = book.brandVoice.description;
  }
  function voice(brand) {
    return brand?.operations?.foundation?.brandVoice ?? brand?.brandBook?.brandVoice?.description ?? '';
  }
  const api = {validate,parse,read,apply,voice};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JMLBrandBook = api;
})(typeof window === 'undefined' ? globalThis : window);
