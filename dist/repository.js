import { db } from './db.js';
const initializeSchema = () => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle_makes (
      make_id TEXT PRIMARY KEY,
      make_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicle_types (
      make_id TEXT NOT NULL,
      type_id TEXT NOT NULL,
      type_name TEXT NOT NULL,
      PRIMARY KEY (make_id, type_id),
      FOREIGN KEY (make_id) REFERENCES vehicle_makes (make_id) ON DELETE CASCADE
    );
  `);
};
initializeSchema();
export function saveVehicleData(data) {
    const insertMake = db.prepare(`
    INSERT INTO vehicle_makes (make_id, make_name)
    VALUES (@makeId, @makeName)
    ON CONFLICT(make_id) DO UPDATE SET make_name = excluded.make_name
  `);
    const insertType = db.prepare(`
    INSERT INTO vehicle_types (make_id, type_id, type_name)
    VALUES (@makeId, @typeId, @typeName)
    ON CONFLICT(make_id, type_id) DO UPDATE SET type_name = excluded.type_name
  `);
    db.transaction(() => {
        db.exec('DELETE FROM vehicle_types; DELETE FROM vehicle_makes;');
        for (const make of data) {
            insertMake.run({ makeId: make.makeId, makeName: make.makeName });
            for (const type of make.vehicleTypes) {
                insertType.run({
                    makeId: make.makeId,
                    typeId: type.typeId,
                    typeName: type.typeName,
                });
            }
        }
    })();
}
export function getVehicleData() {
    const makes = db.prepare(`
    SELECT make_id AS makeId, make_name AS makeName
    FROM vehicle_makes
    ORDER BY make_name ASC
  `).all();
    const typesByMake = db.prepare(`
    SELECT make_id AS makeId, type_id AS typeId, type_name AS typeName
    FROM vehicle_types
    ORDER BY type_name ASC
  `).all();
    const grouped = new Map();
    for (const item of typesByMake) {
        const bucket = grouped.get(item.makeId) ?? [];
        bucket.push({ typeId: item.typeId, typeName: item.typeName });
        grouped.set(item.makeId, bucket);
    }
    return makes.map((make) => ({
        ...make,
        vehicleTypes: grouped.get(make.makeId) ?? [],
    }));
}
export function getVehicleMakeById(makeId) {
    const row = getVehicleData().find((make) => make.makeId === makeId);
    return row;
}
