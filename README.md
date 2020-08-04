# Auslan CD-ROM Data
RIDBC published in Auslan CD-ROM based on Microsoft JET DB, Quicktime for Windows, and Macromedia Director, and Windows 98 technologies, all of
which are obsolete now. The CD continues to be a useful resource, especially in how it provided rich and detailed searchable
information about each Auslan sign's location, handshape, symmetry, and region information, much of which is difficult or
impossible for the general public to access on the modern Auslan SignBank website. This is a reverse engineering attempt to
make that dataset accessible in the modern era for language enthusiests and others who don't have access to the academic
channels required to gain access to the Auslan Sign Corpus that much of this is probably based on.

Software tools are released under the Unlicense software license. Data files (.json and .csv) might be affected by copyright
and it's unclear who holds that copyright. It's likely derived from the Auslan Corpus project, or maybe an ancestor of it. So, uh,
beware spooky legal things?

## Format notes

Under `/entries/v1/` you'll find json files for each ID Gloss in the Auslan CD app. Each file contains an object/map. The property names are educated guesses. Please submit a PR if any of them seem to be wrong or misleading.

To reference videos from the [original CD ROM](https://archive.org/details/signs-of-australia-on-cd-rom), look at the json object. For example `/entries/v1/accept.1a.json`:

```JSON
{
  "tags": [
    "nomlex1",
    "nomlex2",
    "nomlex3",
    "verblex1",
    "verblex2",
    "verblex3",
    "interj1",
    "begindir",
    "auslex",
    "doublehnd",
    "sym",
    "para",
    "engtf1",
    "engtf2",
    "engtf3",
    "engtf4",
    "engtf5",
    "ant1",
    "ant2",
    "syn1",
    "syn2"
  ],
  "sense": "1",
  "blend": "",
  "queries": "",
  "english": [
    "acceptance",
    "resignation",
    "acceptability",
    "accept",
    "acceptable"
  ],
  "deictic": [],
  "cf": [],
  "signNumber": 3930,
  "recordNumber": 2343,
  "signVisualComposition": "",
  "activeHandShape": 5.3,
  "passiveHandShape": 5.3,
  "primaryLocation": 14,
  "secondLocation": 26,
  "antonyms": [
    "refuse.1a",
    "reject"
  ],
  "synonyms": [
    "facing",
    "front.1"
  ],
  "interjection": [
    "1. Used alone to sympathise with the troubles of your addressee and show you know they are powerless to change the circumstances. English = 'What can you do!', 'That's life!', 'There's no point crying over spilt milk!' and so on."
  ],
  "particleLexeme": [],
  "verbLexeme": [
    "1. To say yes to something that has been offered and agree to take it; to follow someone's advice or suggestion and agree to do what they say; to admit you are responsible for something. English = accept.",
    "2. To no longer complain about a difficult or unpleasant situation because you get used to it and because you recognise that it cannot be changed. English = accept, resign yourself to.",
    "3. To be generally approved of and allowed to happen. English = (be) acceptable."
  ],
  "questionLexeme": [],
  "genitiveClassifiers": "",
  "nominalLexeme": [
    "1. The taking of something you have been offered; the agreement to an idea or the decision to follow advice. English = acceptance.",
    "2. The process of no longer complaining about a difficult or unpleasant situation because you get used to it and because you recognise that it cannot be changed. English = acceptance, resignation.",
    "3. The quality of being generally approved of and allowed to happen. English = acceptability."
  ],
  "idGloss": "accept.1a",
  "oldEntry": ""
}
```

the `english` field is most similar to the "keywords" found on Auslan Signbank. To find a corrosponding video on the original CD-ROM,
take the `signNumber` field, convert it to a string, then take the first two characters "39" in this case. This is the shard folder ID.
In the CD-ROM, look in /movie/39/ and you'll find a file named 39300.mov. This is a quicktime movie using the Cinepak codec with no audio
track at 320x240 resolution and around 12.5fps.

So why did sign number 3930 become filename 39300.mov? Your guess is as good as mine, but in the original database, the "SN" field is stored
as a Double Floating Point Number, and indeed, if you look at certain entries like e-mail.json, you'll find signNumber 1143.1. Looking at sign
number 1143.0 - blood.1a, there doesn't appear to be much of a relationship. My suspicion is they added extra resolution to be able to shove
more signs in without disrupting the numbering scheme, which is likely inherited from the big red book: [AUSLAN Dictionary - A Dictionary of
the Sign Language of the Australian Deaf Community](https://www.librarything.com/work/1040748). In this dictionary, the primary/active handshape is the sorting key around which everything
is indexed numerically, so signs which involve similar handshapes are sorted near to each other.

And that seems to hold true, e-mail and blood.1a do both involve a flat splayed handshape. Notably the big red book and this CD-ROM were both authored by Trevor Johnston

So it looks like the best way to locate sign video mov files on the CD-ROM is to multiply sign number by 10, then round it to a whole integer to avoid
any floating point errors, convert the integer to a string, use the first two characters to find the shard ID, and build the path
`/CDMountPoint/movie/:shardID:/:signNumberInteger:.mov`

## A note on tags

The tags field contains every boolean field that was set true in the sign's row in the AUSLANCD table on the original CD-ROM. Some of these are clearly useful tags, while others appear to just note the presence or absence of information in the text fields of the same rows. The tags are presented in their raw form, at least in v1 dataset, and it's up to you to appropriately filter it down to just the useful ones if presenting them in a user interface.