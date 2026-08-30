const fs = require('fs');
const path = require('path');

const files = [
  'src/app/verify/page.tsx',
  'src/app/progress/page.tsx',
  'src/app/bmi/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/categories/[id]/page.tsx',
  'src/app/(auth)/forgot-password/page.tsx',
  'src/app/(auth)/reset-password/page.tsx',
  'src/app/(auth)/resend-confirm-email/page.tsx',
  'src/app/(auth)/confirm-email/page.tsx',
];

const replacements = [
  ['#0044CC', '#059669'],
  ['#0033AA', '#047857'],
  ['bg-blue-50', 'bg-emerald-50'],
  ['bg-blue-100', 'bg-emerald-100'],
  ['bg-blue-600', 'bg-emerald-600'],
  ['bg-blue-700', 'bg-emerald-700'],
  ['text-blue-500', 'text-emerald-500'],
  ['text-blue-600', 'text-emerald-600'],
  ['text-blue-700', 'text-emerald-700'],
  ['border-blue-100', 'border-emerald-100'],
  ['border-blue-200', 'border-emerald-200'],
  ['hover:bg-blue-50', 'hover:bg-emerald-50'],
  ['hover:bg-blue-700', 'hover:bg-emerald-700'],
  ['focus-visible:ring-\\[#0044CC\\]', 'focus-visible:ring-emerald-500'],
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    replacements.forEach(([from, to]) => {
      content = content.split(from).join(to);
    });
    fs.writeFileSync(f, content, 'utf8');
    console.log('OK:', f);
  } catch (e) {
    console.error('FAIL:', f, e.message);
  }
});
console.log('Done.');
