import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { jobTitle, company, location, skills, experience } = await req.json();

  const prompt = `
Write a professional job description for the following role:

Job Title: ${jobTitle}
Company: ${company}
Location: ${location}
Skills: ${skills}
Experience: ${experience}

Format the output with a summary, responsibilities, and requirements.
`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    // console.log("1. OpenAI API key:", process.env.GEMINI_API_KEY);
    // console.log("2. Request body:", { jobTitle, company, location, skills, experience });
    // console.log("3. OpenAI response status:", response.status);
    // console.log("4. OpenAI response text:", await response.text());

    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }

  const data = await response.json();
  const aiText = data.choices?.[0]?.message?.content || 'No description generated.';

  return NextResponse.json({ description: aiText });
}
