/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3377378130",
    "max": 0,
    "min": 0,
    "name": "filePath",
    "pattern": "^\\/(?:[a-zA-Z0-9._+\\-\\(\\) ]+\\/)*[a-zA-Z0-9._+\\-\\(\\) ]+$",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3377378130",
    "max": 0,
    "min": 0,
    "name": "filePath",
    "pattern": "^\\/(?:[a-zA-Z0-9._+\\-\\(\\)]+\\/)*[a-zA-Z0-9._+\\-\\(\\)]+$",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
