
require('dotenv').config();
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Cursors } = require('google-gax');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://my.fixbro.in'; // Reads from .env file
const SITEMAP_PATH = path.join(__dirname, 'public', 'sitemap.xml');
// --- End Configuration ---

// Initialize Firebase Admin SDK
try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({
            credential: cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Sitemap might be incomplete.');
    }
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    // Don't exit process, just log it. A broken sitemap shouldn't stop the whole build.
}

const db = getApps().length > 0 ? getFirestore() : null;

// Function to generate the sitemap
async function generateSitemap() {
    console.log('Starting sitemap generation...');

    try {
        // 1. Define static pages
        const staticPages = [
            '/',
            '/about',
            '/services',
            '/portfolio',
            '/pricing',
            '/contact',
            '/privacy-policy',
            '/terms',
            '/refund-policy',
            '/cancellation-policy'
        ];

        let dynamicPages = [];
        // 2. Fetch dynamic pages from Firestore (only if db is available)
        if (db) {
            try {
                const legalPagesSnapshot = await db.collection('legal_pages').get();
                dynamicPages = legalPagesSnapshot.docs.map(doc => `/${doc.id}`);
            } catch (e) {
                console.error("Failed to fetch dynamic pages for sitemap:", e.message);
            }
        }
        
        console.log(`Found ${staticPages.length} static pages and ${dynamicPages.length} dynamic pages.`);

        // 3. Combine and deduplicate pages
        const allPages = [...new Set([...staticPages, ...dynamicPages])];

        // 4. Build the XML content
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
    <url>
        <loc>${WEBSITE_URL}${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`;

        // 5. Write the file
        fs.writeFileSync(SITEMAP_PATH, sitemapContent.trim());

        console.log(`Sitemap successfully generated and saved to ${SITEMAP_PATH}`);

    } catch (error) {
        console.error('An error occurred during sitemap generation:', error);
        process.exit(1);
    }
}

generateSitemap();
