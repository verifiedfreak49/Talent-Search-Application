import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, location } = await req.json();

    // console.log("RapidAPI Key:", process.env.RAPIDAPI_KEY); // Should show your key
    // console.log("Job Title:", jobTitle); // Should match input


    
    if (!jobTitle?.trim()) {
      return NextResponse.json(
        { error: "Job title is required" },
        { status: 400 }
      );
    }

    // Job Title suggestions
    const jobTitleResponse = await fetch(
      'https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_job_title_suggestions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
          
        },
        
        body: JSON.stringify({ query: jobTitle }),
      }
    );
    const jobTitleClone = jobTitleResponse.clone();
    if (!jobTitleResponse.ok) {
      const errorText = await jobTitleClone.text();
      throw new Error(`Job title API error: ${errorText}`);
    }

    const jobTitleData = await jobTitleResponse.json();

    // Company Suggestions
    const companyResponse = await fetch(
    'https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_company_suggestions',
    {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
          },
      body: JSON.stringify({ query: company }),
      }
    );
     const companyClone = companyResponse.clone();
    

    if (!companyResponse.ok) {
      const errorText = await companyClone.text();
      throw new Error(`Company API error: ${errorText}`);
    }
    const companyData = await companyResponse.json();
    // Location Suggestions
    const locationResponse = await fetch(
      'https://linkedin-sales-navigator-no-cookies-required.p.rapidapi.com/filter_geography_location_region_suggestions ',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'linkedin-sales-navigator-no-cookies-required.p.rapidapi.com',
          },
        body: JSON.stringify({ query: location }),
      }
    );
    const locationClone = locationResponse.clone();
    
    
    if (!locationResponse.ok) {
      const errorText = await locationClone.text();
      throw new Error(`Location API error: ${errorText}`);
    }
    const locationData = await locationResponse.json();
    return NextResponse.json({ 
      jobTitleData,
      companyData,
      locationData
     });

   

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
