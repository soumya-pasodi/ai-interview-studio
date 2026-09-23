const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log("Starting Puppeteer...");
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        const filePath = path.resolve(__dirname, 'Project_Documentation.html');
        console.log(`Loading file: file://${filePath}`);
        
        // Wait until network is idle
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
        
        console.log("Waiting for Mermaid to render the diagrams...");
        // Wait for the SVG element to appear inside the mermaid div
        await page.waitForSelector('.mermaid svg', { timeout: 10000 });
        
        // Add a small extra delay just to make sure
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Generating PDF...");
        await page.pdf({
            path: 'Project_Documentation.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });
        
        console.log("PDF generated successfully with Flow Diagram: Project_Documentation.pdf");
    } catch (err) {
        console.error("Error generating PDF:", err);
    } finally {
        if (browser) await browser.close();
    }
})();
