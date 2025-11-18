import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userSession = searchParams.get("userSession");

    if (!userSession) {
      return Response.json(
        { error: "User session is required" },
        { status: 400 },
      );
    }

    const learningPaths = await sql`
      SELECT lp.*, s.name as skill_name, s.category, s.difficulty_level
      FROM learning_paths lp
      JOIN skills s ON lp.skill_id = s.id
      WHERE lp.user_session = ${userSession}
      ORDER BY lp.created_at DESC
    `;

    return Response.json({ learningPaths });
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    return Response.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      skillId,
      userSession,
      title,
      description,
      totalDays,
      cometQueryUrl,
      generatedPrompt,
    } = await request.json();

    if (!skillId || !userSession || !title) {
      return Response.json(
        {
          error: "Skill ID, user session, and title are required",
        },
        { status: 400 },
      );
    }

    const [learningPath] = await sql`
      INSERT INTO learning_paths (
        skill_id, user_session, title, description, total_days, 
        comet_query_url, generated_prompt
      )
      VALUES (
        ${skillId}, ${userSession}, ${title}, ${description}, ${totalDays || 30}, 
        ${cometQueryUrl}, ${generatedPrompt}
      )
      RETURNING *
    `;

    // Create initial milestones structure
    const milestones = [];
    const days = totalDays || 30;
    const weeksCount = Math.ceil(days / 7);

    for (let week = 1; week <= weeksCount; week++) {
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(week * 7, days);

      for (let day = startDay; day <= endDay; day++) {
        milestones.push({
          learning_path_id: learningPath.id,
          day_number: day,
          title: `Day ${day}: Learning Goals`,
          description: `Complete daily learning objectives for day ${day}`,
        });
      }
    }

    // Insert milestones
    if (milestones.length > 0) {
      const placeholders = milestones
        .map(
          (_, i) =>
            `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`,
        )
        .join(", ");

      const values = milestones.flatMap((m) => [
        m.learning_path_id,
        m.day_number,
        m.title,
        m.description,
      ]);

      await sql(
        `INSERT INTO milestones (learning_path_id, day_number, title, description) VALUES ${placeholders}`,
        values,
      );
    }

    return Response.json({ learningPath });
  } catch (error) {
    console.error("Error creating learning path:", error);
    return Response.json(
      { error: "Failed to create learning path" },
      { status: 500 },
    );
  }
}
