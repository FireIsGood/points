import * as t from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

const timestamp = {
	createdAt: t
		.integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: t
		.integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
};

const users = t.sqliteTable('users', {
	id: t.int().primaryKey({ autoIncrement: true }).notNull(),
	uuid: t
		.text('uuid')
		.notNull()
		.$defaultFn(() => uuidv4()),
	username: t.text('username', { length: 255 }).notNull(),
	...timestamp
});

const transactions = t.sqliteTable('transactions', {
	id: t.int().primaryKey({ autoIncrement: true }).notNull(),
	userId: t
		.int('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	delta: t.real('delta').notNull(),
	note: t.text('note').notNull(),
	...timestamp
});

export { users, transactions };
