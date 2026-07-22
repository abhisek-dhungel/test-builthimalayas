export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ensureDatabase } = await import("@/lib/database");
  await ensureDatabase();
  console.log(
    `[db] ready (${process.env.DATABASE_DRIVER === "mysql" ? "mysql" : "sqlite"})`,
  );
}
