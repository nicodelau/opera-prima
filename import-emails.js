// Script to import existing received emails from Resend to Neon DB.
const { Resend } = require('resend');
const { PrismaClient } = require('@prisma/client');
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

const resend = new Resend(apiKey);
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching received emails from Resend API...');
  const { data: receivingList, error: listError } = await resend.emails.receiving.list();

  if (listError) {
    console.error('Error fetching email list:', listError);
    process.exit(1);
  }

  const emails = receivingList?.data || [];
  console.log(`Found ${emails.length} received emails in Resend.`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of emails) {
    const emailId = item.id;

    // Check if email already exists in DB
    const existing = await prisma.email.findUnique({
      where: { id: emailId }
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    console.log(`Importing email ID: ${emailId} - Subject: "${item.subject}"...`);

    // Fetch full email content
    let emailData = null;
    try {
      const { data, error } = await resend.emails.receiving.get(emailId);
      if (error || !data) {
        throw new Error(error?.message || 'Failed to fetch email details from Resend API');
      }
      emailData = data;
    } catch (fetchError) {
      console.warn(`Could not fetch full content for ${emailId}, using metadata fallback. Error:`, fetchError.message);
    }

    // Determine recipient emails
    const recipientEmails = item.to || [];
    const cleanRecipientEmails = recipientEmails.map((email) => {
      const match = email.match(/<(.+?)>/);
      return (match ? match[1] : email).trim().toLowerCase();
    });

    // Find matching user
    let user = await prisma.user.findFirst({
      where: {
        email: {
          in: cleanRecipientEmails,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      console.warn(`No users in the database to assign email ${emailId}. Skipping.`);
      continue;
    }

    // Save to database
    await prisma.email.create({
      data: {
        id: emailId,
        type: 'received',
        from: emailData?.from || item.from,
        to: emailData?.to || item.to,
        subject: emailData?.subject || item.subject,
        html: emailData?.html || undefined,
        text: emailData?.text || undefined,
        userId: user.id,
        createdAt: emailData?.created_at ? new Date(emailData.created_at) : new Date(item.created_at),
      },
    });

    importedCount++;
  }

  console.log(`\nImport completed: ${importedCount} emails imported, ${skippedCount} emails skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
