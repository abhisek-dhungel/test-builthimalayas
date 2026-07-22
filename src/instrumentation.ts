export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { ensureDatabase } = await import("@/lib/database");
    await ensureDatabase();
    console.log(
      `[db] ready (${process.env.DATABASE_DRIVER === "mysql" ? "mysql" : "sqlite"})`,
    );
  } catch (error) {
    // Don't crash the whole deployment if DB is briefly unreachable.
    console.error("[db] startup migration failed:", error);
  }
}
