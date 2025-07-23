/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // remove field
  collection.fields.removeById("text39128674")

  // remove field
  collection.fields.removeById("text595110440")

  // remove field
  collection.fields.removeById("text4220582852")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text39128674",
    "max": 0,
    "min": 0,
    "name": "contentSourceType",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text595110440",
    "max": 0,
    "min": 0,
    "name": "contentSourceData",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4220582852",
    "max": 0,
    "min": 0,
    "name": "contentSourceMediaType",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
