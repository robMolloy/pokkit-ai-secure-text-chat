/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4275913271")

  // update collection data
  unmarshal({
    "name": "aiThreads"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4275913271")

  // update collection data
  unmarshal({
    "name": "threads"
  }, collection)

  return app.save(collection)
})
