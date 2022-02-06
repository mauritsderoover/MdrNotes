/**
 * Generated by the artifact generator [@inrupt/artifact-generator], version [1.0.4]
 * as part of artifact: [generated-vocab-notetaking], version: [0.0.1]
 * on 'Friday, December 31, 2021 3:58 PM'.
 *
 * Vocabulary built from input: [https://mauritsderoover.solidcommunity.net/public/notetaking.ttl].
 *
 * [Generator provided] - undefined
 */

/* eslint-disable */

// We prefix our local variables with underscores to (hopefully!) prevent
// potential names clashes with terms from vocabularies.
const {
  VocabTerm: _VocabTerm,
  getLocalStore,
} = require("@inrupt/solid-common-vocab");
const _DataFactory = require("@rdfjs/data-model");

const { namedNode: _namedNode } = _DataFactory;

function _NS(localName: string) {
  return _namedNode(
    `https://mauritsderoover.solidcommunity.net/public/notetaking/${localName}`
  );
}

/**
 * [Generator provided] - undefined
 */
const NOTETAKING = {
  PREFIX: "notetaking",
  NAMESPACE: "https://mauritsderoover.solidcommunity.net/public/notetaking/",
  PREFIX_AND_NAMESPACE: {
    notetaking: "https://mauritsderoover.solidcommunity.net/public/notetaking/",
  },
  NS: _NS,

  // *****************
  // All the Classes.
  // *****************

  /**
   * A section is a group or category of notes that belong together. A section can belong to a section group.
   *
   * This term provides multilingual descriptions, but has a mismatch between its labels and comments, with [3] labels in languages [de, en, nl], but [1] comment in the language [en].
   */
  Section: new _VocabTerm(_NS("Section"), _DataFactory, getLocalStore(), false)
    .addLabel(`Abschnitt`, "de")
    .addLabel(`Section`, "en")
    .addLabel(`Sectie`, "nl")
    .addComment(
      `A section is a group or category of notes that belong together. A section can belong to a section group.`,
      "en"
    ),

  /**
   * A group of sections containing notes
   *
   * This term provides multilingual descriptions, but has a mismatch between its labels and comments, with [3] labels in languages [de, en, nl], but [1] comment in the language [NoLocale].
   */
  SectionGroup: new _VocabTerm(
    _NS("SectionGroup"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabel(`Abschnittgruppe`, "de")
    .addLabel(`Sectiongroup`, "en")
    .addLabel(`Sectiegroep`, "nl")
    .addCommentNoLanguage(`A group of sections containing notes`),

  /**
   * A notebook is a collection of notes, note groups, sections, section groups
   *
   * This term provides multilingual descriptions, but has a mismatch between its labels and comments, with [3] labels in languages [de, en, nl], but [1] comment in the language [en].
   */
  NoteBook: new _VocabTerm(
    _NS("NoteBook"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabel(`Notizbuch`, "de")
    .addLabel(`Notebook`, "en")
    .addLabel(`Notitieblok`, "nl")
    .addComment(
      `A notebook is a collection of notes, note groups, sections, section groups`,
      "en"
    ),

  /**
   * A note are thoughts written down primarily meant for the author of the note.
   *
   * This term provides multilingual descriptions, but has a mismatch between its labels and comments, with [3] labels in languages [de, en, nl], but [1] comment in the language [en].
   */
  Note: new _VocabTerm(_NS("Note"), _DataFactory, getLocalStore(), false)
    .addLabel(`Seite`, "de")
    .addLabel(`Page`, "en")
    .addLabel(`Pagina`, "nl")
    .addComment(
      `A note are thoughts written down primarily meant for the author of the note.`,
      "en"
    ),

  /**
   * A group of a pages containing notes
   *
   * The term has a description only in English, but has a mismatch between its labels and comments, with [0] labels, but [1] comment in the language [en].
   */
  PageGroup: new _VocabTerm(
    _NS("PageGroup"),
    _DataFactory,
    getLocalStore(),
    false
  ).addComment(`A group of a pages containing notes`, "en"),

  // *******************
  // All the Properties.
  // *******************

  /**
   *
   *
   * This term has no descriptions at all (i.e., the vocabulary doesn&#x27;t provide any &#x27;rdfs:label&#x27;, &#x27;rdfs:comment&#x27;, or &#x27;dcterms:description&#x27; meta-data).
   */
  hasPage: new _VocabTerm(_NS("hasPage"), _DataFactory, getLocalStore(), false),

  /**
   *
   *
   * This term has no descriptions at all (i.e., the vocabulary doesn&#x27;t provide any &#x27;rdfs:label&#x27;, &#x27;rdfs:comment&#x27;, or &#x27;dcterms:description&#x27; meta-data).
   */
  hasPageGroup: new _VocabTerm(
    _NS("hasPageGroup"),
    _DataFactory,
    getLocalStore(),
    false
  ),

  /**
   *
   *
   * This term has no descriptions at all (i.e., the vocabulary doesn&#x27;t provide any &#x27;rdfs:label&#x27;, &#x27;rdfs:comment&#x27;, or &#x27;dcterms:description&#x27; meta-data).
   */
  hasSection: new _VocabTerm(
    _NS("hasSection"),
    _DataFactory,
    getLocalStore(),
    false
  ),

  /**
   *
   *
   * This term has no descriptions at all (i.e., the vocabulary doesn&#x27;t provide any &#x27;rdfs:label&#x27;, &#x27;rdfs:comment&#x27;, or &#x27;dcterms:description&#x27; meta-data).
   */
  hasSectionGroup: new _VocabTerm(
    _NS("hasSectionGroup"),
    _DataFactory,
    getLocalStore(),
    false
  ),

  /**
   * The notebook to which this section or section group belongs.
   *
   * This term provides descriptions only in English.
   */
  partOfNoteBook: new _VocabTerm(
    _NS("partOfNoteBook"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabel(`partOfNoteBook`, "en")
    .addComment(
      `The notebook to which this section or section group belongs.`,
      "en"
    ),

  /**
   * The page group to which this page belongs.
   *
   * This term provides descriptions only with no explicit locale.
   */
  partOfPageGroup: new _VocabTerm(
    _NS("partOfPageGroup"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabelNoLanguage(`partOfPageGroup`)
    .addCommentNoLanguage(`The page group to which this page belongs.`),

  /**
   * The section to which this page or this group of pages belongs.
   *
   * This term provides descriptions only in English.
   */
  partOfSection: new _VocabTerm(
    _NS("partOfSection"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabel(`partOfSection`, "en")
    .addComment(
      `The section to which this page or this group of pages belongs.`,
      "en"
    ),

  /**
   * The section group to which this section belongs.
   *
   * This term provides descriptions only with no explicit locale.
   */
  partOfSectionGroup: new _VocabTerm(
    _NS("partOfSectionGroup"),
    _DataFactory,
    getLocalStore(),
    false
  )
    .addLabelNoLanguage(`partOfSectionGroup`)
    .addCommentNoLanguage(`The section group to which this section belongs.`),
};

export default NOTETAKING;