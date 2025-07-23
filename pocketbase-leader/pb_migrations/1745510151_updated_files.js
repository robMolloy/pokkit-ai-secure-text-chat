/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1995359227",
    "hidden": false,
    "id": "relation1069581625",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "directoryRelationId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // remove field
  collection.fields.removeById("relation1069581625")

  return app.save(collection)
})
