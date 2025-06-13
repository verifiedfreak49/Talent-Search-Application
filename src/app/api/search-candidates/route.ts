import { NextRequest, NextResponse } from 'next/server';

type SelectedFilter = {
  type: string;
  value: string;
  id: string;
  include: boolean;
};

interface FiltersObject {
  jobTitle?: string[];
  company?: string[];
  location?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { filters } = await req.json() as { filters: SelectedFilter[] };
    
    // Validate input
    if (!filters?.length) {
      return NextResponse.json(
        { error: "No filters provided" },
        { status: 400 }
      );
    }

    // Build filters object
    const filtersObject: FiltersObject = {};
    filters.forEach((f) => {
      if (f.include) {
        const filterType = f.type.toLowerCase() as keyof FiltersObject;
        if (!filtersObject[filterType]) {
          filtersObject[filterType] = [];
        }
        filtersObject[filterType]?.push(f.id);
      }
    });

    // Call LinkedIn API
    const response = await fetch(
      'https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/premium_search_person',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
        },
        body: JSON.stringify({
          filters: filtersObject,
          page: 1,
          limit: 25
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`LinkedIn API error: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ candidates: result.candidates || [] });

  } catch (error: any) {
    console.error("Candidate search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
