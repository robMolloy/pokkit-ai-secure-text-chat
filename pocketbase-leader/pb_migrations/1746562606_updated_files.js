/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "deleteRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "listRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "updateRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "viewRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
