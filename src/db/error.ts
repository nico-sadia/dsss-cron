export const handleDbError = (err: Error): never => {
    console.error("Database error: ", err.message);
    throw new Error(`Database operation failed: ${err.message}`);
};
