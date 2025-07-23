/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1995359227");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "deleteRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
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
        "cascadeDelete": true,
        "collectionId": "pbc_1995359227",
        "hidden": false,
        "id": "relation1542800728",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "directoryRelationId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "^[^<>:\"/\\\\|?*\\x00-\\x1F]+$",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool3604789672",
        "name": "isStarred",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
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
    "id": "pbc_1995359227",
    "indexes": [],
    "listRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "name": "directories",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\"",
    "viewRule": "@request.auth.status = \"approved\" || @request.auth.status = \"admin\""
  });

  return app.save(collection);
})
