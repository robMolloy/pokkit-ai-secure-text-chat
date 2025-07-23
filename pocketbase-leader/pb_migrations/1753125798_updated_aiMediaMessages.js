/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // remove field
  collection.fields.removeById("select3563894552")

  // remove field
  collection.fields.removeById("text39128674")

  // remove field
  collection.fields.removeById("text595110440")

  // remove field
  collection.fields.removeById("text4220582852")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "file2359244304",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "file",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select3563894552",
    "maxSelect": 1,
    "name": "contentType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "image",
      "document"
    ]
  }))

  // add field
  collection.fields.addAt(3, new Field({
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
  collection.fields.addAt(4, new Field({
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
  collection.fields.addAt(5, new Field({
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

  // remove field
  collection.fields.removeById("file2359244304")

  return app.save(collection)
})
