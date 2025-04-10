'use client';

import { useState, useEffect } from 'react';
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import LoginButton from '../components/LoginButton';

export default function Page() {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw' | 'enriched'>('pretty');

  useEffect(() => {
    const fetchDestinyData = async () => {
      try {
        const API_KEY = 'd66db82958e34413a95e655871cc3141';
        
        // Fetch milestone data
        const response = await fetch('https://www.bungie.net/Platform/Destiny2/Milestones/', {
          headers: { 'X-API-Key': API_KEY },
        });

        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        setApiResponse(data.Response);

        // Fetch manifest data
        const manifestResponse = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/', {
          headers: { 'X-API-Key': API_KEY },
        });

        if (!manifestResponse.ok) throw new Error(`Manifest fetch failed: ${manifestResponse.status}`);
        const manifestData = await manifestResponse.json();
        
        // Extract manifest paths
        const manifestUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths.en.DestinyActivityDefinition}`;
        const modifierUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths.en.DestinyActivityModifierDefinition}`;
        const objectiveUrl = `https://www.bungie.net${manifestData.Response.jsonWorldComponentContentPaths.en.DestinyObjectiveDefinition}`;

        // Fetch activity, modifier, and objective definitions
        const [activityDefs, modifierDefs, objectiveDefs] = await Promise.all([
          fetch(manifestUrl).then((res) => res.json()),
          fetch(modifierUrl).then((res) => res.json()),
          fetch(objectiveUrl).then((res) => res.json()),
        ]);

        // Process the milestone data and resolve hashes
        const enriched = Object.entries(data.Response).reduce((acc: any, [key, milestone]: [string, any]) => {
          acc[key] = {
            milestoneHash: milestone.milestoneHash,
            activities: milestone.activities?.map((activity: any) => {
              // Remove the specific modifier (1783825372)
              const filteredModifiers = activity.modifierHashes?.filter((modHash: number) => modHash !== 1783825372) || [];

              return {
                name: activityDefs[activity.activityHash]?.displayProperties?.name || `Unknown Activity (${activity.activityHash})`,
                modifiers: filteredModifiers.map(
                  (modHash: number) => modifierDefs[modHash]?.displayProperties?.name || `Modifier ${modHash}`
                ) || [],
                challenges: activity.challengeObjectiveHashes?.map(
                  (objHash: number) => objectiveDefs[objHash]?.displayProperties?.name || `Challenge ${objHash}`
                ) || [],
                phases: activity.phaseHashes || [],
              };
            }),
            startDate: milestone.startDate,
            endDate: milestone.endDate,
            order: milestone.order,
            title: 'Weekly Challenge', // Set static title to "Weekly Challenge"
          };
          return acc;
        }, {});

        setEnrichedData(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinyData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <LoginButton />
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">

          <div className="rounded-lg bg-gray-100 p-4">
            {loading && <p className="text-gray-600 text-center">Loading Destiny data...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && apiResponse && (
              <div>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setViewMode('pretty')}
                    className={`px-4 py-2 rounded ${viewMode === 'pretty' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Pretty View
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-4 py-2 rounded ${viewMode === 'raw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Raw Data
                  </button>
                  <button
                    onClick={() => setViewMode('enriched')}
                    className={`px-4 py-2 rounded ${viewMode === 'enriched' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Enriched View
                  </button>
                </div>

                {viewMode === 'pretty' ? (
                  <div className="space-y-4">
                    {Object.entries(apiResponse).map(([key, milestone]: [string, any]) => (
                      <div key={key} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3> {/* Changed title */}
                        <p>📅 Starts: {formatDate(milestone.startDate)}</p>
                        <p>⏳ Ends: {formatDate(milestone.endDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : viewMode === 'raw' ? (
                  <pre className="text-xs bg-white p-4 rounded-md overflow-x-auto max-h-96">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(enrichedData || {}).map(([key, milestone]: [string, any]) => (
                      <div key={key} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3> {/* Changed title */}
                        <p>📅 Starts: {formatDate(milestone.startDate)}</p>
                        <p>⏳ Ends: {formatDate(milestone.endDate)}</p>
                        {milestone.activities?.length > 0 ? (
                          milestone.activities.map((activity: any, index: number) => (
                            <div key={index} className="ml-4 mt-2 p-2 bg-gray-50 rounded">
                              <p className="font-medium">🎯 {activity.name}</p>
                              <p>Modifiers: {activity.modifiers?.length > 0 ? activity.modifiers.join(', ') : 'None'}</p>
                              <p>Challenges: {activity.challenges?.length > 0 ? activity.challenges.join(', ') : 'None'}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No activities available.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
