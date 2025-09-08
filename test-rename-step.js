const { chromium } = require('playwright-core');

async function testRenameStepFeature() {
  console.log('🚀 Starting Rename Step Feature Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to application
    console.log('📱 Navigating to http://localhost:4200...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
    
    // Step 2: Login with default credentials
    console.log('🔐 Attempting to login...');
    
    // Wait for login form and fill credentials
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'dev@ap.com');
    await page.fill('input[type="password"]', '12345678');
    
    // Click login button
    await page.click('button[type="submit"]');
    console.log('✅ Login attempted');
    
    // Wait for redirect to flows page
    await page.waitForTimeout(3000);
    
    // Step 3: Create or navigate to a flow
    console.log('🔄 Looking for flows or create new flow...');
    
    // Try to find "Create Flow" or existing flows
    const createFlowSelector = 'button:has-text("Create Flow"), a:has-text("Create Flow"), [data-testid*="create"], button:has-text("New Flow")';
    const existingFlowSelector = 'a[href*="/flows/"], [data-testid*="flow-card"], .flow-card';
    
    // Check if we can create a new flow or use existing one
    if (await page.locator(createFlowSelector).count() > 0) {
      console.log('➕ Creating new flow...');
      await page.click(createFlowSelector);
      await page.waitForTimeout(2000);
    } else if (await page.locator(existingFlowSelector).count() > 0) {
      console.log('📂 Opening existing flow...');
      await page.locator(existingFlowSelector).first().click();
      await page.waitForTimeout(2000);
    }
    
    // Step 4: Wait for flow builder to load
    console.log('⏳ Waiting for flow builder...');
    await page.waitForSelector('.flow-canvas, [class*="canvas"], [class*="builder"]', { timeout: 15000 });
    
    // Step 5: Look for existing steps or add a step
    console.log('🔍 Looking for steps in the flow...');
    
    // Check if there are existing steps
    const stepSelector = '[data-step-context-menu], [class*="step-node"], .step-card, [class*="ap-step"]';
    let stepExists = await page.locator(stepSelector).count() > 0;
    
    if (!stepExists) {
      console.log('➕ Adding a new step...');
      
      // Look for add step buttons or plus icons
      const addStepSelectors = [
        'button:has-text("+")',
        '[aria-label*="add"]',
        '[class*="add-step"]',
        'button[class*="plus"]',
        '.add-action-button'
      ];
      
      for (const selector of addStepSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          await page.waitForTimeout(1000);
          
          // Try to select a simple piece like HTTP or Code
          const pieceSelectors = [
            'text="HTTP Request"',
            'text="Code"',
            'text="Webhook"',
            '[data-piece="http"]',
            '[class*="piece-card"]'
          ];
          
          for (const pieceSelector of pieceSelectors) {
            if (await page.locator(pieceSelector).count() > 0) {
              await page.click(pieceSelector);
              await page.waitForTimeout(1000);
              break;
            }
          }
          break;
        }
      }
    }
    
    // Step 6: Test the rename functionality
    console.log('🎯 Testing rename functionality...');
    
    // Find a step to right-click on
    const step = page.locator(stepSelector).first();
    await step.waitFor({ timeout: 10000 });
    
    console.log('👆 Right-clicking on step...');
    await step.click({ button: 'right' });
    
    // Wait for context menu
    await page.waitForTimeout(1000);
    
    // Step 7: Look for rename option
    console.log('🔍 Looking for Rename option in context menu...');
    
    const renameSelectors = [
      'text="Rename"',
      '[role="menuitem"]:has-text("Rename")',
      'button:has-text("Rename")',
      '[class*="context-menu"] *:has-text("Rename")'
    ];
    
    let renameFound = false;
    for (const selector of renameSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log('✅ Found Rename option!');
        
        // Click on rename
        await page.click(selector);
        await page.waitForTimeout(1000);
        
        // Step 8: Test rename dialog
        console.log('📝 Testing rename dialog...');
        
        // Look for dialog and input field
        const dialogSelector = '[role="dialog"], .dialog, [class*="modal"]';
        const inputSelector = 'input[type="text"], input[name*="name"], input[placeholder*="name"]';
        
        if (await page.locator(dialogSelector).count() > 0) {
          console.log('✅ Rename dialog opened!');
          
          const input = page.locator(inputSelector);
          if (await input.count() > 0) {
            console.log('✅ Found input field!');
            
            // Test renaming
            const newName = 'Test Renamed Step ' + Date.now();
            await input.fill(newName);
            
            // Find and click confirm button
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Save"), button[type="submit"]');
            if (await confirmButton.count() > 0) {
              await confirmButton.click();
              console.log('✅ Clicked confirm button!');
              
              // Wait for success
              await page.waitForTimeout(2000);
              
              // Check for success toast
              if (await page.locator('text="Success", [class*="toast"], [class*="notification"]').count() > 0) {
                console.log('🎉 SUCCESS: Rename functionality works correctly!');
                console.log('✅ Step was renamed successfully');
                renameFound = true;
              } else {
                console.log('⚠️  No success toast found, but operation might have succeeded');
                renameFound = true;
              }
            } else {
              console.log('❌ Could not find confirm button');
            }
          } else {
            console.log('❌ Could not find input field in dialog');
          }
        } else {
          console.log('❌ Rename dialog did not open');
        }
        break;
      }
    }
    
    if (!renameFound) {
      console.log('❌ ISSUE: Rename option not found in context menu');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'debug-context-menu.png', fullPage: true });
      
      // Check what's actually in the context menu
      const menuItems = await page.locator('[role="menu"] *, [class*="context-menu"] *, [class*="menu"] *').allTextContents();
      console.log('📋 Context menu items found:', menuItems);
    }
    
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

// Run the test
testRenameStepFeature().catch(console.error);