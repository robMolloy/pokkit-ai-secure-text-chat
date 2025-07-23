/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.status = \"admin\"",
    "deleteRule": "@request.auth.status = \"admin\"",
    "listRule": "@request.auth.status = \"admin\"",
    "updateRule": "@request.auth.status = \"admin\"",
    "viewRule": "@request.auth.status = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": null,
    "listRule": "",
    "updateRule": "",
    "viewRule": null
  }, collection)

  return app.save(collection)
})
