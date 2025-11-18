import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const learningPathId = searchParams.get("learningPathId");

    if (!learningPathId) {
      return Response.json(
        { error: "Learning path ID is required" },
        { status: 400 },
      );
    }

    const notes = await sql`
      SELECT id, note_text, tags, source_url, created_at
      FROM user_notes 
      WHERE learning_path_id = ${parseInt(learningPathId)}
      ORDER BY created_at DESC
    `;

    return Response.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { learningPathId, noteText, tags, sourceUrl } = await request.json();

    if (!learningPathId || !noteText) {
      return Response.json(
        {
          error: "Learning path ID and note text are required",
        },
        { status: 400 },
      );
    }

    const [note] = await sql`
      INSERT INTO user_notes (learning_path_id, note_text, tags, source_url)
      VALUES (${learningPathId}, ${noteText}, ${tags}, ${sourceUrl})
      RETURNING *
    `;

    return Response.json({ note });
  } catch (error) {
    console.error("Error creating note:", error);
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return Response.json({ error: "Note ID is required" }, { status: 400 });
    }

    const [deletedNote] = await sql`
      DELETE FROM user_notes 
      WHERE id = ${parseInt(noteId)}
      RETURNING *
    `;

    if (!deletedNote) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ success: true, note: deletedNote });
  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
