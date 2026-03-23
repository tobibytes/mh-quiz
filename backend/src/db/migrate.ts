import fs from "node:fs";
import path from "node:path";
import { db } from "./client.js";

function addColumnIfMissing(table: string, column: string, sqlType: string): void {
	const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
	const exists = columns.some((c) => c.name === column);
	if (!exists) {
		db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlType}`);
	}
}

const schemaPath = path.resolve(process.cwd(), "src/db/schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");
db.exec(sql);

addColumnIfMissing("users", "name", "TEXT");
addColumnIfMissing("users", "school", "TEXT");
addColumnIfMissing("users", "school_email", "TEXT");

console.log("Database migration complete");
