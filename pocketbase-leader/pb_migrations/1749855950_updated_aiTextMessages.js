/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // update collection data
  unmarshal({
    "name": "aiMessages"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2492048382")

  // update collection data
  unmarshal({
    "name": "aiTextMessages"
  }, collection)

  return app.save(collection)
})
