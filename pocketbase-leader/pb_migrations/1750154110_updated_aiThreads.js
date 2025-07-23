/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4275913271")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_sH8OdMXKHv` ON `aiThreads` (`threadId`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4275913271")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_sH8OdMXKHv` ON `aiThreads` (`threadId`)"
    ]
  }, collection)

  return app.save(collection)
})
