import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { filterType, query } = await req.json();

    // Map filterType to endpoint and method
    const endpointMap: { [key: string]: { url: string; method: string } } = {
      'job-title': {
        url: 'filter_job_title_suggestions',
        method: 'POST',
      },
      'company': {
        url: 'filter-suggestion-company',
        method: 'POST',
      },
      'location': {
        url: 'filter_geography_location_region_suggestions',
        method: 'POST',
      },
    };

    const endpointInfo = endpointMap[filterType];
    if (!endpointInfo) {
      return NextResponse.json({ error: 'Invalid filter type' }, { status: 400 });
    }

    const apiUrl = `https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/${endpointInfo.url}`;

    let response;
    if (endpointInfo.method === 'GET') {
      response = await fetch(`${apiUrl}?query=${encodeURIComponent(query)}`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
        },
      });
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
        },
        body: JSON.stringify({ query }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.message || 'API Error' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
