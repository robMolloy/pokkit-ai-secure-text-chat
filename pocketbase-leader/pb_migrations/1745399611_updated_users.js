/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.status = \"admin\"",
    "listRule": "@request.auth.status = \"admin\"",
    "updateRule": "@request.auth.status = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.status = \"approved\"",
    "listRule": "@request.auth.status = \"approved\"",
    "updateRule": "@request.auth.status = \"approved\""
  }, collection)

  return app.save(collection)
})
