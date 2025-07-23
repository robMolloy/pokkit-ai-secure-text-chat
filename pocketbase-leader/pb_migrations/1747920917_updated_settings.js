/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "viewRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.status = \"admin\"",
    "viewRule": "@request.auth.status = \"admin\""
  }, collection)

  return app.save(collection)
})
