// Script to easily register a webhook in Resend for receiving emails.
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Read API key from .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found');
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/RESEND_API_KEY\s*=\s*(.+)/);
if (!match) {
  console.error('RESEND_API_KEY not found in .env');
  process.exit(1);
}
const apiKey = match[1].trim().replace(/['"]/g, ''); // clean quotes if any

const urlArg = process.argv[2];
if (!urlArg) {
  console.error('Usage: node register-webhook.js <YOUR_WEBHOOK_URL>');
  console.error('Example: node register-webhook.js https://opera-prima.vercel.app/api/webhooks/emails');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main() {
  console.log(`Registering webhook in Resend for URL: ${urlArg}...`);
  try {
    const { data, error } = await resend.webhooks.create({
      url: urlArg,
      events: ['email.received'],
    });

    if (error) {
      console.error('Error creating webhook:', error.message || error);
    } else {
      console.log('Webhook created successfully in Resend!');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Failed to create webhook:', err.message);
  }
}

main();
