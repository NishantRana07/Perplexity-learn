import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const skills = await sql`
      SELECT id, name, description, category, difficulty_level, estimated_duration_days
      FROM skills 
      ORDER BY category, name
    `;

    return Response.json({ skills });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return Response.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      name,
      description,
      category,
      difficulty_level,
      estimated_duration_days,
    } = await request.json();

    if (!name) {
      return Response.json(
        { error: "Skill name is required" },
        { status: 400 },
      );
    }

    const [skill] = await sql`
      INSERT INTO skills (name, description, category, difficulty_level, estimated_duration_days)
      VALUES (${name}, ${description}, ${category}, ${difficulty_level || "beginner"}, ${estimated_duration_days || 30})
      RETURNING *
    `;

    return Response.json({ skill });
  } catch (error) {
    console.error("Error creating skill:", error);
    return Response.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
