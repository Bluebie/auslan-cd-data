// tool to read raw-csv as extracted by mdb-export from the Auslan CD-ROM's
// Access JET database auslancd.mdb
// This script creates a directory named "entries" and populates it with
// one json file for each IDGLOSS named entries/v1/[IDGLOSS].json
// with each json file restructured to be as intelligible as possible

const fs = require('fs-extra')
const CSV = require('csv-string')
const tableSchemas = require('./raw-csv-schemas.json')
const version = 'v1'

// reads a table with the schema, parsing values appropriately, and returning an array of objects
async function readWithSchema(tableName) {
  let csvBuffer = await fs.readFile(`./raw-csv/${tableName}.csv`)
  let parsedCSV = CSV.parse(csvBuffer.toString())
  let columnLabels = parsedCSV.shift()
  let schema = tableSchemas[tableName]

  return parsedCSV.map(row =>
    Object.fromEntries(row.map((value, idx)=> {
      let columnLabel = columnLabels[idx]
      let type = schema[columnLabel].toLowerCase()
      if (type == 'boolean') value = parseInt(value) != 0
      else if (type == 'text') value = value.toString().replace(/^"/, '').replace(/"$/, '').replace(/""/, '"')
      else if (type == 'double') value = parseFloat(value)
      else if (type == 'byte') value = parseInt(value)
      return [columnLabel.toLowerCase(), value]
    }))
  )
}

// takes an object which has properties like prop1 prop2 prop3 and deletes those properties, creating a new 'prop' containing an array of their values
// where those values are not falsey. Original object is directly modified
function arrayify(object, propertyName) {
  let counter = 1
  let array = []
  while (object[`${propertyName}${counter}`] !== undefined) {
    if (object[`${propertyName}${counter}`]) array.push(object[`${propertyName}${counter}`])
    delete object[`${propertyName}${counter}`]
    counter++
  }
  object[`${propertyName}`] = array
  return object
}

// renames some properties in an object by altering the original object
function renameProps(object, mapping) {
  Object.entries(mapping).forEach(([oldName, newName])=> {
    object[newName] = object[oldName]
    delete object[oldName]
  })
  return object
}

// takes an object, and for any properties whose value is an empty string, set it to null
function nullEmptyStrings(object) {
  Object.entries(object).forEach(([key, value]) => {
    if (value === "") {
      object[key] = null
    }
  })
  return object
}

async function run() {
  // create and erase entries directory
  await fs.ensureDir(`./entries/${version}`)
  await fs.emptyDir(`./entries/${version}`)

  //let englishDB = await readWithSchema('ENGLISH') // not needed
  let auslanDB = await readWithSchema('AUSLANCD')

  let singleFile = {}

  for (let entry of auslanDB) {
    // extract all the literally true values, these are stored as tags
    let tags = Object.entries(entry).filter(([key, value])=> value === true).map(([key, value])=> key.replace(/tf$/, ''))
    // rebuild entry without any of the boolean tag values
    entry = Object.fromEntries(Object.entries(entry).filter(([key, value])=> typeof(value) != 'boolean'))
    // group numeric sequence properties like english1 english2 english3 in to arrays
    arrayify(entry, 'english')
    arrayify(entry, 'deictic')
    arrayify(entry, 'verblex')
    arrayify(entry, 'ant')
    arrayify(entry, 'cf')
    arrayify(entry, 'syn')
    arrayify(entry, 'interj')
    arrayify(entry, 'partlex')
    arrayify(entry, 'nomlex')
    // weird edgecase workaround
    entry.questlex = [entry.questlex, entry.questlex2].filter(x => !!x)
    delete entry.questlex2

    // rename properties to be clearer and uh also not racist?
    renameProps(entry, {
      sn: 'signNumber',
      recnumb: 'recordNumber',
      comp: 'signVisualComposition',
      domhndsh: 'activeHandshape',  // feeling oppinionated about this one, not going to have references to slavery or
      subhndsh: 'passiveHandshape', // BDSM as metaphores in data formats I build dangit!! what the heck
      locprim: 'primaryLocation',
      locsecond: 'secondLocation',
      ant: 'antonyms',
      syn: 'synonyms',
      interj: 'interjection',
      partlex: 'particleLexeme',
      verblex: 'verbLexeme',
      questlex: 'questionLexeme',
      genmean: 'generalMeaning',
      nomlex: 'nominalLexeme',
      idgloss: 'idGloss',
      oldentry: 'oldEntry',
      cf: 'seeAlso'
    })

    // any empty string values become null
    nullEmptyStrings(entry)

    let json = {
      tags,
      ...entry,
    }
    // write out a json file
    await fs.writeJSON(`./entries/${version}/${encodeURIComponent(entry.idGloss)}.json`, json, {
      spaces: 2,
    })

    singleFile[json.idGloss] = json
  }

  // write out single file version
  await fs.writeJSON(`./entries/${version}.json`, singleFile)
}

run()