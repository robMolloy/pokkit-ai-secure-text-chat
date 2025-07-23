/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "deleteRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "listRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "updateRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "viewRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
