/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945797268");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "deleteRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_4275913271",
        "hidden": false,
        "id": "relation1165604065",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "threadId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "file2359244304",
        "maxSelect": 1,
        "maxSize": 0,
        "mimeTypes": [
          "image/png",
          "image/jpeg",
          "image/gif",
          "application/pdf"
        ],
        "name": "file",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2492048382",
        "hidden": false,
        "id": "relation203885561",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "aiTextMessageId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_3945797268",
    "indexes": [],
    "listRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "name": "aiMediaMessages",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\"",
    "viewRule": "@request.auth.status = \"admin\" || @request.auth.status = \"approved\""
  });

  return app.save(collection);
})
