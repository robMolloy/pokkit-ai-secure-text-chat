/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("text1664698358")

  // update field
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "user",
      "assistant"
    ]
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1664698358",
    "max": 0,
    "min": 0,
    "name": "contentText",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
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
