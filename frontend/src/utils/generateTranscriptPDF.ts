// generateTranscriptPDF.ts
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Replace this with your full local or deployed URL to TranscriptDetail page
  await page.goto('http://localhost:5173/transcripts/123456', {
    waitUntil: 'networkidle',
  });

  // Optional: wait for the component to fully render
  await page.waitForSelector('text=Official High School Transcript');

  // Generate PDF
  await page.pdf({
    path: 'transcript.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      bottom: '20px',
      left: '20px',
      right: '20px',
    },
  });

  console.log('✅ PDF saved to transcript.pdf');
  await browser.close();
})();
