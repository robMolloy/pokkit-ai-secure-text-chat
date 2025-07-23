/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_YUecd8Oi1U` ON `providers` (`provider`)"
    ],
    "name": "providers"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2769025244")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_YUecd8Oi1U` ON `settings` (`provider`)"
    ],
    "name": "settings"
  }, collection)

  return app.save(collection)
})
