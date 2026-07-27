import { MetadataRoute } from 'next';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://premiumtimber.com';

  // Base public pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stock`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic pages for timber containers
  let containerUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];

  try {
    if (isSupabaseConfigured && supabase) {
      // Query active published container IDs from Supabase
      const { data: containers } = await supabase
        .from('containers')
        .select('container_number, updated_at')
        .eq('is_draft', false)
        .is('deleted_at', null);

      if (containers) {
        containerUrls = containers.map((c) => ({
          url: `${baseUrl}/stock/${c.container_number}`,
          lastModified: new Date(c.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }));
      }
    } else {
      // Fallback Mock Seed IDs for sitemap demonstration
      const mockContainers = ['ECU-88291', 'BRA-99104', 'PAN-22194', 'GHA-55102', 'TZA-44183'];
      containerUrls = mockContainers.map((id) => ({
        url: `${baseUrl}/stock/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error compiling dynamic sitemaps:', error);
  }

  return [...routes, ...containerUrls];
}
