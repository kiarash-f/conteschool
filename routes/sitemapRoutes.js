const express = require('express');
const Course = require('../models/courseModel'); // adjust path if needed

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const courses = await Course.find();

    const courseUrls = courses.map(course => {
      return `
        <url>
          <loc>${baseUrl}/courses/${course._id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    }).join('');

    const staticUrls = [
      '',
      '/about',
      '/contact',
      '/courses',
    ].map(path => {
      return `
        <url>
          <loc>${baseUrl}${path}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls}
        ${courseUrls}
      </urlset>
    `;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
