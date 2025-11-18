import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { isCompleted, notes } = await request.json();

    if (isCompleted === undefined) {
      return Response.json(
        { error: "Completion status is required" },
        { status: 400 },
      );
    }

    const [milestone] = await sql`
      UPDATE milestones 
      SET 
        is_completed = ${isCompleted}, 
        completed_at = ${isCompleted ? new Date().toISOString() : null},
        notes = ${notes || null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!milestone) {
      return Response.json({ error: "Milestone not found" }, { status: 404 });
    }

    return Response.json({ milestone });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return Response.json(
      { error: "Failed to update milestone" },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const learningPathId = searchParams.get("learningPathId");

    if (learningPathId) {
      // Get all milestones for a learning path
      const milestones = await sql`
        SELECT * FROM milestones 
        WHERE learning_path_id = ${learningPathId}
        ORDER BY day_number
      `;
      return Response.json({ milestones });
    } else {
      // Get single milestone
      const [milestone] = await sql`
        SELECT * FROM milestones WHERE id = ${id}
      `;

      if (!milestone) {
        return Response.json({ error: "Milestone not found" }, { status: 404 });
      }

      return Response.json({ milestone });
    }
  } catch (error) {
    console.error("Error fetching milestone(s):", error);
    return Response.json(
      { error: "Failed to fetch milestone(s)" },
      { status: 500 },
    );
  }
}
