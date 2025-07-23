/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2492048382",
    "hidden": false,
    "id": "relation203885561",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "aiTextMessageId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // remove field
  collection.fields.removeById("relation203885561")

  return app.save(collection)
})
