/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // remove field
  collection.fields.removeById("select3563894552")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3563894552",
    "maxSelect": 1,
    "name": "contentType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "text",
      "image",
      "document"
    ]
  }))

  return app.save(collection)
})
