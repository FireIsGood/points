import { db } from '$lib/server/db/client';
import { users, transactions } from '$lib/server/db/schema';
import { and, asc, desc, eq, inArray, sql, sum } from 'drizzle-orm';

export const db_ = {
	users: [
		{ id: '3a23355e-cfd5-4ec1-9f0c-68125d3b40df', username: 'FireIsGood' },
		{ id: 'cc421bf6-40e5-4128-878c-5d925eb7b611', username: 'FireIsBad' }
	],
	transactions: [
		{ id: '3a23355e-cfd5-4ec1-9f0c-68125d3b40df', delta: 4000, note: 'Initial setup' },
		{ id: 'cc421bf6-40e5-4128-878c-5d925eb7b611', delta: -4000, note: 'Initial setup' }
	]
};

export function userExists(id: string): boolean {
	return db.select().from(users).where(eq(users.uuid, id)).get() !== undefined;
}

// Create
export async function createUser(data: typeof users.$inferInsert) {
	return db.insert(users).values(data).returning().get();
}

export async function createTransaction(data: { uuid: string; delta: number; note: string }) {
	const user = db.select({ id: users.id }).from(users).where(eq(users.uuid, data.uuid)).get();
	if (user === undefined) return undefined;

	return db
		.insert(transactions)
		.values({ userId: user.id, delta: data.delta, note: data.note })
		.returning()
		.get();
}

// Read
function _getUsers() {
	// Get point sums
	const sq = db
		.select({ id: transactions.userId, points: sum(transactions.delta).as('pt') })
		.from(transactions)
		.groupBy(transactions.userId)
		.as('sq');
	return db
		.select({
			id: users.uuid,
			username: users.username,
			points: sql<number>`CASE WHEN ${sq.points} THEN ${sq.points} ELSE 0 END`,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.orderBy(asc(users.username))
		.leftJoin(sq, eq(users.id, sq.id));
}
export async function getUsers(tracking: string[]) {
	return await _getUsers().where(inArray(users.uuid, tracking));
}
export async function getUsersAdmin() {
	return await _getUsers();
}

function _getTransactions() {
	return db
		.select({
			id: users.uuid,
			delta: transactions.delta,
			note: transactions.note,
			createdAt: transactions.createdAt,
			updatedAt: transactions.updatedAt
		})
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.orderBy(desc(transactions.createdAt));
}
export async function getTransactions(tracking: string[]) {
	return await _getTransactions().where(inArray(users.uuid, tracking));
}
export async function getTransactionsAdmin() {
	return await _getTransactions();
}

// Update
export async function updateUser(uuid: string, data: Partial<typeof users.$inferInsert>) {
	return (await db.update(users).set(data).where(eq(users.uuid, uuid)).limit(1).returning()).at(0);
}

export async function updateTransaction(
	uuid: string,
	createdAt: Date,
	data: Partial<typeof transactions.$inferSelect>
) {
	const transaction_id = db
		.select({ id: transactions.id })
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.where(and(eq(users.uuid, uuid), eq(transactions.createdAt, createdAt)))
		.get()?.id;

	if (transaction_id === undefined) return undefined;

	return (
		await db
			.update(transactions)
			.set(data)
			.where(eq(transactions.id, transaction_id))
			.limit(1)
			.returning()
	).at(0);
}

// Delete
export async function deleteUser(uuid: string) {
	return db.delete(users).where(eq(users.uuid, uuid)).limit(1).returning().get();
}

export async function deleteTransaction(uuid: string, createdAt: Date) {
	const transaction_id = db
		.select({ id: transactions.id })
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.where(and(eq(users.uuid, uuid), eq(transactions.createdAt, createdAt)))
		.get()?.id;

	if (transaction_id === undefined) return undefined;

	return db
		.delete(transactions)
		.where(eq(transactions.id, transaction_id))
		.limit(1)
		.returning()
		.get();
}
