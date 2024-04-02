export function getDbAddress() {
	return import.meta.env.VITE_DATABASE_ADDRESS;
}

export function getDbUser() {
	return { user: import.meta.env.VITE_DATABASE_USER, password: import.meta.env.VITE_DATABASE_USER_PASSWORD };
}

export function connectToDb() {
	
}