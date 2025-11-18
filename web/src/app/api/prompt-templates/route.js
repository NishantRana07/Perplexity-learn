import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const templates = await sql`
      SELECT id, template_name, template_type, prompt_text, placeholders
      FROM prompt_templates 
      ORDER BY template_type, template_name
    `;

    return Response.json({ templates });
  } catch (error) {
    console.error("Error fetching prompt templates:", error);
    return Response.json(
      { error: "Failed to fetch prompt templates" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const {
      skillName,
      templateType,
      customPrompt,
      duration = "30",
    } = await request.json();

    if (!skillName || !templateType) {
      return Response.json(
        {
          error: "Skill name and template type are required",
        },
        { status: 400 },
      );
    }

    // Get the appropriate template
    const [template] = await sql`
      SELECT prompt_text, placeholders 
      FROM prompt_templates 
      WHERE template_type = ${templateType}
      LIMIT 1
    `;

    if (!template) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }

    // Generate the prompt by replacing placeholders
    let generatedPrompt = template.prompt_text;

    // Replace common placeholders
    generatedPrompt = generatedPrompt.replace(/{skill}/g, skillName);
    generatedPrompt = generatedPrompt.replace(/{duration}/g, duration);

    // If assignment helper, include custom prompt
    if (templateType === "assignment" && customPrompt) {
      generatedPrompt = generatedPrompt.replace(
        /{assignment_details}/g,
        customPrompt,
      );
    }

    // Generate Comet deep-link URL
    const encodedPrompt = encodeURIComponent(generatedPrompt);
    const cometUrl = `https://www.perplexity.ai/search?q=${encodedPrompt}`;

    return Response.json({
      generatedPrompt,
      cometUrl,
      templateType,
    });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return Response.json(
      { error: "Failed to generate prompt" },
      { status: 500 },
    );
  }
}
